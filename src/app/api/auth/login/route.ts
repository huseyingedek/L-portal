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

    const result = await callCaniasService('userCheck', [username, password]);


    // --- FAIL-CLOSED ---
    // Giris SADECE userCheck birebir "OK" donerse acilir.
    // "FL degilse OK say" mantigi kaldirildi: bos/anlamsiz/yanlis her yanit elenir.
    const dogrulandi = result.status === 'OK' && result.response.trim().toUpperCase() === 'OK';

    if (!dogrulandi) {
      // Sunucu/baglanti hatasi mi (canias 'Baglanti hatasi' / timeout / WSDL doner),
      // yoksa yanlis kimlik bilgisi mi ayir
      const isBaglantiHatasi =
        result.response.includes('Baglanti') ||
        result.response.includes('timeout')  ||
        result.response.includes('WSDL');
      if (isBaglantiHatasi) {
        return NextResponse.json({ error: 'Sunucu bağlantısı kurulamadı, lütfen tekrar deneyin.' }, { status: 503 });
      }
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.login = 1;
    session.usern = username.toUpperCase();
    await session.save();

    return NextResponse.json({ success: true, usern: session.usern });
  } catch (err) {
    console.error('Login hatasi:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
