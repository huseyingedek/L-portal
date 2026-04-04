'use client';

import Link from 'next/link';

const GOLD = '#F7CA18';

export default function UrunTakipPanelClient({ firmaAd }: { firmaAd: string }) {
  async function handleLogout() {
    await fetch('/api/urun-takip/logout', { method: 'POST' });
    window.location.href = '/urun-takip';
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body {
          background: #1c1e21;
          font-family: 'Dosis', sans-serif;
          min-height: 100vh;
          color: #fff;
        }
        .ut-navbar {
          background: #111214;
          border-bottom: 2px solid ${GOLD};
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ut-navbar-brand {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.03em;
        }
        .ut-navbar-brand span { color: ${GOLD}; }
        .ut-logout {
          background: transparent;
          border: 1px solid ${GOLD};
          color: ${GOLD};
          padding: 6px 18px;
          cursor: pointer;
          font-family: 'Dosis', sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.3s;
        }
        .ut-logout:hover { background: ${GOLD}; color: #fff; }
        .ut-sidebar {
          width: 240px;
          background: #111214;
          border-right: 1px solid rgba(247,202,24,0.15);
          min-height: calc(100vh - 56px);
          padding: 16px 0;
          flex-shrink: 0;
        }
        .ut-sidebar a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          font-size: 14px;
          font-weight: 400;
          transition: all 0.15s;
          border-left: 2px solid transparent;
        }
        .ut-sidebar a:hover {
          color: #fff;
          background: rgba(247,202,24,0.06);
          border-left-color: ${GOLD};
        }
        .ut-sidebar a.active {
          color: #fff;
          background: rgba(247,202,24,0.1);
          border-left-color: ${GOLD};
        }
        .ut-sidebar-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.2);
          padding: 16px 20px 6px;
          font-weight: 700;
        }
        .ut-content {
          flex: 1;
          padding: 32px 28px;
        }
        .ut-welcome {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .ut-welcome span { color: ${GOLD}; }
        .ut-desc { font-size: 14px; color: rgba(255,255,255,0.4); }
      `}</style>
      <link href="https://fonts.googleapis.com/css?family=Dosis:300,400,700" rel="stylesheet" />

      <nav className="ut-navbar">
        <div className="ut-navbar-brand">
          Lizay Pırlanta — <span>Ürün Takip</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: 8 }}>| {firmaAd}</span>
        </div>
        <button className="ut-logout" onClick={handleLogout}>Çıkış</button>
      </nav>

      <div style={{ display: 'flex' }}>
        <aside className="ut-sidebar">
          <div className="ut-sidebar-label">Menü</div>
          <Link href="/urun-takip/panel" className="active">
            <i style={{ fontSize: 13, width: 16, textAlign: 'center' }}>🏠</i>
            Ana Panel
          </Link>
          <Link href="/urun-takip/satis-tablosu">
            <i style={{ fontSize: 13, width: 16, textAlign: 'center' }}>📋</i>
            Satışları Listele
          </Link>
          <Link href="/urun-takip/satis-ekle">
            <i style={{ fontSize: 13, width: 16, textAlign: 'center' }}>➕</i>
            Satış Ekle
          </Link>
          <div className="ut-sidebar-label" style={{ marginTop: 8 }}>Hesap</div>
          <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <i style={{ fontSize: 13, width: 16, textAlign: 'center' }}>🚪</i>
            Çıkış Yap
          </a>
        </aside>

        <main className="ut-content">
          <div className="ut-welcome">Hoş geldiniz, <span>{firmaAd}</span></div>
          <div className="ut-desc">Sol menüden işlem yapabilirsiniz.</div>
        </main>
      </div>
    </>
  );
}
