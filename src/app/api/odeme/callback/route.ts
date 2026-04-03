import { NextRequest, NextResponse } from 'next/server';

// iyzico ödeme sonrası buraya POST ile döner
export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => null);
  const status = body?.get('status') as string || 'failure';
  const origin = req.nextUrl.origin;

  if (status === 'success') {
    return NextResponse.redirect(`${origin}/odeme-sayfasi?status=success`);
  }
  return NextResponse.redirect(`${origin}/odeme-sayfasi?status=failure`);
}

// GET ile de gelebilir (test/redirect)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'failure';
  const origin = req.nextUrl.origin;
  return NextResponse.redirect(`${origin}/odeme-sayfasi?status=${status}`);
}
