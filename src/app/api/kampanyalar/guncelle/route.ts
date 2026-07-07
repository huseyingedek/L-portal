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
  const { dosya_adi, kampanya_icerik, kampanya_gorsel_baslik, kampanya_baslik, kampanya_gecerlilik } = body;

  const anahtar = String(dosya_adi || '').trim();
  if (!anahtar) return NextResponse.json({ error: 'Kayıt anahtarı gerekli' }, { status: 400 });
  if (!kampanya_icerik) return NextResponse.json({ error: 'İçerik boş olamaz' }, { status: 400 });

  const gecerlilik = kampanya_gecerlilik ? String(kampanya_gecerlilik).slice(0, 10) : null;
  const raw = anahtar.replace(/^\.\//, '').replace(/\.php$/, '');

  // dosya_adi (slug) sabit bırakılıyor; detay URL'leri bozulmasın diye yeniden üretilmiyor.
  const [result] = await db.query(
    `UPDATE KAMPANYALAR
       SET kampanya_baslik = ?, kampanya_gorsel_baslik = ?, kampanya_icerik = ?, kampanya_gecerlilik = ?
     WHERE kampanya_dosya_adi = ? OR kampanya_dosya_adi = ? OR kampanya_dosya_adi = ? OR kampanya_dosya_adi = ?`,
    [kampanya_baslik, kampanya_gorsel_baslik, kampanya_icerik, gecerlilik, anahtar, raw, `./${raw}`, `${raw}.php`]
  ) as [{ affectedRows: number }, unknown];

  if (!result || result.affectedRows === 0) {
    return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
