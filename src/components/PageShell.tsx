'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface Props {
  children: React.ReactNode;
  usern?: string;
}

const COLLAPSED_KEY = 'lz-sidebar-collapsed';
const SIDEBAR_W     = 240;
const SIDEBAR_SLIM  = 58;

export default function PageShell({ children, usern }: Props) {
  const [collapsed, setCollapsed] = useState(false); // masaüstü: dar ↔ geniş
  const [mobileOpen, setMobileOpen] = useState(false); // mobil: gizli ↔ açık
  const [isMobile, setIsMobile]   = useState(false);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => {
    setMounted(true);
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) {
      const saved = localStorage.getItem(COLLAPSED_KEY);
      setCollapsed(saved === 'true');
    }
    const onResize = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      if (m) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function toggle() {
    if (isMobile) {
      setMobileOpen(v => !v);
    } else {
      const next = !collapsed;
      setCollapsed(next);
      localStorage.setItem(COLLAPSED_KEY, String(next));
    }
  }

  if (!mounted) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 52, backgroundColor: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{children}</div>
        </div>
      </div>
    );
  }

  const sidebarW = isMobile ? 0 : (collapsed ? SIDEBAR_SLIM : SIDEBAR_W);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Sidebar
        usern={usern}
        collapsed={collapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* İçerik alanı */}
      <div style={{
        flex: 1,
        minWidth: 0,
        marginLeft: sidebarW,
        transition: 'margin-left 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Topbar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 30,
          height: 58,
          background: 'linear-gradient(90deg, #0f0710 0%, #150a14 50%, #1a0c18 100%)',
          borderBottom: '2px solid rgba(214,48,80,0.3)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.5), 0 1px 0 rgba(214,48,80,0.1)',
          display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 12, flexShrink: 0,
        }}>
          {/* Hamburger */}
          <button
            onClick={toggle}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
              fontSize: 15, width: 34, height: 34, borderRadius: 8,
              transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(214,48,80,0.15)'; e.currentTarget.style.color = '#d63050'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
            aria-label="Menüyü Aç/Kapat"
          >
            <i className="fa-solid fa-bars" />
          </button>

          {/* IAS Linkleri — mobilde gizli */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, overflow: 'hidden' }}>
              {[
                { label: 'IAS Dış İp', href: 'http://176.236.6.140:8099/caniasout.jnlp', sub: '176.236.6.140:8099', icon: 'fa-solid fa-server' },
                { label: 'IAS İç İp',  href: 'http://192.168.1.50:8099/canias.jnlp',     sub: '192.168.1.50:8099',  icon: 'fa-solid fa-network-wired' },
                { label: 'JAVA',       href: 'https://media.ias.com.tr/java8/windows/jre-8u191-windows-x64.exe', sub: null, icon: 'fa-brands fa-java' },
              ].map((l, i) => (
                <span key={l.href} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && <span style={{ margin: '0 8px', color: 'rgba(214,48,80,0.25)', fontSize: 12 }}>|</span>}
                  <a href={l.href} target="_blank" rel="noreferrer"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 6, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(214,48,80,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <i className={l.icon} style={{ fontSize: 10, color: 'rgba(214,48,80,0.6)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.02em' }}>{l.label}</span>
                    {l.sub && <span style={{ color: 'rgba(255,255,255,0.22)' }}>{l.sub}</span>}
                  </a>
                </span>
              ))}
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Sağ: kullanıcı + çıkış */}
          {usern && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {/* Kullanıcı chip */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(214,48,80,0.08)',
                border: '1px solid rgba(214,48,80,0.2)',
                borderRadius: 10, padding: '4px 10px 4px 5px',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: 'linear-gradient(135deg, #d63050, #a82040)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: 'white',
                  boxShadow: '0 2px 8px rgba(214,48,80,0.4)',
                  letterSpacing: '0.02em', flexShrink: 0,
                }}>
                  {usern.charAt(0).toUpperCase()}
                </div>
                {!isMobile && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.03em' }}>{usern}</span>
                )}
              </div>
              {/* Çıkış butonu */}
              <button
                onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }}
                title="Çıkış Yap"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
                  fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
                  transition: 'all 0.15s', letterSpacing: '0.04em',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 12 }} />
                {!isMobile && 'Çıkış'}
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
