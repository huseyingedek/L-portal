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
  console.log('[picture-ver] istek:', { comp: body.comp, numm: body.numm, beltip: body.beltip });
  const result = await callCaniasService('consExpensesPictVER', [body.comp || '', body.numm || '', body.beltip || '']);
  console.log('[picture-ver] Canias status:', result.status);
  console.log('[picture-ver] Canias yanit (ilk 300 char):', String(result.response).substring(0, 300));
  return NextResponse.json({ data: result.response, status: result.status });
}
