import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Sadece geliştirme ortamında kullanılabilir' }, { status: 403 });
  }

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  session.bayi_firma_ad = 'TEST FİRMA';
  session.bayi_kisi_tel = '05000000000';
  session.bayi_kisi_oncelik = 1;
  session.bayi_kisi_ad_soyad = 'Test Kullanıcı';
  await session.save();

  return NextResponse.redirect(new URL('/urun-takip/panel', 'http://localhost:3000'));
}
