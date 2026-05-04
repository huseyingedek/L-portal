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

const SESSION_FILE = path.join(process.cwd(), 'canias_session.txt');

// ── Oturum havuzu (max 2) ─────────────────────────────────────────────────────
//  Slot 1 = primary   (txt'e yazılır, restart sonrası temizlenir)
//  Slot 2 = yardımcı  (primary meşgulken açılır, boşalınca kapatılır)

let _sid1  = '';   // primary session ID
let _sid2  = '';   // yardimci session ID
let _busy1 = false;
let _busy2 = false;

// Login mutex'leri – aynı anda 1 login per slot
let _login1Promise: Promise<string> | null = null;
let _login2Promise: Promise<string> | null = null;

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
    ).then(c => { _client = c; return c; })
     .catch(err => { _clientPromise = null; throw err; });
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

async function startupCleanup(): Promise<void> {
  const old = readSessionFile();
  if (!old) { console.log('[CANIAS] Baslangic: temiz.'); return; }
  console.log(`[CANIAS] Baslangic: eski oturum temizleniyor -> ${old}`);
  try {
    const client = await getSoapClient();
    await withTimeout(client.logoutAsync({ sessionid: old }), 5_000, 'startup-logout');
    console.log('[CANIAS] Baslangic: eski oturum kapatildi.');
  } catch {
    console.log('[CANIAS] Baslangic: eski oturum zaten olmuste.');
  }
  clearSessionFile();
}

startupCleanup();

// ── Login ─────────────────────────────────────────────────────────────────────

async function doLoginCall(client: Client, label: string): Promise<string> {
  console.log(`[CANIAS] Login atiliyor... (${label})`);
  const result = await withTimeout(
    client.loginAsync(LOGIN_ARGS),
    REQUEST_TIMEOUT_MS,
    `Login (${label})`
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r0: any = (result as any)?.[0];
  const sid = parseRawValue(r0?.loginReturn ?? r0 ?? '');
  if (!sid) throw new Error('Login basarisiz, session ID bos dondu');
  console.log(`[CANIAS] Oturum alindi: ${sid}`);
  return sid;
}

/** Primary login – txt'e yazar */
async function login1(client: Client, label: string): Promise<string> {
  if (_login1Promise) {
    console.log(`[CANIAS] Primary login zaten suruyor, bekleniyor... (${label})`);
    return _login1Promise;
  }
  _login1Promise = doLoginCall(client, label)
    .then(sid => { _sid1 = sid; writeSessionFile(sid); return sid; })
    .finally(() => { _login1Promise = null; });
  return _login1Promise;
}

/** Yardımcı login – txt'e yazmaz */
async function login2(client: Client, label: string): Promise<string> {
  if (_login2Promise) {
    console.log(`[CANIAS] Yardimci login zaten suruyor, bekleniyor... (${label})`);
    return _login2Promise;
  }
  _login2Promise = doLoginCall(client, label)
    .then(sid => { _sid2 = sid; return sid; })
    .finally(() => { _login2Promise = null; });
  return _login2Promise;
}

// ── Slot edinme ───────────────────────────────────────────────────────────────

type SlotNum = 1 | 2;

/**
 * Boştaki bir slot döner. Yok ise:
 *  - Slot 1 hiç yoksa  → primary login açar
 *  - Slot 1 meşgulse   → yardımcı açar (veya bekler)
 *  - İkisi de meşgulse → spin-wait
 */
async function acquireSlot(client: Client, label: string): Promise<SlotNum> {
  // ── Slot 1 ──────────────────────────────────────────────────────
  if (!_busy1) {
    if (_sid1) { _busy1 = true; return 1; }

    // Henüz primary yok veya temizlendi → login al
    if (!_login1Promise) {
      _busy1 = true;
      try {
        await login1(client, label);
        return 1;
      } catch (err) {
        _busy1 = false;
        throw err;
      }
    }
    // Login1 sürüyor: bekle
    _busy1 = true;
    try { await _login1Promise; return 1; }
    catch (err) { _busy1 = false; throw err; }
  }

  // ── Slot 2 (primary meşgul) ──────────────────────────────────────
  if (!_busy2) {
    if (_sid2) { _busy2 = true; return 2; }

    // Yardımcı yok → aç
    if (!_login2Promise) {
      _busy2 = true;
      try {
        await login2(client, `${label}-yardimci`);
        console.log('[CANIAS] Yardimci oturum devreye girdi.');
        return 2;
      } catch {
        console.log('[CANIAS] Yardimci oturum acilamadi, primary bekleniyor...');
        _busy2 = false;
        // primary beklemeye düşecek (aşağıda)
      }
    } else {
      // login2 sürüyor: bekle
      _busy2 = true;
      try { await _login2Promise; return 2; }
      catch { _busy2 = false; }
    }
  }

  // ── Her ikisi de meşgul ya da slot 2 açılamadı → spin-wait ───────
  await new Promise(r => setTimeout(r, 30));
  return acquireSlot(client, label);
}

function releaseSlot(slot: SlotNum): void {
  if (slot === 1) _busy1 = false;
  else            _busy2 = false;
}

function sidOf(slot: SlotNum): string { return slot === 1 ? _sid1 : _sid2; }

// ── checkProcess yardimcilari ─────────────────────────────────────────────────

type SessionRow = Record<string, string>;

async function fetchSessions(client: Client): Promise<SessionRow[] | null> {
  const activeSid = _sid1 || _sid2;
  if (!activeSid) return null;
  try {
    const result = await withTimeout(
      client.callIASServiceAsync({
        sessionid:  activeSid,
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
    return Array.isArray(parsed) ? parsed : (Object.values(parsed) as SessionRow[]);
  } catch { return null; }
}

async function safeLogout(client: Client, sid: string): Promise<void> {
  try {
    await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, 'zombie-logout');
    console.log(`[CANIAS] Session kapatildi: ${sid}`);
  } catch { /* sessiz gec */ }
}

// ── Post-is temizligi ─────────────────────────────────────────────────────────

/**
 * Adımlar (arka planda çalışır, ana isteği bekletmez):
 *  1. checkProcess → PROCESSTIME=0 olanları kapat (slot1 ve slot2 HARİÇ)
 *  2. MAX 2 OTURUM: 2'den fazla diger aktif varsa fazlaları kapat
 *  3. Diğer aktif oturumlar bitene kadar bekle, bitenleri kapat
 *  4. Yardımcı oturum (slot2) boştaysa → kapat (slot1 bırak)
 *  5. txt'i güncelle
 */
async function cleanupZombieSessions(client: Client): Promise<void> {
  try {
    const sessions = await fetchSessions(client);
    if (!sessions) return;

    // Bizim bilinen session'larımız
    const bizimSidler = [_sid1, _sid2].filter(Boolean);

    // 1. Hemen kapat: PROCESSTIME=0 + bizim değil
    const hemenKapat = sessions.filter(s =>
      Number(s.PROCESSTIME ?? 0) === 0 &&
      s.CONNECTIONID &&
      !bizimSidler.includes(s.CONNECTIONID)
    );
    for (const s of hemenKapat) await safeLogout(client, s.CONNECTIONID);

    // 2. Max 2 oturum: bizim dışındaki aktifler 1'den fazlaysa fazlayı kapat
    let digerAktifler = sessions.filter(s =>
      Number(s.PROCESSTIME ?? 0) > 0 &&
      s.CONNECTIONID &&
      !bizimSidler.includes(s.CONNECTIONID)
    );
    if (digerAktifler.length > 1) {
      const fazlalilar = digerAktifler.slice(1);
      console.log(`[CANIAS] Max 2 oturum: ${fazlalilar.length} fazla kapatiliyor...`);
      for (const s of fazlalilar) await safeLogout(client, s.CONNECTIONID);
      digerAktifler = digerAktifler.slice(0, 1);
    }

    // 3. Kalan diger aktif oturum(lar) bitene kadar bekle
    if (digerAktifler.length > 0) {
      console.log(`[CANIAS] ${digerAktifler.length} baska aktif oturum bekleniyor...`);
      const MAX_BEKLEME_MS   = 120_000;
      const POLL_INTERVAL_MS =   3_000;
      const baslangic = Date.now();

      while (digerAktifler.length > 0 && Date.now() - baslangic < MAX_BEKLEME_MS) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
        const guncel = await fetchSessions(client);
        if (!guncel) break;

        const bitenler = digerAktifler.filter(prev => {
          const simdiki = guncel.find(u => u.CONNECTIONID === prev.CONNECTIONID);
          return !simdiki || Number(simdiki.PROCESSTIME ?? 0) === 0;
        });
        for (const s of bitenler) await safeLogout(client, s.CONNECTIONID);

        digerAktifler = guncel.filter(s =>
          Number(s.PROCESSTIME ?? 0) > 0 &&
          !bizimSidler.includes(s.CONNECTIONID)
        );
      }
    }

    // 4. Yardımcı oturum (slot2) bosta ve meşgul değilse → kapat
    if (_sid2 && !_busy2) {
      const slot2Row = sessions.find(s => s.CONNECTIONID === _sid2);
      const slot2Processtime = Number(slot2Row?.PROCESSTIME ?? 0);
      if (slot2Processtime === 0) {
        await safeLogout(client, _sid2);
        _sid2 = '';
        console.log('[CANIAS] Yardimci oturum bosta, kapatildi.');
      }
    }

    // 5. txt'i güncelle
    if (_sid1) {
      writeSessionFile(_sid1);
      console.log(`[CANIAS] Temizlik tamam. Aktif session: ${_sid1}`);
    }
  } catch {
    // Ana isi etkilemez
  }
}

// ── Ana servis cagrisi ────────────────────────────────────────────────────────

/**
 * Bora Abi + yardımcı oturum algoritması:
 *
 *  - Primary (slot 1) boşsa → kullan
 *  - Primary meşgulse     → yardımcı (slot 2) aç/kullan
 *  - İkisi de meşgulse    → bekle
 *
 *  Hata durumunda (primary):
 *    fail → yeniden login → fail → 1. token → bekle → döngü
 *
 *  Hata durumunda (yardımcı):
 *    fail → yardımcıyı temizle → primary bekle
 *
 *  İş bitince: arka planda cleanup (idle oturumları kapat)
 */
export async function callCaniasService(
  functionName: string,
  params: string[]
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  const client = await getSoapClient();
  const args   = params.join(',');

  let slot: SlotNum;
  try {
    slot = await acquireSlot(client, functionName);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { response: `Baglanti hatasi: ${msg}`, status: 'FL' };
  }

  let sessionId = sidOf(slot);
  const ilkToken  = sessionId;                  // retry fallback
  const MAX_DONGU = slot === 1 ? 10 : 2;        // yardımcıda max 2 deneme

  try {
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

        if (raw.startsWith('FL')) return { response: raw.substring(3), status: 'FL' };

        console.log(`[CANIAS] OK: ${functionName} (slot=${slot}, dongu=${dongu})`);
        cleanupZombieSessions(client).catch(() => {});
        return { response: raw, status: 'OK' };

      } catch (servisHata) {
        console.log(
          `[CANIAS] Hata (slot=${slot}, dongu=${dongu}, fn=${functionName}): ` +
          (servisHata instanceof Error ? servisHata.message : String(servisHata))
        );

        // ── Yardımcı oturum başarısız ──────────────────────────────
        if (slot === 2) {
          console.log('[CANIAS] Yardimci oturum basarisiz, primary bekleniyor...');
          _sid2  = '';
          releaseSlot(2);
          slot = 1; // Slot değiştir

          // Primary slot açılana kadar bekle
          while (_busy1) await new Promise(r => setTimeout(r, 30));
          _busy1    = true;
          sessionId = _sid1;
          if (!sessionId) {
            try { sessionId = await login1(client, `${functionName}-s2fallback`); }
            catch (e) { return { response: `Baglanti hatasi: ${e instanceof Error ? e.message : e}`, status: 'FL' }; }
          }
          continue;
        }

        // ── Primary oturum hata yönetimi (Bora Abi algoritması) ───
        try {
          const eskiSid = _sid1;
          _sid1 = '';
          clearSessionFile();
          if (eskiSid && eskiSid !== ilkToken) {
            try { await withTimeout(client.logoutAsync({ sessionid: eskiSid }), 3_000, 'pre-login-logout'); } catch { /* sessiz */ }
          }
          sessionId = await login1(client, `${functionName}-retry${dongu}`);
          console.log(`[CANIAS] Yeniden login basarili (dongu=${dongu}), tekrar deneniyor...`);
        } catch (loginHata) {
          console.log(
            `[CANIAS] Login basarisiz (dongu=${dongu}): ` +
            (loginHata instanceof Error ? loginHata.message : String(loginHata)) +
            ' -> 1. token ile tekrar deneniyor...'
          );
          sessionId = ilkToken;
          _sid1     = ilkToken;
          if (ilkToken) writeSessionFile(ilkToken);
          await new Promise(r => setTimeout(r, 1_000 * (dongu + 1)));
        }
      }
    }
  } finally {
    releaseSlot(slot);
  }

  return { response: 'Maksimum deneme sayisina ulasildi', status: 'FL' };
}

export const callCaniasServiceWithLogout = callCaniasService;

// ── Graceful shutdown ─────────────────────────────────────────────────────────

async function gracefulLogout(): Promise<void> {
  if (!_client) return;
  for (const sid of [_sid1, _sid2].filter(Boolean)) {
    try {
      await withTimeout(_client.logoutAsync({ sessionid: sid }), 5_000, 'Graceful logout');
      console.log(`[CANIAS] Graceful shutdown: ${sid} kapatildi`);
    } catch { /* sessiz gec */ }
  }
  clearSessionFile();
  _sid1 = '';
  _sid2 = '';
}

process.once('SIGTERM', async () => { await gracefulLogout(); process.exit(0); });
process.once('SIGINT',  async () => { await gracefulLogout(); process.exit(0); });
