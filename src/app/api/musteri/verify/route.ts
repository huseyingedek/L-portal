import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { callCaniasService } from '@/lib/canias';

function buildXml(body: Record<string, string>, issmsconf: number) {
  const adres = body.kisi_adres
    ? body.kisi_adres
    : `${body.kisi_ilce || ''}/${(body.kisi_sehir || '').toUpperCase()}/ ${body.kisi_ulke || ''}`;

  const today = new Date();
  const dd   = String(today.getDate()).padStart(2, '0');
  const mm   = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const dateStr = issmsconf > 0 ? `${dd}.${mm}.${yyyy}` : '';

  return `<?xml version='1.0' encoding='UTF-8'?>
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
    <ISSMSCONF>${issmsconf}</ISSMSCONF>
    <ISSMSCONFDATE>${dateStr}</ISSMSCONFDATE>
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
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { userInput } = await req.json();
  const entered = String(userInput || '').trim().toUpperCase();

  const kvkk_code      = session.musteri_kvkk || '';
  const etk_code       = session.musteri_etk  || '';
  const kvkk_etk_codes = kvkk_code + etk_code;

  if (!kvkk_code || !session.musteri_veriler) {
    return NextResponse.json({ error: 'Oturum süresi dolmuş, lütfen formu tekrar doldurun.' }, { status: 400 });
  }

  const body: Record<string, string> = JSON.parse(session.musteri_veriler);

  let issmsconf  = 0;
  let smsParam   = '0';
  let resultLabel = 'Reddedildi';

  if (entered === kvkk_etk_codes) {
    issmsconf  = 2;
    smsParam   = '2';
    resultLabel = 'KVKK_ETK';
  } else if (entered === kvkk_code) {
    issmsconf  = 1;
    smsParam   = '1';
    resultLabel = 'KVKK';
  } else if (entered === etk_code) {
    issmsconf  = 1;
    smsParam   = '1';
    resultLabel = 'ETK';
  }

  const xml = buildXml(body, issmsconf);

  try {
    const result = await callCaniasService('addCustomer', [
      '0',
      xml,
      session.usern,
      smsParam,
    ]);

    // Oturumdan müşteri verilerini temizle
    delete session.musteri_kvkk;
    delete session.musteri_etk;
    delete session.musteri_veriler;
    await session.save();

    if (result.status === 'OK') {
      return NextResponse.json({ success: true, result: resultLabel });
    }
    return NextResponse.json({ error: result.response }, { status: 400 });
  } catch (e) {
    console.error('[musteri/verify] hata:', e);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
