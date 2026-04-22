import { createClientAsync, Client } from 'soap';

const WSDL_URL = process.env.CANIAS_WSDL_URL || 'http://192.168.1.50:8080/CaniasWS-v1/services/iasWebService?wsdl';

const LOGIN_ARGS = {
  p_strClient:    '00',
  p_strLanguage:  'T',
  p_strDBName:    'NEW',
  p_strDBServer:  'CANIAS',
  p_strAppServer: '192.168.1.50:27499/S2',
  p_strUserName:  'WSONLIZ',
  p_strPassword:  'Nvf7bM955zge2xgp',
};

const WSDL_TIMEOUT_MS    = 15_000;
const REQUEST_TIMEOUT_MS = 30_000;

let _client:        Client | null          = null;
let _clientPromise: Promise<Client> | null = null;

/** Verilen promise için zaman aşımı ekler */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`CANIAS timeout: ${label} (${ms}ms)`)), ms)
    ),
  ]);
}

async function getSoapClient(): Promise<Client> {
  if (_client) return _client;
  if (!_clientPromise) {
    _clientPromise = withTimeout(
      createClientAsync(WSDL_URL, { wsdl_options: { timeout: WSDL_TIMEOUT_MS } }),
      WSDL_TIMEOUT_MS,
      'WSDL yükleme'
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
    return JSON.stringify(rawValue);
  }
  return String(rawValue ?? '');
}

async function callService(client: Client, sessionId: string, functionName: string, args: string) {
  return withTimeout(
    client.callIASServiceAsync({
      sessionid:  sessionId,
      serviceid:  functionName,
      args,
      returntype: 'string',
      permanent:  false,
    }),
    REQUEST_TIMEOUT_MS,
    functionName
  );
}

async function freshLogin(client: Client, label: string): Promise<string> {
  const loginResult = await withTimeout(
    client.loginAsync(LOGIN_ARGS),
    REQUEST_TIMEOUT_MS,
    `Login (${label})`
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r0: any = (loginResult as any)?.[0];
  const sid = parseRawValue(r0?.loginReturn ?? r0 ?? '');
  return sid;
}

async function doLogout(client: Client, sessionId: string, label: string): Promise<void> {
  try {
    await withTimeout(
      client.logoutAsync({ sessionid: sessionId }),
      5_000,
      `Logout (${label})`
    );
    console.log(`[CANIAS] Logout OK [${label}] session: ${sessionId}`);
  } catch (err) {
    console.error(`[CANIAS] Logout HATA [${label}]:`, err instanceof Error ? err.message : String(err));
  }
}

/**
 * Her çağrıda: login → servis → logout
 * Tüm CANIAS işlemleri bu fonksiyonla yapılır.
 */
export async function callCaniasService(
  functionName: string,
  params: string[]
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  const client = await getSoapClient();
  const args   = params.join(',');

  let sessionId: string;
  try {
    sessionId = await freshLogin(client, functionName);
    if (!sessionId) return { response: 'Login başarısız', status: 'FL' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { response: `Bağlantı hatası: ${msg}`, status: 'FL' };
  }

  let raw = '';
  try {
    const result = await callService(client, sessionId, functionName, args);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res0: any = (result as any)?.[0];
    raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await doLogout(client, sessionId, functionName);
    return { response: `Servis hatası: ${msg}`, status: 'FL' };
  }

  await doLogout(client, sessionId, functionName);

  if (raw.startsWith('FL')) {
    return { response: raw.substring(3), status: 'FL' };
  }
  return { response: raw, status: 'OK' };
}

// Geriye dönük uyumluluk için alias
export const callCaniasServiceWithLogout = callCaniasService;
