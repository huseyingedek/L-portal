import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ALLOWED_MODULES = ['bilgilendirme', 'calisankampanyalari', 'prosedurler', 'ik'];
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: { message: 'Yetkisiz' } }, { status: 401 });

  const module = req.nextUrl.searchParams.get('module') ?? '';
  if (!ALLOWED_MODULES.includes(module)) {
    return NextResponse.json({ error: { message: 'Geçersiz modül' } }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: { message: 'Form verisi okunamadı' } }, { status: 400 });
  }

  const file = formData.get('upload') as File | null;
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: { message: 'Dosya bulunamadı' } }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: { message: 'Sadece resim dosyaları yüklenebilir' } }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: { message: 'Dosya boyutu 10MB\'ı geçemez' } }, { status: 400 });
  }

  const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const uploadDir = join(process.cwd(), 'public', module, 'upload');

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, safeName), buffer);

  const url = `/${module}/upload/${safeName}`;
  return NextResponse.json({ uploaded: 1, fileName: safeName, url });
}
