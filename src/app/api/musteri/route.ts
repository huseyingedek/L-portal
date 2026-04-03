import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { callCaniasService } from '@/lib/canias';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (type === 'ulke') {
    try {
      const result = await callCaniasService('getCountryCode', ['P2000C']);
      const parsed = JSON.parse(result.response);
      const rows = Array.isArray(parsed) ? parsed : parsed?.Records?.ROW ?? parsed?.ROW;
      return NextResponse.json(Array.isArray(rows) ? rows : rows ? [rows] : []);
    } catch (e) {
      console.error('[musteri/ulke] hata:', e);
      return NextResponse.json([]);
    }
  }

  if (type === 'sehir') {
    try {
      const ulke = searchParams.get('ulke') || 'TR';
      const result = await callCaniasService('getCityCode', [session.usern, ulke]);
      const parsed = JSON.parse(result.response);
      const rows = Array.isArray(parsed) ? parsed : parsed?.Records?.ROW ?? parsed?.ROW;
      return NextResponse.json(Array.isArray(rows) ? rows : rows ? [rows] : []);
    } catch (e) {
      console.error('[musteri/sehir] hata:', e);
      return NextResponse.json([]);
    }
  }

  return NextResponse.json({ error: 'type parametresi gerekli' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();

  const adres = body.kisi_adres
    ? body.kisi_adres
    : `${body.kisi_ilce || ''}/${(body.kisi_sehir || '').toUpperCase()}/ ${body.kisi_ulke || ''}`;

  // PHP operation.php ile birebir aynı XML yapısı
  const xml = `<?xml version='1.0' encoding='UTF-8'?>
<XMLCUSTTBL>
  <ROW>
    <ISCUSTORVEND>3</ISCUSTORVEND>
    <TAXNUM>${body.kisi_tc || ''}</TAXNUM>
    <TITLE></TITLE>
    <NAME1>${body.kisi_ad_soyad || ''}</NAME1>
    <ADDRESSLINE1>${adres}</ADDRESSLINE1>
    <COUNTRY>${body.kisi_ulke || 'TR'}</COUNTRY>
    <ISLOCKED>0</ISLOCKED>
    <ZIPSTREET>34000</ZIPSTREET>
    <CITY>${body.kisi_sehir || ''}</CITY>
    <TOWN>${body.kisi_ilce || ''}</TOWN>
    <LOCALITY></LOCALITY>
    <AVENUE></AVENUE>
    <STREET></STREET>
    <OTHERINFO></OTHERINFO>
    <TELNUM>${body.kisi_tel || ''}</TELNUM>
    <TLXNUM>aa.a.com.trr</TLXNUM>
    <CURRENCY>TL</CURRENCY>
    <LANGU>T</LANGU>
    <BRANCH>*</BRANCH>
    <SORTBY>*</SORTBY>
    <ACCLASS>C</ACCLASS>
    <CUSTACC></CUSTACC>
    <RECACC>120.01</RECACC>
    <ADVPACC>120.01</ADVPACC>
    <VATKEY>20</VATKEY>
    <PAYMCOND>000</PAYMCOND>
    <PAYMTYPE>*</PAYMTYPE>
    <ISSMSCONF>0</ISSMSCONF>
    <ISSMSCONFDATE>01.01.1975</ISSMSCONFDATE>
    <GENDER>${body.kisi_cinsiyet || 'Erkek'}</GENDER>
    <PASSPORTNUM>${body.kisi_pasaport_numarasi || ''}</PASSPORTNUM>
    <BIRTHDAY>${body.kisi_dogum_tarihi || ''}</BIRTHDAY>
    <PRBIRTHDAY>${body.kisi_es_dogum_tarihi || ''}</PRBIRTHDAY>
    <WEDDINGDAT>${body.kisi_evlilik_tarihi || ''}</WEDDINGDAT>
    <PASSPORTDATE>${body.kisi_pasaport_tarihi || ''}</PASSPORTDATE>
    <ISRINGSIZE>${body.kisi_yuzuk_olcusu || ''}</ISRINGSIZE>
    <NOT>${body.kisi_not || ''}</NOT>
  </ROW>
</XMLCUSTTBL>`;

  const kisi_sms = body.kisi_sms || '0';

  // PHP operation.php: wsCanias("addCustomer", ["0", $xml, $username, $kisi_sms])
  // İlk çağrı: ISSMSCONF=0 XML ile, 4. parametre kisi_sms
  // Eğer kisi_sms=1 ise API KVKK+ETK kodlarını döndürür → doğrulama gerekir
  try {
    const result = await callCaniasService('addCustomer', [
      '0',
      xml,
      session.usern,
      kisi_sms,
    ]);

    if (result.status === 'OK') {
      const responseStr = String(result.response || '').trim();

      // SMS istendi ve kod döndü → doğrulama adımı gerekiyor
      if (kisi_sms === '1' && responseStr.length >= 4) {
        const kvkk_code = responseStr.substring(0, 4).toUpperCase();
        const etk_code  = responseStr.substring(4).toUpperCase();

        // Form verilerini ve kodları session'a kaydet
        const cookieStore2 = await cookies();
        const session2 = await getIronSession<SessionData>(cookieStore2, sessionOptions);
        session2.musteri_kvkk    = kvkk_code;
        session2.musteri_etk     = etk_code;
        session2.musteri_veriler = JSON.stringify(body);
        await session2.save();

        return NextResponse.json({ needsVerification: true });
      }

      // SMS istenmedi veya kod dönmedi → kayıt direkt tamamlandı
      return NextResponse.json({ success: true, response: responseStr });
    }
    return NextResponse.json({ error: result.response }, { status: 400 });
  } catch (e) {
    console.error('[musteri/post] hata:', e);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
