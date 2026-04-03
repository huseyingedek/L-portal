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
  const user      = body.exp_usern || session.usern;
  const comp      = body.exp_comp  || '%';
  const datt      = body.exp_date  || '';
  const typp      = body.exp_typp  || '%';
  const stat      = body.exp_stat  || '';
  const islemtp   = body.exp_islemtp || '';

  const result = await callCaniasService('consExpensesList', [user, comp, datt, typp, stat, islemtp]);
  return NextResponse.json({ data: result.response, status: result.status });
}
