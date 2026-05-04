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

// ── Yardimci fonksiyonlar ─────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`CANIAS timeout: ${label} (${ms}ms)`)), ms)
    ),
  ]);
}

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

// ── Session kontrolu ──────────────────────────────────────────────────────────

/**
 * checkSessionId sonucu:
 *   true  = CANLI  → herhangi bir deger dondu, session gecerli
 *   false = OLMUS  → bos string dondu, token kesin oldu, re-login gerekli
 *   null  = YOGUN  → timeout/hata, CANIAS mesgul ama session muhtemelen saglikli,
 *                    yeni login ACMA, mevcut session koru ve servis cagrisini dene
 */
async function checkSession(client: Client, sid: string): Promise<boolean | null> {
  if (!sid) return false;
  try {
    const result = await withTimeout(
      client.callIASServiceAsync({
        sessionid:  sid,
        serviceid:  'checkSessionId',
        args:       '',
        returntype: 'STRING',
        permanent:  false,
      }),
      10_000,
      'checkSessionId'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res0: any = (result as any)?.[0];
    const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
    const alive = raw !== '';
    console.log(`[CANIAS] checkSessionId -> "${raw}" -> ${alive ? 'CANLI' : 'OLMUS'}`);
    return alive;
  } catch {
    // Timeout veya network hatasi — CANIAS mesgul, session muhtemelen saglikli
    // Yeni login ACMA, mevcut session koru
    console.log('[CANIAS] checkSessionId -> timeout/hata -> session korunuyor, servis denenecek');
    return null;
  }
}

async function getSession(client: Client, label: string): Promise<string> {
  const status = await checkSession(client, _sessionId);
  if (status === true)  return _sessionId;              // CANLI -> kullan
  if (status === null && _sessionId) return _sessionId; // YOGUN -> koru, dene
  // false veya hic session yok -> re-login
  clearSessionFile();
  _sessionId = '';
  return doLogin(client, label);
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

// ── checkProcess: zombie session temizligi ────────────────────────────────────

/**
 * Is bittikten sonra arka planda cagrilir.
 * WSONLIZ adina acik olan tum session'lari ceker,
 * PROCESSTIME = 0 (bosta) olanlari logout eder.
 * Aktif session (su an kullanilanlar) korunur.
 */
async function cleanupZombieSessions(client: Client): Promise<void> {
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
    if (!raw || raw.startsWith('FL')) return;

    let sessions: Record<string, string>[];
    try {
      const parsed = JSON.parse(raw);
      // JSON array veya {ROW: {...}, "0": {...}, ...} seklinde gelebilir
      if (Array.isArray(parsed)) {
        sessions = parsed;
      } else {
        sessions = Object.values(parsed);
      }
    } catch { return; }

    const aktifler = sessions.filter(s => Number(s.PROCESSTIME ?? 0) > 0).map(s => s.CONNECTIONID);
    const bostalar = sessions.filter(s =>
      Number(s.PROCESSTIME ?? 0) === 0 &&
      s.CONNECTIONID &&
      s.CONNECTIONID !== _sessionId &&   // Kendi oturumumuzu ASLA kapatma
      !aktifler.includes(s.CONNECTIONID)
    );

    if (bostalar.length === 0) {
      console.log('[CANIAS] checkProcess: kapatilacak bos session yok.');
      return;
    }

    console.log(`[CANIAS] checkProcess: ${bostalar.length} bos session kapatiliyor...`);
    for (const s of bostalar) {
      try {
        await withTimeout(client.logoutAsync({ sessionid: s.CONNECTIONID }), 5_000, 'zombie-logout');
        console.log(`[CANIAS] Zombie session kapatildi: ${s.CONNECTIONID}`);
      } catch { /* sessiz gec */ }
    }

    // Temizlik sonrasi txt'i guncelle: mevcut aktif session'imizi kaydet
    if (_sessionId) writeSessionFile(_sessionId);
  } catch {
    // checkProcess basarisiz olursa sessizce gec, ana is etkilenmesin
  }
}

// ── Ana servis cagrisi ────────────────────────────────────────────────────────

export async function callCaniasService(
  functionName: string,
  params: string[]
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  const client = await getSoapClient();
  const args   = params.join(',');

  let sessionId: string;
  try {
    sessionId = await getSession(client, functionName);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { response: `Baglanti hatasi: ${msg}`, status: 'FL' };
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
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

      if (raw.startsWith('FL')) {
        return { response: raw.substring(3), status: 'FL' };
      }
      // Is bitti, arka planda zombie temizligi yap (ana istegi bekletme)
      cleanupZombieSessions(client).catch(() => {});
      return { response: raw, status: 'OK' };

    } catch (err) {
      if (attempt === 2) {
        const msg = err instanceof Error ? err.message : String(err);
        return { response: `Servis hatasi: ${msg}`, status: 'FL' };
      }
      // Servis hatasi -> session gercekten oldu mu kontrol et
      console.log(`[CANIAS] Servis hatasi, session kontrol ediliyor... (${functionName})`);
      const sessionStatus = await checkSession(client, _sessionId);
      if (sessionStatus !== false) {
        // null (CANIAS yogun) veya true (canli) -> yeni session ACMA, tekrar dene
        console.log(`[CANIAS] Session saglikli/yogun, tekrar deneniyor... (${functionName})`);
        continue;
      }
      // false: session kesin olmus -> logout + txt temizle + yeni login
      console.log(`[CANIAS] Session olmus, yenileniyor... (${functionName})`);
      if (_sessionId) {
        try {
          await withTimeout(client.logoutAsync({ sessionid: _sessionId }), 5_000, 'logout');
          console.log(`[CANIAS] Eski oturum kapatildi: ${_sessionId}`);
        } catch { /* sessiz gec */ }
        clearSessionFile();
      }
      _sessionId = '';
      try {
        sessionId = await doLogin(client, functionName);
      } catch (loginErr) {
        const msg = loginErr instanceof Error ? loginErr.message : String(loginErr);
        return { response: `Baglanti hatasi: ${msg}`, status: 'FL' };
      }
    }
  }

  return { response: 'Bilinmeyen hata', status: 'FL' };
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
