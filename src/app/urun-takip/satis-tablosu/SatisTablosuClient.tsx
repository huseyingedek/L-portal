'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [rows, setRows]             = useState<Satis[]>([]);
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [firmaFilter, setFirmaFilter] = useState('');

  async function fetchData(start?: string, end?: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (start) params.set('startDate', start);
    if (end)   params.set('endDate', end);
    const res = await fetch('/api/urun-takip/satis?' + params.toString());
    const data = await res.json();
    setRows(data.rows || []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    fetchData(startDate, endDate);
  }

  function handleTemizle() {
    setStartDate('');
    setEndDate('');
    setSearch('');
    setFirmaFilter('');
    fetchData();
  }

  function formatDate(d: string) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('tr-TR') + ' ' + dt.toLocaleTimeString('tr-TR');
  }

  const firmalar = kisiOncelik === 5 ? [...new Set(rows.map(r => r.firma_ad))] : [];

  const filtered = rows.filter(r => {
    const matchFirma  = firmaFilter ? r.firma_ad === firmaFilter : true;
    const matchSearch = search
      ? Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase())
      : true;
    return matchFirma && matchSearch;
  });

  return (
    <>
      <style>{`
        body { font-family: sans-serif; }
        .navbar { background-color: #343A40; color: white; padding: 10px 0; }
        .container { max-width: 1140px; margin: 0 auto; padding: 0 15px; }
        .d-flex { display: flex; }
        .justify-content-between { justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #dee2e6; padding: 8px 10px; text-align: center; font-size: 14px; }
        th { background: #f8f9fa; font-weight: bold; }
        tr:nth-child(even) { background: #f2f2f2; }
        .filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
        .filter-row input, .filter-row select { padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; }
        .btn { padding: 6px 14px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
        .btn-sm { padding: 4px 10px; font-size: 12px; }
        .btn-secondary { background: #6c757d; }
        a { color: white; text-decoration: none; font-weight: bold; }
      `}</style>

      <header>
        <div className="navbar">
          <div className="container d-flex justify-content-between">
            <Link href="/urun-takip/panel">
              <strong style={{ color: 'white' }}>Geri Dön</strong>
            </Link>
            <strong>Lizay Pırlanta Satış Listeleme Sayfası - {firmaAd}</strong>
          </div>
        </div>
      </header>

      <div className="container" style={{ marginTop: 16 }}>
        <div className="filter-row">
          {kisiOncelik === 5 && (
            <select value={firmaFilter} onChange={e => setFirmaFilter(e.target.value)}>
              <option value="">Tüm Firmalar</option>
              {firmalar.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
          <form onSubmit={handleFilter} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label>Başlangıç Tarihi:
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ marginLeft: 4 }} />
            </label>
            <label>Bitiş Tarihi:
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ marginLeft: 4 }} />
            </label>
            <button type="submit" className="btn btn-sm">Aralığı Filtrele</button>
          </form>
          <button className="btn btn-sm btn-secondary" onClick={handleTemizle}>Filtreleri Temizle</button>
          <input
            type="text"
            placeholder="Ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }}
          />
        </div>

        {loading && <p>Yükleniyor...</p>}

        <table className="table table-bordered table-striped" id="satisTable">
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
              <tr><td colSpan={5}>Veri bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
