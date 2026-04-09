'use client';

import { useState, useEffect } from 'react';
import UrunTakipLayout from '../_components/UrunTakipLayout';

const GOLD = '#F7CA18';

interface Satis {
  firma_ad: string;
  barkod_no: string;
  urun_fiyat: string;
  para_birimi: string;
  satis_tarih: string;
}

interface Props { firmaAd: string; kisiOncelik: number; }

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
    const res  = await fetch('/api/urun-takip/satis?' + params.toString());
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
    const dt = new Date(d);
    return dt.toLocaleDateString('tr-TR') + ' ' + dt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  const firmalar = kisiOncelik === 5 ? [...new Set(rows.map(r => r.firma_ad))] : [];
  const filtered = rows.filter(r => {
    const mFirma  = firmaFilter ? r.firma_ad === firmaFilter : true;
    const mSearch = search ? Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase()) : true;
    return mFirma && mSearch;
  });

  return (
    <UrunTakipLayout firmaAd={firmaAd} activeHref="/urun-takip/satis-tablosu">
      <style>{`
        .st-wrap { padding: 16px; }
        .st-page-title { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 16px; }

        .st-filters { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
        .st-filter-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .st-date-group { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .st-date-label { font-size: 12px; color: rgba(255,255,255,0.5); white-space: nowrap; }

        .st-input, .st-select {
          padding: 9px 10px;
          background: rgba(237,235,250,0.1);
          border: 1px solid rgba(255,255,255,0.25);
          color: #fff; font-size: 13px; outline: none;
          font-family: 'Dosis', sans-serif; border-radius: 6px;
        }
        .st-input:focus, .st-select:focus { border-color: ${GOLD}; }
        .st-select option { background: #1c1e21; }
        .st-input-search { flex: 1; min-width: 120px; }

        .st-btn {
          padding: 9px 16px; border: 1px solid ${GOLD};
          background: transparent; color: ${GOLD}; font-size: 13px;
          font-family: 'Dosis', sans-serif; cursor: pointer;
          text-transform: uppercase; transition: all 0.2s; border-radius: 6px;
          white-space: nowrap;
        }
        .st-btn:hover { background: ${GOLD}; color: #111; }
        .st-btn-sec { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.5); }
        .st-btn-sec:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .st-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); }
        table { width: 100%; border-collapse: collapse; min-width: 440px; }
        th { background: rgba(247,202,24,0.12); color: ${GOLD}; padding: 11px 12px; text-align: center; font-size: 11px; font-weight: 700; border-bottom: 1px solid rgba(247,202,24,0.25); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        td { padding: 10px 12px; text-align: center; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(247,202,24,0.04); }
        .st-empty { color: rgba(255,255,255,0.25); padding: 28px; font-size: 14px; text-align: center; }
        .st-loading { color: rgba(255,255,255,0.4); padding: 24px; text-align: center; font-size: 13px; }

        @media (max-width: 600px) {
          .st-date-group { flex-direction: column; align-items: flex-start; width: 100%; }
          .st-input { width: 100%; }
          .st-btn { flex: 1; text-align: center; }
          .st-input-search { width: 100%; }
        }
      `}</style>

      <div className="st-wrap">
        <div className="st-page-title">📋 Satış Listesi</div>

        <div className="st-filters">
          {kisiOncelik === 5 && (
            <select className="st-select" value={firmaFilter} onChange={e => setFirmaFilter(e.target.value)}>
              <option value="">Tüm Firmalar</option>
              {firmalar.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}

          <form onSubmit={handleFilter} style={{ display: 'contents' }}>
            <div className="st-date-group">
              <span className="st-date-label">Başlangıç:</span>
              <input type="date" className="st-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <span className="st-date-label">Bitiş:</span>
              <input type="date" className="st-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="st-filter-row">
              <button type="submit" className="st-btn">Filtrele</button>
              <button type="button" className="st-btn st-btn-sec" onClick={handleTemizle}>Temizle</button>
              <input type="text" className="st-input st-input-search" placeholder="Ara..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </form>
        </div>

        {dbError && (
          <div style={{
            marginBottom: 16, padding: '12px 16px', borderRadius: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#fca5a5', fontSize: 13,
          }}>⚠ Veritabanına bağlanılamadı. Lütfen daha sonra tekrar deneyin.</div>
        )}

        {loading
          ? <div className="st-loading">Yükleniyor...</div>
          : (
            <div className="st-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Firma</th>
                    <th>Barkod</th>
                    <th>Fiyat</th>
                    <th>Birim</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0
                    ? filtered.map((r, i) => (
                      <tr key={i}>
                        <td>{r.firma_ad}</td>
                        <td>{r.barkod_no}</td>
                        <td>{r.urun_fiyat}</td>
                        <td>{r.para_birimi}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.satis_tarih)}</td>
                      </tr>
                    ))
                    : <tr><td colSpan={5} className="st-empty">Kayıt bulunamadı.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </UrunTakipLayout>
  );
}
