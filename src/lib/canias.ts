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
const REQUEST_TIMEOUT_MS = 30_000;

/** Aktif oturum ID'si — memory'de tutulur, txt yok */
let _sessionId: string = '';

/** Login mutex — aynı anda sadece 1 login işlemi yapılır */
let _loginPromise: Promise<string> | null = null;

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

/** CANIAS oturumunun hâlâ aktif olup olmadığını kontrol eder */
async function isSessionAlive(client: Client, sid: string): Promise<boolean> {
  if (!sid) return false;
  try {
    const result = await withTimeout(
      client.callIASServiceAsync({
        sessionid:  sid,
        serviceid:  'checkSessionId',
        args:       '',
        returntype: 'STRING',
        permanent:  false,
      }),
      10_000,
      'checkSessionId'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res0: any = (result as any)?.[0];
    const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');
    const alive = raw !== '';  // herhangi bir yanıt = CANLI, boş/hata = ÖLMÜŞ
    console.log(`[CANIAS] checkSessionId → "${raw}" → ${alive ? 'CANLI' : 'ÖLMÜŞ'}`);
    return alive;
  } catch {
    return false;
  }
}

/**
 * Login mutex ile korunan login fonksiyonu.
 * Aynı anda birden fazla login isteği gelirse hepsi aynı promise'i bekler.
 */
async function doLogin(client: Client, label: string): Promise<string> {
  if (_loginPromise) {
    console.log(`[CANIAS] Login zaten sürüyor, bekleniyor... (${label})`);
    return _loginPromise;
  }

  _loginPromise = (async () => {
    console.log(`[CANIAS] Yeni login atılıyor... (${label})`);
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
    console.log(`[CANIAS] Yeni oturum alındı: ${sid}`);
    return sid;
  })().finally(() => {
    _loginPromise = null;
  });

  return _loginPromise;
}

/** Aktif ve geçerli bir session ID döner; gerekirse yeniden login atar */
async function getSession(client: Client, label: string): Promise<string> {
  if (await isSessionAlive(client, _sessionId)) {
    return _sessionId;
  }
  return doLogin(client, label);
}

/**
 * Paylaşılan oturumla servis çağrısı yapar.
 * Login sadece oturum yoksa veya ölmüşse yapılır — logout asla yapılmaz.
 * Session çağrı sırasında ölürse bir kez daha login atıp tekrar dener.
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

  // Servis çağrısı — session çağrı sırasında ölürse 1 kez daha dene
  for (let attempt = 1; attempt <= 2; attempt++) {
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
        return { response: raw.substring(3), status: 'FL' };
      }
      return { response: raw, status: 'OK' };

    } catch (err) {
      if (attempt === 2) {
        const msg = err instanceof Error ? err.message : String(err);
        return { response: `Servis hatası: ${msg}`, status: 'FL' };
      }
      // İlk denemede hata → session ölmüş olabilir, yeniden login at
      console.log(`[CANIAS] Servis hatası, session yenileniyor... (${functionName})`);
      _sessionId = '';
      try {
        sessionId = await doLogin(client, functionName);
      } catch (loginErr) {
        const msg = loginErr instanceof Error ? loginErr.message : String(loginErr);
        return { response: `Bağlantı hatası: ${msg}`, status: 'FL' };
      }
    }
  }

  return { response: 'Bilinmeyen hata', status: 'FL' };
}

// Geriye dönük uyumluluk için alias
export const callCaniasServiceWithLogout = callCaniasService;

/**
 * PM2/process shutdown sinyalinde mevcut CANIAS oturumunu temiz kapatır.
 * Böylece sunucu yeniden başladığında CANIAS'ta zombie session kalmaz.
 */
async function gracefulLogout() {
  if (!_sessionId || !_client) return;
  try {
    await withTimeout(
      _client.logoutAsync({ sessionid: _sessionId }),
      5_000,
      'Graceful logout'
    );
    console.log('[CANIAS] Graceful shutdown: oturum kapatıldı');
  } catch { /* sessiz geç */ }
}

process.once('SIGTERM', async () => { await gracefulLogout(); process.exit(0); });
process.once('SIGINT',  async () => { await gracefulLogout(); process.exit(0); });
