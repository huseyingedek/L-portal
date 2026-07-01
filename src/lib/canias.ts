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
const LOGOUT_TIMEOUT_MS  = 5_000;
const MAX_RETRY          = 2;

// --- Genel yardimcilar ---

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

// --- SOAP Client (WSDL bir kez yuklenir, sonra onbellekten) ---

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

// --- Ana servis cagrisi ---
// Klasik model: her islemde login -> cagri -> logout.
// Her cagri taze oturum actigi icin disaridan kill edilse bile bir sonraki
// istek kendini toparlar; kalici oturum, slot havuzu, session dosyasi YOK.

export async function callCaniasService(
  functionName: string,
  params: string[],
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  const client = await getSoapClient();
  const args   = params.join(',');

  let lastErr = '';

  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    let sid = '';
    try {
      // 1) Login
      const loginRes = await withTimeout(client.loginAsync(LOGIN_ARGS), timeoutMs, `login-${functionName}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lr0: any = (loginRes as any)?.[0];
      sid = parseRawValue(lr0?.loginReturn ?? lr0 ?? '');
      if (!sid) { lastErr = 'Login basarisiz (bos session ID)'; continue; }

      // 2) Servis cagrisi
      const res = await withTimeout(
        client.callIASServiceAsync({ sessionid: sid, serviceid: functionName, args, returntype: 'STRING', permanent: false }),
        timeoutMs, functionName
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r0: any = (res as any)?.[0];
      const raw = parseRawValue(r0?.callIASServiceReturn ?? r0 ?? '');

      // Is hatasi (FL) ya da basari -- her iki durumda da sonucu dondur (retry yok)
      return { response: raw, status: raw.startsWith('FL') ? 'FL' : 'OK' };

    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
      console.log(`[CANIAS] Hata (attempt=${attempt}, fn=${functionName}): ${lastErr}`);
    } finally {
      // 3) Logout -- her kosulda (oturum acildiysa) kapat
      if (sid) {
        try { await withTimeout(client.logoutAsync({ sessionid: sid }), LOGOUT_TIMEOUT_MS, `logout-${functionName}`); }
        catch { /* logout basarisiz olsa da devam */ }
      }
    }

    // Bir sonraki denemeden once kisa bekle
    await new Promise(r => setTimeout(r, 500));
  }

  return { response: `Baglanti hatasi: ${lastErr}`, status: 'FL' };
}

// fiyatgor route'u bu isimle import ediyor -- geriye donuk uyumluluk icin alias
export const callCaniasServiceWithLogout = callCaniasService;
