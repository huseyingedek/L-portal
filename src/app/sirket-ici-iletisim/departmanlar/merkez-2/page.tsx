import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';
import PageShell from '@/components/PageShell';
import DbErrorBanner from '@/components/DbErrorBanner';

interface Dahili { id: number; kisi_ad_soyad: string; kisi_birim: string; dahili: string; }

export default async function Merkez2Page() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  let rows: Dahili[] = [];
  let dbError = false;
  try {
    const [r] = await db.query('SELECT * FROM DEPARTMANLAR_DAHILI_HATLAR WHERE merkez = 2') as [Dahili[], unknown];
    rows = r;
  } catch { dbError = true; }

  return (
    <PageShell usern={session.usern}>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Merkez 2 — Çalışanlar Listesi</h1>
        {dbError ? <DbErrorBanner /> : (
          <div className="df-table-wrap">
            <table className="df-data-table">
              <thead><tr><th>İsim Soyisim</th><th>Departman</th><th>Dahili</th></tr></thead>
              <tbody>
                {rows.map((k, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:500 }}>{k.kisi_ad_soyad}</td>
                    <td style={{ color:'var(--text-muted)' }}>{k.kisi_birim}</td>
                    <td><span style={{ fontFamily:'monospace',fontSize:13,color:'var(--accent)',fontWeight:600 }}>{k.dahili}</span></td>
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
