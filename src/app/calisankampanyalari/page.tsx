import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import DbErrorBanner from '@/components/DbErrorBanner';
import KurumActions from './KurumActions';

const RENKLER = [
  '#d63050','#34d399','#f59e0b','#f87171','#60a5fa',
  '#a78bfa','#4ade80','#fb923c','#38bdf8','#e879f9',
  '#2ea568','#12a9d6','#de3b59','#F29500','#905E96',
];

interface Kampanya {
  kampanya_baslik: string;
  kampanya_gorsel_baslik: string;
  kampanya_dosya_adi: string;
  kampanya_gecerlilik: string | Date | null;
}

function formatGecerlilik(v: string | Date | null): string {
  if (!v) return '';
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return '';
  // DB bağlantısı timezone +03:00 kullanıyor; İstanbul saatinde göster ki gün kaymasın.
  return d.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
}

export default async function CalisanKampanyalariPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  let rows: Kampanya[] = [];
  let dbError = false;
  try {
    const [result] = await db.query(
      'SELECT * FROM `KAMPANYALAR` ORDER BY `kampanya_tarih` DESC'
    ) as [Kampanya[], unknown];
    rows = result;
  } catch { dbError = true; }

  const canEdit = true; // Ekleme aktif

  return (
    <PageShell usern={session.usern}>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Anlaşmalı Kurumlar</h1>
          {canEdit && (
            <Link href="/calisankampanyalari/ekle" style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500,
              padding: '6px 14px', borderRadius: 8, color: 'white', marginLeft: 'auto',
              backgroundColor: 'var(--color-primary, #d63050)',
            }}>
              <i className="fas fa-plus" style={{ fontSize: 10 }} /> Kurum Ekle
            </Link>
          )}
        </div>

        {dbError ? <DbErrorBanner /> : rows.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Henüz içerik eklenmemiş.</p>
        ) : (
          <div className="grid-content">
            {rows.map((row, i) => {
              const renk = RENKLER[i % RENKLER.length];
              const slug = row.kampanya_dosya_adi.replace(/^\.\//, '').replace('.php', '');
              const gecerli = formatGecerlilik(row.kampanya_gecerlilik);
              return (
                <div key={i} style={{ position: 'relative' }}>
                  <Link href={`/calisankampanyalari/${encodeURIComponent(slug)}`} className="pcard">
                    <div className="pcard-icon" style={{ backgroundColor: renk + '18' }}>
                      <div className="pcard-icon-inner" style={{ backgroundColor: renk }}>
                        <i className="fa-solid fa-tag" />
                      </div>
                    </div>
                    <div className="pcard-body">
                      <p className="pcard-title">{row.kampanya_gorsel_baslik}</p>
                      <p className="pcard-desc" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.kampanya_baslik}</p>
                      {gecerli && (
                        <p className="pcard-desc" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          <i className="far fa-calendar" style={{ marginRight: 4 }} />Geçerlilik: {gecerli}
                        </p>
                      )}
                    </div>
                    <div className="pcard-bar" style={{ backgroundColor: renk }} />
                  </Link>
                  {canEdit && (
                    <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                      <KurumActions
                        dosyaAdi={row.kampanya_dosya_adi}
                        editHref={`/calisankampanyalari/duzenle/${encodeURIComponent(slug)}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </PageShell>
  );
}
