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

// ── Oturum havuzu ─────────────────────────────────────────────────────────────
//  Slot 0 = primary   (kalıcı, txt'e yazılır)
//  Slot 1 = yardımcı1 (geçici, 15sn keepalive)
//  Slot 2 = yardımcı2 (geçici, 15sn keepalive)

const MAX_SLOTS           = 3;
const YARDIMCI_KEEPALIVE  = 15_000; // ms - boşta bu kadar beklenir, sonra kapatılır

const _sids:   string[]                                  = ['', '', ''];
const _busys:  boolean[]                                 = [false, false, false];
const _loginPs: (Promise<string> | null)[]               = [null, null, null];
const _timers:  (ReturnType<typeof setTimeout> | null)[] = [null, null, null];

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

async function loginForSlot(client: Client, i: number, label: string): Promise<string> {
  if (_loginPs[i]) return _loginPs[i]!;
  _loginPs[i] = doLoginCall(client, label)
    .then(sid => {
      _sids[i] = sid;
      if (i === 0) writeSessionFile(sid);
      return sid;
    })
    .finally(() => { _loginPs[i] = null; });
  return _loginPs[i]!;
}

// ── Keepalive timer (yardımcı slotlar için) ───────────────────────────────────

function cancelTimer(i: number): void {
  if (_timers[i]) { clearTimeout(_timers[i]!); _timers[i] = null; }
}

function scheduleClose(i: number): void {
  if (i === 0) return; // Primary hiçbir zaman kapatılmaz
  cancelTimer(i);
  _timers[i] = setTimeout(async () => {
    _timers[i] = null;
    if (_sids[i] && !_busys[i] && _client) {
      await safeLogout(_client, _sids[i]);
      _sids[i] = '';
      console.log(`[CANIAS] Yardimci oturum keepalive sona erdi, kapatildi (slot ${i + 1}).`);
    }
  }, YARDIMCI_KEEPALIVE);
}

// ── Slot edinme ───────────────────────────────────────────────────────────────

/**
 * Boştaki bir slot döner (0-indexed).
 *  - Slot 0 boşsa → kullan
 *  - Slot 0 meşgulse → yardımcı slotları dene (sırayla 1, 2)
 *  - Hepsi meşgulse → spin-wait
 */
async function acquireSlot(client: Client, label: string): Promise<number> {
  // 1. Boşta ve hazır bir slot var mı? (önce primary, sonra yardımcılar)
  for (let i = 0; i < MAX_SLOTS; i++) {
    if (!_busys[i] && _sids[i]) {
      cancelTimer(i);
      _busys[i] = true;
      return i;
    }
  }

  // 2. Primary hiç açılmamışsa → aç
  if (!_sids[0] && !_busys[0]) {
    _busys[0] = true;
    try {
      await loginForSlot(client, 0, label);
      return 0;
    } catch (err) {
      _busys[0] = false;
      throw err;
    }
  }

  // 3. Primary login sürüyorsa → bekle
  if (!_sids[0] && _busys[0] && _loginPs[0]) {
    try { await _loginPs[0]; }
    catch { /* primary hata, aşağıda tekrar denenecek */ }
    await new Promise(r => setTimeout(r, 30));
    return acquireSlot(client, label);
  }

  // 4. Primary meşgul → yardımcı slot aç (1 veya 2)
  for (let i = 1; i < MAX_SLOTS; i++) {
    if (_busys[i]) continue; // Bu slot meşgul, geç

    if (_loginPs[i]) {
      // Login sürüyor → bekle ve al
      _busys[i] = true;
      try { await _loginPs[i]!; return i; }
      catch { _busys[i] = false; continue; }
    }

    if (!_sids[i]) {
      // Henüz açılmamış → aç
      _busys[i] = true;
      try {
        await loginForSlot(client, i, `${label}-yardimci`);
        console.log(`[CANIAS] Yardimci oturum devreye girdi (slot ${i + 1}).`);
        return i;
      } catch {
        _busys[i] = false;
        // Bu yardımcı açılamadı, bir sonrakini dene
      }
    }
  }

  // 5. Hepsi meşgul → spin-wait
  await new Promise(r => setTimeout(r, 30));
  return acquireSlot(client, label);
}

function releaseSlot(i: number): void {
  _busys[i] = false;
}

// ── checkProcess yardimcilari ─────────────────────────────────────────────────

type SessionRow = Record<string, string>;

async function fetchSessions(client: Client): Promise<SessionRow[] | null> {
  const activeSid = _sids.find(s => s);
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

async function cleanupZombieSessions(client: Client): Promise<void> {
  try {
    const sessions = await fetchSessions(client);
    if (!sessions) return;

    const bizimSidler = _sids.filter(Boolean);

    // 1. Yabancı idle sessionları hemen kapat
    const yabanci = sessions.filter(s =>
      Number(s.PROCESSTIME ?? 0) === 0 &&
      s.CONNECTIONID &&
      !bizimSidler.includes(s.CONNECTIONID)
    );
    for (const s of yabanci) await safeLogout(client, s.CONNECTIONID);

    // 2. Max 3 oturum: yabancı aktifler 2'den fazlaysa fazlayı kapat
    let digerAktifler = sessions.filter(s =>
      Number(s.PROCESSTIME ?? 0) > 0 &&
      s.CONNECTIONID &&
      !bizimSidler.includes(s.CONNECTIONID)
    );
    if (digerAktifler.length > 2) {
      for (const s of digerAktifler.slice(2)) await safeLogout(client, s.CONNECTIONID);
      digerAktifler = digerAktifler.slice(0, 2);
    }

    // 3. Kalan yabancı aktifler bitene kadar bekle
    if (digerAktifler.length > 0) {
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
          Number(s.PROCESSTIME ?? 0) > 0 && !bizimSidler.includes(s.CONNECTIONID)
        );
      }
    }

    // 4. Yardımcı slotlar boştaysa 15sn keepalive başlat
    for (let i = 1; i < MAX_SLOTS; i++) {
      if (_sids[i] && !_busys[i] && !_timers[i]) {
        scheduleClose(i);
      }
    }

    // 5. txt'i güncelle
    if (_sids[0]) writeSessionFile(_sids[0]);
  } catch {
    // Ana isi etkilemez
  }
}

// ── Ana servis cagrisi ────────────────────────────────────────────────────────

export async function callCaniasService(
  functionName: string,
  params: string[]
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  const client = await getSoapClient();
  const args   = params.join(',');

  let slot: number;
  try {
    slot = await acquireSlot(client, functionName);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { response: `Baglanti hatasi: ${msg}`, status: 'FL' };
  }

  let sessionId  = _sids[slot];
  const ilkToken = sessionId;
  const MAX_DONGU = slot === 0 ? 10 : 2; // yardımcıda max 2 deneme

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

        cleanupZombieSessions(client).catch(() => {});
        return { response: raw, status: 'OK' };

      } catch (servisHata) {
        console.log(
          `[CANIAS] Hata (slot=${slot + 1}, dongu=${dongu}, fn=${functionName}): ` +
          (servisHata instanceof Error ? servisHata.message : String(servisHata))
        );

        // ── Yardımcı slot başarısız → primary'e devret ────────────
        if (slot > 0) {
          console.log(`[CANIAS] Yardimci slot ${slot + 1} basarisiz, primary bekleniyor...`);
          _sids[slot] = '';
          releaseSlot(slot);
          slot = 0;
          while (_busys[0]) await new Promise(r => setTimeout(r, 30));
          _busys[0]  = true;
          sessionId  = _sids[0];
          if (!sessionId) {
            try { sessionId = await loginForSlot(client, 0, `${functionName}-fallback`); }
            catch (e) { return { response: `Baglanti hatasi: ${e instanceof Error ? e.message : e}`, status: 'FL' }; }
          }
          continue;
        }

        // ── Primary hata yönetimi (Bora Abi algoritması) ──────────
        try {
          const eskiSid = _sids[0];
          _sids[0] = '';
          clearSessionFile();
          if (eskiSid && eskiSid !== ilkToken) {
            try { await withTimeout(client.logoutAsync({ sessionid: eskiSid }), 3_000, 'pre-login-logout'); } catch { /* sessiz */ }
          }
          sessionId = await loginForSlot(client, 0, `${functionName}-retry${dongu}`);
          console.log(`[CANIAS] Yeniden login basarili (dongu=${dongu}), tekrar deneniyor...`);
        } catch (loginHata) {
          console.log(
            `[CANIAS] Login basarisiz (dongu=${dongu}): ` +
            (loginHata instanceof Error ? loginHata.message : String(loginHata)) +
            ' -> 1. token ile tekrar deneniyor...'
          );
          sessionId = ilkToken;
          _sids[0]  = ilkToken;
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
  for (let i = 0; i < MAX_SLOTS; i++) {
    cancelTimer(i);
    if (_sids[i]) {
      try {
        await withTimeout(_client.logoutAsync({ sessionid: _sids[i] }), 5_000, 'Graceful logout');
        console.log(`[CANIAS] Graceful shutdown: slot ${i + 1} kapatildi`);
      } catch { /* sessiz gec */ }
      _sids[i] = '';
    }
  }
  clearSessionFile();
}

process.once('SIGTERM', async () => { await gracefulLogout(); process.exit(0); });
process.once('SIGINT',  async () => { await gracefulLogout(); process.exit(0); });
