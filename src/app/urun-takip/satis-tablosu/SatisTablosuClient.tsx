'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const GOLD = '#F7CA18';

interface Satis {
  firma_ad: string;
  barkod_no: string;
  urun_fiyat: string;
  para_birimi: string;
  satis_tarih: string;
}

interface Props {
  firmaAd: string;
  kisiOncelik: number;
}

export default function SatisTablosuClient({ firmaAd, kisiOncelik }: Props) {
  const [rows, setRows]               = useState<Satis[]>([]);
  const [dbError, setDbError]         = useState(false);
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [firmaFilter, setFirmaFilter] = useState('');

  async function fetchData(start?: string, end?: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (start) params.set('startDate', start);
    if (end)   params.set('endDate', end);
    const res = await fetch('/api/urun-takip/satis?' + params.toString());
    const data = await res.json();
    if (data.error) setDbError(true);
    setRows(data.rows || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  function handleFilter(e: React.FormEvent) { e.preventDefault(); fetchData(startDate, endDate); }
  function handleTemizle() { setStartDate(''); setEndDate(''); setSearch(''); setFirmaFilter(''); fetchData(); }
  function formatDate(d: string) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('tr-TR') + ' ' + new Date(d).toLocaleTimeString('tr-TR');
  }

  const firmalar = kisiOncelik === 5 ? [...new Set(rows.map(r => r.firma_ad))] : [];
  const filtered = rows.filter(r => {
    const matchFirma  = firmaFilter ? r.firma_ad === firmaFilter : true;
    const matchSearch = search ? Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase()) : true;
    return matchFirma && matchSearch;
  });

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
        .ut-main { max-width: 1100px; margin: 24px auto; padding: 0 24px; }
        .filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .ut-input, .ut-select {
          padding: 7px 10px;
          background: rgba(237,235,250,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          font-size: 13px;
          outline: none;
          font-family: 'Dosis', sans-serif;
          border-radius: 0;
        }
        .ut-input:focus, .ut-select:focus { border-color: ${GOLD}; }
        .ut-select option { background: #1c1e21; }
        .ut-btn {
          padding: 7px 16px;
          border: 1px solid ${GOLD};
          background: transparent;
          color: ${GOLD};
          font-size: 13px;
          font-family: 'Dosis', sans-serif;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.2s;
          border-radius: 0;
        }
        .ut-btn:hover { background: ${GOLD}; color: #fff; }
        .ut-btn-secondary { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.5); }
        .ut-btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: rgba(247,202,24,0.15); color: ${GOLD}; padding: 10px 12px; text-align: center; font-size: 13px; font-weight: 700; border-bottom: 1px solid rgba(247,202,24,0.3); text-transform: uppercase; letter-spacing: 0.04em; }
        td { padding: 9px 12px; text-align: center; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
        tr:hover td { background: rgba(247,202,24,0.05); }
        .loading { color: rgba(255,255,255,0.4); padding: 20px 0; text-align: center; }
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
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'block', padding: '12px 20px', color: 'rgba(255,255,255,0.55)',
              textDecoration: 'none', fontSize: 14,
              borderLeft: item.href === '/urun-takip/satis-tablosu' ? `2px solid ${GOLD}` : '2px solid transparent',
              background: item.href === '/urun-takip/satis-tablosu' ? 'rgba(247,202,24,0.1)' : 'transparent',
            }}>{item.label}</Link>
          ))}
        </aside>

      <main className="ut-main" style={{ flex: 1 }}>
        <div className="filter-row">
          {kisiOncelik === 5 && (
            <select className="ut-select" value={firmaFilter} onChange={e => setFirmaFilter(e.target.value)}>
              <option value="">Tüm Firmalar</option>
              {firmalar.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
          <form onSubmit={handleFilter} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Başlangıç:
              <input type="date" className="ut-input" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ marginLeft: 6 }} />
            </label>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Bitiş:
              <input type="date" className="ut-input" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ marginLeft: 6 }} />
            </label>
            <button type="submit" className="ut-btn">Filtrele</button>
          </form>
          <button className="ut-btn ut-btn-secondary" onClick={handleTemizle}>Temizle</button>
          <input type="text" className="ut-input" placeholder="Ara..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {dbError && (
          <div style={{
            margin: '16px 0', padding: '14px 18px', borderRadius: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span>⚠</span>
            Veritabanına bağlanılamadı. Satış verileri yüklenemedi, lütfen daha sonra tekrar deneyin.
          </div>
        )}
        {loading && <div className="loading">Yükleniyor...</div>}

        <table>
          <thead>
            <tr>
              <th>Firma</th>
              <th>Barkod No</th>
              <th>Fiyat</th>
              <th>Para Birimi</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((r, i) => (
                <tr key={i}>
                  <td>{r.firma_ad}</td>
                  <td>{r.barkod_no}</td>
                  <td>{r.urun_fiyat}</td>
                  <td>{r.para_birimi}</td>
                  <td>{formatDate(r.satis_tarih)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} style={{ color: 'rgba(255,255,255,0.3)', padding: 20 }}>Veri bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </main>
      </div>
    </>
  );
}
