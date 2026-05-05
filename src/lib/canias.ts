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
const HELPER_IDLE_MS     = 30 * 1_000;

const SESSION_FILE = path.join(process.cwd(), 'canias_session.txt');

// Slot 0: PRIMARY  - idle timer yok, her zaman acik kalir (min 1 oturum garantisi)
// Slot 1-3: YARDIMCI - 30 sn bostta kalirsa kapanir, gerekince tekrar acilir
// Max 4 es zamanli oturum; 5. oturum ASLA acilmaz

let _sid0 = '', _sid1 = '', _sid2 = '', _sid3 = '';
let _busy0 = false, _busy1 = false, _busy2 = false, _busy3 = false;
let _login0Promise: Promise<string> | null = null;
let _login1Promise: Promise<string> | null = null;
let _login2Promise: Promise<string> | null = null;
let _login3Promise: Promise<string> | null = null;
let _timer1: ReturnType<typeof setTimeout> | null = null;
let _timer2: ReturnType<typeof setTimeout> | null = null;
let _timer3: ReturnType<typeof setTimeout> | null = null;

function writeSessionFile(sid: string): void {
  try { fs.writeFileSync(SESSION_FILE, sid, 'utf8'); } catch { /**/ }
}
function clearSessionFile(): void {
  try { fs.writeFileSync(SESSION_FILE, '', 'utf8'); } catch { /**/ }
}

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
      WSDL_TIMEOUT_MS, 'WSDL yukleme'
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

async function doLoginCall(client: Client, label: string): Promise<string> {
  console.log(`[CANIAS] Login atiliyor... (${label})`);
  const result = await withTimeout(client.loginAsync(LOGIN_ARGS), REQUEST_TIMEOUT_MS, `Login (${label})`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
async function helperLogin3(client: Client, label: string): Promise<string> {
  if (_login3Promise) return _login3Promise;
  _login3Promise = doLoginCall(client, label)
    .then(sid => { _sid3 = sid; return sid; })
    .finally(() => { _login3Promise = null; });
  return _login3Promise;
}

type SessionRow = Record<string, string>;

async function startupCleanup(): Promise<void> {
  console.log('[CANIAS] Baslangic: zombie temizligi basliyor...');
  try {
    const client = await getSoapClient();
    await primaryLogin(client, 'startup');
    const mySid = _sid0;
    if (!mySid) return;
    const mySidBase = mySid.split('|')[0];
    const result = await withTimeout(
      client.callIASServiceAsync({ sessionid: mySid, serviceid: 'checkProcess', args: 'WSONLIZ', returntype: 'STRING', permanent: false }),
      10_000, 'startup-checkProcess'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res0: any = (result as any)?.[0];
    const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
    if (!raw || raw.startsWith('FL')) { console.log('[CANIAS] Baslangic: checkProcess bos dondu, temiz.'); return; }
    const parsed = JSON.parse(raw);
    const sessions: SessionRow[] = Array.isArray(parsed) ? parsed : (Object.values(parsed) as SessionRow[]);
    const zombiler = sessions.filter(s => s.CONNECTIONID && s.CONNECTIONID !== mySid && s.CONNECTIONID !== mySidBase);
    if (zombiler.length === 0) { console.log('[CANIAS] Baslangic: zombie yok, temiz.'); return; }
    console.log(`[CANIAS] Baslangic: ${zombiler.length} zombie bulundu, kapatiliyor...`);
    for (const s of zombiler) {
      try {
        await withTimeout(client.logoutAsync({ sessionid: s.CONNECTIONID }), 5_000, 'startup-zombie-logout');
        console.log(`[CANIAS] Baslangic: zombie kapatildi -> ${s.CONNECTIONID}`);
      } catch { console.log(`[CANIAS] Baslangic: zombie zaten olmuste -> ${s.CONNECTIONID}`); }
    }
  } catch (err) {
    console.log(`[CANIAS] Baslangic temizligi basarisiz: ${err instanceof Error ? err.message : String(err)}`);
    clearSessionFile();
  }
}

startupCleanup().catch(err =>
  console.log(`[CANIAS] startupCleanup unhandled: ${err instanceof Error ? err.message : String(err)}`)
);

// Periyodik zombie temizligi (her 5 dakikada bir)
// cleanupZombieSessions yalnizca basarili servis cagrisindan sonra calisir.
// Idle logout basarisiz olursa CANIAS'ta hayalet session kalabilir.
// Bu interval bagimsiz calisarak 4'u asan tum WSONLIZ sessionlarini temizler.
setInterval(async () => {
  try {
    const client = await getSoapClient();
    const sid = _sid0 || _sid1 || _sid2 || _sid3;
    if (!sid) return;
    const result = await withTimeout(
      client.callIASServiceAsync({ sessionid: sid, serviceid: 'checkProcess', args: 'WSONLIZ', returntype: 'STRING', permanent: false }),
      10_000, 'periyodik-checkProcess'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res0: any = (result as any)?.[0];
    const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
    if (!raw || raw.startsWith('FL')) return;
    const parsed = JSON.parse(raw);
    const sessions: SessionRow[] = Array.isArray(parsed) ? parsed : (Object.values(parsed) as SessionRow[]);
    const bizimSidler = [_sid0, _sid1, _sid2, _sid3].filter(Boolean);
    const zombiler = sessions.filter(s => s.CONNECTIONID && !bizimSidler.includes(s.CONNECTIONID));
    if (zombiler.length > 0) {
      console.log(`[CANIAS] Periyodik temizlik: ${zombiler.length} zombie bulundu, kapatiliyor...`);
      for (const s of zombiler) {
        try {
          await withTimeout(client.logoutAsync({ sessionid: s.CONNECTIONID }), 5_000, 'periyodik-logout');
          console.log(`[CANIAS] Periyodik temizlik: kapatildi -> ${s.CONNECTIONID}`);
        } catch { /**/ }
      }
    }
  } catch { /**/ }
}, 5 * 60 * 1_000);

function startIdleTimer(slot: 1 | 2 | 3, client: Client): void {
  const fire = async (slotNum: 1 | 2 | 3) => {
    const getSid  = (): string  => slotNum === 1 ? _sid1 : slotNum === 2 ? _sid2 : _sid3;
    const getBusy = (): boolean => slotNum === 1 ? _busy1 : slotNum === 2 ? _busy2 : _busy3;
    const clearSid = (): void => { if (slotNum === 1) _sid1 = ''; else if (slotNum === 2) _sid2 = ''; else _sid3 = ''; };
    if (slotNum === 1) _timer1 = null; else if (slotNum === 2) _timer2 = null; else _timer3 = null;
    const sid = getSid();
    if (!sid || getBusy()) return;
    clearSid();
    console.log(`[CANIAS] Yardimci ${slotNum} bosta kaldi (30sn), kapatiliyor: ${sid}`);
    try {
      await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, `idle-logout-${slotNum}`);
      console.log(`[CANIAS] Yardimci ${slotNum} oturum kapatildi.`);
    } catch { /**/ }
  };
  if (slot === 1) { if (_timer1) clearTimeout(_timer1); _timer1 = setTimeout(() => fire(1), HELPER_IDLE_MS); }
  else if (slot === 2) { if (_timer2) clearTimeout(_timer2); _timer2 = setTimeout(() => fire(2), HELPER_IDLE_MS); }
  else { if (_timer3) clearTimeout(_timer3); _timer3 = setTimeout(() => fire(3), HELPER_IDLE_MS); }
}

function cancelIdleTimer(slot: 1 | 2 | 3): void {
  if (slot === 1 && _timer1) { clearTimeout(_timer1); _timer1 = null; }
  if (slot === 2 && _timer2) { clearTimeout(_timer2); _timer2 = null; }
  if (slot === 3 && _timer3) { clearTimeout(_timer3); _timer3 = null; }
}

type SlotNum = 0 | 1 | 2 | 3;

async function acquireSlot(client: Client, label: string): Promise<SlotNum> {
  const SLOT_TIMEOUT_MS = 10_000;
  const started = Date.now();
  while (true) {
    if (!_busy0) {
      if (_sid0) { _busy0 = true; return 0; }
      if (!_login0Promise) { _busy0 = true; try { await primaryLogin(client, label); return 0; } catch (err) { _busy0 = false; throw err; } }
      _busy0 = true; try { await _login0Promise; return 0; } catch (err) { _busy0 = false; throw err; }
    }
    if (!_busy1) {
      cancelIdleTimer(1);
      if (_sid1) { _busy1 = true; return 1; }
      if (!_login1Promise) {
        _busy1 = true;
        try { await helperLogin1(client, `${label}-yard1`); console.log('[CANIAS] Yardimci 1 oturum devreye girdi.'); return 1; }
        catch { console.log('[CANIAS] Yardimci 1 acilamadi, slot 2 deneniyor...'); _busy1 = false; }
      } else { _busy1 = true; try { await _login1Promise; return 1; } catch { _busy1 = false; } }
    }
    if (!_busy2) {
      cancelIdleTimer(2);
      if (_sid2) { _busy2 = true; return 2; }
      if (!_login2Promise) {
        _busy2 = true;
        try { await helperLogin2(client, `${label}-yard2`); console.log('[CANIAS] Yardimci 2 oturum devreye girdi.'); return 2; }
        catch { console.log('[CANIAS] Yardimci 2 acilamadi, slot 3 deneniyor...'); _busy2 = false; }
      } else { _busy2 = true; try { await _login2Promise; return 2; } catch { _busy2 = false; } }
    }
    if (!_busy3) {
      cancelIdleTimer(3);
      if (_sid3) { _busy3 = true; return 3; }
      if (!_login3Promise) {
        _busy3 = true;
        try { await helperLogin3(client, `${label}-yard3`); console.log('[CANIAS] Yardimci 3 oturum devreye girdi.'); return 3; }
        catch { console.log('[CANIAS] Yardimci 3 acilamadi, tum slotlar dolu, bekleniyor...'); _busy3 = false; }
      } else { _busy3 = true; try { await _login3Promise; return 3; } catch { _busy3 = false; } }
    }
    if (Date.now() - started >= SLOT_TIMEOUT_MS) {
      throw new Error(`acquireSlot: ${SLOT_TIMEOUT_MS}ms icerisinde bos slot bulunamadi (fn=${label})`);
    }
    await new Promise(r => setTimeout(r, 30));
  }
}

function releaseSlot(slot: SlotNum, client: Client): void {
  if (slot === 0) { _busy0 = false; }
  else if (slot === 1) { _busy1 = false; if (_sid1) startIdleTimer(1, client); }
  else if (slot === 2) { _busy2 = false; if (_sid2) startIdleTimer(2, client); }
  else { _busy3 = false; if (_sid3) startIdleTimer(3, client); }
}

function sidOf(slot: SlotNum): string {
  if (slot === 0) return _sid0;
  if (slot === 1) return _sid1;
  if (slot === 2) return _sid2;
  return _sid3;
}

async function fetchSessions(client: Client): Promise<SessionRow[] | null> {
  const sid = _sid0 || _sid1 || _sid2 || _sid3;
  if (!sid) return null;
  try {
    const result = await withTimeout(
      client.callIASServiceAsync({ sessionid: sid, serviceid: 'checkProcess', args: 'WSONLIZ', returntype: 'STRING', permanent: false }),
      10_000, 'checkProcess'
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
  } catch { /**/ }
}

async function cleanupZombieSessions(client: Client): Promise<void> {
  try {
    const sessions = await fetchSessions(client);
    if (!sessions) return;
    const bizimSidler = [_sid0, _sid1, _sid2, _sid3].filter(Boolean);
    const yabanciIdle = sessions.filter(s => Number(s.PROCESSTIME ?? 0) === 0 && s.CONNECTIONID && !bizimSidler.includes(s.CONNECTIONID));
    for (const s of yabanciIdle) await safeLogout(client, s.CONNECTIONID);
    let digerAktifler = sessions.filter(s => Number(s.PROCESSTIME ?? 0) > 0 && s.CONNECTIONID && !bizimSidler.includes(s.CONNECTIONID));
    if (digerAktifler.length > 0) {
      const MAX_BEKLEME_MS = 120_000; const POLL_INTERVAL_MS = 3_000;
      const baslangic = Date.now();
      while (digerAktifler.length > 0 && Date.now() - baslangic < MAX_BEKLEME_MS) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
        const guncel = await fetchSessions(client);
        if (!guncel) break;
        const bitenler = digerAktifler.filter(prev => { const s = guncel.find(u => u.CONNECTIONID === prev.CONNECTIONID); return !s || Number(s.PROCESSTIME ?? 0) === 0; });
        for (const s of bitenler) await safeLogout(client, s.CONNECTIONID);
        digerAktifler = guncel.filter(s => Number(s.PROCESSTIME ?? 0) > 0 && !bizimSidler.includes(s.CONNECTIONID));
      }
    }
    if (_sid0) writeSessionFile(_sid0);
  } catch { /**/ }
}

export async function callCaniasService(
  functionName: string,
  params: string[]
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  const client = await getSoapClient();
  const args   = params.join(',');
  let slot: SlotNum;
  try { slot = await acquireSlot(client, functionName); }
  catch (err) { return { response: `Baglanti hatasi: ${err instanceof Error ? err.message : String(err)}`, status: 'FL' }; }

  let sessionId = sidOf(slot);
  let hasReloggedIn = false;
  const MAX_DONGU = slot === 0 ? 6 : 4;

  try {
    for (let dongu = 0; dongu < MAX_DONGU; dongu++) {

      if (!sessionId) {
        try {
          if      (slot === 0) sessionId = await primaryLogin(client, `${functionName}-init${dongu}`);
          else if (slot === 1) sessionId = await helperLogin1(client, `${functionName}-init${dongu}`);
          else if (slot === 2) sessionId = await helperLogin2(client, `${functionName}-init${dongu}`);
          else                 sessionId = await helperLogin3(client, `${functionName}-init${dongu}`);
          console.log(`[CANIAS] Bos slot ${slot} icin login basarili (dongu=${dongu})`);
        } catch (loginErr) {
          console.log(`[CANIAS] Bos slot ${slot} login hatasi (dongu=${dongu}): ${loginErr instanceof Error ? loginErr.message : loginErr}`);
          await new Promise(r => setTimeout(r, 1_000 * (dongu + 1)));
          continue;
        }
      }

      try {
        const result = await withTimeout(
          client.callIASServiceAsync({ sessionid: sessionId, serviceid: functionName, args, returntype: 'STRING', permanent: false }),
          REQUEST_TIMEOUT_MS, functionName
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res0: any = (result as any)?.[0];
        const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');

        if (raw.startsWith('FL')) {
          if (!hasReloggedIn) {
            console.log(`[CANIAS] FL alindi (slot=${slot}, dongu=${dongu}, fn=${functionName}): oturum olmust olabilir, yeniden deneniyor...`);
            throw new Error(`FL_SESSION: ${raw}`);
          }
          return { response: raw.substring(3), status: 'FL' };
        }

        cleanupZombieSessions(client).catch(() => {});
        return { response: raw, status: 'OK' };

      } catch (servisHata) {
        console.log(`[CANIAS] Hata (slot=${slot}, dongu=${dongu}, fn=${functionName}): ${servisHata instanceof Error ? servisHata.message : String(servisHata)}`);

        if (slot === 1 || slot === 2 || slot === 3) {
          console.log(`[CANIAS] Yardimci slot ${slot} basarisiz, primary'e devrediliyor...`);
          if (slot === 1) _sid1 = ''; else if (slot === 2) _sid2 = ''; else _sid3 = '';
          releaseSlot(slot, client);
          slot = 0;
          while (_busy0) await new Promise(r => setTimeout(r, 30));
          _busy0 = true;
          sessionId = _sid0;
          continue;
        }

        const eskiSid = _sid0;
        _sid0 = ''; sessionId = '';
        clearSessionFile();
        if (eskiSid) withTimeout(client.logoutAsync({ sessionid: eskiSid }), 3_000, 'pre-login-logout').catch(() => {});
        try {
          sessionId = await primaryLogin(client, `${functionName}-retry${dongu}`);
          hasReloggedIn = true;
          console.log(`[CANIAS] Yeniden login basarili (dongu=${dongu}), tekrar deneniyor...`);
        } catch (loginHata) {
          console.log(`[CANIAS] Login basarisiz (dongu=${dongu}): ${loginHata instanceof Error ? loginHata.message : String(loginHata)} -> bekleyip tekrar denenecek...`);
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

async function gracefulLogout(): Promise<void> {
  if (!_client) return;
  if (_timer1) { clearTimeout(_timer1); _timer1 = null; }
  if (_timer2) { clearTimeout(_timer2); _timer2 = null; }
  if (_timer3) { clearTimeout(_timer3); _timer3 = null; }
  for (const sid of [_sid0, _sid1, _sid2, _sid3].filter(Boolean)) {
    try {
      await withTimeout(_client.logoutAsync({ sessionid: sid }), 5_000, 'Graceful logout');
      console.log(`[CANIAS] Graceful shutdown: ${sid} kapatildi`);
    } catch { /**/ }
  }
  clearSessionFile();
  _sid0 = ''; _sid1 = ''; _sid2 = ''; _sid3 = '';
}

process.once('SIGTERM', async () => { await gracefulLogout(); process.exit(0); });
process.once('SIGINT',  async () => { await gracefulLogout(); process.exit(0); });
