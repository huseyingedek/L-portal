import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.odeme_firma_ad      = undefined;
  session.odeme_kisi_ad_soyad = undefined;
  session.odeme_kisi_tel      = undefined;
  session.odeme_kisi_oncelik  = undefined;
  session.odeme_kisi_eposta   = undefined;
  await session.save();
  return NextResponse.json({ success: true });
}
