import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();
  const dosya_adi = String(body.dosya_adi || '').trim();
  if (!dosya_adi) return NextResponse.json({ error: 'Kayıt anahtarı gerekli' }, { status: 400 });

  // Detay sayfasıyla aynı esnek eşleşme: ham / ./ önekli / .php son ekli
  const raw = dosya_adi.replace(/^\.\//, '').replace(/\.php$/, '');
  const [result] = await db.query(
    'DELETE FROM KAMPANYALAR WHERE kampanya_dosya_adi = ? OR kampanya_dosya_adi = ? OR kampanya_dosya_adi = ? OR kampanya_dosya_adi = ?',
    [dosya_adi, raw, `./${raw}`, `${raw}.php`]
  ) as [{ affectedRows: number }, unknown];

  if (!result || result.affectedRows === 0) {
    return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
  }
  return NextResponse.json({ success: true, affectedRows: result.affectedRows });
}
