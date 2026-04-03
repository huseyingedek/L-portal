import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firma_ad, kisi_ad_soyad, kisi_eposta, kisi_tel, kisi_password } = body;

    if (!firma_ad || !kisi_eposta || !kisi_tel || !kisi_password) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 });
    }

    await db.query(
      'INSERT INTO SATIS_EKLEME_KULLANICI (firma_ad, kisi_tel, kisi_ad_soyad, kisi_password, kisi_eposta) VALUES (?, ?, ?, ?, ?)',
      [firma_ad, kisi_tel, kisi_ad_soyad || '', kisi_password, kisi_eposta]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Kayıt işlemi başarısız.' }, { status: 500 });
  }
}
