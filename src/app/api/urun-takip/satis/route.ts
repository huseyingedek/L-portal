import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';

// Satışları listele
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.bayi_firma_ad) {
    return NextResponse.json({ error: 'Oturum açınız.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate');
  const endDate   = searchParams.get('endDate');
  const oncelik   = session.bayi_kisi_oncelik;
  const tel       = session.bayi_kisi_tel;

  let rows: unknown[] = [];

  try {
    if (oncelik === 5) {
      if (startDate && endDate) {
        [rows] = await db.query(
          'SELECT * FROM SATIS_TAKIPLERI WHERE satis_tarih BETWEEN ? AND ?',
          [startDate, endDate]
        ) as [unknown[], unknown];
      } else {
        [rows] = await db.query('SELECT * FROM SATIS_TAKIPLERI') as [unknown[], unknown];
      }
    } else {
      if (startDate && endDate) {
        [rows] = await db.query(
          'SELECT * FROM SATIS_TAKIPLERI WHERE kisi_tel = ? AND satis_tarih BETWEEN ? AND ?',
          [tel, startDate, endDate]
        ) as [unknown[], unknown];
      } else {
        [rows] = await db.query(
          'SELECT * FROM SATIS_TAKIPLERI WHERE kisi_tel = ?',
          [tel]
        ) as [unknown[], unknown];
      }
    }
  } catch {
    return NextResponse.json({ rows: [], error: 'Veritabanına bağlanılamadı.' });
  }

  return NextResponse.json({ rows });
}

// Satış ekle
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.bayi_firma_ad) {
    return NextResponse.json({ error: 'Oturum açınız.' }, { status: 401 });
  }

  const body = await req.json();
  const { barkod_no, urun_fiyat, para_birimi, satis_tarih, musteri_ad, musteri_soyad } = body;

  if (!barkod_no || !urun_fiyat || !satis_tarih) {
    return NextResponse.json({ error: 'Tarih, fiyat ve barkod bilgisi girilmesi zorunludur.' }, { status: 400 });
  }

  const now = new Date();
  const zaman = now.toTimeString().slice(0, 8);
  const satisTarihFull = `${satis_tarih} ${zaman}`;

  try {
    await db.query(
      'INSERT INTO SATIS_TAKIPLERI (barkod_no, urun_fiyat, para_birimi, satis_tarih, firma_ad, kisi_ad_soyad, kisi_tel, musteri_ad, musteri_soyad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        barkod_no.toUpperCase(),
        urun_fiyat,
        para_birimi,
        satisTarihFull,
        session.bayi_firma_ad,
        session.bayi_kisi_ad_soyad,
        session.bayi_kisi_tel,
        musteri_ad || null,
        musteri_soyad || null,
      ]
    );
  } catch {
    return NextResponse.json({ error: 'Veritabanına bağlanılamadı.' }, { status: 503 });
  }

  return NextResponse.json({ success: true });
}
