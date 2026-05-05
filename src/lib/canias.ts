import { createClientAsync, Client } from 'soap';
import fs   from 'fs';
import path from 'path';

const WSDL_URL = process.env.CANIAS_WSDL_URL || 'http://192.168.1.50:8080/CaniasWS-v1/services/iasWebService?wsdl';

const LOGIN_ARGS = {
  p_strClient:    '00',
  p_strLanguage:  'T',
  p_strDBName:    'NEW',
  p_strDBServer:  'CANIAS',
  p_strAppServer: '192.168.1.50:27499',
  p_strUserName:  'WSONLIZ',
  p_strPassword:  'Nvf7bM955zge2xgp',
};

const WSDL_TIMEOUT_MS    = 15_000;
const REQUEST_TIMEOUT_MS = 30_000;
const HELPER_IDLE_MS     = 30 * 1_000; // 30 saniye boşta → kapat

const SESSION_FILE = path.join(process.cwd(), 'canias_session.txt');


let _sid0 = '', _sid1 = '', _sid2 = '';
let _busy0 = false, _busy1 = false, _busy2 = false;
let _login0Promise: Promise<string> | null = null;
let _login1Promise: Promise<string> | null = null;
let _login2Promise: Promise<string> | null = null;
let _timer1: ReturnType<typeof setTimeout> | null = null;
let _timer2: ReturnType<typeof setTimeout> | null = null;

// ── Txt dosyası yardımcıları ──────────────────────────────────────────────────

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

// ── Login ─────────────────────────────────────────────────────────────────────

async function doLoginCall(client: Client, label: string): Promise<string> {
  console.log(`[CANIAS] Login atiliyor... (${label})`);
  const result = await withTimeout(
    client.loginAsync(LOGIN_ARGS),
    REQUEST_TIMEOUT_MS,
    `Login (${label})`
  );
  const r0: any = (result as any)?.[0];
  const sid = parseRawValue(r0?.loginReturn ?? r0 ?? '');
  if (!sid) throw new Error('Login basarisiz, session ID bos dondu');
  console.log(`[CANIAS] Oturum alindi: ${sid}`);
  return sid;
}

async function primaryLogin(client: Client, label: string): Promise<string> {
  if (_login0Promise) return _login0Promise;
  _login0Promise = doLoginCall(client, label)
    .then(sid => { _sid0 = sid; writeSessionFile(sid); return sid; })
    .finally(() => { _login0Promise = null; });
  return _login0Promise;
}

async function helperLogin1(client: Client, label: string): Promise<string> {
  if (_login1Promise) return _login1Promise;
  _login1Promise = doLoginCall(client, label)
    .then(sid => { _sid1 = sid; return sid; })
    .finally(() => { _login1Promise = null; });
  return _login1Promise;
}

async function helperLogin2(client: Client, label: string): Promise<string> {
  if (_login2Promise) return _login2Promise;
  _login2Promise = doLoginCall(client, label)
    .then(sid => { _sid2 = sid; return sid; })
    .finally(() => { _login2Promise = null; });
  return _login2Promise;
}

async function startupCleanup(): Promise<void> {
  console.log('[CANIAS] Baslangic: zombie temizligi basliyor...');
  try {
    const client = await getSoapClient();


    await primaryLogin(client, 'startup');
    const mySid = _sid0;
    if (!mySid) return;


    const mySidBase = mySid.split('|')[0];

    // checkProcess ile tüm WSONLIZ oturumlarını listele
    const result = await withTimeout(
      client.callIASServiceAsync({
        sessionid:  mySid,
        serviceid:  'checkProcess',
        args:       'WSONLIZ',
        returntype: 'STRING',
        permanent:  false,
      }),
      10_000,
      'startup-checkProcess'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res0: any = (result as any)?.[0];
    const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');

    if (!raw || raw.startsWith('FL')) {
      console.log('[CANIAS] Baslangic: checkProcess bos dondu, temiz.');
      return;
    }

    const parsed = JSON.parse(raw);
    const sessions: SessionRow[] = Array.isArray(parsed) ? parsed : (Object.values(parsed) as SessionRow[]);

    // Yeni oturum hariç hepsini kapat
    // mySidBase: base64 kısmı olmadan karşılaştır (checkProcess kısa format döndürür)
    const zombiler = sessions.filter(s =>
      s.CONNECTIONID &&
      s.CONNECTIONID !== mySid &&
      s.CONNECTIONID !== mySidBase
    );

    if (zombiler.length === 0) {
      console.log('[CANIAS] Baslangic: zombie yok, temiz.');
      return;
    }

    console.log(`[CANIAS] Baslangic: ${zombiler.length} zombie bulundu, kapatiliyor...`);
    for (const s of zombiler) {
      try {
        await withTimeout(client.logoutAsync({ sessionid: s.CONNECTIONID }), 5_000, 'startup-zombie-logout');
        console.log(`[CANIAS] Baslangic: zombie kapatildi -> ${s.CONNECTIONID}`);
      } catch {
        console.log(`[CANIAS] Baslangic: zombie zaten olmuste -> ${s.CONNECTIONID}`);
      }
    }
  } catch (err) {
    console.log(`[CANIAS] Baslangic temizligi basarisiz: ${err instanceof Error ? err.message : String(err)}`);
    clearSessionFile();
  }
}

startupCleanup();



function startIdleTimer(slot: 1 | 2, client: Client): void {
  if (slot === 1) {
    if (_timer1) clearTimeout(_timer1);
    _timer1 = setTimeout(async () => {
      _timer1 = null;
      if (!_sid1 || _busy1) return;
      const sid = _sid1;
      _sid1 = '';
      console.log(`[CANIAS] Yardimci 1 bosta kaldi (30sn), oturum kapatiliyor: ${sid}`);
      try {
        await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, 'idle-logout-1');
        console.log('[CANIAS] Yardimci 1 oturum kapatildi.');
      } catch { /* sessiz gec */ }
    }, HELPER_IDLE_MS);
  } else {
    if (_timer2) clearTimeout(_timer2);
    _timer2 = setTimeout(async () => {
      _timer2 = null;
      if (!_sid2 || _busy2) return; // meşgulse dokunma
      const sid = _sid2;
      _sid2 = '';  
      console.log(`[CANIAS] Yardimci 2 bosta kaldi (30sn), oturum kapatiliyor: ${sid}`);
      try {
        await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, 'idle-logout-2');
        console.log('[CANIAS] Yardimci 2 oturum kapatildi.');
      } catch { /* sessiz gec */ }
    }, HELPER_IDLE_MS);
  }
}

function cancelIdleTimer(slot: 1 | 2): void {
  if (slot === 1 && _timer1) { clearTimeout(_timer1); _timer1 = null; }
  if (slot === 2 && _timer2) { clearTimeout(_timer2); _timer2 = null; }
}

// ── Slot edinme ───────────────────────────────────────────────────────────────

type SlotNum = 0 | 1 | 2;

async function acquireSlot(client: Client, label: string): Promise<SlotNum> {

  // ── Slot 0 (primary) ──────────────────────────────────────────────
  if (!_busy0) {
    if (_sid0) { _busy0 = true; return 0; }
    if (!_login0Promise) {
      _busy0 = true;
      try { await primaryLogin(client, label); return 0; }
      catch (err) { _busy0 = false; throw err; }
    }
    _busy0 = true;
    try { await _login0Promise; return 0; }
    catch (err) { _busy0 = false; throw err; }
  }

  // ── Slot 1 (yardımcı 1) – primary meşgulse ────────────────────────
  if (!_busy1) {
    cancelIdleTimer(1);
    if (_sid1) { _busy1 = true; return 1; }
    if (!_login1Promise) {
      _busy1 = true;
      try {
        await helperLogin1(client, `${label}-yard1`);
        console.log('[CANIAS] Yardimci 1 oturum devreye girdi.');
        return 1;
      } catch {
        console.log('[CANIAS] Yardimci 1 acilamadi, slot 2 deneniyor...');
        _busy1 = false;
      }
    } else {
      _busy1 = true;
      try { await _login1Promise; return 1; }
      catch { _busy1 = false; }
    }
  }

  // ── Slot 2 (yardımcı 2) – slot 0 ve slot 1 meşgulse ──────────────
  if (!_busy2) {
    cancelIdleTimer(2);
    if (_sid2) { _busy2 = true; return 2; }
    if (!_login2Promise) {
      _busy2 = true;
      try {
        await helperLogin2(client, `${label}-yard2`);
        console.log('[CANIAS] Yardimci 2 oturum devreye girdi.');
        return 2;
      } catch {
        console.log('[CANIAS] Yardimci 2 acilamadi, tum slotlar dolu, bekleniyor...');
        _busy2 = false;
      }
    } else {
      _busy2 = true;
      try { await _login2Promise; return 2; }
      catch { _busy2 = false; }
    }
  }

  // ── Hepsi meşgul → spin-wait (4. oturum ASLA açılmaz) ─────────────
  await new Promise(r => setTimeout(r, 30));
  return acquireSlot(client, label);
}

function releaseSlot(slot: SlotNum, client: Client): void {
  if (slot === 0) {
    _busy0 = false;
  } else if (slot === 1) {
    _busy1 = false;
    if (_sid1) startIdleTimer(1, client); // 30sn timer başlat
  } else {
    _busy2 = false;
    if (_sid2) startIdleTimer(2, client); // 30sn timer başlat
  }
}

function sidOf(slot: SlotNum): string {
  if (slot === 0) return _sid0;
  if (slot === 1) return _sid1;
  return _sid2;
}

// ── checkProcess yardımcıları ─────────────────────────────────────────────────

type SessionRow = Record<string, string>;

async function fetchSessions(client: Client): Promise<SessionRow[] | null> {
  const sid = _sid0 || _sid1 || _sid2;
  if (!sid) return null;
  try {
    const result = await withTimeout(
      client.callIASServiceAsync({
        sessionid:  sid,
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
    console.log(`[CANIAS] Zombie session kapatildi: ${sid}`);
  } catch { /* sessiz gec */ }
}

// ── Post-iş temizliği ─────────────────────────────────────────────────────────

async function cleanupZombieSessions(client: Client): Promise<void> {
  try {
    const sessions = await fetchSessions(client);
    if (!sessions) return;

    const bizimSidler = [_sid0, _sid1, _sid2].filter(Boolean);

    // Yabancı idle sessionları kapat
    const yabanciIdle = sessions.filter(s =>
      Number(s.PROCESSTIME ?? 0) === 0 &&
      s.CONNECTIONID &&
      !bizimSidler.includes(s.CONNECTIONID)
    );
    for (const s of yabanciIdle) await safeLogout(client, s.CONNECTIONID);

    // Yabancı aktif sessionlar → bitene kadar bekle, sonra kapat
    let digerAktifler = sessions.filter(s =>
      Number(s.PROCESSTIME ?? 0) > 0 &&
      s.CONNECTIONID &&
      !bizimSidler.includes(s.CONNECTIONID)
    );

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

    if (_sid0) writeSessionFile(_sid0);
  } catch { /* ana işi etkilemez */ }
}

// ── Ana servis çağrısı ────────────────────────────────────────────────────────

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

  let sessionId  = sidOf(slot);
  const ilkToken = sessionId;
  // Primary: max 6 deneme. Yardımcı: max 2 deneme.
  const MAX_DONGU = slot === 0 ? 6 : 2;

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

        if (raw.startsWith('FL')) {
          // İlk denemede FL: oturum ölmüş olabilir → retry tetikle (tüm slotlar için)
          // İkinci+ denemede FL: gerçek iş hatası → döndür
          if (dongu === 0) {
            console.log(`[CANIAS] FL alindi (slot=${slot}, dongu=0, fn=${functionName}): oturum olmust olabilir, yeniden deneniyor...`);
            throw new Error(`FL_SESSION: ${raw}`);
          }
          return { response: raw.substring(3), status: 'FL' };
        }

        cleanupZombieSessions(client).catch(() => {});
        return { response: raw, status: 'OK' };

      } catch (servisHata) {
        console.log(
          `[CANIAS] Hata (slot=${slot}, dongu=${dongu}, fn=${functionName}): ` +
          (servisHata instanceof Error ? servisHata.message : String(servisHata))
        );

        // Yardımcı (slot 1 veya 2) başarısız → primary'e devret
        if (slot === 1 || slot === 2) {
          console.log(`[CANIAS] Yardimci slot ${slot} basarisiz, primary bekleniyor...`);
          if (slot === 1) _sid1 = '';
          else            _sid2 = '';
          releaseSlot(slot, client); // _busy=false, timer yok (_sid boş)
          slot = 0;
          while (_busy0) await new Promise(r => setTimeout(r, 30));
          _busy0    = true;
          sessionId = _sid0;
          if (!sessionId) {
            try { sessionId = await primaryLogin(client, `${functionName}-fallback`); }
            catch (e) { return { response: `Baglanti hatasi: ${e instanceof Error ? e.message : e}`, status: 'FL' }; }
          }
          continue;
        }

        // Primary hata → retry (Bora Abi algoritması)
        try {
          const eskiSid = _sid0;
          _sid0 = '';
          clearSessionFile();
          if (eskiSid && eskiSid !== ilkToken) {
            try { await withTimeout(client.logoutAsync({ sessionid: eskiSid }), 3_000, 'pre-login-logout'); } catch { /* sessiz */ }
          }
          sessionId = await primaryLogin(client, `${functionName}-retry${dongu}`);
          console.log(`[CANIAS] Yeniden login basarili (dongu=${dongu}), tekrar deneniyor...`);
        } catch (loginHata) {
          console.log(
            `[CANIAS] Login basarisiz (dongu=${dongu}): ` +
            (loginHata instanceof Error ? loginHata.message : String(loginHata)) +
            ' -> 1. token ile tekrar deneniyor...'
          );
          sessionId = ilkToken;
          _sid0     = ilkToken;
          if (ilkToken) writeSessionFile(ilkToken);
          await new Promise(r => setTimeout(r, 1_000 * (dongu + 1)));
        }
      }
    }
  } finally {
    releaseSlot(slot, client);
  }

  return { response: 'Maksimum deneme sayisina ulasildi', status: 'FL' };
}

export const callCaniasServiceWithLogout = callCaniasService;

// ── Graceful shutdown ─────────────────────────────────────────────────────────

async function gracefulLogout(): Promise<void> {
  if (!_client) return;
  if (_timer1) { clearTimeout(_timer1); _timer1 = null; }
  if (_timer2) { clearTimeout(_timer2); _timer2 = null; }
  for (const sid of [_sid0, _sid1, _sid2].filter(Boolean)) {
    try {
      await withTimeout(_client.logoutAsync({ sessionid: sid }), 5_000, 'Graceful logout');
      console.log(`[CANIAS] Graceful shutdown: ${sid} kapatildi`);
    } catch { /* sessiz gec */ }
  }
  clearSessionFile();
  _sid0 = ''; _sid1 = ''; _sid2 = '';
}

process.once('SIGTERM', async () => { await gracefulLogout(); process.exit(0); });
process.once('SIGINT',  async () => { await gracefulLogout(); process.exit(0); });
