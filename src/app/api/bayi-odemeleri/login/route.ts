import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kisi_tel, kisi_password } = body;

    if (!kisi_tel || !kisi_password) {
      return NextResponse.json({ error: 'Telefon ve şifre gerekli.' }, { status: 400 });
    }

    const [rows] = await db.query(
      'SELECT * FROM BAYILER_ODEME_HESAPLARI WHERE kisi_tel = ? AND kisi_password = ?',
      [kisi_tel, kisi_password]
    ) as [Record<string, unknown>[], unknown];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Giriş bilgileriniz hatalı.' }, { status: 401 });
    }

    const firma = rows[0];
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.odeme_firma_ad      = firma['firma_ad']      as string;
    session.odeme_kisi_ad_soyad = firma['kisi_ad_soyad'] as string;
    session.odeme_kisi_tel      = firma['kisi_tel']      as string;
    session.odeme_kisi_oncelik  = firma['kisi_oncelik']  as number;
    session.odeme_kisi_eposta   = firma['kisi_eposta']   as string;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
