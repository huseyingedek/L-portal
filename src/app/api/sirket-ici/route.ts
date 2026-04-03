import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tur = searchParams.get('tur') || 'personel';

  const [rows] = await db.query(
    'SELECT * FROM KAYITLAR WHERE kisi_tur = ? ORDER BY id DESC',
    [tur]
  );
  return NextResponse.json(rows);
}
