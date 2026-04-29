import { createClientAsync, Client } from 'soap';
import fs from 'fs';
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
const SESSION_FILE       = path.join(process.cwd(), 'canias-session.txt');

/** Aktif oturum ID'si — tüm istekler bunu paylaşır */
let _sessionId: string = '';

/** Verilen promise için zaman aşımı ekler */
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

/** Session ID'yi dosyaya kaydeder */
function saveSession(sid: string) {
  try { fs.writeFileSync(SESSION_FILE, sid, 'utf8'); } catch { /* sessiz geç */ }
}

/** Session ID'yi dosyadan okur */
function loadSession(): string {
  try {
    if (fs.existsSync(SESSION_FILE)) return fs.readFileSync(SESSION_FILE, 'utf8').trim();
  } catch { /* sessiz geç */ }
  return '';
}

/** CANIAS oturumunun hâlâ aktif olup olmadığını kontrol eder */
async function isSessionAlive(client: Client, sid: string): Promise<boolean> {
  if (!sid) return false;
  try {
    const result = await withTimeout(
      client.callIASServiceAsync({
        sessionid:  sid,
        serviceid:  'checkSessionId',
        args:       '',
        returntype: 'string',
        permanent:  false,
      }),
      10_000,
      'checkSessionId'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res0: any = (result as any)?.[0];
    const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
    const alive = raw !== '' && !raw.startsWith('FL');
    console.log(`[CANIAS] checkSessionId → "${raw}" → ${alive ? 'CANLI' : 'ÖLMÜŞ'}`);
    return alive;
  } catch {
    return false;
  }
}

/** Aktif ve geçerli bir session ID döner; gerekirse yeniden login atar */
async function getSession(client: Client, label: string): Promise<string> {
  // Önce bellekteki oturumu dene
  if (!_sessionId) _sessionId = loadSession();

  if (await isSessionAlive(client, _sessionId)) {
    return _sessionId;
  }

  // Oturum ölmüş — yeniden login
  console.log(`[CANIAS] Oturum yok/geçersiz, yeniden login atılıyor... (${label})`);
  const loginResult = await withTimeout(
    client.loginAsync(LOGIN_ARGS),
    REQUEST_TIMEOUT_MS,
    `Login (${label})`
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r0: any = (loginResult as any)?.[0];
  const sid = parseRawValue(r0?.loginReturn ?? r0 ?? '');

  if (!sid) throw new Error('Login başarısız, session ID boş döndü');

  _sessionId = sid;
  saveSession(sid);
  console.log(`[CANIAS] Yeni oturum alındı: ${sid}`);
  return sid;
}

/**
 * Paylaşılan oturumla servis çağrısı yapar.
 * Login sadece oturum yoksa veya ölmüşse yapılır — logout asla yapılmaz.
 */
export async function callCaniasService(
  functionName: string,
  params: string[]
): Promise<{ response: string; status: 'OK' | 'FL' }> {
  const client = await getSoapClient();
  const args   = params.join(',');

  let sessionId: string;
  try {
    sessionId = await getSession(client, functionName);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { response: `Bağlantı hatası: ${msg}`, status: 'FL' };
  }

  let raw = '';
  try {
    const result = await withTimeout(
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res0: any = (result as any)?.[0];
    raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
  } catch (err) {
    // Oturum ölmüş olabilir — sıfırla, bir sonraki istekte yeniden login atar
    _sessionId = '';
    saveSession('');
    const msg = err instanceof Error ? err.message : String(err);
    return { response: `Servis hatası: ${msg}`, status: 'FL' };
  }

  if (raw.startsWith('FL')) {
    return { response: raw.substring(3), status: 'FL' };
  }
  return { response: raw, status: 'OK' };
}

// Geriye dönük uyumluluk için alias
export const callCaniasServiceWithLogout = callCaniasService;
