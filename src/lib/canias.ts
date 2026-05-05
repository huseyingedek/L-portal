import { createClientAsync, Client } from 'soap';
import fs   from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// YAPILANDIRMA
// ─────────────────────────────────────────────────────────────────────────────
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
const REQUEST_TIMEOUT_MS = 60_000;  // 30'dan 60'a çıkarıldı — CANIAS yavaş olsa bile bekle
const SLOT_TIMEOUT_MS    = 120_000; // 30'dan 120'ye çıkarıldı — 200 bayi sıra beklese bile çökme
const HELPER_IDLE_MS     = 30_000;
const MAX_SESSIONS       = 4;
const MAX_RETRY          = 10;

const SESSION_FILE = path.join(process.cwd(), 'canias_session.txt');

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────
let _sid0 = '', _sid1 = '', _sid2 = '', _sid3 = '';
let _busy0 = false, _busy1 = false, _busy2 = false, _busy3 = false;
let _login0Promise: Promise<string> | null = null;
let _login1Promise: Promise<string> | null = null;
let _login2Promise: Promise<string> | null = null;
let _login3Promise: Promise<string> | null = null;
let _timer1: ReturnType<typeof setTimeout> | null = null;
let _timer2: ReturnType<typeof setTimeout> | null = null;
let _timer3: ReturnType<typeof setTimeout> | null = null;

// Açık oturum sayacı — await'ten ÖNCE artırılır (JS single-thread = atomik)
// Böylece eş zamanlı isteklerde MAX_SESSIONS kesinlikle aşılamaz
let _openCount = 0;

// Zombie temizliği kilidi + throttle
let _cleanupRunning = false;
let _lastCleanup    = 0;

// ─────────────────────────────────────────────────────────────────────────────
// CIRCUIT BREAKER STATE
// CLOSED  → normal çalışma
// OPEN    → sunucu erişilemiyor, istekleri anında reddet
// HALF    → reset süresi doldu, 1 test isteği gönder
// ─────────────────────────────────────────────────────────────────────────────
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF';
let _circuitState       : CircuitState = 'CLOSED';
let _circuitOpenedAt    : number       = 0;
let _consecutiveSoapFail: number       = 0; // arka arkaya SOAP bağlantı hatası sayısı
let _consecutiveTimeout : number       = 0; // arka arkaya timeout sayısı

// Kaç arka arkaya hata olursa circuit açılır
const CIRCUIT_SOAP_FAIL_THRESHOLD = 3;  // 3 SOAP bağlantı hatası → anında aç
const CIRCUIT_TIMEOUT_THRESHOLD   = 5;  // 5 arka arkaya timeout → aç
const CIRCUIT_RESET_MS            = 30_000; // 30sn sonra HALF-OPEN → test isteği

// ─────────────────────────────────────────────────────────────────────────────
// YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────────────────────────────────────────
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

function decrementCount(label: string): void {
  _openCount = Math.max(0, _openCount - 1);
  console.log(`[CANIAS] Oturum dusuruldu (${label}), kalan: ${_openCount}`);
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

// ─────────────────────────────────────────────────────────────────────────────
// CIRCUIT BREAKER FONKSİYONLARI
// ─────────────────────────────────────────────────────────────────────────────

// İstek göndermeden önce çağrılır — true ise isteği reddet
function isCircuitOpen(): boolean {
  if (_circuitState === 'CLOSED') return false;

  if (_circuitState === 'OPEN') {
    // Reset süresi doldu mu?
    if (Date.now() - _circuitOpenedAt >= CIRCUIT_RESET_MS) {
      _circuitState = 'HALF';
      console.log('[CANIAS] Circuit HALF-OPEN — test istegi gonderiliyor...');
      return false; // 1 test isteğine izin ver
    }
    return true; // hâlâ açık, reddet
  }

  // HALF: sadece 1 test isteğine izin verildi, diğerlerini reddet
  return false;
}

// Başarılı istek geldi → her sayacı sıfırla, circuit'i kapat
function onSuccess(): void {
  if (_circuitState !== 'CLOSED') {
    console.log('[CANIAS] Circuit CLOSED — sunucu geri geldi ✅');
  }
  _circuitState        = 'CLOSED';
  _consecutiveSoapFail = 0;
  _consecutiveTimeout  = 0;
}

// SOAP bağlantı hatası (timeout DEĞİL — sunucu gerçekten erişilemiyor)
function onSoapError(): void {
  _consecutiveTimeout  = 0; // farklı tip hata, timeout sayacını sıfırla
  _consecutiveSoapFail++;
  console.log(`[CANIAS] SOAP baglanti hatasi — arka arkaya: ${_consecutiveSoapFail}`);
  if (_consecutiveSoapFail >= CIRCUIT_SOAP_FAIL_THRESHOLD) {
    _circuitState    = 'OPEN';
    _circuitOpenedAt = Date.now();
    console.log(`[CANIAS] Circuit OPEN (SOAP hata) — ${CIRCUIT_RESET_MS / 1000}sn sonra tekrar denenecek`);
  }
}

// Timeout hatası (sunucu yavaş olabilir, çökmüş de olabilir)
function onTimeout(): void {
  _consecutiveSoapFail = 0; // farklı tip hata
  _consecutiveTimeout++;
  console.log(`[CANIAS] Timeout — arka arkaya: ${_consecutiveTimeout}`);
  if (_consecutiveTimeout >= CIRCUIT_TIMEOUT_THRESHOLD) {
    _circuitState    = 'OPEN';
    _circuitOpenedAt = Date.now();
    console.log(`[CANIAS] Circuit OPEN (timeout) — ${CIRCUIT_RESET_MS / 1000}sn sonra tekrar denenecek`);
  }
}

// FL hatası → oturum sorunu, sunucu sağlıklı → circuit'e dokunma
function onFL(): void {
  _consecutiveSoapFail = 0;
  _consecutiveTimeout  = 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// SOAP CLIENT (tekil, lazy)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// _openCount artırımı ÇAĞIRAN yerde yapılır (await öncesi, senkron = atomik).
// Hata olursa .catch() içinde geri alınır → double-count imkânsız.
// ─────────────────────────────────────────────────────────────────────────────
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
  console.log(`[CANIAS] Oturum alindi: ${sid} — toplam acik: ${_openCount}`);
  return sid;
}

async function primaryLogin(client: Client, label: string): Promise<string> {
  if (_login0Promise) return _login0Promise;
  _login0Promise = doLoginCall(client, label)
    .then(sid => { _sid0 = sid; writeSessionFile(sid); return sid; })
    .catch(err => { decrementCount('login0-fail'); throw err; })
    .finally(() => { _login0Promise = null; });
  return _login0Promise;
}

async function helperLogin1(client: Client, label: string): Promise<string> {
  if (_login1Promise) return _login1Promise;
  _login1Promise = doLoginCall(client, label)
    .then(sid => { _sid1 = sid; return sid; })
    .catch(err => { decrementCount('login1-fail'); throw err; })
    .finally(() => { _login1Promise = null; });
  return _login1Promise;
}

async function helperLogin2(client: Client, label: string): Promise<string> {
  if (_login2Promise) return _login2Promise;
  _login2Promise = doLoginCall(client, label)
    .then(sid => { _sid2 = sid; return sid; })
    .catch(err => { decrementCount('login2-fail'); throw err; })
    .finally(() => { _login2Promise = null; });
  return _login2Promise;
}

async function helperLogin3(client: Client, label: string): Promise<string> {
  if (_login3Promise) return _login3Promise;
  _login3Promise = doLoginCall(client, label)
    .then(sid => { _sid3 = sid; return sid; })
    .catch(err => { decrementCount('login3-fail'); throw err; })
    .finally(() => { _login3Promise = null; });
  return _login3Promise;
}

// ─────────────────────────────────────────────────────────────────────────────
// IDLE TIMER (yardımcı slotlar için)
// ─────────────────────────────────────────────────────────────────────────────
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
    if (!sid || getBusy()) return; // meşgulse dokunma

    clearSid();
    decrementCount(`idle-slot${slotNum}`);
    console.log(`[CANIAS] Yardimci ${slotNum} bosta kaldi (30sn), kapatiliyor: ${sid}`);
    try {
      await withTimeout(
        client.logoutAsync({ sessionid: sid }),
        5_000,
        `idle-logout-${slotNum}`
      );
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

// ─────────────────────────────────────────────────────────────────────────────
// SLOT YÖNETİMİ
// ─────────────────────────────────────────────────────────────────────────────
type SlotNum = 0 | 1 | 2 | 3;

function sidOf(slot: SlotNum): string {
  if (slot === 0) return _sid0;
  if (slot === 1) return _sid1;
  if (slot === 2) return _sid2;
  return _sid3;
}

// Slot'u geçersiz kıl: sid sil + sayaç azalt + logout (fire-and-forget)
function invalidateSlotSid(slot: SlotNum, client: Client): void {
  const sid = sidOf(slot);
  if (!sid) return;
  if (slot === 0) { _sid0 = ''; clearSessionFile(); }
  else if (slot === 1) _sid1 = '';
  else if (slot === 2) _sid2 = '';
  else _sid3 = '';
  decrementCount(`invalidate-slot${slot}`);
  withTimeout(
    client.logoutAsync({ sessionid: sid }),
    3_000,
    `invalidate-logout-${slot}`
  ).catch(() => {});
}

async function acquireSlot(client: Client, label: string): Promise<SlotNum> {
  const started = Date.now();

  while (true) {

    // ── Slot 0 (Primary — her zaman açık kalır) ──────────────────────────────
    if (!_busy0) {
      if (_sid0) { _busy0 = true; return 0; }
      if (_login0Promise) {
        // Devam eden login var: double-count ETME, sadece bekle
        _busy0 = true;
        try { await _login0Promise; return 0; }
        catch (err) { _busy0 = false; throw err; }
      }
      if (_openCount < MAX_SESSIONS) {
        _openCount++; // pre-increment (atomik)
        _busy0 = true;
        try { await primaryLogin(client, label); return 0; }
        catch (err) { _busy0 = false; throw err; } // decrementCount primaryLogin.catch'de yapıldı
      }
    }

    // ── Slot 1 ───────────────────────────────────────────────────────────────
    if (!_busy1) {
      cancelIdleTimer(1);
      if (_sid1) { _busy1 = true; return 1; }
      if (_login1Promise) {
        _busy1 = true;
        try { await _login1Promise; return 1; }
        catch { _busy1 = false; }
      } else if (_openCount < MAX_SESSIONS) {
        _openCount++;
        _busy1 = true;
        try {
          await helperLogin1(client, `${label}-yard1`);
          console.log('[CANIAS] Yardimci 1 devreye girdi.');
          return 1;
        } catch {
          console.log('[CANIAS] Yardimci 1 acilamadi.');
          _busy1 = false;
        }
      }
    }

    // ── Slot 2 ───────────────────────────────────────────────────────────────
    if (!_busy2) {
      cancelIdleTimer(2);
      if (_sid2) { _busy2 = true; return 2; }
      if (_login2Promise) {
        _busy2 = true;
        try { await _login2Promise; return 2; }
        catch { _busy2 = false; }
      } else if (_openCount < MAX_SESSIONS) {
        _openCount++;
        _busy2 = true;
        try {
          await helperLogin2(client, `${label}-yard2`);
          console.log('[CANIAS] Yardimci 2 devreye girdi.');
          return 2;
        } catch {
          console.log('[CANIAS] Yardimci 2 acilamadi.');
          _busy2 = false;
        }
      }
    }

    // ── Slot 3 ───────────────────────────────────────────────────────────────
    if (!_busy3) {
      cancelIdleTimer(3);
      if (_sid3) { _busy3 = true; return 3; }
      if (_login3Promise) {
        _busy3 = true;
        try { await _login3Promise; return 3; }
        catch { _busy3 = false; }
      } else if (_openCount < MAX_SESSIONS) {
        _openCount++;
        _busy3 = true;
        try {
          await helperLogin3(client, `${label}-yard3`);
          console.log('[CANIAS] Yardimci 3 devreye girdi.');
          return 3;
        } catch {
          console.log('[CANIAS] Yardimci 3 acilamadi, tum slotlar dolu, bekleniyor...');
          _busy3 = false;
        }
      }
    }

    // ── Timeout kontrolü ─────────────────────────────────────────────────────
    if (Date.now() - started >= SLOT_TIMEOUT_MS) {
      throw new Error(
        `acquireSlot: ${SLOT_TIMEOUT_MS}ms icerisinde bos slot bulunamadi (fn=${label})`
      );
    }

    // Kısa bekle, tekrar dene (busy-wait — 200 bayi için yeterli)
    await new Promise(r => setTimeout(r, 30));
  }
}

function releaseSlot(slot: SlotNum, client: Client): void {
  if (slot === 0)      { _busy0 = false; }
  else if (slot === 1) { _busy1 = false; if (_sid1) startIdleTimer(1, client); }
  else if (slot === 2) { _busy2 = false; if (_sid2) startIdleTimer(2, client); }
  else                 { _busy3 = false; if (_sid3) startIdleTimer(3, client); }
}

// ─────────────────────────────────────────────────────────────────────────────
// ZOMBIE TEMİZLİĞİ (başlangıçta bir kez + her başarılı çağrı sonrası throttled)
// ─────────────────────────────────────────────────────────────────────────────
type SessionRow = Record<string, string>;

async function fetchSessions(client: Client): Promise<SessionRow[] | null> {
  const sid = _sid0 || _sid1 || _sid2 || _sid3;
  if (!sid) return null;
  try {
    const result = await withTimeout(
      client.callIASServiceAsync({
        sessionid: sid,
        serviceid: 'checkProcess',
        args: 'WSONLIZ',
        returntype: 'STRING',
        permanent: false,
      }),
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
  if (_cleanupRunning) return;
  const now = Date.now();
  if (now - _lastCleanup < 2 * 60_000) return; // max 2 dakikada bir
  _cleanupRunning = true;
  _lastCleanup    = now;
  try {
    const sessions = await fetchSessions(client);
    if (!sessions) return;

    const bizimSidler = [_sid0, _sid1, _sid2, _sid3].filter(Boolean);

    // ── SADECE WSONLIZ oturumlarına bak — diğer kullanıcılara DOKUNMA ────────
    const wsonlizSessions = sessions.filter(
      s => s.CONNECTIONID && s.CONNECTIONID.startsWith('WSONLIZ')
    );

    // Boşta olan yabancı WSONLIZ oturumlarını kapat
    const yabanciIdle = wsonlizSessions.filter(
      s => Number(s.PROCESSTIME ?? 0) === 0 &&
           s.CONNECTIONID &&
           !bizimSidler.includes(s.CONNECTIONID)
    );
    for (const s of yabanciIdle) await safeLogout(client, s.CONNECTIONID);

    // Aktif yabancı WSONLIZ oturumları bitene kadar (max 2 dk) bekle, sonra kapat
    let digerAktifler = wsonlizSessions.filter(
      s => Number(s.PROCESSTIME ?? 0) > 0 &&
           s.CONNECTIONID &&
           !bizimSidler.includes(s.CONNECTIONID)
    );
    if (digerAktifler.length > 0) {
      const MAX_BEKLEME_MS   = 120_000;
      const POLL_INTERVAL_MS = 3_000;
      const baslangic = Date.now();
      while (digerAktifler.length > 0 && Date.now() - baslangic < MAX_BEKLEME_MS) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
        const guncel = await fetchSessions(client);
        if (!guncel) break;
        const guncelWsonliz = guncel.filter(
          s => s.CONNECTIONID && s.CONNECTIONID.startsWith('WSONLIZ')
        );
        const bitenler = digerAktifler.filter(prev => {
          const s = guncelWsonliz.find(u => u.CONNECTIONID === prev.CONNECTIONID);
          return !s || Number(s.PROCESSTIME ?? 0) === 0;
        });
        for (const s of bitenler) await safeLogout(client, s.CONNECTIONID);
        digerAktifler = guncelWsonliz.filter(
          s => Number(s.PROCESSTIME ?? 0) > 0 &&
               !bizimSidler.includes(s.CONNECTIONID)
        );
      }
    }
    if (_sid0) writeSessionFile(_sid0);
  } catch { /**/ }
  finally { _cleanupRunning = false; }
}

async function startupCleanup(): Promise<void> {
  console.log('[CANIAS] Baslangic: zombie temizligi basliyor...');
  try {
    const client = await getSoapClient();
    // Slot 0'ı kilitle — eş zamanlı ilk isteklerle race olmasın
    _busy0 = true;
    if (!_sid0 && !_login0Promise) {
      if (_openCount < MAX_SESSIONS) {
        _openCount++;
        try {
          await primaryLogin(client, 'startup');
        } catch (err) {
          _busy0 = false;
          console.log(`[CANIAS] Baslangic login hatasi: ${err instanceof Error ? err.message : String(err)}`);
          clearSessionFile();
          return;
        }
      }
    } else if (_login0Promise) {
      try { await _login0Promise; } catch { _busy0 = false; return; }
    }
    _busy0 = false;

    const mySid = _sid0;
    if (!mySid) return;
    const mySidBase = mySid.split('|')[0];

    const result = await withTimeout(
      client.callIASServiceAsync({
        sessionid: mySid,
        serviceid: 'checkProcess',
        args: 'WSONLIZ',
        returntype: 'STRING',
        permanent: false,
      }),
      10_000, 'startup-checkProcess'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res0: any = (result as any)?.[0];
    const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
    if (!raw || raw.startsWith('FL')) {
      console.log('[CANIAS] Baslangic: checkProcess bos dondu, temiz.');
      return;
    }
    const parsed = JSON.parse(raw);
    const sessions: SessionRow[] = Array.isArray(parsed)
      ? parsed
      : (Object.values(parsed) as SessionRow[]);

    // ── SADECE WSONLIZ oturumlarına bak — diğer kullanıcılara DOKUNMA ────────
    const wsonlizSessions = sessions.filter(
      s => s.CONNECTIONID && s.CONNECTIONID.startsWith('WSONLIZ')
    );
    console.log(`[CANIAS] Baslangic: CANIAS'ta ${wsonlizSessions.length} WSONLIZ oturumu bulundu.`);

    // Bizim yeni açtığımız oturum (mySid) dışındakiler zombie
    const zombiler = wsonlizSessions.filter(
      s => s.CONNECTIONID !== mySid && s.CONNECTIONID !== mySidBase
    );

    // _openCount'u gerçek duruma göre ayarla:
    // Bizim 1 yeni oturumumuz var, zombiler henüz kapatılmadı
    // Kapatma bittikten sonra net durum: sadece bizimki kalır
    if (zombiler.length === 0) {
      console.log('[CANIAS] Baslangic: WSONLIZ zombie yok, temiz.');
      // _openCount zaten startup'ta 1 olarak set edildi (primaryLogin ile)
      return;
    }

    console.log(`[CANIAS] Baslangic: ${zombiler.length} WSONLIZ zombie bulundu, kapatiliyor...`);
    for (const s of zombiler) {
      try {
        await withTimeout(
          client.logoutAsync({ sessionid: s.CONNECTIONID }),
          5_000,
          'startup-zombie-logout'
        );
        console.log(`[CANIAS] Baslangic: zombie kapatildi -> ${s.CONNECTIONID}`);
      } catch {
        console.log(`[CANIAS] Baslangic: zombie zaten olmuste -> ${s.CONNECTIONID}`);
      }
    }
    // Zombiler kapatıldı — _openCount artık doğru (primaryLogin'de 1 olarak set edildi)
  } catch (err) {
    _busy0 = false;
    console.log(`[CANIAS] Baslangic temizligi basarisiz: ${err instanceof Error ? err.message : String(err)}`);
    clearSessionFile();
  }
}

startupCleanup().catch(err =>
  console.log(`[CANIAS] startupCleanup unhandled: ${err instanceof Error ? err.message : String(err)}`)
);

// ─────────────────────────────────────────────────────────────────────────────
// ANA FONKSİYON
// ─────────────────────────────────────────────────────────────────────────────
export async function callCaniasService(
  functionName: string,
  params: string[]
): Promise<{ response: string; status: 'OK' | 'FL' }> {

  // ── Circuit breaker kontrolü ─────────────────────────────────────────────
  // OPEN durumdaysa slot bile almadan anında reddet
  if (isCircuitOpen()) {
    console.log(`[CANIAS] Circuit OPEN — istek reddedildi (fn=${functionName})`);
    return { response: 'Sunucu gecici olarak erisilemuyor, lutfen bekleyin', status: 'FL' };
  }

  const client = await getSoapClient();
  const args   = params.join(',');

  let slot: SlotNum;
  try {
    slot = await acquireSlot(client, functionName);
  } catch (err) {
    return {
      response: `Baglanti hatasi: ${err instanceof Error ? err.message : String(err)}`,
      status: 'FL',
    };
  }

  let sessionId = sidOf(slot);

  try {
    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {

      // Session yoksa yenile
      if (!sessionId) {
        if (_openCount >= MAX_SESSIONS) {
          await new Promise(r => setTimeout(r, 1_000 * (attempt + 1)));
          sessionId = sidOf(slot);
          continue;
        }
        _openCount++;
        try {
          if      (slot === 0) sessionId = await primaryLogin(client, `${functionName}-init${attempt}`);
          else if (slot === 1) sessionId = await helperLogin1(client, `${functionName}-init${attempt}`);
          else if (slot === 2) sessionId = await helperLogin2(client, `${functionName}-init${attempt}`);
          else                 sessionId = await helperLogin3(client, `${functionName}-init${attempt}`);
          console.log(`[CANIAS] Slot ${slot} icin login basarili (attempt=${attempt})`);
        } catch (loginErr) {
          console.log(
            `[CANIAS] Slot ${slot} login hatasi (attempt=${attempt}): ` +
            `${loginErr instanceof Error ? loginErr.message : loginErr}`
          );
          await new Promise(r => setTimeout(r, 1_000 * (attempt + 1)));
          continue;
        }
      }

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
          // ── FL ayrımı ──────────────────────────────────────────────────
          // "FL"     → gerçek session hatası → invalidate, yeni login aç
          // "FL;..." → iş mantığı hatası     → session sağlıklı, direkt döndür
          //
          // Örnekler:
          //   FL                             → session geçersiz
          //   FL;Geçersiz İş Alanı           → iş hatası, session tamam
          //   FL;Aynı Seri ve Numarada Kayıt → iş hatası, session tamam
          // ───────────────────────────────────────────────────────────────
          const flBody = raw.substring(2); // "FL" sonrası ("" veya ";..." şeklinde)

          const isSessionError =
            flBody === '' ||                               // sadece "FL"
            flBody.toLowerCase().includes('session')   ||
            flBody.toLowerCase().includes('oturum')    ||
            flBody.toLowerCase().includes('login')     ||
            flBody.toLowerCase().includes('timeout');

          if (isSessionError) {
            console.log(
              `[CANIAS] FL session hatasi (slot=${slot}, attempt=${attempt}, fn=${functionName}): ` +
              `oturum yenileniyor...`
            );
            onFL();
            invalidateSlotSid(slot, client);
            sessionId = '';
            continue;
          }

          // İş mantığı hatası → session sağlıklı, direkt döndür
          console.log(
            `[CANIAS] FL is hatasi (slot=${slot}, fn=${functionName}): ${raw} — session korunuyor`
          );
          onSuccess(); // session çalışıyor, sayaçları sıfırla
          return { response: raw, status: 'FL' };
        }

        // ── Başarılı ────────────────────────────────────────────────────────
        onSuccess(); // tüm sayaçları sıfırla, circuit'i kapat
        cleanupZombieSessions(client).catch(() => {});
        return { response: raw, status: 'OK' };

      } catch (servisHata) {
        const hataMsg   = servisHata instanceof Error ? servisHata.message : String(servisHata);
        const isTimeout = hataMsg.includes('timeout');
        console.log(
          `[CANIAS] Hata (slot=${slot}, attempt=${attempt}, fn=${functionName}): ${hataMsg}`
        );

        if (isTimeout) {
          // Timeout → oturum hâlâ geçerli olabilir; sayaç artır, bekle, tekrar dene
          onTimeout();
          console.log(`[CANIAS] Timeout, session korunuyor, tekrar deneniyor...`);
          await new Promise(r => setTimeout(r, 2_000));
          continue;
        }

        // SOAP bağlantı hatası → sunucu erişilemiyor olabilir
        onSoapError();
        invalidateSlotSid(slot, client);
        sessionId = '';
      }
    }
  } finally {
    releaseSlot(slot, client);
  }

  return { response: 'Maksimum deneme sayisina ulasildi', status: 'FL' };
}

// Geriye dönük uyumluluk
export const callCaniasServiceWithLogout = callCaniasService;

// ─────────────────────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────────────────────
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
  _openCount = 0;
}

process.once('SIGTERM', async () => { await gracefulLogout(); process.exit(0); });
process.once('SIGINT',  async () => { await gracefulLogout(); process.exit(0); });