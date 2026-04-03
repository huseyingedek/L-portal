import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';
import DashboardClient from './DashboardClient';
import PageShell from '@/components/PageShell';

const STORE_USERS = [
  'LBURADA', 'LBURSA', 'LDUZCE', 'LEMAAR', 'LFATSA',
  'LHILLTOWN', 'LIHILLTOWN', 'LISKENDERUN', 'LKRIKHAN',
  'LMETROPOL', 'LMARAS', 'LNADIRE', 'LSILIVRI', 'LSYMBOL',
];

interface DuyuruRow {
  baslik: string;
  gorsel_baslik: string;
  dosya_adi: string;
  tarih?: string;
}

async function safeCount(query: string): Promise<number> {
  try {
    const [rows] = await db.query(query) as [{ total: number }[], unknown];
    return rows[0]?.total ?? 0;
  } catch { return 0; }
}

async function safeRows<T>(query: string, limit: number): Promise<T[]> {
  try {
    const [rows] = await db.query(query + ` LIMIT ${limit}`) as [T[], unknown];
    return rows ?? [];
  } catch { return []; }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  const isStoreUser = STORE_USERS.includes(session.usern);

  // Paralel sorgular
  const [
    bilgilendirmeCount,
    prosedurCount,
    kampanyaCount,
    ikCount,
    sonBilgilendirmeler,
    sonKampanyalar,
    sonIK,
  ] = await Promise.all([
    safeCount('SELECT COUNT(*) as total FROM BILGILENDIRMELER'),
    safeCount('SELECT COUNT(*) as total FROM PROSEDURLER'),
    safeCount('SELECT COUNT(*) as total FROM KAMPANYALAR'),
    safeCount("SELECT COUNT(*) as total FROM KAYITLAR"),
    safeRows<DuyuruRow>(
      'SELECT bilgilendirme_baslik as baslik, bilgilendirme_gorsel_baslik as gorsel_baslik, bilgilendirme_dosya_adi as dosya_adi, bilgilendirme_tarih as tarih FROM BILGILENDIRMELER ORDER BY bilgilendirme_tarih DESC',
      5
    ),
    safeRows<DuyuruRow>(
      'SELECT kampanya_baslik as baslik, kampanya_gorsel_baslik as gorsel_baslik, kampanya_dosya_adi as dosya_adi, kampanya_tarih as tarih FROM KAMPANYALAR ORDER BY kampanya_tarih DESC',
      3
    ),
    safeRows<{ kisi_ad_soyad: string; kisi_gorev: string; kisi_kayit_tarihi: string; kisi_tur: string }>(
      'SELECT kisi_ad_soyad, kisi_gorev, kisi_kayit_tarihi, kisi_tur FROM KAYITLAR ORDER BY id DESC',
      4
    ),
  ]);

  return (
    <PageShell usern={session.usern}>
      <DashboardClient
        usern={session.usern}
        isStoreUser={isStoreUser}
        stats={{ bilgilendirme: bilgilendirmeCount, prosedur: prosedurCount, kampanya: kampanyaCount, ik: ikCount }}
        sonBilgilendirmeler={sonBilgilendirmeler}
        sonKampanyalar={sonKampanyalar}
        sonIK={sonIK}
      />
    </PageShell>
  );
}
