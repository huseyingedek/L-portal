import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { callCaniasService } from '@/lib/canias';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();
  const comp      = body.comp      || '';
  const dateStart = body.dateStart || '';
  const dateEnd   = body.dateEnd   || '';
  const cari      = body.cari      || '';

  const result = await callCaniasService('consBAList', [comp, dateStart, dateEnd, cari]);
  return NextResponse.json({ data: result.response, status: result.status });
}
