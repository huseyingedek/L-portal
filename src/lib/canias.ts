import { createClientAsync, Client } from 'soap';
import fs   from 'fs';
import path from 'path';

const WSDL_URL = process.env.CANIAS_WSDL_URL || 'http://192.168.1.50:8080/CaniasWS-v1/services/iasWebService?wsdl';

const LOGIN_ARGS = {
  p_strClient:    '00',
  p_strLanguage:  'T',
  p_strDBName:    'NEW',
  p_strDBServer:  'CANIAS',
  p_strAppServer: '192.168.1.50:27499/M9',
  p_strUserName:  'WSONLIZ',
  p_strPassword:  'Nvf7bM955zge2xgp',
};

const WSDL_TIMEOUT_MS    = 15_000;
const REQUEST_TIMEOUT_MS = 30_000;

/** Session ID'nin kalici olarak yazildigi dosya */
const SESSION_FILE = path.join(process.cwd(), 'canias_session.txt');

/** Aktif oturum ID'si - memory'de tutulur */
let _sessionId: string = '';

/** Login mutex - ayni anda sadece 1 login islemi yapilir */
let _loginPromise: Promise<string> | null = null;

// ── Txt dosyasi yardimcilari ──────────────────────────────────────────────────

function readSessionFile(): string {
  try { return fs.readFileSync(SESSION_FILE, 'utf8').trim(); }
  catch { return ''; }
}

function writeSessionFile(sid: string): void {
  try { fs.writeFileSync(SESSION_FILE, sid, 'utf8'); }
  catch { /* sessiz gec */ }
}

function clearSessionFile(): void {
  try { fs.writeFileSync(SESSION_FILE, '', 'utf8'); }
  catch { /* sessiz gec */ }
}

// ── Timeout utility ───────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`CANIAS timeout: ${label} (${ms}ms)`)), ms)
    ),
  ]);
}

// ── SOAP client ───────────────────────────────────────────────────────────────

let _client:        Client | null          = null;
let _clientPromise: Promise<Client> | null = null;

async function getSoapClient(): Promise<Client> {
  if (_client) return _client;
  if (!_clientPromise) {
    _clientPromise = withTimeout(
      createClientAsync(WSDL_URL, { wsdl_options: { timeout: WSDL_TIMEOUT_MS } }),
      WSDL_TIMEOUT_MS,
      'WSDL yukleme'
    ).then(c => {
      _client = c;
      return c;
    }).catch(err => {
      _clientPromise = null;
      throw err;
    });
  }
  return _clientPromise;
}

function parseRawValue(rawValue: unknown): string {
  if (typeof rawValue === 'object' && rawValue !== null) {
    if ('$value' in rawValue) return String((rawValue as Record<string, unknown>).$value);
    const keys = Object.keys(rawValue as object);
    if (keys.length === 1 && keys[0] === 'attributes') return '';
    return JSON.stringify(rawValue);
  }
  return String(rawValue ?? '');
}

// ── Startup temizligi ─────────────────────────────────────────────────────────

/**
 * Sunucu her basladiginda txt dosyasindan eski session'i okur,
 * CANIAS'ta logout eder, dosyayi temizler.
 * Restart/crash sonrasi zombie session kalmaz.
 */
async function startupCleanup(): Promise<void> {
  const oldSid = readSessionFile();
  if (!oldSid) {
    console.log('[CANIAS] Baslangic: dosyada eski oturum yok, temiz basliyor.');
    return;
  }
  console.log(`[CANIAS] Baslangic: eski oturum temizleniyor -> ${oldSid}`);
  try {
    const client = await getSoapClient();
    await withTimeout(client.logoutAsync({ sessionid: oldSid }), 5_000, 'startup-logout');
    console.log('[CANIAS] Baslangic: eski oturum CANIAS\'ta kapatildi.');
  } catch {
    console.log('[CANIAS] Baslangic: eski oturum zaten olmuste, dosya temizleniyor.');
  }
  clearSessionFile();
}

startupCleanup();

// ── Login ─────────────────────────────────────────────────────────────────────

async function doLogin(client: Client, label: string): Promise<string> {
  if (_loginPromise) {
    console.log(`[CANIAS] Login zaten suruyor, bekleniyor... (${label})`);
    return _loginPromise;
  }

  _loginPromise = (async () => {
    console.log(`[CANIAS] Yeni login atiliyor... (${label})`);
    const loginResult = await withTimeout(
      client.loginAsync(LOGIN_ARGS),
      REQUEST_TIMEOUT_MS,
      `Login (${label})`
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r0: any = (loginResult as any)?.[0];
    const sid = parseRawValue(r0?.loginReturn ?? r0 ?? '');
    if (!sid) throw new Error('Login basarisiz, session ID bos dondu');
    _sessionId = sid;
    writeSessionFile(sid);
    console.log(`[CANIAS] Yeni oturum alindi: ${sid}`);
    return sid;
  })().finally(() => {
    _loginPromise = null;
  });

  return _loginPromise;
}

// ── checkProcess yardimcilari ─────────────────────────────────────────────────

type SessionRow = Record<string, string>;

/**
 * WSONLIZ adina acik tum sessionlari ceker.
 * Basarisiz olursa null döner (ana isi etkilemez).
 */
async function fetchSessions(client: Client): Promise<SessionRow[] | null> {
  if (!_sessionId) return null;
  try {
    const result = await withTimeout(
      client.callIASServiceAsync({
        sessionid:  _sessionId,
        serviceid:  'checkProcess',
        args:       'WSONLIZ',
        returntype: 'STRING',
        permanent:  false,
      }),
      10_000,
      'checkProcess'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res0: any = (result as any)?.[0];
    const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
    if (!raw || raw.startsWith('FL')) return null;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
      : (Object.values(parsed) as SessionRow[]);
  } catch {
    return null;
  }
}

async function safeLogout(client: Client, sid: string): Promise<void> {
  try {
    await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, 'zombie-logout');
    console.log(`[CANIAS] Session kapatildi: ${sid}`);
  } catch { /* sessiz gec */ }
}

// ── Post-is temizligi ─────────────────────────────────────────────────────────

/**
 * Is bittikten sonra arka planda cagrilir (ana istegi bekletmez).
 *
 * Adimlar:
 *  1. checkProcess -> PROCESSTIME=0 olanlari kapat (kendi session HARIC)
 *  2. Hala PROCESSTIME>0 olan baskasi varsa, onlari bitip bosalana kadar bekle
 *  3. Bosalanlari kapat
 *  4. Son kalan aktif session'i txt'e yaz (genellikle _sessionId)
 */
async function cleanupZombieSessions(client: Client): Promise<void> {
  try {
    // 1. Ilk snapshot
    const sessions = await fetchSessions(client);
    if (!sessions) return;

    // 2. Hemen kapatilabiilecekler: PROCESSTIME=0, kendi session degil
    const hemenKapat = sessions.filter(s =>
      Number(s.PROCESSTIME ?? 0) === 0 &&
      s.CONNECTIONID &&
      s.CONNECTIONID !== _sessionId
    );
    for (const s of hemenKapat) {
      await safeLogout(client, s.CONNECTIONID);
    }

    // 3. Bizim disimizda hala PROCESSTIME>0 olan sessionlar var mi?
    let digerAktifler = sessions.filter(s =>
      Number(s.PROCESSTIME ?? 0) > 0 &&
      s.CONNECTIONID &&
      s.CONNECTIONID !== _sessionId
    );

    // MAX 2 OTURUM KURALI: bizimki + en fazla 1 diger = 2 toplam
    // Fazla aktif sessionlar varsa hemen kapat (beklemeden)
    if (digerAktifler.length > 1) {
      const fazlalilar = digerAktifler.slice(1); // ilkini bırak, gerisini kapat
      console.log(`[CANIAS] Max 2 oturum kurali: ${fazlalilar.length} fazla aktif session kapatiliyor...`);
      for (const s of fazlalilar) {
        await safeLogout(client, s.CONNECTIONID);
      }
      digerAktifler = digerAktifler.slice(0, 1);
    }

    if (digerAktifler.length > 0) {
      console.log(`[CANIAS] ${digerAktifler.length} baska aktif session bekleniyor...`);

      const MAX_BEKLEME_MS   = 120_000; // maksimum 2 dakika bekle
      const POLL_INTERVAL_MS =   3_000;
      const baslangic = Date.now();

      while (digerAktifler.length > 0 && Date.now() - baslangic < MAX_BEKLEME_MS) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));

        const guncel = await fetchSessions(client);
        if (!guncel) break;

        // Biten (artik PROCESSTIME=0 veya listede yok) olanlari kapat
        const bitenler = digerAktifler.filter(prev => {
          const simdiki = guncel.find(u => u.CONNECTIONID === prev.CONNECTIONID);
          return !simdiki || Number(simdiki.PROCESSTIME ?? 0) === 0;
        });
        for (const s of bitenler) {
          await safeLogout(client, s.CONNECTIONID);
        }

        // Hala aktif olanlari guncelle (kendi session haric)
        digerAktifler = guncel.filter(s =>
          Number(s.PROCESSTIME ?? 0) > 0 &&
          s.CONNECTIONID !== _sessionId
        );
      }

      if (digerAktifler.length > 0) {
        console.log(`[CANIAS] ${digerAktifler.length} session zaman asimina ugradi, temizlik sonlandi.`);
      }
    }

    // 4. Txt'e aktif oturumu kaydet
    if (_sessionId) {
      writeSessionFile(_sessionId);
      console.log(`[CANIAS] Temizlik tamam. Aktif session txt'e yazildi: ${_sessionId}`);
    }

  } catch {
    // Hata olursa sessizce gec, ana isi etkilemez
  }
}

// ── Ana servis cagrisi ────────────────────────────────────────────────────────

/**
 * Bora Abi algoritmasi:
 *
 *  1. "1. token" = sunucu basladiginda elimizdeki ilk gecerli session
 *  2. O token ile cevap alirsak is bitti
 *  3. Cevap alamazsak yeniden login ac
 *     - Login basarili -> yeni token ile tekrar dene
 *     - Login basarisiz -> 1. token'a geri don, biraz bekle, tekrar dene
 *  4. Ta ki ya cevap alana ya da login olana kadar dongu
 *  5. Is bitince arka planda cleanupZombieSessions calis
 */
export async function callCaniasService(
  functionName: string,
  params: string[]
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  const client = await getSoapClient();
  const args   = params.join(',');

  // Baslangic session'ini belirle: memory'de varsa kullan, yoksa login al
  let sessionId = _sessionId;
  if (!sessionId) {
    try {
      sessionId = await doLogin(client, functionName);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { response: `Baglanti hatasi: ${msg}`, status: 'FL' };
    }
  }

  // "1. token" - login basarisiz olunca her zaman buna donulur
  const ilkToken = sessionId;

  const MAX_DONGU = 10; // sonsuz dongu koruyucu

  for (let dongu = 0; dongu < MAX_DONGU; dongu++) {
    try {
      const result = await withTimeout(
        client.callIASServiceAsync({
          sessionid:  sessionId,
          serviceid:  functionName,
          args,
          returntype: 'STRING',
          permanent:  false,
        }),
        REQUEST_TIMEOUT_MS,
        functionName
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res0: any = (result as any)?.[0];
      const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');

      // CANIAS uygulama seviyesi hata (FL...) - retry yapma, direkt don
      if (raw.startsWith('FL')) {
        return { response: raw.substring(3), status: 'FL' };
      }

      // Basarili
      console.log(`[CANIAS] OK: ${functionName} (dongu=${dongu}, session=${sessionId})`);
      cleanupZombieSessions(client).catch(() => {}); // arka planda temizlik
      return { response: raw, status: 'OK' };

    } catch (servisHata) {
      console.log(
        `[CANIAS] Servis hatasi (dongu=${dongu}, fn=${functionName}): ` +
        (servisHata instanceof Error ? servisHata.message : String(servisHata))
      );

      // Yeniden login dene (mutex sayesinde paralel istekler tek login yapar)
      // MAX 2 OTURUM: yeni login acmadan once mevcut session'i kapat
      try {
        const eskiSid = _sessionId;
        _sessionId = '';
        clearSessionFile();
        if (eskiSid && eskiSid !== ilkToken) {
          // ilkToken'u kapatma - ona geri donebilmek gerekebilir
          try { await withTimeout(client.logoutAsync({ sessionid: eskiSid }), 3_000, 'pre-login-logout'); } catch { /* sessiz gec */ }
        }
        sessionId = await doLogin(client, `${functionName}-retry${dongu}`);
        console.log(`[CANIAS] Yeniden login basarili (dongu=${dongu}), tekrar deneniyor...`);
        // Yeni session ile hemen bir sonraki donguye gec
      } catch (loginHata) {
        // Login de basarisiz -> 1. token'a don, bekle, tekrar dene
        console.log(
          `[CANIAS] Login basarisiz (dongu=${dongu}): ` +
          (loginHata instanceof Error ? loginHata.message : String(loginHata)) +
          ' -> 1. token ile tekrar deneniyor...'
        );
        sessionId  = ilkToken;
        _sessionId = ilkToken;
        if (ilkToken) writeSessionFile(ilkToken);

        // Kademeli bekleme: 1s, 2s, 3s ...
        await new Promise(r => setTimeout(r, 1_000 * (dongu + 1)));
      }
    }
  }

  return { response: 'Maksimum deneme sayisina ulasildi', status: 'FL' };
}

export const callCaniasServiceWithLogout = callCaniasService;

// ── Graceful shutdown ─────────────────────────────────────────────────────────

async function gracefulLogout() {
  if (!_sessionId || !_client) return;
  try {
    await withTimeout(
      _client.logoutAsync({ sessionid: _sessionId }),
      5_000,
      'Graceful logout'
    );
    console.log('[CANIAS] Graceful shutdown: oturum kapatildi');
  } catch { /* sessiz gec */ }
  clearSessionFile();
  _sessionId = '';
}

process.once('SIGTERM', async () => { await gracefulLogout(); process.exit(0); });
process.once('SIGINT',  async () => { await gracefulLogout(); process.exit(0); });
