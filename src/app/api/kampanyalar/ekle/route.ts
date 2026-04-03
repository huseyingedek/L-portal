import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';

const EDIT_USERS = ['CICIGEN', 'BTEMUR', 'EALPER', 'SGENC'];

function dosyaAdiOlustur(baslik: string): string {
  return baslik
    .replace(/[ÇçĞğIıİiÖöŞşÜü]/g, (c) =>
      ({ 'Ç':'C','ç':'c','Ğ':'G','ğ':'g','I':'I','ı':'i','İ':'I','i':'i','Ö':'O','ö':'o','Ş':'S','ş':'s','Ü':'U','ü':'u' }[c] ?? c)
    )
    .replace(/ /g, '-')
    .replace(/[^A-Za-z0-9\-]/g, '')
    + '.php';
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  if (!EDIT_USERS.includes(session.usern)) return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });

  const body = await req.json();
  const { kampanya_icerik, kampanya_gorsel_baslik, kampanya_baslik } = body;

  if (!kampanya_icerik) return NextResponse.json({ error: 'İçerik boş olamaz' }, { status: 400 });

  const kampanya_tarih = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const dosya_adi = dosyaAdiOlustur(kampanya_gorsel_baslik);

  await db.query(
    'INSERT INTO KAMPANYALAR (kampanya_baslik, kampanya_gorsel_baslik, kampanya_icerik, kampanya_tarih, kampanya_dosya_adi) VALUES (?, ?, ?, ?, ?)',
    [kampanya_baslik, kampanya_gorsel_baslik, kampanya_icerik, kampanya_tarih, dosya_adi]
  );

  return NextResponse.json({ success: true });
}
