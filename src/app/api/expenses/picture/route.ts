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
  console.log('[picture] istek:', { comp: body.comp, typp: body.typp, numm: body.numm });
  const result = await callCaniasService('consExpensesPict', [body.comp, body.typp, body.numm]);
  console.log('[picture] Canias status:', result.status);
  console.log('[picture] Canias yanit (ilk 300 char):', String(result.response).substring(0, 300));
  return NextResponse.json({ data: result.response, status: result.status });
}
