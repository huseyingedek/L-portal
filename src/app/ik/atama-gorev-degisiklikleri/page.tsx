import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';
import PageShell from '@/components/PageShell';
import DbErrorBanner from '@/components/DbErrorBanner';
import IseAlimClient from '../ise-alim-duyurulari/IseAlimClient';

interface Kayit {
  id: number; kisi_ad_soyad: string; kisi_gorev: string; kisi_resim: string;
  kisi_kayit_tarihi: string; kisi_onceki_gorevi: string; kisi_vekalet_suresi: string;
}

export default async function AtamaGorevPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  let rows: Kayit[] = [];
  let dbError = false;
  try {
    const [r] = await db.query("SELECT * FROM KAYITLAR WHERE kisi_tur = 'gorev_atamasi' ORDER BY id DESC") as [Kayit[], unknown];
    rows = r;
  } catch { dbError = true; }

  return (
    <PageShell usern={session.usern}>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Atama & Görev Değişiklikleri</h1>
        {dbError ? <DbErrorBanner /> : <IseAlimClient rows={rows} />}
      </main>
    </PageShell>
  );
}
