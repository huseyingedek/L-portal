import { NextResponse } from 'next/server';
import { createClientAsync } from 'soap';
import fs from 'fs';
import path from 'path';

const WSDL_URL   = process.env.CANIAS_WSDL_URL || 'http://192.168.1.50:8080/CaniasWS-v1/services/iasWebService?wsdl';
const SESSION_FILE = path.join(process.cwd(), 'canias_session.txt');

function parseRawValue(rawValue: unknown): string {
  if (typeof rawValue === 'object' && rawValue !== null) {
    if ('$value' in rawValue) return String((rawValue as Record<string, unknown>).$value);
    const keys = Object.keys(rawValue as object);
    if (keys.length === 1 && keys[0] === 'attributes') return '';
    return JSON.stringify(rawValue);
  }
  return String(rawValue ?? '');
}

export async function GET() {
  const txtSession = (() => {
    try { return fs.readFileSync(SESSION_FILE, 'utf8').trim(); } catch { return '(okunamadi)'; }
  })();

  let sessions: unknown[] = [];
  let hata = '';

  try {
    const client = await Promise.race([
      createClientAsync(WSDL_URL),
      new Promise<never>((_, r) => setTimeout(() => r(new Error('WSDL timeout')), 10_000)),
    ]);

    if (!txtSession || txtSession === '(okunamadi)') {
      hata = 'txt dosyasinda session yok';
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (client as any).callIASServiceAsync({
        sessionid:  txtSession,
        serviceid:  'checkProcess',
        args:       'WSONLIZ',
        returntype: 'STRING',
        permanent:  false,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res0: any = result?.[0];
      const raw = parseRawValue(res0?.callIASServiceReturn ?? res0 ?? '');

      if (!raw || raw.startsWith('FL')) {
        hata = `checkProcess FL veya bos: ${raw}`;
      } else {
        const parsed = JSON.parse(raw);
        sessions = Array.isArray(parsed) ? parsed : Object.values(parsed);
      }
    }
  } catch (e) {
    hata = e instanceof Error ? e.message : String(e);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const satirlar = (sessions as any[]).map(s => ({
    connectionId:  s.CONNECTIONID  || '-',
    kullanici:     s.USERNAME       || s.USER || '-',
    processTime:   Number(s.PROCESSTIME ?? 0),
    durum:         Number(s.PROCESSTIME ?? 0) > 0 ? '🔴 AKTIF' : '🟢 BOSTA',
  }));

  return NextResponse.json({
    txtSession:    txtSession || '(bos)',
    toplamOturum:  satirlar.length,
    aktifSayisi:   satirlar.filter(s => s.processTime > 0).length,
    bostaSayisi:   satirlar.filter(s => s.processTime === 0).length,
    oturumlar:     satirlar,
    hata:          hata || null,
    zaman:         new Date().toISOString(),
  });
}
