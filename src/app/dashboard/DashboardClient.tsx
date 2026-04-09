'use client';

import Link from 'next/link';

const QUICK_ACCESS = [
  { href: '/masrafgirisleri/masraf-girisi',  label: 'Masraf Girişi',       icon: 'fa-solid fa-receipt',        color: '#f59e0b' },
  { href: '/masrafgirisleri/masraf-onay',    label: 'Masraf Onayları',     icon: 'fa-solid fa-circle-check',   color: '#10b981' },
  { href: '/masrafgirisleri/fatura-onay',    label: 'Fatura Onayları',     icon: 'fa-solid fa-file-invoice',   color: '#3b82f6' },
  { href: '/bilgilendirme',                  label: 'Bilgilendirme',       icon: 'fa-solid fa-bell',           color: '#d63050' },
  { href: '/prosedurler',                    label: 'Prosedürler',         icon: 'fa-solid fa-book-open',      color: '#06b6d4' },
  { href: '/ik/ise-alim-duyurulari',         label: 'İşe Alım',           icon: 'fa-solid fa-user-tie',       color: '#f43f5e' },
  { href: '/izin-formu',                     label: 'İzin Formu',          icon: 'fa-solid fa-calendar-check', color: '#8b5cf6' },
  { href: '/magazacilik/musteri-kaydi',      label: 'Müşteri Kaydı',      icon: 'fa-solid fa-user-plus',      color: '#ec4899' },
  { href: '/fiyatgor',                       label: 'Fiyat Gör',          icon: 'fa-solid fa-barcode',        color: '#c53030' },
];

interface DuyuruRow { baslik: string; gorsel_baslik: string; dosya_adi: string; tarih?: string; }
interface IKRow { kisi_ad_soyad: string; kisi_gorev: string; kisi_kayit_tarihi: string; kisi_tur: string; }

interface Props {
  usern: string;
  isStoreUser: boolean;
  stats: { bilgilendirme: number; prosedur: number; kampanya: number; ik: number };
  sonBilgilendirmeler: DuyuruRow[];
  sonKampanyalar: DuyuruRow[];
  sonIK: IKRow[];
}

const STATS = [
  { key: 'bilgilendirme' as const, label: 'Bilgilendirme',  icon: 'fa-solid fa-bell',        color: '#d63050', href: '/bilgilendirme' },
  { key: 'prosedur'      as const, label: 'Prosedür',       icon: 'fa-solid fa-book-open',   color: '#06b6d4', href: '/prosedurler' },
  { key: 'kampanya'      as const, label: 'Kampanya',       icon: 'fa-solid fa-tag',         color: '#f59e0b', href: '/calisankampanyalari' },
  { key: 'ik'            as const, label: 'İK Duyurusu',   icon: 'fa-solid fa-users',       color: '#f43f5e', href: '/ik/ise-alim-duyurulari' },
];

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Bugün';
  if (days === 1) return 'Dün';
  if (days < 30) return `${days} gün önce`;
  if (days < 365) return `${Math.floor(days / 30)} ay önce`;
  return `${Math.floor(days / 365)} yıl önce`;
}

function cleanSlug(dosyaAdi: string) {
  return encodeURIComponent(dosyaAdi.replace(/^\.\//, '').replace('.php', ''));
}

export default function DashboardClient({ usern, isStoreUser, stats, sonBilgilendirmeler, sonKampanyalar, sonIK }: Props) {
  const quickItems = isStoreUser
    ? QUICK_ACCESS.filter(i => !i.href.startsWith('/masrafgirisleri'))
    : QUICK_ACCESS;

  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', padding: '28px 24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            Hoş geldiniz, <span style={{ color: 'var(--accent)' }}>{usern}</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 5 }}>{today}</p>
        </div>
      </div>

      {/* ── İstatistik Widget'ları ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
        {STATS.map(s => (
          <Link key={s.key} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = s.color + '55';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLDivElement).style.transform = 'none';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: s.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className={s.icon} style={{ color: s.color, fontSize: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {stats[s.key]}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Ana İçerik Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 32 }}>

        {/* Son Bilgilendirmeler */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-bell" style={{ color: '#d63050', fontSize: 13 }} />
              <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>Son Bilgilendirmeler</span>
            </div>
            <Link href="/bilgilendirme" style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 500, opacity: 0.8 }}>
              Tümü <i className="fa-solid fa-arrow-right" style={{ fontSize: 9 }} />
            </Link>
          </div>
          <div>
            {sonBilgilendirmeler.length === 0
              ? <p style={{ padding: '20px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>İçerik yok</p>
              : sonBilgilendirmeler.map((row, i) => (
                <Link
                  key={i}
                  href={`/bilgilendirme/${cleanSlug(row.dosya_adi)}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 20px',
                    borderBottom: i < sonBilgilendirmeler.length - 1 ? '1px solid var(--border)' : 'none',
                    textDecoration: 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(214,48,80,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d63050', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.gorsel_baslik}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{row.baslik}</div>
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{timeAgo(row.tarih)}</div>
                </Link>
              ))
            }
          </div>
        </div>

        {/* Son Kampanyalar + İK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Son Kampanyalar */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-tag" style={{ color: '#f59e0b', fontSize: 13 }} />
                <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>Son Kampanyalar</span>
              </div>
            </div>
            <div>
              {sonKampanyalar.length === 0
                ? <p style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-muted)' }}>İçerik yok</p>
                : sonKampanyalar.map((row, i) => (
                  <Link
                    key={i}
                    href={`/calisankampanyalari/${cleanSlug(row.dosya_adi)}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 20px',
                      borderBottom: i < sonKampanyalar.length - 1 ? '1px solid var(--border)' : 'none',
                      textDecoration: 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.gorsel_baslik}</div>
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(row.tarih)}</div>
                  </Link>
                ))
              }
            </div>
          </div>

          {/* Son İK Duyuruları */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-users" style={{ color: '#f43f5e', fontSize: 13 }} />
                <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>İK Duyuruları</span>
              </div>
              <Link href="/ik/ise-alim-duyurulari" style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 500, opacity: 0.8 }}>
                Tümü <i className="fa-solid fa-arrow-right" style={{ fontSize: 9 }} />
              </Link>
            </div>
            <div>
              {sonIK.length === 0
                ? <p style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-muted)' }}>İçerik yok</p>
                : sonIK.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 20px',
                      borderBottom: i < sonIK.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                      background: row.kisi_tur === 'ise_alim' ? 'rgba(244,63,94,0.15)' : 'rgba(59,130,246,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className={row.kisi_tur === 'ise_alim' ? 'fa-solid fa-user-plus' : 'fa-solid fa-user-gear'}
                        style={{ fontSize: 11, color: row.kisi_tur === 'ise_alim' ? '#f43f5e' : '#3b82f6' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.kisi_ad_soyad}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.kisi_gorev}</div>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {new Date(row.kisi_kayit_tarihi).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

        </div>
      </div>

      {/* ── Hızlı Erişim ── */}
      <div>
        <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
          Hızlı Erişim
        </p>
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {quickItems.map(item => (
            <Link key={item.href} href={item.href} className="pcard" style={{ textDecoration: 'none' }}>
              <div className="pcard-icon" style={{ backgroundColor: item.color + '15', height: 70 }}>
                <div className="pcard-icon-inner" style={{ backgroundColor: item.color, width: 38, height: 38 }}>
                  <i className={item.icon} style={{ fontSize: '0.95rem' }} />
                </div>
              </div>
              <div className="pcard-body" style={{ padding: '8px 12px 12px' }}>
                <p className="pcard-title" style={{ fontSize: 12 }}>{item.label}</p>
              </div>
              <div className="pcard-bar" style={{ backgroundColor: item.color }} />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
