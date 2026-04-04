import { createClientAsync, Client } from 'soap';

const WSDL_URL = process.env.CANIAS_WSDL_URL || 'http://192.168.1.50:8080/CaniasWS-v1/services/iasWebService?wsdl';

const LOGIN_ARGS = {
  p_strClient:    '00',
  p_strLanguage:  'T',
  p_strDBName:    'NEW',
  p_strDBServer:  'CANIAS',
  p_strAppServer: '192.168.1.50:27499/S2',
  p_strUserName:  'WSLIZAY',
  p_strPassword:  'Ws-123lizay',
};

const WSDL_TIMEOUT_MS    = 15_000;  // WSDL indirme maks 15sn
const REQUEST_TIMEOUT_MS = 30_000;  // Her SOAP çağrısı maks 30sn
const SESSION_TTL_MS     = 20 * 60 * 1000;

let _client:        Client | null          = null;
let _clientPromise: Promise<Client> | null = null;
let _sessionId  = '';
let _sessionExp = 0;

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
      // Hata durumunda sıfırla — bir sonraki istek tekrar deneyebilsin
      _clientPromise = null;
      throw err;
    });
  }
  return _clientPromise;
}

async function getSession(client: Client): Promise<string> {
  if (_sessionId && Date.now() < _sessionExp) return _sessionId;

  const loginResult = await withTimeout(
    client.loginAsync(LOGIN_ARGS),
    REQUEST_TIMEOUT_MS,
    'Login'
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r0: any = (loginResult as any)?.[0];
  const sid: string = r0?.loginReturn ?? r0 ?? '';
  _sessionId  = sid;
  _sessionExp = Date.now() + SESSION_TTL_MS;
  return sid;
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

export async function callCaniasService(
  functionName: string,
  params: string[]
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  const client = await getSoapClient();
  const args   = params.join(',');

  let sessionId: string;
  let result;

  try {
    sessionId = await getSession(client);
    result    = await callService(client, sessionId, functionName, args);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Timeout veya session hatası — session sıfırla ve bir kez daha dene
    _sessionId  = '';
    _sessionExp = 0;
    try {
      sessionId = await getSession(client);
      result    = await callService(client, sessionId, functionName, args);
    } catch {
      return { response: `Bağlantı hatası: ${msg}`, status: 'FL' };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res0: any = (result as any)?.[0];
  const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');

  if (raw.startsWith('FL')) {
    return { response: raw.substring(3), status: 'FL' };
  }
  return { response: raw, status: 'OK' };
}

