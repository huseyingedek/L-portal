import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';
import KampanyaForm from '../../KampanyaForm';

interface KampanyaRow {
  kampanya_baslik: string;
  kampanya_gorsel_baslik: string;
  kampanya_icerik: string;
  kampanya_dosya_adi: string;
  kampanya_gecerlilik: string | Date | null;
}

function toISODate(v: string | Date | null): string {
  if (!v) return '';
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return '';
  // DB bağlantısı timezone +03:00 kullanıyor; İstanbul saatinde formatla ki gün kaymasın.
  return d.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
}

export default async function KampanyaDuzenlePage({ params }: { params: Promise<{ slug: string }> }) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  const { slug } = await params;
  const raw = decodeURIComponent(slug);

  const [rows] = await db.query(
    'SELECT * FROM `KAMPANYALAR` WHERE kampanya_dosya_adi = ? OR kampanya_dosya_adi = ? OR kampanya_dosya_adi = ? LIMIT 1',
    [raw, `./${raw}`, `${raw}.php`]
  ) as [KampanyaRow[], unknown];

  if (!rows || rows.length === 0) notFound();
  const row = rows[0];

  return (
    <KampanyaForm
      mode="duzenle"
      slug={row.kampanya_dosya_adi}
      initial={{
        kampanya_gorsel_baslik: row.kampanya_gorsel_baslik ?? '',
        kampanya_baslik: row.kampanya_baslik ?? '',
        kampanya_icerik: row.kampanya_icerik ?? '',
        kampanya_gecerlilik: toISODate(row.kampanya_gecerlilik),
      }}
    />
  );
}
