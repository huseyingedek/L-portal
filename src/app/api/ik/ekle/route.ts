import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';

const IK_ADMINS = ['EALPER', 'SGENC', 'MSAHINBAY', 'IYILMAZ', 'CICIGEN'];

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  if (!IK_ADMINS.includes(session.usern)) return NextResponse.json({ error: 'Yetki yok' }, { status: 403 });

  const formData = await req.formData();
  const kisi_ad               = (formData.get('kisi_ad') as string) || '';
  const kisi_soyad            = (formData.get('kisi_soyad') as string) || '';
  const kisi_eposta           = (formData.get('kisi_eposta') as string) || '';
  const kisi_gorev            = (formData.get('kisi_gorev') as string) || '';
  const kisi_tur              = (formData.get('kisi_tur') as string) || '';
  const kisi_kayit_tarihi     = (formData.get('kisi_kayit_tarihi') as string) || '';
  const kisi_onceki_gorevi    = (formData.get('kisi_onceki_gorevi') as string) || '';
  const kisi_vekalet_suresi   = (formData.get('kisi_vekalet_suresi') as string) || '';
  const imageFile             = formData.get('kisi_resim') as File | null;

  let kisi_resim = '';
  if (imageFile && imageFile.size > 0) {
    const buf = Buffer.from(await imageFile.arrayBuffer());
    kisi_resim = `data:${imageFile.type};base64,${buf.toString('base64')}`;
  }

  const kisi_ad_soyad = `${kisi_ad} ${kisi_soyad}`.trim();

  await db.query(
    `INSERT INTO KAYITLAR 
      (kisi_ad, kisi_soyad, kisi_ad_soyad, kisi_eposta, kisi_gorev, kisi_resim, kisi_kayit_tarihi, kisi_tur, kisi_onceki_gorevi, kisi_vekalet_suresi) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [kisi_ad, kisi_soyad, kisi_ad_soyad, kisi_eposta, kisi_gorev, kisi_resim, kisi_kayit_tarihi, kisi_tur, kisi_onceki_gorevi, kisi_vekalet_suresi]
  );

  return NextResponse.json({ success: true });
}
