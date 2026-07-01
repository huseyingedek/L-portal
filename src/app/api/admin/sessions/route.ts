import { NextResponse } from 'next/server';

// Bu endpoint kaldırıldı.
// Eski çoklu-oturum (slot havuzu / zombie temizleme) modeli kaldırıldığı için
// listCaniasSessions / killCaniasSession fonksiyonları artık yok.
// Yetkisiz erişime açık olduğu için de tamamen devre dışı bırakıldı.

export async function GET() {
  return NextResponse.json({ error: 'Bu endpoint kaldırıldı.' }, { status: 404 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Bu endpoint kaldırıldı.' }, { status: 404 });
}
