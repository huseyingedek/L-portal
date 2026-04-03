import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import DbErrorBanner from '@/components/DbErrorBanner';

const RENKLER = [
  '#818cf8','#34d399','#f59e0b','#f87171','#60a5fa',
  '#a78bfa','#4ade80','#fb923c','#38bdf8','#e879f9',
  '#2ea568','#12a9d6','#de3b59','#F29500','#905E96',
];

interface Prosedur {
  prosedur_baslik: string;
  prosedur_gorsel_baslik: string;
  prosedur_dosya_adi: string;
}

const EDIT_USERS = ['CICIGEN', 'BTEMUR', 'EALPER', 'SGENC'];

export default async function ProsedurlerPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  let rows: Prosedur[] = [];
  let dbError = false;
  try {
    const [result] = await db.query(
      'SELECT * FROM `PROSEDURLER` ORDER BY `prosedur_tarih` DESC'
    ) as [Prosedur[], unknown];
    rows = result;
  } catch { dbError = true; }

  const canEdit = EDIT_USERS.includes(session.usern);

  return (
    <PageShell usern={session.usern}>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Prosedürler</h1>
          {canEdit && (
            <Link href="/prosedurler/ekle" style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500,
              padding: '6px 14px', borderRadius: 8, color: 'white',
              backgroundColor: 'var(--color-primary, #818cf8)',
            }}>
              <i className="fas fa-plus" style={{ fontSize: 10 }} /> Prosedür Ekle
            </Link>
          )}
        </div>

        {dbError ? <DbErrorBanner /> : rows.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Henüz içerik eklenmemiş.</p>
        ) : (
          <div className="grid-content">
            {rows.map((row, i) => {
              const renk = RENKLER[i % RENKLER.length];
              return (
                <Link key={i} href={`/prosedurler/${encodeURIComponent(row.prosedur_dosya_adi.replace('.php', ''))}`} className="pcard">
                  <div className="pcard-icon" style={{ backgroundColor: renk + '18' }}>
                    <div className="pcard-icon-inner" style={{ backgroundColor: renk }}>
                      <i className="fa-solid fa-book-open" />
                    </div>
                  </div>
                  <div className="pcard-body">
                    <p className="pcard-title">{row.prosedur_gorsel_baslik}</p>
                    <p className="pcard-desc" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.prosedur_baslik}</p>
                  </div>
                  <div className="pcard-bar" style={{ backgroundColor: renk }} />
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </PageShell>
  );
}
