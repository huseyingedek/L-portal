import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';
import PageShell from '@/components/PageShell';
import DbErrorBanner from '@/components/DbErrorBanner';

interface Kampanya { kampanya_baslik: string; kampanya_gorsel_baslik: string; kampanya_icerik: string; }
interface Props { params: Promise<{ slug: string }>; }

export default async function KampanyaDetayPage({ params }: Props) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  const { slug } = await params;
  const decoded = decodeURIComponent(slug).replace(/^\.\//, '');
  let rows: Kampanya[] = [];
  try {
    const [result] = await db.query(
      'SELECT * FROM `KAMPANYALAR` WHERE kampanya_dosya_adi = ? OR kampanya_dosya_adi = ?',
      [decoded + '.php', './' + decoded + '.php']
    ) as [Kampanya[], unknown];
    rows = result;
  } catch {
    return <PageShell usern={session.usern}><div style={{ padding: 24 }}><DbErrorBanner /></div></PageShell>;
  }
  if (!rows?.length) notFound();
  const row = rows[0];

  return (
    <PageShell usern={session.usern}>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>{row.kampanya_gorsel_baslik}</h1>
        <div style={{ backgroundColor:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'28px 32px',lineHeight:1.85,color:'var(--text)',fontSize:14 }}>
          <p style={{ fontWeight:700,marginBottom:12,color:'var(--text)' }}>{row.kampanya_baslik}</p>
          <div dangerouslySetInnerHTML={{ __html: row.kampanya_icerik }} />
        </div>
      </main>
    </PageShell>
  );
}
