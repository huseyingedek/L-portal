import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';
import PageShell from '@/components/PageShell';
import DbErrorBanner from '@/components/DbErrorBanner';

interface Magaza { id: number; magaza_ad: string; dahili: string; mail: string; cep_tel: string; }

export default async function MagazaIletisimPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  let rows: Magaza[] = [];
  let dbError = false;
  try {
    const [r] = await db.query('SELECT * FROM MAGAZA_ILETISIM_BILGILERI') as [Magaza[], unknown];
    rows = r;
  } catch { dbError = true; }

  return (
    <PageShell usern={session.usern}>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Mağaza İletişim Bilgileri</h1>
        {dbError ? <DbErrorBanner /> : (
          <div className="df-table-wrap">
            <table className="df-data-table">
              <thead><tr><th>Mağaza Adı</th><th>Dahili</th><th>Mail</th><th>Cep Tel</th></tr></thead>
              <tbody>
                {rows.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:500 }}>{m.magaza_ad}</td>
                    <td style={{ color:'var(--text-muted)' }}>{m.dahili}</td>
                    <td>{m.mail && <a href={`mailto:${m.mail}`} style={{ color:'var(--accent)' }}>{m.mail}</a>}</td>
                    <td style={{ color:'var(--text-muted)' }}>{m.cep_tel}</td>
                  </tr>
                ))}
                {rows.length===0 && <tr><td colSpan={4} style={{ textAlign:'center',padding:24 }}>Kayıt bulunamadı.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </PageShell>
  );
}
