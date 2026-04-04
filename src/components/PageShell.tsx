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
          height: 54,
          background: 'linear-gradient(90deg, #06080f 0%, #080b14 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: 10, flexShrink: 0,
        }}>
          {/* Hamburger */}
          <button
            onClick={toggle}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              fontSize: 16, padding: '6px 8px', borderRadius: 8,
              transition: 'background 0.14s, color 0.14s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.1)'; e.currentTarget.style.color = '#818cf8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            aria-label="Menüyü Aç/Kapat"
          >
            <i className="fa-solid fa-bars" />
          </button>

          {/* IAS Linkleri — mobilde gizli */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontSize: 11.5, overflow: 'hidden' }}>
              {[
                { label: 'IAS Dış İp', href: 'http://176.236.6.140:8099/caniasout.jnlp', sub: '176.236.6.140:8099' },
                { label: 'IAS İç İp',  href: 'http://192.168.1.50:8099/canias.jnlp',     sub: '192.168.1.50:8099'  },
                { label: 'JAVA',       href: 'https://media.ias.com.tr/java8/windows/jre-8u191-windows-x64.exe', sub: null },
              ].map((l, i) => (
                <span key={l.href} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                  {i > 0 && <span style={{ margin: '0 10px', color: 'rgba(255,255,255,0.1)', fontSize: 14 }}>|</span>}
                  <a href={l.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', transition: 'color .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                    onMouseLeave={e => (e.currentTarget.style.color = '')}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{l.label}</span>
                    {l.sub && <span style={{ color: 'rgba(255,255,255,0.28)', marginLeft: 3 }}>: {l.sub}</span>}
                  </a>
                </span>
              ))}
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Sağ: kullanıcı adı + çıkış */}
          {usern && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: 'white',
                boxShadow: '0 2px 8px rgba(79,70,229,0.4)',
                letterSpacing: '0.02em',
              }}>
                {usern.charAt(0).toUpperCase()}
              </div>
              {!isMobile && (
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.01em' }}>{usern}</span>
              )}
              <button
                onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }}
                title="Çıkış Yap"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: 'rgba(239,68,68,0.7)', cursor: 'pointer',
                  fontSize: 13, padding: '5px 8px', borderRadius: 7,
                  transition: 'background 0.14s, color 0.14s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'rgba(239,68,68,0.7)'; }}
              >
                <i className="fa-solid fa-right-from-bracket" />
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
