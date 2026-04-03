import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { callCaniasService } from '@/lib/canias';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
    }

    // ─── TEST MODU: Canias erişimi olmayan ortamlarda test için ───
    // Production'a geçmeden önce bu bloğu sil ve alttaki satırı aç
    const TEST_MODE = process.env.TEST_MODE === 'true';
    if (TEST_MODE) {
      if (username === 'TEST' && password === 'TEST123') {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
        session.login = 1;
        session.usern = 'TESTUSER';
        await session.save();
        return NextResponse.json({ success: true, usern: session.usern });
      }
      return NextResponse.json({ error: 'Test modunda yanlış şifre' }, { status: 401 });
    }
    // ─────────────────────────────────────────────────────────────

    const result = await callCaniasService('userCheck', [username, password]);

    if (result.status !== 'OK') {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.login = 1;
    session.usern = username.toUpperCase();
    await session.save();

    return NextResponse.json({ success: true, usern: session.usern });
  } catch (err) {
    console.error('Login hatası:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
