import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

// PHP operation.php'yi direkt çağırıyoruz — birebir aynı PDF üretir
const PHP_OPERATION_URL = 'https://online.lizaypirlanta.com/izin-formu/operation.php';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();

  // PHP operation.php'nin beklediği POST parametreleri
  const formData = new URLSearchParams();
  formData.append('talep_tarihi',        body.talep_tarihi || '');
  formData.append('kisi_ad_soyad',       body.kisi_ad_soyad || '');
  formData.append('kisi_tc',             body.kisi_tc || '');
  formData.append('kisi_tel',            body.kisi_tel || '');
  formData.append('kisi_birim',          body.kisi_birim || '');
  formData.append('kisi_giris',          body.kisi_giris || '');
  formData.append('kisi_izin_baslangic', body.kisi_izin_baslangic || '');
  formData.append('kisi_izin_bitis',     body.kisi_izin_bitis || '');
  formData.append('kisi_izin_yeri',      body.kisi_izin_yeri || '');

  const phpRes = await fetch(PHP_OPERATION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!phpRes.ok) {
    return NextResponse.json({ error: 'PDF oluşturulamadı' }, { status: 500 });
  }

  const pdfBytes = await phpRes.arrayBuffer();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Lizay-izin-formu.pdf"',
    },
  });
}
