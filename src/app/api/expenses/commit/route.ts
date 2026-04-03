import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { callCaniasService } from '@/lib/canias';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  try {
    const formData = await req.formData();
    const sharedNum   = (formData.get('InvoiceSharedNumb') as string) || '';
    const busArea     = (formData.get('BusArea') as string) || '';
    const invoiceD    = (formData.get('InvoiceDate') as string) || '';
    const invoiceQ    = (formData.get('InvoiceQuine') as string) || '';
    const invoiceN    = (formData.get('InvoiceNumber') as string) || '';
    const invoiceA    = (formData.get('InvoiceAmount') as string) || '';
    const ctype       = (formData.get('CostType') as string) || '';
    const stext       = (formData.get('Stext') as string) || '';
    const expParatp   = (formData.get('exp_paratp') as string) || '';
    const ppaytype    = (formData.get('ppaytype') as string) || '';
    const imageFile   = formData.get('InvoiceImage') as File | null;

    let imgBase64 = '';
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      imgBase64 = Buffer.from(arrayBuffer).toString('base64');
    }

    const result = await callCaniasService('consExpensesCommit', [
      session.usern, '', sharedNum, busArea, invoiceD, invoiceQ,
      invoiceN, invoiceA, ctype, stext, imgBase64, 'jpg', expParatp, ppaytype,
    ]);

    if (result.response === 'OK') {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: result.response }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
