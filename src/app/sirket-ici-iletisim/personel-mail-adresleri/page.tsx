import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';
import PageShell from '@/components/PageShell';
import DbErrorBanner from '@/components/DbErrorBanner';

interface Personel { id: number; kisi_ad_soyad: string; kisi_birim: string; kisi_eposta: string; }

export default async function PersonelMailPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  let rows: Personel[] = [];
  let dbError = false;
  try {
    const [r] = await db.query('SELECT * FROM PERSONEL_MAIL_ADRESLERI') as [Personel[], unknown];
    rows = r;
  } catch { dbError = true; }

  return (
    <PageShell usern={session.usern}>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Personel Mail Adresleri</h1>
        {dbError ? <DbErrorBanner /> : (
          <div className="df-table-wrap">
            <table className="df-data-table">
              <thead><tr><th>İsim Soyisim</th><th>Departman</th><th>E-Posta</th></tr></thead>
              <tbody>
                {rows.map((k, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:500 }}>{k.kisi_ad_soyad}</td>
                    <td style={{ color:'var(--text-muted)' }}>{k.kisi_birim}</td>
                    <td>{k.kisi_eposta && <a href={`mailto:${k.kisi_eposta}`} style={{ color:'var(--accent)' }}>{k.kisi_eposta}</a>}</td>
                  </tr>
                ))}
                {rows.length===0 && <tr><td colSpan={3} style={{ textAlign:'center',padding:24 }}>Kayıt bulunamadı.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </PageShell>
  );
}
