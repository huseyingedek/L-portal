import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-sikayet';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { isim, mesaj } = body;

    if (!isim || !mesaj) {
      return NextResponse.json({ error: 'Başlık ve mesaj boş bırakılamaz.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || '0.0.0.0';

    const tarih = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await db.query(
      'INSERT INTO lizay_sikayet (baslik, mesaj, ip, tarih) VALUES (?, ?, ?, ?)',
      [isim, mesaj, ip, tarih]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Bir sorun oluştu.' }, { status: 500 });
  }
}
