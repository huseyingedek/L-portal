import { createClientAsync, Client } from 'soap';

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
const LOGIN_TIMEOUT_MS   = 20_000;
const LOGOUT_TIMEOUT_MS  = 8_000;
const QUERY_TIMEOUT_MS   = 12_000;
const MAX_RETRY          = 2;
const MAX_REAP_TRIES     = 6;
const REAPER_INTERVAL_MS = 60_000;   // logout'u takılan kendi oturumlarımızı tekrar dener
const SWEEP_INTERVAL_MS  = 150_000;  // Canias'ta kalmış (boştaki) WSONLIZ oturumlarını tarar
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

// Yazma servisleri: servis çağrısı gönderildikten sonra hata/timeout gelirse TEKRAR DENENMEZ.
// (Sunucu ilk isteği commit etmiş olabilir; retry mükerrer kayıt oluşturur.)
const YAZMA_SERVISLERI = new Set<string>([
  'consExpensesCommit', 'consExpenseConfirm', 'consExpenseConfirmSH', 'consExpenseConfirmVER',
  'consExpenseRefuse', 'consExpenseRefuseSH', 'consNewSharedocNumb', 'addCustomer',
]);

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));


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

function connId(sid: string): string { return sid.split('|')[0]; }


let _client:        Client | null          = null;
let _clientPromise: Promise<Client> | null = null;

async function getSoapClient(): Promise<Client> {
  if (_client) return _client;
  if (!_clientPromise) {
    _clientPromise = withTimeout(
      createClientAsync(WSDL_URL, { wsdl_options: { timeout: WSDL_TIMEOUT_MS } }),
      WSDL_TIMEOUT_MS, 'WSDL yukleme',
    ).then(c => { _client = c; return c; })
     .catch(err => { _clientPromise = null; throw err; });
  }
  return _clientPromise;
}

function resetClient(): void { _client = null; _clientPromise = null; }

const activeSids = new Set<string>();
const leakedSids = new Map<string, number>();

async function tryLogout(client: Client, sid: string, label: string): Promise<boolean> {
  try {
    // WSDL'de logout parametresinin adı 'p_strSessionId' (callIASService'teki 'sessionid' DEĞİL).
    // Yanlış ad gönderilirse SOAP çağrısı OK döner ama oturumu kapatmaz.
    await withTimeout(client.logoutAsync({ p_strSessionId: sid }), LOGOUT_TIMEOUT_MS, `logout-${label}`);
    console.log(`[CANIAS] logout OK (${label}): ${connId(sid)}`);
    return true;
  } catch (e) {
    console.log(`[CANIAS] logout FAIL (${label}): ${connId(sid)} -> ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

async function doLogin(client: Client, label: string): Promise<string> {
  const loginRes = await withTimeout(client.loginAsync(LOGIN_ARGS), LOGIN_TIMEOUT_MS, `login-${label}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lr0: any = (loginRes as any)?.[0];
  return parseRawValue(lr0?.loginReturn ?? lr0 ?? '');
}


export async function callCaniasService(
  functionName: string,
  params: string[],
  timeoutMs: number = REQUEST_TIMEOUT_MS,
  idempotent: boolean = !YAZMA_SERVISLERI.has(functionName),
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  // Argümanlar virgülle birleştiği için parametredeki virgül alanları kaydırır -> baştan reddet.
  const virgullu = params.find(p => typeof p === 'string' && p.includes(','));
  if (virgullu !== undefined) {
    return { response: `FL Parametre virgul iceremez (Canias ayraci): "${virgullu}"`, status: 'FL' };
  }
  const args = params.join(',');
  let lastErr = '';

  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    let client: Client;
    try {
      client = await getSoapClient();
    } catch (e) {
      lastErr = `WSDL/baglanti: ${e instanceof Error ? e.message : e}`;
      console.log(`[CANIAS] ${lastErr} (attempt=${attempt})`);
      resetClient();
      await sleep(500);
      continue;
    }

    let sid = '';
    let connErr = false;
    let dispatched = false;   // servis çağrısı sunucuya gönderildi mi
    try {
      // 1) Login
      sid = await doLogin(client, functionName);
      // Login yanıtını doğrula: boş ya da FL ile başlıyorsa geçersiz say.
      if (!sid || sid.startsWith('FL')) { lastErr = `Login gecersiz yanit: ${sid || '(bos)'}`; connErr = true; continue; }
      activeSids.add(sid);

      // 2) Servis çağrısı — bir kez gönderildikten sonra yazma servislerinde retry edilmez
      dispatched = true;
      const res = await withTimeout(
        client.callIASServiceAsync({ sessionid: sid, serviceid: functionName, args, returntype: 'STRING', permanent: false }),
        timeoutMs, functionName,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r0: any = (res as any)?.[0];
      const raw = parseRawValue(r0?.callIASServiceReturn ?? r0 ?? '');

      // İş hatası (FL) ya da başarı — ikisinde de sonucu döndür (yeniden deneme yok)
      return { response: raw, status: raw.startsWith('FL') ? 'FL' : 'OK' };

    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
      connErr = true;
      console.log(`[CANIAS] Hata (attempt=${attempt}, fn=${functionName}): ${lastErr}`);
      // Çağrı gönderildikten sonra hata: yazma servisinde mükerrer kayıt olmasın diye tekrar deneme.
      if (dispatched && !idempotent) {
        return { response: `Baglanti hatasi (yazma, tekrar denenmedi): ${lastErr}`, status: 'FL' };
      }
    } finally {
      // 3) Logout
      if (sid) {
        activeSids.delete(sid);
        const ok = await tryLogout(client, sid, functionName);
        if (!ok) leakedSids.set(sid, 0);
      }
      // Bağlantı seviyesinde hata olduysa client'i sıfırla (çökme/kopma sonrası taze kurulsun)
      if (connErr) resetClient();
    }

    await sleep(500);
  }

  return { response: `Baglanti hatasi: ${lastErr}`, status: 'FL' };
}

export const callCaniasServiceWithLogout = callCaniasService;

let _reaping = false;
async function reapLeaked(): Promise<void> {
  if (_reaping || leakedSids.size === 0) return;
  _reaping = true;
  try {
    let client: Client;
    try { client = await getSoapClient(); } catch { return; }
    for (const [sid, tries] of Array.from(leakedSids.entries())) {
      if (activeSids.has(sid)) continue;                 
      const ok = await tryLogout(client, sid, 'reaper');
      if (ok || tries + 1 >= MAX_REAP_TRIES) leakedSids.delete(sid);
      else leakedSids.set(sid, tries + 1);
    }
  } finally {
    _reaping = false;
  }
}

type SessionRow = Record<string, string>;
let _sweeping = false;

async function fetchWsonlizSessions(client: Client, sid: string): Promise<SessionRow[] | null> {
  for (const svc of ['SYSGETUSERINFOLIST', 'checkProcess']) {
    try {
      const r = await withTimeout(
        client.callIASServiceAsync({ sessionid: sid, serviceid: svc, args: 'WSONLIZ', returntype: 'STRING', permanent: false }),
        QUERY_TIMEOUT_MS, svc,
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r0: any = (r as any)?.[0];
      const raw = parseRawValue(r0?.callIASServiceReturn ?? r0 ?? '');
      if (!raw || raw.startsWith('FL')) continue;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : (Object.values(parsed) as SessionRow[]);
    } catch { continue; }
  }
  return null;
}

async function sweepZombies(): Promise<void> {
  if (_sweeping) return;
  _sweeping = true;
  let client: Client | null = null;
  let sid = '';
  try {
    try { client = await getSoapClient(); } catch { return; }

    sid = await doLogin(client, 'sweep');
    if (!sid) return;
    activeSids.add(sid);

    const sessions = await fetchWsonlizSessions(client, sid);
    if (!sessions) return;

    const korumali = new Set<string>([connId(sid), ...Array.from(activeSids).map(connId)]);
    const zombiler = sessions.filter(s =>
      s.CONNECTIONID?.startsWith('WSONLIZ') &&
      !korumali.has(s.CONNECTIONID) &&
      parseInt(s.PROCESSTIME ?? '0', 10) === 0, 
    );

    if (zombiler.length > 0) {
      console.log(`[CANIAS] sweep: ${zombiler.length} bosta WSONLIZ oturumu kapatiliyor`);
      for (const z of zombiler) {
        await tryLogout(client, z.CONNECTIONID, 'sweep-zombie');
      }
    }
  } catch (e) {
    console.log(`[CANIAS] sweep hata: ${e instanceof Error ? e.message : e}`);
  } finally {
    if (sid && client) {
      activeSids.delete(sid);
      const ok = await tryLogout(client, sid, 'sweep-self');
      if (!ok) leakedSids.set(sid, 0);
    }
    _sweeping = false;
  }
}



if (!IS_BUILD) {
  setInterval(() => { reapLeaked().catch(() => {}); }, REAPER_INTERVAL_MS);
  setInterval(() => { sweepZombies().catch(() => {}); }, SWEEP_INTERVAL_MS);

  setTimeout(() => { sweepZombies().catch(() => {}); }, 5_000);

  const graceful = async (sinyal: string) => {
    console.log(`[CANIAS] ${sinyal} alindi, acik oturumlar kapatiliyor...`);
    try {
      const client = _client;
      if (client) {
        for (const s of Array.from(activeSids))        await tryLogout(client, s, 'shutdown');
        for (const s of Array.from(leakedSids.keys()))  await tryLogout(client, s, 'shutdown-leaked');
      }
    } catch { /* */ }
  };
  process.once('SIGTERM', async () => { await graceful('SIGTERM'); process.exit(0); });
  process.once('SIGINT',  async () => { await graceful('SIGINT');  process.exit(0); });
}
