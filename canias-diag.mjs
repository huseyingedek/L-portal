// Canias logout teşhis betiği.
// Sunucuda (192.168.1.50'e erişimi olan makinede) proje kökünde çalıştır:
//   node canias-diag.mjs
// Amaç: WSDL'deki login/logout/callIASService operasyonlarının GERÇEK parametre
// adlarını göstermek ve canlı bir login -> logout denemesinin sonucunu yazdırmak.

import soap from 'soap';

const WSDL = process.env.CANIAS_WSDL_URL
  || 'http://192.168.1.50:8080/CaniasWS-v1/services/iasWebService?wsdl';

// Bizim projedeki LOGIN_ARGS ile birebir aynı (WSONLIZ)
const LOGIN_ARGS = {
  p_strClient:    '00',
  p_strLanguage:  'T',
  p_strDBName:    'NEW',
  p_strDBServer:  'CANIAS',
  p_strAppServer: '192.168.1.50:27499',
  p_strUserName:  'WSONLIZ',
  p_strPassword:  'Nvf7bM955zge2xgp',
};

function parseRaw(v) {
  if (v && typeof v === 'object') {
    if ('$value' in v) return String(v.$value);
    return JSON.stringify(v);
  }
  return String(v ?? '');
}

const client = await soap.createClientAsync(WSDL);

// 1) Operasyonların gerçek parametre adları
console.log('==================== OPERASYON PARAMETRELERİ ====================');
const desc = client.describe();
for (const svc of Object.keys(desc)) {
  for (const port of Object.keys(desc[svc])) {
    const ops = desc[svc][port];
    for (const opName of ['login', 'logout', 'callIASService']) {
      if (ops[opName]) {
        console.log(`${opName}.input =`, JSON.stringify(ops[opName].input));
      }
    }
  }
}

// 2) Canlı login
console.log('\n==================== LOGIN ====================');
const [loginRes] = await client.loginAsync(LOGIN_ARGS);
const sid = parseRaw(loginRes?.loginReturn ?? loginRes);
console.log('sid =', sid);

// 3) Logout'u DOĞRU param adıyla (p_strSessionId) dene
console.log('\n==================== LOGOUT (p_strSessionId ile) ====================');
try {
  const [logoutRes] = await client.logoutAsync({ p_strSessionId: sid });
  console.log('logout yanıtı =', JSON.stringify(logoutRes));
  console.log('son giden XML =', client.lastRequest);
} catch (e) {
  console.log('logout HATA =', e?.message || e);
  console.log('son giden XML =', client.lastRequest);
}

console.log('\nBitti. Şimdi Workbench\'te bu sid gerçekten kapandı mı kontrol et.');
process.exit(0);
