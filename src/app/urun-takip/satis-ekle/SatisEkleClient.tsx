'use client';

import { useState } from 'react';
import Link from 'next/link';

const GOLD = '#F7CA18';

export default function SatisEkleClient({ firmaAd }: { firmaAd: string }) {
  const [satisTarih, setSatisTarih] = useState('');
  const [barkodNo, setBarkodNo]     = useState('');
  const [urunFiyat, setUrunFiyat]   = useState('');
  const [paraBirimi, setParaBirimi] = useState('TRY');
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/urun-takip/satis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barkod_no: barkodNo, urun_fiyat: urunFiyat, para_birimi: paraBirimi, satis_tarih: satisTarih }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      alert('Başarıyla eklendi!');
      setSatisTarih(''); setBarkodNo(''); setUrunFiyat(''); setParaBirimi('TRY');
    } else {
      alert(data.error || 'Hata oluştu.');
    }
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css?family=Dosis:300,400,700" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body { background: #1c1e21; font-family: 'Dosis', sans-serif; min-height: 100vh; color: #fff; }
        .ut-navbar {
          background: #111214;
          border-bottom: 2px solid ${GOLD};
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ut-navbar a { color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; }
        .ut-navbar a:hover { color: ${GOLD}; }
        .ut-navbar-title { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.7); }
        .ut-main { max-width: 600px; margin: 40px auto; padding: 0 24px; }
        .ut-group { margin-bottom: 18px; }
        .ut-label { display: block; font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 4px; font-weight: 300; }
        .ut-input, .ut-select {
          width: 100%;
          padding: 10px;
          background: rgba(237,235,250,0.1);
          border: 1px solid #fff;
          border-radius: 0;
          color: #fff;
          font-size: 14px;
          outline: none;
          font-family: 'Dosis', sans-serif;
          transition: border-color 0.2s;
        }
        .ut-input:focus, .ut-select:focus { border-color: ${GOLD}; }
        .ut-select option { background: #1c1e21; color: #fff; }
        .ut-btn {
          margin-top: 10px;
          padding: 14px;
          width: 100%;
          border: 2px solid ${GOLD};
          border-radius: 0;
          background: transparent;
          color: ${GOLD};
          font-size: 17px;
          font-family: 'Dosis', sans-serif;
          font-weight: 300;
          text-transform: uppercase;
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: all 0.3s;
        }
        .ut-btn:hover:not(:disabled) { background: ${GOLD}; color: #fff; }
        .ut-btn:disabled { border-color: #555; color: #555; cursor: not-allowed; }
      `}</style>

      <nav className="ut-navbar">
        <span className="ut-navbar-title">Lizay Pırlanta — <span style={{color:GOLD}}>Ürün Takip</span> | {firmaAd}</span>
      </nav>

      <div style={{ display: 'flex' }}>
        <aside style={{
          width: 220, background: '#111214', borderRight: `1px solid rgba(247,202,24,0.15)`,
          minHeight: 'calc(100vh - 56px)', padding: '16px 0', flexShrink: 0,
        }}>
          {[
            { href: '/urun-takip/panel', label: 'Ana Panel' },
            { href: '/urun-takip/satis-tablosu', label: 'Satışları Listele' },
            { href: '/urun-takip/satis-ekle', label: 'Satış Ekle' },
            { href: '/urun-takip/fiyatgor', label: '💎 Fiyat Gör' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'block', padding: '12px 20px', color: 'rgba(255,255,255,0.55)',
              textDecoration: 'none', fontSize: 14,
              borderLeft: item.href === '/urun-takip/satis-ekle' ? `2px solid ${GOLD}` : '2px solid transparent',
              background: item.href === '/urun-takip/satis-ekle' ? 'rgba(247,202,24,0.1)' : 'transparent',
            }}>{item.label}</Link>
          ))}
        </aside>

      <main className="ut-main" style={{ flex: 1 }}>
        <form onSubmit={handleSubmit}>
          <div className="ut-group">
            <label className="ut-label">Tarih</label>
            <input type="date" className="ut-input" value={satisTarih} onChange={e => setSatisTarih(e.target.value)} required />
          </div>
          <div className="ut-group">
            <label className="ut-label">Barkod Numarası</label>
            <input type="text" className="ut-input" maxLength={8} value={barkodNo} onChange={e => setBarkodNo(e.target.value)} required placeholder="BARKOD NO" />
          </div>
          <div className="ut-group">
            <label className="ut-label">Fiyat</label>
            <input type="number" className="ut-input" value={urunFiyat} onChange={e => setUrunFiyat(e.target.value)} required placeholder="0.00" />
          </div>
          <div className="ut-group">
            <label className="ut-label">Para Birimi</label>
            <select className="ut-select" value={paraBirimi} onChange={e => setParaBirimi(e.target.value)}>
              <option value="TRY">(₺) Türk Lirası</option>
              <option value="USD">($) Dolar</option>
              <option value="EUR">(€) Euro</option>
              <option value="GBP">(£) Pound</option>
            </select>
          </div>
          <button type="submit" className="ut-btn" disabled={loading}>
            {loading ? 'Yükleniyor...' : 'Kaydet'}
          </button>
        </form>
      </main>
      </div>
    </>
  );
}
