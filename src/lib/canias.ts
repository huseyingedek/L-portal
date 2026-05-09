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
const HELPER_IDLE_MS     = 20_000;
const MAX_RETRY          = 3;
const MAX_SLOTS          = 4;

const SESSION_FILE = path.join(process.cwd(), 'canias_session.txt');

// ─── Dosya yardımcıları ───────────────────────────────────────────────────────

function syncSessionFile(sids: string[]): void {
  try { fs.writeFileSync(SESSION_FILE, sids.filter(Boolean).join('\n'), 'utf8'); } catch { /**/ }
}
function clearSessionFile(): void {
  try { fs.writeFileSync(SESSION_FILE, '', 'utf8'); } catch { /**/ }
}
function readAllSessionsFile(): string[] {
  try { return fs.readFileSync(SESSION_FILE, 'utf8').trim().split('\n').filter(Boolean); } catch { return []; }
}

// ─── Genel yardımcılar ────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timerId = setTimeout(() => reject(new Error(`CANIAS timeout: ${label} (${ms}ms)`)), ms);
    }),
  ]).finally(() => clearTimeout(timerId));
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

// ─── SOAP Client ──────────────────────────────────────────────────────────────

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

// ─── Slot havuzu ──────────────────────────────────────────────────────────────
// Her slot bir Canias oturumunu temsil eder.
// Slot 0: kalıcı (kapanmaz). Slot 1-3: yardımcı (20sn boşta kalırsa kapanır).
// Eş zamanlı en fazla MAX_SLOTS (4) istek Canias'a gider; fazlası kuyruğa alınır.

type SlotNum = 0 | 1 | 2 | 3;

interface Slot {
  sid:          string;
  busy:         boolean;
  loginPromise: Promise<string> | null;
  idleTimer:    ReturnType<typeof setTimeout> | null;
}

const slots: Slot[] = Array.from({ length: MAX_SLOTS }, () => ({
  sid: '', busy: false, loginPromise: null, idleTimer: null,
}));

function getAllSids(): string[] {
  return slots.map(s => s.sid).filter(Boolean);
}

function flushSessionFile(): void {
  syncSessionFile(getAllSids());
}

// ─── Kuyruk ───────────────────────────────────────────────────────────────────
// Tüm slotlar doluyken gelen istekler buraya eklenir.
// releaseSlot() çağrıldığında tryDispatch() bir sonraki bekleyeni uyandırır.
// Bu sayede hiçbir zaman polling yapılmaz ve 4'ten fazla Canias oturumu açılmaz.

interface Waiter {
  resolve:   (slot: SlotNum) => void;
  reject:    (err: Error)    => void;
  timeoutId: ReturnType<typeof setTimeout>;
  label:     string;
}

const _waiters: Waiter[] = [];

function tryDispatch(): void {
  while (_waiters.length > 0) {
    const freeIdx = slots.findIndex(s => !s.busy);
    if (freeIdx === -1) break;
    slots[freeIdx].busy = true;
    cancelIdleTimer(freeIdx as SlotNum);
    const waiter = _waiters.shift()!;
    clearTimeout(waiter.timeoutId);
    waiter.resolve(freeIdx as SlotNum);
  }
}

async function acquireSlot(label: string): Promise<SlotNum> {
  // Hemen boş slot varsa senkron dön — kuyruk yok, gecikme yok
  const freeIdx = slots.findIndex(s => !s.busy);
  if (freeIdx !== -1) {
    slots[freeIdx].busy = true;
    cancelIdleTimer(freeIdx as SlotNum);
    return freeIdx as SlotNum;
  }

  // Boş slot yok — kuyruğa ekle
  return new Promise<SlotNum>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const idx = _waiters.findIndex(w => w.timeoutId === timeoutId);
      if (idx >= 0) _waiters.splice(idx, 1);
      reject(new Error(`acquireSlot: ${SLOT_TIMEOUT_MS}ms içinde boş slot bulunamadı (fn=${label})`));
    }, SLOT_TIMEOUT_MS);
    _waiters.push({ resolve, reject, timeoutId, label });
  });
}

function releaseSlot(slotNum: SlotNum, client: Client): void {
  slots[slotNum].busy = false;
  // Önce kuyruğa bak: waiter slot'u aldıysa idle timer başlatma
  tryDispatch();
  // tryDispatch slot'u bir waitera verdiyse busy=true olur — o zaman timer başlatma
  if (slotNum !== 0 && !slots[slotNum].busy && slots[slotNum].sid) {
    startIdleTimer(slotNum, client);
  }
}

// ─── Idle timer ───────────────────────────────────────────────────────────────

function cancelIdleTimer(slotNum: SlotNum): void {
  const slot = slots[slotNum];
  if (slot.idleTimer) { clearTimeout(slot.idleTimer); slot.idleTimer = null; }
}

function startIdleTimer(slotNum: SlotNum, client: Client): void {
  if (slotNum === 0) return;
  cancelIdleTimer(slotNum);
  const slot = slots[slotNum];
  slot.idleTimer = setTimeout(async () => {
    slot.idleTimer = null;
    if (!slot.sid || slot.busy) return;
    const sid = slot.sid;
    slot.sid = '';
    flushSessionFile();
    console.log(`[CANIAS] Yardımcı ${slotNum} boşta kaldı (${HELPER_IDLE_MS / 1000}sn), kapatılıyor: ${sid}`);
    try {
      const logoutRes = await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, `idle-logout-${slotNum}`);
      console.log(`[CANIAS] Yardımcı ${slotNum} oturum kapatıldı.`);
      console.log(`[CANIAS][DEBUG] idle-logout yanıt: ${JSON.stringify(logoutRes)}`);
    } catch {
      // Logout başarısız — session'ı geri koy ve yeni idle timer başlat
      // Timer başlatılmazsa session sonsuza kadar açık kalır
      if (!slot.busy && !slot.sid) {
        slot.sid = sid;
        flushSessionFile();
        console.log(`[CANIAS] Yardımcı ${slotNum} idle logout başarısız, 20sn sonra tekrar denenecek.`);
        startIdleTimer(slotNum, client);
      }
    }
  }, HELPER_IDLE_MS);
}

// ─── Login ────────────────────────────────────────────────────────────────────
// Aynı slot için eş zamanlı login fırtınasını önler: loginPromise singleton.

async function ensureSession(slotNum: SlotNum, client: Client, label: string): Promise<string> {
  const slot = slots[slotNum];
  if (slot.sid) return slot.sid;
  if (slot.loginPromise) return slot.loginPromise;

  console.log(`[CANIAS] Slot ${slotNum} login başlatılıyor... (${label})`);
  slot.loginPromise = (async () => {
    const result = await withTimeout(client.loginAsync(LOGIN_ARGS), REQUEST_TIMEOUT_MS, `Login-slot${slotNum}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r0: any = (result as any)?.[0];
    const sid = parseRawValue(r0?.loginReturn ?? r0 ?? '');
    if (!sid) throw new Error('Login başarısız, session ID boş döndü');
    slot.sid = sid;
    flushSessionFile();
    console.log(`[CANIAS] Slot ${slotNum} oturum açıldı: ${sid}`);
    return sid;
  })().finally(() => { slot.loginPromise = null; });

  return slot.loginPromise;
}

async function closeSlotSession(slotNum: SlotNum, client: Client): Promise<void> {
  const slot = slots[slotNum];
  const sid  = slot.sid;
  if (!sid) return;
  slot.sid = '';
  flushSessionFile();
  console.log(`[CANIAS] Slot ${slotNum} session kapatılıyor: ${sid}`);
  try {
    await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, `close-slot${slotNum}`);
    console.log(`[CANIAS] Slot ${slotNum} session kapatıldı.`);
  } catch {
    console.log(`[CANIAS] Slot ${slotNum} session zaten yoktu.`);
  }
}

// ─── Zombie temizliği ─────────────────────────────────────────────────────────

type SessionRow = Record<string, string>;

let _cleanupRunning = false;
let _lastCleanup    = 0;

async function fetchAllWsonlizSessions(client: Client): Promise<SessionRow[] | null> {
  // Boş slot bul ve kilitle — çağrı süresince başka istek aynı session'ı kullanamaz
  const freeIdx = slots.findIndex(s => s.sid && !s.busy);
  if (freeIdx === -1) return null;
  const slotNum = freeIdx as SlotNum;
  slots[slotNum].busy = true;
  cancelIdleTimer(slotNum);
  const sid = slots[slotNum].sid;
  try {
    for (const svcId of ['SYSGETUSERINFOLIST', 'checkProcess']) {
      try {
        const result = await withTimeout(
          client.callIASServiceAsync({ sessionid: sid, serviceid: svcId, args: 'WSONLIZ', returntype: 'STRING', permanent: false }),
          10_000, svcId
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res0: any = (result as any)?.[0];
        const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
        if (!raw || raw.startsWith('FL')) {
          console.log(`[CANIAS][DEBUG] ${svcId} FL/boş yanıt: "${raw}"`);
          continue;
        }
        console.log(`[CANIAS][DEBUG] ${svcId} ham yanıt: ${raw}`);
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : (Object.values(parsed) as SessionRow[]);
      } catch { continue; }
    }
    return null;
  } finally {
    releaseSlot(slotNum, client);
  }
}

async function cleanupZombieSessions(client: Client): Promise<void> {
  if (_cleanupRunning) return;
  const now = Date.now();
  if (now - _lastCleanup < 2 * 60_000) return;
  _cleanupRunning = true;
  _lastCleanup    = now;
  try {
    const sessions = await fetchAllWsonlizSessions(client);
    if (!sessions) return;
    const bizimSidler = getAllSids().map(s => s.split('|')[0]);
    const zombiler = sessions.filter(s =>
      s.CONNECTIONID?.startsWith('WSONLIZ') &&
      !bizimSidler.includes(s.CONNECTIONID) &&
      parseInt(s.PROCESSTIME ?? '0', 10) === 0
    );
    if (zombiler.length > 0) {
      console.log(`[CANIAS] Periyodik temizlik: ${zombiler.length} zombie (PROCESSTIME=0) kapatılıyor.`);
      for (const s of zombiler) {
        try {
          const logoutRes = await withTimeout(client.logoutAsync({ sessionid: s.CONNECTIONID }), 5_000, 'zombie-logout');
          console.log(`[CANIAS] Zombie kapatıldı: ${s.CONNECTIONID}`);
          console.log(`[CANIAS][DEBUG] zombie-logout yanıt: ${JSON.stringify(logoutRes)}`);
        } catch { /**/ }
      }
    }
  } catch { /**/ }
  finally { _cleanupRunning = false; }
}

// ─── Başlangıç temizliği ──────────────────────────────────────────────────────

async function startupCleanup(): Promise<void> {
  console.log('[CANIAS] Başlangıç temizliği başlıyor...');
  // Slot 0'ı tüm startup boyunca rezerve et.
  // Gelen istekler slot 1-3'e yönlenir (max 3 yeni session açılır).
  // Slot 0 + slot 1-3 = en fazla 4 session → limit aşılmaz.
  // fetchAllWsonlizSessions'ı atlatıp slot 0 session'ı direkt kullanıyoruz.
  slots[0].busy = true;
  try {
    const client    = await getSoapClient();
    const fileSids  = readAllSessionsFile();
    const [candidateSid, ...helperSids] = fileSids;

    // Slot 0 için önceki oturumu dene
    if (candidateSid) {
      try {
        const r = await withTimeout(
          client.callIASServiceAsync({ sessionid: candidateSid, serviceid: 'checkSessionId', args: '', returntype: 'STRING', permanent: false }),
          5_000, 'startup-checkSessionId'
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res0: any = (r as any)?.[0];
        const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
        console.log(`[CANIAS][DEBUG] checkSessionId ham yanıt: "${raw}"`);
        if (raw && !raw.startsWith('FL')) {
          slots[0].sid = candidateSid;
          console.log(`[CANIAS] Başlangıç: mevcut token canlı → ${candidateSid}`);
        } else {
          console.log('[CANIAS] Başlangıç: mevcut token ölmüş veya boş yanıt, yeni login açılıyor.');
        }
      } catch {
        console.log('[CANIAS] Başlangıç: checkSessionId timeout, yeni login açılıyor.');
      }
    }

    // Eski yardımcı oturumları kapat
    await Promise.allSettled(helperSids.map(async sid => {
      try {
        await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, 'startup-helper-logout');
        console.log(`[CANIAS] Başlangıç: helper session kapatıldı → ${sid}`);
      } catch { /**/ }
    }));

    // Slot 0 yoksa yeni login aç (slot zaten busy=true, ensureSession direkt çalışır)
    if (!slots[0].sid) {
      try {
        await ensureSession(0, client, 'startup');
      } catch (err) {
        clearSessionFile();
        console.log(`[CANIAS] Başlangıç login hatası: ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
    }

    flushSessionFile();

    // Zombie temizliği: fetchAllWsonlizSessions'ı bypass et, slot 0'ı direkt kullan.
    // (slot 0 busy=true ama biz zaten sahibiz — güvenle sorgulayabiliriz)
    const mySid = slots[0].sid;
    if (!mySid) return;

    let sessions: SessionRow[] | null = null;
    for (const svcId of ['SYSGETUSERINFOLIST', 'checkProcess']) {
      try {
        const result = await withTimeout(
          client.callIASServiceAsync({ sessionid: mySid, serviceid: svcId, args: 'WSONLIZ', returntype: 'STRING', permanent: false }),
          10_000, `startup-${svcId}`
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res0: any = (result as any)?.[0];
        const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
        console.log(`[CANIAS][DEBUG] ${svcId} ham yanıt: ${raw}`);
        if (!raw || raw.startsWith('FL')) continue;
        const parsed = JSON.parse(raw);
        sessions = Array.isArray(parsed) ? parsed : (Object.values(parsed) as SessionRow[]);
        break;
      } catch { continue; }
    }

    if (!sessions) {
      console.log('[CANIAS] Başlangıç: session listesi alınamadı, zombie temizliği atlandı.');
      return;
    }

    const bizimSidler = getAllSids().map(s => s.split('|')[0]);
    const zombiler    = sessions.filter(s =>
      s.CONNECTIONID?.startsWith('WSONLIZ') &&
      !bizimSidler.includes(s.CONNECTIONID)
    );

    if (zombiler.length === 0) {
      console.log('[CANIAS] Başlangıç: zombie yok, temiz.');
      return;
    }

    console.log(`[CANIAS] Başlangıç: ${zombiler.length} zombie kapatılıyor...`);
    for (const s of zombiler) {
      try {
        await withTimeout(client.logoutAsync({ sessionid: s.CONNECTIONID }), 5_000, 'startup-zombie-logout');
        console.log(`[CANIAS] Başlangıç: zombie kapatıldı → ${s.CONNECTIONID}`);
      } catch {
        console.log(`[CANIAS] Başlangıç: zombie zaten yoktu → ${s.CONNECTIONID}`);
      }
    }
  } catch (err) {
    clearSessionFile();
    console.log(`[CANIAS] Başlangıç temizliği başarısız: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    slots[0].busy = false;
    tryDispatch(); // startup bitti, kuyruktaki istekleri uyandır
  }
}

// Build sırasında (next build) 19 worker canias.ts'i import eder.
// Bu adımda Canias bağlantısı açılmamalı — sadece gerçek server'da çalışsın.
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

if (!IS_BUILD) {
  startupCleanup().catch(err =>
    console.log(`[CANIAS] startupCleanup unhandled: ${err instanceof Error ? err.message : String(err)}`)
  );
}

// ─── Ana servis çağrısı ───────────────────────────────────────────────────────

export async function callCaniasService(
  functionName: string,
  params: string[],
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  const client = await getSoapClient();
  const args   = params.join(',');

  let slotNum: SlotNum;
  try { slotNum = await acquireSlot(functionName); }
  catch (err) {
    return { response: `Bağlantı hatası: ${err instanceof Error ? err.message : String(err)}`, status: 'FL' };
  }

  const slot       = slots[slotNum];
  let reloggedIn   = false;

  try {
    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {

      let sessionId: string;
      try {
        sessionId = await ensureSession(slotNum, client, `${functionName}-a${attempt}`);
      } catch (loginErr) {
        console.log(`[CANIAS] Slot ${slotNum} login hatası (attempt=${attempt}): ${loginErr instanceof Error ? loginErr.message : loginErr}`);
        await new Promise(r => setTimeout(r, 1_000));
        continue;
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
          // GEÇİCİ LOG — session hata mesajlarını tanımlamak için, sonra kaldır
          console.log(`[CANIAS][FL-DEBUG] fn=${functionName} mesaj="${flBody}"`); 

          // Lisans / max-session hatası: zombie session olabilir — temizlik tetikle
          if (
            flLower.includes('lisans') || flLower.includes('license') ||
            flLower.includes('maximum session') || flLower.includes('max session')
          ) {
            console.log(`[CANIAS] Lisans hatası (slot=${slotNum}, attempt=${attempt}): zombie temizliği tetikleniyor...`);
            _lastCleanup = 0; // throttle'ı sıfırla, cleanup zorunlu çalışsın
            cleanupZombieSessions(client).catch(() => {});
            await new Promise(r => setTimeout(r, 2_000));
            continue;
          }

          // Session hatası: oturumu kapat ve yeniden aç
          // 'timeout' tek başına iş mantığı hatası olabilir (örn: "işlem zaman aşımı") — dahil edilmiyor
          const isSessionErr =
            flLower.includes('session')  || flLower.includes('oturum') ||
            flLower.includes('login')    || flLower.includes('gecersiz') ||
            flLower.includes('invalid');
          if (isSessionErr && !reloggedIn) {
            console.log(`[CANIAS] FL session hatası (slot=${slotNum}, attempt=${attempt}, fn=${functionName}): oturum yenileniyor...`);
            await closeSlotSession(slotNum, client);
            reloggedIn = true;
            await new Promise(r => setTimeout(r, 300));
            continue;
          }

          console.log(`[CANIAS] FL iş hatası (slot=${slotNum}, fn=${functionName}): ${raw}`);
          return { response: raw, status: 'FL' };
        }

        // Başarılı yanıt
        cleanupZombieSessions(client).catch(() => {});
        return { response: raw, status: 'OK' };

      } catch (servisHata) {
        const hataMsg = servisHata instanceof Error ? servisHata.message : String(servisHata);
        console.log(`[CANIAS] Hata (slot=${slotNum}, attempt=${attempt}, fn=${functionName}): ${hataMsg}`);
        await new Promise(r => setTimeout(r, 2_000));
      }
    }

    // Tüm denemeler başarısız: cleanup releaseSlot'tan ÖNCE yapılmalı.
    // Aksi hâlde releaseSlot kuyruktaki yeni bir isteğe slot'u verir ve
    // aşağıdaki sid temizliği o isteğin session'ını sıfırlar.
    const sidToClose = slot.sid;
    cancelIdleTimer(slotNum);
    slot.sid = '';
    flushSessionFile();
    if (sidToClose) {
      // Logout'u await et: yeni login başlamadan eski session Canias'ta kapansın.
      // Fire-and-forget olsaydı max-session limitine yakın durumlarda yeni login FL alabilirdi.
      await withTimeout(client.logoutAsync({ sessionid: sidToClose }), 5_000, `maxretry-logout-slot${slotNum}`)
        .then(() => console.log(`[CANIAS] Slot ${slotNum} maxretry logout başarılı: ${sidToClose}`))
        .catch(() => console.log(`[CANIAS] Slot ${slotNum} maxretry logout başarısız (zombie cleanup kapatacak).`));
    }
    return { response: 'Maksimum deneme sayısına ulaşıldı', status: 'FL' };

  } finally {
    // Her koşulda slot'u serbest bırak — kuyruk varsa tryDispatch devreye girer
    releaseSlot(slotNum, client);
  }
}

export const callCaniasServiceWithLogout = callCaniasService;

// ─── Admin araçları ───────────────────────────────────────────────────────────

export async function listCaniasSessions(): Promise<{ sessions: SessionRow[] | null; bizim: string[] }> {
  const client   = await getSoapClient();
  const sessions = await fetchAllWsonlizSessions(client);
  const bizim    = getAllSids().map(s => s.split('|')[0]);
  return { sessions, bizim };
}

export async function killCaniasSession(sid: string): Promise<boolean> {
  const client = await getSoapClient();
  try {
    await withTimeout(client.logoutAsync({ sessionid: sid }), 5_000, 'force-kill');
    console.log(`[CANIAS] Manuel kill: ${sid}`);
    return true;
  } catch {
    console.log(`[CANIAS] Manuel kill başarısız: ${sid}`);
    return false;
  }
}

// ─── logProcess heartbeat ─────────────────────────────────────────────────────

let _logProcessRunning = false;
let _shuttingDown      = false;

if (!IS_BUILD) setInterval(async () => {
  if (_shuttingDown || _logProcessRunning) return;
  // Tüm slotlar meşgulse heartbeat'i atla — gerçek isteklerin önüne geçme
  if (slots.every(s => s.busy)) return;
  _logProcessRunning = true;
  try {
    const { response, status } = await callCaniasService('logProcess', [], 30_000);
    console.log(`[CANIAS] logProcess (${status}): ${response}`);
  } catch (err) {
    console.log(`[CANIAS] logProcess hata: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    _logProcessRunning = false;
  }
}, 3 * 60_000);

// ─── Graceful shutdown ────────────────────────────────────────────────────────


async function gracefulLogout(): Promise<void> {
  if (!_client) return;
  _shuttingDown = true;
  console.log('[CANIAS] Graceful shutdown başlıyor...');

  // Idle timer'ları iptal et
  slots.forEach((_, i) => cancelIdleTimer(i as SlotNum));

  // Kuyruktaki bekleyenleri hemen reddet
  while (_waiters.length > 0) {
    const w = _waiters.shift()!;
    clearTimeout(w.timeoutId);
    w.reject(new Error('Sunucu kapatılıyor'));
  }

  // Aktif isteklerin bitmesini kısa süre bekle — devam eden Canias çağrısı varken
  // logout göndermek o isteği kesebilir ve veri tutarsızlığına yol açabilir
  const BUSY_WAIT_MS = 5_000;
  const busyStart    = Date.now();
  while (slots.some(s => s.busy) && Date.now() - busyStart < BUSY_WAIT_MS) {
    await new Promise(r => setTimeout(r, 100));
  }

  // Tüm açık oturumları kapat
  const sidler = getAllSids();
  await Promise.allSettled(sidler.map(async sid => {
    try {
      await withTimeout(_client!.logoutAsync({ sessionid: sid }), 3_000, 'graceful-logout');
      console.log(`[CANIAS] Graceful shutdown: ${sid} kapatıldı`);
    } catch {
      console.log(`[CANIAS] Graceful shutdown: ${sid} kapatılamadı`);
    }
  }));

  clearSessionFile();
  slots.forEach(s => { s.sid = ''; s.busy = false; });
  console.log('[CANIAS] Graceful shutdown tamamlandı.');
}

if (!IS_BUILD) {
  process.once('SIGTERM', async () => { console.log('[CANIAS] SIGTERM alındı.'); await gracefulLogout(); process.exit(0); });
  process.once('SIGINT',  async () => { console.log('[CANIAS] SIGINT alındı.');  await gracefulLogout(); process.exit(0); });
}
