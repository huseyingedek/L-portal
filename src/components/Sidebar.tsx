'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavChild { label: string; href: string; }
interface NavItem {
  label: string;
  icon: string;
  href?: string;
  children?: NavChild[];
}

const NAV: NavItem[] = [
  { label: 'Ana Menü',              icon: 'fa-solid fa-house',          href: '/dashboard' },
  {
    label: 'Masraf Girişleri',      icon: 'fa-solid fa-receipt',
    children: [
      { label: 'Masraf Girişi',   href: '/masrafgirisleri/masraf-girisi' },
      { label: 'Belgeye Masraf',  href: '/masrafgirisleri/belgeye-masraf' },
      { label: 'Merkez Ofis',     href: '/masrafgirisleri/merkez-ofis' },
      { label: 'Masraf Onayları', href: '/masrafgirisleri/masraf-onay' },
      { label: 'Fatura Onayları', href: '/masrafgirisleri/fatura-onay' },
    ],
  },
  {
    label: 'Şirket İçi İletişim',   icon: 'fa-solid fa-address-book',
    children: [
      { label: 'Personel Mailleri', href: '/sirket-ici-iletisim/personel-mail-adresleri' },
      { label: 'Mağaza İletişim',   href: '/sirket-ici-iletisim/magaza-iletisim-bilgileri' },
      { label: 'Merkez 1',          href: '/sirket-ici-iletisim/departmanlar/merkez-1' },
      { label: 'Merkez 2',          href: '/sirket-ici-iletisim/departmanlar/merkez-2' },
      { label: 'Mail Grupları',     href: '/sirket-ici-iletisim/departmanlar/mail-gruplari' },
    ],
  },
  {
    label: 'İAS Eğitim',            icon: 'fa-solid fa-graduation-cap',
    children: [
      { label: 'Franchise Ürün Kabulü',  href: '/ias-egitim/muhasebe-belgeleri' },
      { label: 'Müşteri Bakiye',         href: '/ias-egitim/musteri-bakiye-listesi' },
      { label: 'Banko Aktarımları',      href: '/ias-egitim/banko-transferleri' },
      { label: 'Barkod Sayım',           href: '/ias-egitim/barkod-sayimi' },
      { label: 'Stoklar',                href: '/ias-egitim/stoklar' },
      { label: 'Barkod Giriş',           href: '/ias-egitim/barkod-giris' },
      { label: 'Satış İstatistikleri',   href: '/ias-egitim/satis-istatistikleri' },
      { label: 'Satış Raporları',        href: '/ias-egitim/satis-raporlari' },
    ],
  },
  { label: 'Prosedürler',          icon: 'fa-solid fa-book-open',      href: '/prosedurler' },
  { label: 'Bilgilendirme',        icon: 'fa-solid fa-bell',           href: '/bilgilendirme' },
  {
    label: 'İnsan Kaynakları',      icon: 'fa-solid fa-users',
    children: [
      { label: 'İşe Alım Duyuruları',       href: '/ik/ise-alim-duyurulari' },
      { label: 'Atama-Görev Değişiklikleri', href: '/ik/atama-gorev-degisiklikleri' },
    ],
  },
  {
    label: 'Mağazacılık',           icon: 'fa-solid fa-store',
    children: [
      { label: 'Müşteri Kaydı', href: '/magazacilik/musteri-kaydi' },
      { label: 'Fiyat Gör',     href: '/fiyatgor' },
    ],
  },
  { label: 'İzin Formu',           icon: 'fa-solid fa-calendar-check', href: '/izin-formu' },
  { label: 'Ödeme Yap',            icon: 'fa-solid fa-credit-card',    href: '/odeme-sayfasi' },
];

const ACCENT = '#d63050';
const W_FULL = 240;
const W_SLIM = 58;

// PHP: calisankampanyalari/index.php → sadece bu kullanıcılar sidebar'da görür
const KAMPANYA_USERS = ['CICIGEN', 'BTEMUR', 'EALPER', 'SGENC'];

interface Props {
  usern?: string;
  collapsed: boolean;       // masaüstü: dar(true) ↔ geniş(false)
  isMobile: boolean;
  mobileOpen: boolean;      // mobil: gizli(false) ↔ açık(true)
  onMobileClose: () => void;
}

export default function Sidebar({ usern, collapsed, isMobile, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();

  const nav = KAMPANYA_USERS.includes(usern || '')
    ? [...NAV.slice(0, 6), { label: 'Çalışan Kampanyaları', icon: 'fa-solid fa-tag', href: '/calisankampanyalari' }, ...NAV.slice(6)]
    : NAV;

  function hasActiveChild(item: NavItem): boolean {
    return item.children?.some(c => pathname === c.href || pathname.startsWith(c.href + '/')) ?? false;
  }

  const initOpen = new Set(nav.filter(hasActiveChild).map(i => i.label));
  const [openSecs, setOpenSecs] = useState<Set<string>>(initOpen);

  useEffect(() => {
    const active = nav.filter(hasActiveChild).map(i => i.label);
    if (active.length) setOpenSecs(prev => new Set([...prev, ...active]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggle(label: string) {
    setOpenSecs(prev => {
      const n = new Set(prev);
      n.has(label) ? n.delete(label) : n.add(label);
      return n;
    });
  }

  function isActive(href: string) {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
  }

  // Masaüstünde: her zaman görünür, genişlik değişir
  // Mobilde: translateX ile gizlenir/gösterilir
  const sidebarVisible = isMobile ? mobileOpen : true;
  const width = isMobile ? W_FULL : (collapsed ? W_SLIM : W_FULL);
  const slim = !isMobile && collapsed;

  const transform = isMobile
    ? (mobileOpen ? 'translateX(0)' : `translateX(-${W_FULL}px)`)
    : 'translateX(0)';

  return (
    <>
      {/* Mobil overlay */}
      {isMobile && mobileOpen && (
        <div onClick={onMobileClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)', zIndex: 39 }} />
      )}

      <aside style={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh',
        width,
        background: 'linear-gradient(180deg, #0f0710 0%, #130912 40%, #150a14 100%)',
        borderRight: '1px solid rgba(214,48,80,0.22)',
        boxShadow: '2px 0 24px rgba(0,0,0,0.5)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        transform,
        transition: 'transform 0.22s ease, width 0.22s ease',
        willChange: 'transform, width',
        overflow: 'hidden',
      }}>
        {/* Logo satırı */}
        <div style={{
          height: 58, flexShrink: 0,
          display: 'flex', alignItems: 'center',
          justifyContent: slim ? 'center' : 'flex-start',
          padding: slim ? 0 : '0 18px',
          borderBottom: '2px solid rgba(214,48,80,0.22)',
          background: 'linear-gradient(90deg, rgba(214,48,80,0.06) 0%, transparent 100%)',
          overflow: 'hidden',
        }}>
          <Link
            href="/dashboard"
            onClick={isMobile ? onMobileClose : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', overflow: 'hidden' }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #d63050 0%, #8a1a30 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(214,48,80,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}>
              <i className="fa-solid fa-gem" style={{ color: 'white', fontSize: 13 }} />
            </div>
            {!slim && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#f5eaee', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>Lizay</div>
                <div style={{ fontSize: 9.5, color: 'rgba(214,48,80,0.6)', whiteSpace: 'nowrap', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 1, fontWeight: 600 }}>Pırlanta Portal</div>
              </div>
            )}
          </Link>
        </div>

        {/* Menü öğeleri */}
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 0' }}>
          {nav.map(item => {
            if (item.href && !item.children) {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isMobile ? onMobileClose : undefined}
                  title={slim ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: slim ? 'center' : 'flex-start',
                    gap: slim ? 0 : 10,
                    margin: slim ? '2px 0' : '2px 10px',
                    padding: slim ? '11px 0' : '9px 12px',
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 400,
                    color: active ? '#f5eaee' : 'rgba(255,255,255,0.48)',
                    background: active
                      ? 'linear-gradient(90deg, rgba(214,48,80,0.28) 0%, rgba(214,48,80,0.05) 100%)'
                      : 'transparent',
                    borderRadius: slim ? 0 : 9,
                    borderLeft: slim ? 'none' : `2px solid ${active ? '#d63050' : 'transparent'}`,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    letterSpacing: active ? '0.01em' : undefined,
                  }}
                >
                  <i className={item.icon} style={{
                    fontSize: slim ? 17 : 13,
                    width: slim ? 'auto' : 16,
                    textAlign: 'center',
                    flexShrink: 0,
                    color: active ? '#d63050' : 'rgba(255,255,255,0.3)',
                  }} />
                  {!slim && item.label}
                </Link>
              );
            }

            const secOpen = openSecs.has(item.label);
            const activeSection = hasActiveChild(item);

            if (slim) {
              const firstChild = item.children![0];
              return (
                <Link
                  key={item.label}
                  href={firstChild.href}
                  title={item.label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '10px 0', margin: '2px 0',
                    color: activeSection ? '#d63050' : 'rgba(255,255,255,0.6)',
                    background: activeSection ? 'rgba(214,48,80,0.16)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'background 0.14s, color 0.14s',
                  }}
                >
                  <i className={item.icon} style={{ fontSize: 17 }} />
                </Link>
              );
            }

            return (
              <div key={item.label} style={{ margin: '1px 8px' }}>
                <button
                  onClick={() => toggle(item.label)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', width: '100%', fontSize: 13,
                    fontWeight: activeSection ? 600 : 400,
                    color: activeSection ? '#fff' : 'rgba(255,255,255,0.5)',
                    background: activeSection
                      ? 'linear-gradient(90deg, rgba(214,48,80,0.2) 0%, rgba(214,48,80,0.04) 100%)'
                      : 'transparent',
                    borderLeft: `2px solid ${activeSection ? '#d63050' : 'transparent'}`,
                    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    borderRadius: 8,
                    transition: 'background 0.14s, color 0.14s',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                  }}
                >
                  <i className={item.icon} style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0, color: activeSection ? '#d63050' : undefined }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                  <i
                    className="fa-solid fa-chevron-right"
                    style={{ fontSize: 8, flexShrink: 0, opacity: 0.5, transition: 'transform 0.22s', transform: secOpen ? 'rotate(90deg)' : 'none' }}
                  />
                </button>

                <div style={{
                  overflow: 'hidden',
                  maxHeight: secOpen ? 500 : 0,
                  transition: 'max-height 0.26s ease',
                }}>
                  {item.children!.map(child => {
                    const active = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={isMobile ? onMobileClose : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 10px 6px 36px',
                          fontSize: 12.5,
                          fontWeight: active ? 600 : 400,
                          color: active ? '#d63050' : 'rgba(255,255,255,0.6)',
                          background: active ? 'rgba(214,48,80,0.12)' : 'transparent',
                          borderLeft: `2px solid ${active ? '#d63050' : 'transparent'}`,
                          borderRadius: 7,
                          margin: '1px 0',
                          textDecoration: 'none',
                          transition: 'background 0.12s, color 0.12s',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}
                      >
                        {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#d63050', flexShrink: 0 }} />}
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Alt kısım: kullanıcı */}
        {usern && (
          <div style={{
            borderTop: '1px solid rgba(214,48,80,0.2)',
            background: 'rgba(214,48,80,0.04)',
            padding: slim ? '12px 0' : '12px 14px',
            flexShrink: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              justifyContent: slim ? 'center' : 'flex-start',
            }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #d63050, #8a1a30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0,
                letterSpacing: '0.02em',
                boxShadow: '0 3px 10px rgba(214,48,80,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}>
                {usern.charAt(0).toUpperCase()}
              </div>
              {!slim && (
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f5eaee', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.02em' }}>{usern}</div>
                  <div style={{ fontSize: 10, color: 'rgba(214,48,80,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginTop: 1 }}>Aktif Oturum</div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

    </>
  );
}
