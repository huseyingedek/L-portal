import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';
import PageShell from '@/components/PageShell';

interface Prosedur { prosedur_baslik: string; prosedur_gorsel_baslik: string; prosedur_icerik: string; }
interface Props { params: Promise<{ slug: string }>; }

export default async function ProsedurDetayPage({ params }: Props) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  const { slug } = await params;
  const [rows] = await db.query('SELECT * FROM `PROSEDURLER` WHERE prosedur_dosya_adi = ?', [decodeURIComponent(slug) + '.php']) as [Prosedur[], unknown];
  if (!rows?.length) notFound();
  const row = rows[0];

  return (
    <PageShell usern={session.usern}>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>{row.prosedur_gorsel_baslik}</h1>
        <div style={{ backgroundColor:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'28px 32px',lineHeight:1.85,color:'var(--text)',fontSize:14 }}>
          <p style={{ fontWeight:700,marginBottom:12,color:'var(--text)' }}>{row.prosedur_baslik}</p>
          <div dangerouslySetInnerHTML={{ __html: row.prosedur_icerik }} />
        </div>
      </main>
    </PageShell>
  );
}
