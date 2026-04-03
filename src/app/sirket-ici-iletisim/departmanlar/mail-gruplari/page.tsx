import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import PageShell from '@/components/PageShell';

const MAIL_GRUPLARI = [
  { departman: 'Yönetim Kurulu',            eposta: 'yk@lizaypirlanta.com' },
  { departman: 'Satın Alma',                eposta: 'talep@lizaypirlanta.com' },
  { departman: 'Bilgi İşlem / IAS Destek',  eposta: 'bt@lizaypirlanta.com' },
  { departman: 'İnsan Kaynakları',          eposta: 'insankaynaklari@lizaypirlanta.com' },
  { departman: 'Finans',                    eposta: 'finans@lizaypirlanta.com' },
  { departman: 'e-Ticaret',                 eposta: 'eticaret@lizaypirlanta.com' },
  { departman: 'Muhasebe',                  eposta: 'muhasebe@lizaypirlanta.com' },
  { departman: 'Lizay Bölge Müdürleri',     eposta: 'lbm@lizaypirlanta.com' },
  { departman: 'Franchise Bölge Müdürleri', eposta: 'fbm@lizaypirlanta.com' },
];

export default async function MailGruplariPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  return (
    <PageShell usern={session.usern}>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '28px 20px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Mail Grupları</h1>
        <div className="df-table-wrap">
          <table className="df-data-table">
            <thead><tr><th>Departman</th><th>E-Posta</th></tr></thead>
            <tbody>
              {MAIL_GRUPLARI.map((m, i) => (
                <tr key={i}>
                  <td style={{ fontWeight:500 }}>{m.departman}</td>
                  <td><a href={`mailto:${m.eposta}`} style={{ color:'var(--accent)' }}>{m.eposta}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </PageShell>
  );
}
