import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

// Ana Iyzipay sınıfı yerine doğrudan resource kullan
// (Turbopack fs.readdirSync'i desteklemiyor)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PayWithIyzico = require('iyzipay/lib/resources/PayWithIyzico');

const API_KEYS: Record<string, { apiKey: string; secretKey: string }> = {
  FRNIZMITC:     { apiKey: '20KAhkPtoJwP8h3LFrPf2tazpJC2pp1F', secretKey: 'q6tSJI3ziyEzpCrEqU5S507n6La9FOyS' },
  FRNNAUTILUS:   { apiKey: 'gPPCVjtGtNpMzyn3fvBd1hJ0C5R4lFfC', secretKey: 'MARE0lillu1FYj1wqiAD2ktrukigFAOW' },
  FRNFISTANBUL:  { apiKey: 'H1w6NvUagTI3xdu6hLMnuN9vyoU3l4Sn', secretKey: 'WT9b1coCAG1ilAn5xVZpVLIu6k7WtBTB' },
  FRNISTOZDILEK: { apiKey: 'E1VlBhBkraHoy02EAfIW5woT1ncdll88', secretKey: '50BG326sl50Du8edRlbLgSXs3a3tW5I8' },
  FRNINEGOL:     { apiKey: 'g2kW31Dfn2yHpxuemTF8zwWxvgmwLKHg', secretKey: 'jIypKp9008dSaFSus6msTopY9fN9twu7' },
  LNADIRE:       { apiKey: 'IIhpUhpuFWgj345ut5lbvhe4fVkSQY8E', secretKey: 'LNu8FDgZi19ZDGBB5GvcSNOqe2YVUowS' },
  LIHILLTOWN:    { apiKey: 'Elaa0jPwP9khuehxzXGL91rkng9gkhWk', secretKey: 'zoIelpGkhSxOm30o9XsgB53mYMNFoRfJ' },
  FRNGUZELDAG:   { apiKey: 'kO1UW8w80wHkE3X1LViXau4FwKs01cl7', secretKey: 'PWDLmnrJ4OEE6hMM32GM69SQzNec7S0K' },
  FRNGORDION:    { apiKey: '8M3PUZDdl0jyuFlFhZCZ6ASxTq4LFulO', secretKey: 'DDD4LZ2gsz0GgDVQZ86sDsbgdBcPOtwa' },
  LSYMBOL:       { apiKey: '8zbTgs25KXgefJy6FAL3gqnE9ehcRehcRVMU', secretKey: 'az8RgTj2MX2nWtcOrL6iXWpmk52PgmJp' },
};

const DEFAULT_KEYS = {
  apiKey:    'HTjq7Xl7yH9qWzxqbfRIC0OsjsR1e6au',
  secretKey: 'GtXWaj32VOwXukJVpBMRVhkgM0QaF6lt',
};

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  // PHP odeme-sayfasi/index.php'de session kontrolü yorum satırında (public)
  // API tarafında da aynı şekilde hem çalışan hem bayi kullanabilir
  const isEmployee = session.login === 1;
  const isBayi     = !!session.odeme_firma_ad;
  if (!isEmployee && !isBayi) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();
  const { odeme_tc, odeme_kisi, odeme_tel, odeme_email, odeme_fatura, odeme_tutar } = body;

  const { apiKey, secretKey } = API_KEYS[session.usern] ?? DEFAULT_KEYS;

  const payWithIyzico = new PayWithIyzico({
    uri: 'https://api.iyzipay.com',
    apiKey,
    secretKey,
  });

  const adParts = odeme_kisi.trim().split(' ');
  const ad    = adParts[0] || '';
  const soyad = adParts.slice(1).join(' ') || ad;

  const request = {
    locale: 'tr',
    conversationId: Date.now().toString(),
    price: odeme_tutar,
    paidPrice: odeme_tutar,
    currency: 'TRY',
    basketId: `B${Date.now()}`,
    paymentGroup: 'PRODUCT',
    enabledInstallments: [2, 3, 6, 9],
    callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/api/odeme/callback`,
    buyer: {
      id: session.usern,
      name: ad,
      surname: soyad,
      gsmNumber: `+9${odeme_tel}`,
      email: odeme_email,
      identityNumber: odeme_tc,
      lastLoginDate: '2015-10-05 12:43:35',
      registrationDate: '2013-04-21 15:12:09',
      registrationAddress: odeme_fatura,
      ip: req.headers.get('x-forwarded-for') ?? '85.34.78.112',
      city: 'Istanbul',
      country: 'Turkey',
      zipCode: '34732',
    },
    shippingAddress: {
      contactName: `${ad} ${soyad}`,
      city: 'Istanbul',
      country: 'Turkey',
      address: odeme_fatura,
      zipCode: '34732',
    },
    billingAddress: {
      contactName: `${ad} ${soyad}`,
      city: 'Istanbul',
      country: 'Turkey',
      address: odeme_fatura,
      zipCode: '34732',
    },
    basketItems: [{
      id: 'BI101',
      name: 'Lizay Pirlanta Odeme',
      category1: 'Odeme',
      category2: 'Mucevher',
      itemType: 'VIRTUAL',
      price: odeme_tutar,
    }],
  };

  return new Promise<NextResponse>((resolve) => {
    payWithIyzico.initialize(
      request,
      (err: unknown, result: { status: string; payWithIyzicoPageUrl: string; errorMessage?: string }) => {
        if (err || result?.status !== 'success') {
          resolve(NextResponse.json({ error: result?.errorMessage ?? 'İyzico bağlantı hatası' }, { status: 400 }));
        } else {
          resolve(NextResponse.json({ paymentPageUrl: result.payWithIyzicoPageUrl }));
        }
      }
    );
  });
}
