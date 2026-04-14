import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

// Helvetica Latin-1'de olmayan Türkçe harfleri dönüştür (ğ/ş/ı ve büyükleri)
function tr(s: string): string {
  return (s || '')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I');
}

function fmt(d: string) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  if (!y || !m || !day) return d;
  return `${day}.${m}.${y}`;
}

// mm → pt (pdf-lib koordinat sistemi: sol-alt köşe)
const MM = 2.835;
const PAGE_H = 841.89; // A4 yüksekliği (pt)
function pt(xMm: number, yMm: number): [number, number] {
  return [xMm * MM, PAGE_H - yMm * MM - 10];
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();

  try {
    // Şablon PDF'i oku
    const templatePath = path.join(process.cwd(), 'public', 'yillik-izin-lizay.pdf');
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const SIZE = 10;
    const COLOR = rgb(0, 0, 0);

    // İzin gün hesabı
    const gun = body.kisi_izin_baslangic && body.kisi_izin_bitis
      ? Math.round((new Date(body.kisi_izin_bitis).getTime() - new Date(body.kisi_izin_baslangic).getTime()) / 86400000)
      : 0;

    const tarihler = `${fmt(body.kisi_izin_baslangic)} ile ${fmt(body.kisi_izin_bitis)}`;

    // PHP operation.php ile aynı koordinat/sıra
    const entries: [number, number, string][] = [
      [50, 35, tr(body.kisi_ad_soyad)],
      [50, 45, tr(body.kisi_tc)],
      [50, 53, tr(body.kisi_birim)],
      [50, 64, fmt(body.kisi_giris)],
      [50, 77, fmt(body.kisi_izin_baslangic)],
      [50, 89, fmt(body.kisi_izin_bitis)],
      [50, 100, tr(body.kisi_tel)],
      [50, 112, tr(body.kisi_izin_yeri)],
      [50, 128, String(gun)],
      [122, 55, tr(tarihler)],
      [154, 93, tr(body.kisi_ad_soyad)],
      [157, 102, fmt(body.talep_tarihi)],
    ];

    for (const [x, y, text] of entries) {
      const [px, py] = pt(x, y);
      page.drawText(text, { x: px, y: py, size: SIZE, font, color: COLOR });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Lizay-izin-formu.pdf"',
      },
    });
  } catch (err) {
    console.error('[izin-formu] PDF hatasi:', err);
    return NextResponse.json({ error: 'PDF olusturulamadi' }, { status: 500 });
  }
}
