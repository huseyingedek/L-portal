'use client';

import { useState } from 'react';
import Link from 'next/link';

const GOLD = '#F7CA18';

const NAV_ITEMS = [
  { href: '/urun-takip/panel',         label: 'Ana Panel',         emoji: '🏠' },
  { href: '/urun-takip/satis-tablosu', label: 'Satışları Listele', emoji: '📋' },
  { href: '/urun-takip/satis-ekle',    label: 'Satış Ekle',        emoji: '➕' },
  { href: '/urun-takip/fiyatgor',      label: 'Fiyat Gör',         emoji: '💎' },
];

interface Props {
  firmaAd: string;
  activeHref: string;
  children: React.ReactNode;
}

export default function UrunTakipLayout({ firmaAd, activeHref, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/urun-takip/logout', { method: 'POST' });
    window.location.href = '/urun-takip';
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css?family=Dosis:300,400,700" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body { background: #1c1e21; font-family: 'Dosis', sans-serif; min-height: 100vh; color: #fff; }

        .ut-hamburger {
          display: none;
          background: transparent;
          border: 1px solid rgba(247,202,24,0.4);
          color: ${GOLD};
          width: 38px; height: 38px;
          border-radius: 8px;
          align-items: center; justify-content: center;
          cursor: pointer; font-size: 20px;
          flex-shrink: 0;
        }
        .ut-exit-btn {
          background: transparent;
          border: 1px solid ${GOLD};
          color: ${GOLD};
          padding: 6px 14px;
          cursor: pointer;
          font-family: 'Dosis', sans-serif;
          font-size: 13px; font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
          border-radius: 4px;
        }
        .ut-brand-sub { color: rgba(255,255,255,0.4); font-weight: 400; margin-left: 8px; font-size: 13px; }

        .ut-sidebar-desktop {
          width: 220px;
          background: #111214;
          border-right: 1px solid rgba(247,202,24,0.15);
          min-height: calc(100vh - 56px);
          padding: 16px 0;
          flex-shrink: 0;
        }
        .ut-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 20px;
          color: rgba(255,255,255,0.55);
          text-decoration: none; font-size: 14px;
          border-left: 2px solid transparent;
          background: transparent;
          transition: background 0.15s, color 0.15s;
        }
        .ut-nav-link:hover { color: #fff; background: rgba(247,202,24,0.06); border-left-color: ${GOLD}; }
        .ut-nav-link.active { color: #fff; background: rgba(247,202,24,0.1); border-left-color: ${GOLD}; }

        .ut-content-area { flex: 1; min-width: 0; overflow-x: hidden; }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .ut-hamburger { display: flex; }
          .ut-sidebar-desktop { display: none; }
          .ut-brand-sub { display: none; }
          .ut-exit-btn { padding: 6px 10px; font-size: 12px; }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: '#111214', borderBottom: `2px solid ${GOLD}`,
        padding: '0 14px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100, gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
          <button className="ut-hamburger" onClick={() => setMenuOpen(true)}>☰</button>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Lizay — <span style={{ color: GOLD }}>Ürün Takip</span>
            <span className="ut-brand-sub">| {firmaAd}</span>
          </div>
        </div>
        <button className="ut-exit-btn" onClick={handleLogout}>Çıkış</button>
      </nav>

      {/* Body */}
      <div style={{ display: 'flex' }}>

        {/* Desktop sidebar */}
        <aside className="ut-sidebar-desktop">
          <div style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.2)', padding: '8px 20px 10px', fontWeight: 700,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{firmaAd}</div>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}
              className={`ut-nav-link${activeHref === item.href ? ' active' : ''}`}>
              <span style={{ fontSize: 14 }}>{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          <div style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.2)', padding: '14px 20px 6px', fontWeight: 700,
          }}>Hesap</div>
          <a onClick={handleLogout} className="ut-nav-link" style={{ cursor: 'pointer' }}>
            <span style={{ fontSize: 14 }}>🚪</span><span>Çıkış Yap</span>
          </a>
        </aside>

        {/* Mobile sidebar overlay */}
        {menuOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
            <aside style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: 270, background: '#111214',
              borderRight: `1px solid rgba(247,202,24,0.2)`,
              display: 'flex', flexDirection: 'column',
              boxShadow: '4px 0 28px rgba(0,0,0,0.6)', zIndex: 1,
            }}>
              {/* Header */}
              <div style={{
                padding: '16px 18px', borderBottom: `1px solid rgba(247,202,24,0.12)`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>
                    Lizay — <span style={{ color: GOLD }}>Ürün Takip</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{firmaAd}</div>
                </div>
                <button onClick={() => setMenuOpen(false)} style={{
                  background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff',
                  width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>✕</button>
              </div>

              {/* Nav */}
              <nav style={{ flex: 1, overflowY: 'auto', paddingTop: 8 }}>
                {NAV_ITEMS.map(item => (
                  <Link key={item.href} href={item.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '15px 20px', fontSize: 15, textDecoration: 'none',
                      color: activeHref === item.href ? '#fff' : 'rgba(255,255,255,0.65)',
                      borderLeft: activeHref === item.href ? `3px solid ${GOLD}` : '3px solid transparent',
                      background: activeHref === item.href ? `rgba(247,202,24,0.1)` : 'transparent',
                      fontWeight: activeHref === item.href ? 600 : 400,
                    }}>
                    <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.emoji}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Footer */}
              <div style={{ padding: '16px 18px', borderTop: `1px solid rgba(247,202,24,0.1)` }}>
                <button onClick={handleLogout} style={{
                  width: '100%', padding: '13px',
                  border: `1px solid ${GOLD}`, background: 'transparent',
                  color: GOLD, cursor: 'pointer',
                  fontFamily: "'Dosis', sans-serif", fontSize: 14, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: 4,
                }}>Çıkış Yap</button>
              </div>
            </aside>
          </div>
        )}

        {/* Content */}
        <div className="ut-content-area">{children}</div>
      </div>
    </>
  );
}
