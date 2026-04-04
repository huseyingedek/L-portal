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

const ACCENT = '#818cf8';
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
        background: 'linear-gradient(180deg, #06080f 0%, #070a14 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
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
          height: 54, flexShrink: 0,
          display: 'flex', alignItems: 'center',
          justifyContent: slim ? 'center' : 'flex-start',
          padding: slim ? 0 : '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}>
          <Link
            href="/dashboard"
            onClick={isMobile ? onMobileClose : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', overflow: 'hidden' }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            }}>
              <i className="fa-solid fa-gem" style={{ color: 'white', fontSize: 12 }} />
            </div>
            {!slim && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#e2e8f0', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>Lizay</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: -1 }}>Portal</div>
              </div>
            )}
          </Link>
        </div>

        {/* Menü öğeleri */}
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0 8px' }}>
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
                    margin: slim ? '2px 0' : '1px 8px',
                    padding: slim ? '10px 0' : '8px 10px',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                    background: active
                      ? 'linear-gradient(90deg, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.06) 100%)'
                      : 'transparent',
                    borderRadius: slim ? 0 : 8,
                    borderLeft: slim ? 'none' : `2px solid ${active ? '#818cf8' : 'transparent'}`,
                    textDecoration: 'none',
                    transition: 'background 0.14s, color 0.14s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  <i className={item.icon} style={{
                    fontSize: slim ? 17 : 13,
                    width: slim ? 'auto' : 16,
                    textAlign: 'center',
                    flexShrink: 0,
                    color: active ? '#818cf8' : undefined,
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
                    color: activeSection ? '#818cf8' : 'rgba(255,255,255,0.5)',
                    background: activeSection ? 'rgba(99,102,241,0.15)' : 'transparent',
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
                      ? 'linear-gradient(90deg, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.04) 100%)'
                      : 'transparent',
                    borderLeft: `2px solid ${activeSection ? '#818cf8' : 'transparent'}`,
                    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    borderRadius: 8,
                    transition: 'background 0.14s, color 0.14s',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                  }}
                >
                  <i className={item.icon} style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0, color: activeSection ? '#818cf8' : undefined }} />
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
                          color: active ? '#818cf8' : 'rgba(255,255,255,0.42)',
                          background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                          borderLeft: `2px solid ${active ? '#818cf8' : 'transparent'}`,
                          borderRadius: 7,
                          margin: '1px 0',
                          textDecoration: 'none',
                          transition: 'background 0.12s, color 0.12s',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}
                      >
                        {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#818cf8', flexShrink: 0 }} />}
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Alt kısım: mobilde IAS linkleri */}
        {isMobile && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: '10px 14px', flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {[
              { label: 'IAS Dış İp', href: 'http://176.236.6.140:8099/caniasout.jnlp', sub: '176.236.6.140:8099' },
              { label: 'IAS İç İp',  href: 'http://192.168.1.50:8099/canias.jnlp',     sub: '192.168.1.50:8099'  },
              { label: 'JAVA',       href: 'https://media.ias.com.tr/java8/windows/jre-8u191-windows-x64.exe', sub: null },
            ].map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fa-solid fa-link" style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{l.label}</span>
                {l.sub && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{l.sub}</span>}
              </a>
            ))}
          </div>
        )}

        {/* Alt kısım: kullanıcı */}
        {usern && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: slim ? '12px 0' : '12px 12px',
            flexShrink: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9,
              justifyContent: slim ? 'center' : 'flex-start',
            }}>
              <div style={{
                width: slim ? 28 : 30, height: slim ? 28 : 30,
                borderRadius: 9,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0,
                letterSpacing: '0.02em',
                boxShadow: '0 2px 8px rgba(79,70,229,0.4)',
              }}>
                {usern.charAt(0).toUpperCase()}
              </div>
              {!slim && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{usern}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.05em' }}>Kullanıcı</div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

    </>
  );
}
