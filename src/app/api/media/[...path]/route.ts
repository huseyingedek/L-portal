import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join, normalize, extname } from 'path';

// Yuklenen dosyalari diskten okuyup servis eder.
// Next.js, calisma aninda public/ altina yazilan dosyalari otomatik sunmaz;
// bu route o dosyalari public/ altindan okuyup dondurur.

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const rel = normalize(parts.join('/'));

  // Path traversal koruması
  if (rel.includes('..') || rel.startsWith('/') || rel.startsWith('\\')) {
    return new NextResponse('Not found', { status: 404 });
  }

  const filePath = join(process.cwd(), 'public', rel);
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
