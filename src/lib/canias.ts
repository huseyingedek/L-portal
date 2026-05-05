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
const REQUEST_TIMEOUT_MS = 60_000;
const SLOT_TIMEOUT_MS    = 60_000;
const HELPER_IDLE_MS     = 30_000;
const MAX_RETRY          = 3;

const SESSION_FILE = path.join(process.cwd(), 'canias_session.txt');

let _sid0 = '', _sid1 = '', _sid2 = '', _sid3 = '';
let _busy0 = false, _busy1 = false, _busy2 = false, _busy3 = false;
let _login0Promise: Promise<string> | null = null;
let _login1Promise: Promise<string> | null = null;
let _login2Promise: Promise<string> | null = null;
let _login3Promise: Promise<string> | null = null;
let _timer1: ReturnType<typeof setTimeout> | null = null;
let _timer2: ReturnType<typeof setTimeout> | null = null;
let _timer3: ReturnType<typeof setTimeout> | null = null;
let _cleanupRunning = false;
let _lastCleanup    = 0;
// Login cooldown: basarisiz login sonrasi N sn slot atlanir (infinite retry onlenir)
const LOGIN_COOLDOWN_MS = 5_000;
let _loginCooldown1 = 0, _loginCooldown2 = 0, _loginCooldown3 = 0;

function writeSessionFile(sid: string): void {
  try { fs.writeFileSync(SESSION_FILE, sid, 'utf8'); } catch { /**/ }
}
function clearSessionFile(): void {
  try { fs.writeFileSync(SESSION_FILE, '', 'utf8'); } catch { /**/ }
}
function readSessionFile(): string {
  try { return fs.readFileSync(SESSION_FILE, 'utf8').trim(); } catch { return ''; }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`CANIAS timeout: ${label} (${ms}ms)`)), ms)
    ),
  ]);
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

function startIdleTimer(slot: 1 | 2 | 3, client: Client): void {
  const fire = async (slotNum: 1 | 2 | 3) => {
    const getSid   = (): string  => slotNum === 1 ? _sid1 : slotNum === 2 ? _sid2 : _sid3;
    const getBusy  = (): boolean => slotNum === 1 ? _busy1 : slotNum === 2 ? _busy2 : _busy3;
    const clearSid = (): void => {
      if (slotNum === 1) _sid1 = '';
      else if (slotNum === 2) _sid2 = '';
      else _sid3 = '';
    };
    if (slotNum === 1) _timer1 = null;
    else if (slotNum === 2) _timer2 = null;
    else _timer3 = null;
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

function sidOf(slot: SlotNum): string {
  if (slot === 0) return _sid0;
  if (slot === 1) return _sid1;
  if (slot === 2) return _sid2;
  return _sid3;
}

// Slot icindeki session'i CANIAS'tan senkron olarak kapat (fire-and-forget degil)
// Bu fonksiyon zombie olusumunu onler
async function closeSlotSession(slot: SlotNum, client: Client): Promise<void> {
  const sid = sidOf(slot);
  if (!sid) return;
  if (slot === 0) { _sid0 = ''; clearSessionFile(); }
  else if (slot === 1) _sid1 = '';
  else if (slot === 2) _sid2 = '';
  else _sid3 = '';
  console.log(`[CANIAS] Slot ${slot} session kapatiliyor: ${sid}`);
  try {
    await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, `slot${slot}-logout`);
    console.log(`[CANIAS] Slot ${slot} session kapatildi.`);
  } catch {
    console.log(`[CANIAS] Slot ${slot} session zaten yoktu.`);
  }
}

async function acquireSlot(client: Client, label: string): Promise<SlotNum> {
  const started = Date.now();
  while (true) {
    if (!_busy0) {
      if (_sid0) { _busy0 = true; return 0; }
      if (_login0Promise) {
        _busy0 = true;
        try { await _login0Promise; return 0; }
        catch (err) { _busy0 = false; throw err; }
      }
      _busy0 = true;
      try { await primaryLogin(client, label); return 0; }
      catch (err) { _busy0 = false; throw err; }
    }
    if (!_busy1) {
      cancelIdleTimer(1);
      if (_sid1) { _busy1 = true; return 1; }
      if (_login1Promise) {
        _busy1 = true;
        try { await _login1Promise; return 1; } catch { _busy1 = false; }
      } else if (Date.now() >= _loginCooldown1) {
        _busy1 = true;
        try { await helperLogin1(client, `${label}-yard1`); console.log('[CANIAS] Yardimci 1 devreye girdi.'); return 1; }
        catch { console.log('[CANIAS] Yardimci 1 acilamadi.'); _loginCooldown1 = Date.now() + LOGIN_COOLDOWN_MS; _busy1 = false; }
      }
    }
    if (!_busy2) {
      cancelIdleTimer(2);
      if (_sid2) { _busy2 = true; return 2; }
      if (_login2Promise) {
        _busy2 = true;
        try { await _login2Promise; return 2; } catch { _busy2 = false; }
      } else if (Date.now() >= _loginCooldown2) {
        _busy2 = true;
        try { await helperLogin2(client, `${label}-yard2`); console.log('[CANIAS] Yardimci 2 devreye girdi.'); return 2; }
        catch { console.log('[CANIAS] Yardimci 2 acilamadi.'); _loginCooldown2 = Date.now() + LOGIN_COOLDOWN_MS; _busy2 = false; }
      }
    }
    if (!_busy3) {
      cancelIdleTimer(3);
      if (_sid3) { _busy3 = true; return 3; }
      if (_login3Promise) {
        _busy3 = true;
        try { await _login3Promise; return 3; } catch { _busy3 = false; }
      } else if (Date.now() >= _loginCooldown3) {
        _busy3 = true;
        try { await helperLogin3(client, `${label}-yard3`); console.log('[CANIAS] Yardimci 3 devreye girdi.'); return 3; }
        catch { console.log('[CANIAS] Yardimci 3 acilamadi.'); _loginCooldown3 = Date.now() + LOGIN_COOLDOWN_MS; _busy3 = false; }
      }
    }
    if (Date.now() - started >= SLOT_TIMEOUT_MS) {
      throw new Error(`acquireSlot: ${SLOT_TIMEOUT_MS}ms icerisinde bos slot bulunamadi (fn=${label})`);
    }
    await new Promise(r => setTimeout(r, 200));
  }
}

function releaseSlot(slot: SlotNum, client: Client): void {
  if (slot === 0)      { _busy0 = false; }
  else if (slot === 1) { _busy1 = false; if (_sid1) startIdleTimer(1, client); }
  else if (slot === 2) { _busy2 = false; if (_sid2) startIdleTimer(2, client); }
  else                 { _busy3 = false; if (_sid3) startIdleTimer(3, client); }
}

type SessionRow = Record<string, string>;

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
    console.log(`[CANIAS] checkProcess ham yanit: ${raw}`);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : (Object.values(parsed) as SessionRow[]);
  } catch { return null; }
}

async function safeLogout(client: Client, sid: string): Promise<void> {
  try {
    await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, 'zombie-logout');
    console.log(`[CANIAS] Zombie kapatildi: ${sid}`);
  } catch { /**/ }
}

async function cleanupZombieSessions(client: Client): Promise<void> {
  if (_cleanupRunning) return;
  const now = Date.now();
  if (now - _lastCleanup < 2 * 60_000) return;
  _cleanupRunning = true;
  _lastCleanup    = now;
  try {
    const sessions = await fetchSessions(client);
    if (!sessions) return;
    // CANIAS CONNECTIONID kisa format doner: "WSONLIZ_XXX"
    // _sidN tam format tutar: "WSONLIZ_XXX|base64"
    // Karsilastirma icin pipe oncesini al
    const bizimSidler = [_sid0, _sid1, _sid2, _sid3]
      .filter(Boolean)
      .map(s => s.split('|')[0]);
    const zombiler = sessions.filter(
      s => s.CONNECTIONID && s.CONNECTIONID.startsWith('WSONLIZ') && !bizimSidler.includes(s.CONNECTIONID)
    );
    if (zombiler.length > 0) {
      console.log(`[CANIAS] Periyodik temizlik: ${zombiler.length} zombie bulundu.`);
      for (const s of zombiler) await safeLogout(client, s.CONNECTIONID);
    }
    if (_sid0) writeSessionFile(_sid0);
  } catch { /**/ }
  finally { _cleanupRunning = false; }
}

async function startupCleanup(): Promise<void> {
  console.log('[CANIAS] Baslangic: temizlik basliyor...');
  try {
    const client = await getSoapClient();

    // 1. Dosyadaki eski session'i kapat
    const fileSid = readSessionFile();
    if (fileSid) {
      console.log(`[CANIAS] Baslangic: eski session kapatiliyor -> ${fileSid}`);
      try {
        await withTimeout(client.logoutAsync({ sessionid: fileSid }), 5_000, 'startup-old-logout');
        console.log('[CANIAS] Baslangic: eski session kapatildi.');
      } catch { console.log('[CANIAS] Baslangic: eski session zaten yoktu.'); }
      clearSessionFile();
    }

    // 2. Primary login
    _busy0 = true;
    try {
      await primaryLogin(client, 'startup');
    } catch (err) {
      _busy0 = false;
      console.log(`[CANIAS] Baslangic login hatasi: ${err instanceof Error ? err.message : String(err)}`);
      clearSessionFile();
      return;
    }
    _busy0 = false;

    const mySid = _sid0;
    if (!mySid) return;

    // 3. checkProcess ile zombie'leri temizle
    // bizimSidler: o ana kadar acilmis TUM slotlari koru (startup sirasinda helper acilabilir)
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
    const wsonliz = sessions.filter(s => s.CONNECTIONID && s.CONNECTIONID.startsWith('WSONLIZ'));
    console.log(`[CANIAS] Baslangic: CANIAS'ta ${wsonliz.length} WSONLIZ oturumu bulundu.`);

    const bizimSidler = [_sid0, _sid1, _sid2, _sid3]
      .filter(Boolean)
      .map(s => s.split('|')[0]);
    const zombiler = wsonliz.filter(s => !bizimSidler.includes(s.CONNECTIONID));

    if (zombiler.length === 0) { console.log('[CANIAS] Baslangic: zombie yok, temiz.'); return; }
    console.log(`[CANIAS] Baslangic: ${zombiler.length} zombie kapatiliyor...`);
    for (const s of zombiler) {
      try {
        await withTimeout(client.logoutAsync({ sessionid: s.CONNECTIONID }), 5_000, 'startup-zombie-logout');
        console.log(`[CANIAS] Baslangic: zombie kapatildi -> ${s.CONNECTIONID}`);
      } catch { console.log(`[CANIAS] Baslangic: zombie zaten yoktu -> ${s.CONNECTIONID}`); }
    }
  } catch (err) {
    _busy0 = false;
    console.log(`[CANIAS] Baslangic temizligi basarisiz: ${err instanceof Error ? err.message : String(err)}`);
    clearSessionFile();
  }
}

startupCleanup().catch(err =>
  console.log(`[CANIAS] startupCleanup unhandled: ${err instanceof Error ? err.message : String(err)}`)
);

export async function callCaniasService(
  functionName: string,
  params: string[],
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  const client = await getSoapClient();
  const args   = params.join(',');

  let slot: SlotNum;
  try { slot = await acquireSlot(client, functionName); }
  catch (err) {
    return { response: `Baglanti hatasi: ${err instanceof Error ? err.message : String(err)}`, status: 'FL' };
  }

  let sessionId  = sidOf(slot);
  let reloggedIn = false;

  try {
    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {

      if (!sessionId) {
        try {
          if      (slot === 0) sessionId = await primaryLogin(client, `${functionName}-a${attempt}`);
          else if (slot === 1) sessionId = await helperLogin1(client, `${functionName}-a${attempt}`);
          else if (slot === 2) sessionId = await helperLogin2(client, `${functionName}-a${attempt}`);
          else                 sessionId = await helperLogin3(client, `${functionName}-a${attempt}`);
          console.log(`[CANIAS] Slot ${slot} login basarili (attempt=${attempt})`);
        } catch (loginErr) {
          console.log(`[CANIAS] Slot ${slot} login hatasi (attempt=${attempt}): ${loginErr instanceof Error ? loginErr.message : loginErr}`);
          await new Promise(r => setTimeout(r, 1_000));
          continue;
        }
      }

      try {
        const result = await withTimeout(
          client.callIASServiceAsync({ sessionid: sessionId, serviceid: functionName, args, returntype: 'STRING', permanent: false }),
          timeoutMs, functionName
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res0: any = (result as any)?.[0];
        const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');

        if (raw.startsWith('FL')) {
          const flBody  = raw.substring(2);
          const flLower = flBody.toLowerCase();

          // Lisans/max-session hatasi: session saglikli, bekle ve tekrar dene
          const isLicenseErr =
            flLower.includes('lisans') || flLower.includes('license') ||
            flLower.includes('maximum session') || flLower.includes('max session');
          if (isLicenseErr) {
            console.log(`[CANIAS] Lisans hatasi (slot=${slot}, attempt=${attempt}): bekleniyor...`);
            await new Promise(r => setTimeout(r, 1_000));
            continue;
          }

          // Session hatasi: SENKRON logout yap, sonra yeniden login ac
          // ONEMLI: fire-and-forget DEGIL — zombie olusturmaz
          const isSessionErr =
            flBody === '' ||
            flLower.includes('session')  || flLower.includes('oturum') ||
            flLower.includes('login')    || flLower.includes('timeout') ||
            flLower.includes('gecersiz') || flLower.includes('invalid');
          if (isSessionErr && !reloggedIn) {
            console.log(`[CANIAS] FL session hatasi (slot=${slot}, attempt=${attempt}, fn=${functionName}): oturum yenileniyor...`);
            await closeSlotSession(slot, client);  // SENKRON
            sessionId  = '';
            reloggedIn = true;
            await new Promise(r => setTimeout(r, 300));
            continue;
          }

          // Is mantigi hatasi veya ikinci FL: direkt don
          console.log(`[CANIAS] FL is hatasi (slot=${slot}, fn=${functionName}): ${raw}`);
          return { response: raw, status: 'FL' };
        }

        // Basarili
        cleanupZombieSessions(client).catch(() => {});
        return { response: raw, status: 'OK' };

      } catch (servisHata) {
        const hataMsg   = servisHata instanceof Error ? servisHata.message : String(servisHata);
        const isTimeout = hataMsg.includes('timeout');
        console.log(`[CANIAS] Hata (slot=${slot}, attempt=${attempt}, fn=${functionName}): ${hataMsg}`);
        // Timeout VEYA SOAP network hatasi:
        // CANIAS session gecerlidir, yeniden login ACMA, sadece bekle ve tekrar dene
        if (!isTimeout) console.log('[CANIAS] SOAP hatasi — session korunuyor, tekrar deneniyor...');
        else            console.log('[CANIAS] Timeout — session korunuyor, tekrar deneniyor...');
        await new Promise(r => setTimeout(r, 2_000));
      }
    }
  } finally {
    releaseSlot(slot, client);
  }

  return { response: 'Maksimum deneme sayisina ulasildi', status: 'FL' };
}

export const callCaniasServiceWithLogout = callCaniasService;

// Tum WSONLIZ sessionlarini listele (admin icin)
export async function listCaniasSessions(): Promise<{ sessions: SessionRow[] | null; bizim: string[] }> {
  const client = await getSoapClient();
  const sessions = await fetchSessions(client);
  const bizim = [_sid0, _sid1, _sid2, _sid3].filter(Boolean).map(s => s.split('|')[0]);
  return { sessions, bizim };
}

// Belirli bir session'i zorla kapat (zombie temizleme)
export async function killCaniasSession(sid: string): Promise<boolean> {
  const client = await getSoapClient();
  try {
    await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, 'force-kill');
    console.log(`[CANIAS] Manuel kill: ${sid}`);
    return true;
  } catch {
    console.log(`[CANIAS] Manuel kill basarisiz: ${sid}`);
    return false;
  }
}

// Her 3 dakikada bir logProcess cagirilir — sunucu durumu PM2 loglarına düşer
setInterval(async () => {
  try {
    const { response, status } = await callCaniasService('logProcess', [], 30_000);
    console.log(`[CANIAS] logProcess (${status}): ${response}`);
  } catch (err) {
    console.log(`[CANIAS] logProcess hata: ${err instanceof Error ? err.message : String(err)}`);
  }
}, 3 * 60_000);

async function gracefulLogout(): Promise<void> {
  if (!_client) return;
  console.log('[CANIAS] Graceful shutdown basliyor...');
  if (_timer1) { clearTimeout(_timer1); _timer1 = null; }
  if (_timer2) { clearTimeout(_timer2); _timer2 = null; }
  if (_timer3) { clearTimeout(_timer3); _timer3 = null; }
  const sidler = [_sid0, _sid1, _sid2, _sid3].filter(Boolean);
  // Paralel logout — toplam 3sn icinde bitmeli
  await Promise.allSettled(sidler.map(async sid => {
    try {
      await withTimeout(_client!.logoutAsync({ sessionid: sid }), 3_000, 'graceful-logout');
      console.log(`[CANIAS] Graceful shutdown: ${sid} kapatildi`);
    } catch {
      console.log(`[CANIAS] Graceful shutdown: ${sid} kapatilamadi`);
    }
  }));
  clearSessionFile();
  _sid0 = ''; _sid1 = ''; _sid2 = ''; _sid3 = '';
  console.log('[CANIAS] Graceful shutdown tamamlandi.');
}

process.once('SIGTERM', async () => {
  console.log('[CANIAS] SIGTERM alindi.');
  await gracefulLogout();
  process.exit(0);
});
process.once('SIGINT', async () => {
  console.log('[CANIAS] SIGINT alindi.');
  await gracefulLogout();
  process.exit(0);
});
