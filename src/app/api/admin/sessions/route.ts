import { NextRequest, NextResponse } from 'next/server';
import { listCaniasSessions, killCaniasSession } from '@/lib/canias';

// Gecici endpoint: CANIAS session listesi ve zombie temizleme
// Kullanim: GET  /api/admin/sessions          → tum sessionlari listele
//           DELETE /api/admin/sessions?sid=XX  → belirli session'i kapat

export async function GET() {
  const data = await listCaniasSessions();
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const sid = req.nextUrl.searchParams.get('sid');
  if (!sid) return NextResponse.json({ error: 'sid parametresi gerekli' }, { status: 400 });
  const ok = await killCaniasSession(sid);
  return NextResponse.json({ ok, sid });
}
