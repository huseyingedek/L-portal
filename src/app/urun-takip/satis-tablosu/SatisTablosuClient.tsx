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
  musteri_ad?: string;
  musteri_soyad?: string;
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
        /* ── Genel ── */
        .st-page { padding: 24px 20px 48px; }

        /* ── Başlık ── */
        .st-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .st-title {
          font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.01em;
        }
        .st-badge {
          font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 99px;
          background: rgba(247,202,24,0.13); color: ${GOLD};
          border: 1px solid rgba(247,202,24,0.28); font-family: 'Dosis', sans-serif;
          letter-spacing: 0.04em;
        }

        /* ── Filtre kartı ── */
        .st-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 16px 18px 14px;
          margin-bottom: 18px;
        }

        /* Üst satır: etiketli tarih alanları + Filtrele */
        .st-top-row {
          display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .st-field { display: flex; flex-direction: column; gap: 5px; }
        .st-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: rgba(255,255,255,0.35);
          font-family: 'Dosis', sans-serif;
        }
        .st-spacer { flex: 1; min-width: 8px; }

        /* Alt satır: Ara + Temizle */
        .st-bottom-row { display: flex; gap: 10px; align-items: center; }
        .st-search-wrap { flex: 1; position: relative; }
        .st-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.22); font-size: 12px; pointer-events: none;
        }

        /* Input & select */
        .st-input, .st-select {
          height: 38px; padding: 0 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff; font-size: 13px; outline: none;
          font-family: 'Dosis', sans-serif; border-radius: 8px;
          box-sizing: border-box; transition: border-color 0.18s;
        }
        .st-input:focus, .st-select:focus {
          border-color: ${GOLD}; background: rgba(247,202,24,0.04);
        }
        .st-input::placeholder { color: rgba(255,255,255,0.18); }
        .st-select option { background: #1a1b1e; }
        .st-search-input { width: 100%; padding-left: 34px; height: 38px; }

        /* Butonlar */
        .st-btn {
          height: 38px; padding: 0 18px; border-radius: 8px;
          font-size: 12px; font-family: 'Dosis', sans-serif; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em; cursor: pointer;
          white-space: nowrap; transition: all 0.18s;
          border: 1.5px solid ${GOLD}; background: transparent; color: ${GOLD};
        }
        .st-btn:hover { background: ${GOLD}; color: #111; }
        .st-btn-ghost {
          border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.4);
          background: transparent;
        }
        .st-btn-ghost:hover {
          border-color: rgba(255,255,255,0.35); color: rgba(255,255,255,0.75);
          background: rgba(255,255,255,0.05);
        }

        /* ── Hata ── */
        .st-error {
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
          padding: 11px 16px; border-radius: 10px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5; font-size: 13px;
        }

        /* ── Tablo ── */
        .st-table-wrap {
          border-radius: 12px; border: 1px solid rgba(255,255,255,0.07);
          overflow: hidden; overflow-x: auto; -webkit-overflow-scrolling: touch;
        }
        table { width: 100%; border-collapse: collapse; min-width: 520px; }
        thead { background: rgba(247,202,24,0.09); }
        th {
          padding: 12px 16px; text-align: left;
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: ${GOLD}; white-space: nowrap;
          border-bottom: 1px solid rgba(247,202,24,0.18);
        }
        td {
          padding: 11px 16px; text-align: left;
          font-size: 13px; color: rgba(255,255,255,0.75);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover td { background: rgba(247,202,24,0.03); }

        .td-firma  { color: #fff; font-weight: 600; }
        .td-musteri { color: rgba(255,255,255,0.5); font-size: 12px; }
        .td-barkod { font-family: 'Courier New', monospace; font-size: 12px; color: rgba(255,255,255,0.55); letter-spacing: 0.04em; }
        .td-fiyat  { color: ${GOLD}; font-weight: 700; }
        .td-birim  {
          display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px;
          border-radius: 99px; background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.45); letter-spacing: 0.06em;
        }
        .td-tarih  { font-size: 12px; color: rgba(255,255,255,0.38); white-space: nowrap; }

        .st-loading { padding: 40px; text-align: center; color: rgba(255,255,255,0.3); font-size: 13px; }
        .st-empty   { padding: 40px; text-align: center !important; color: rgba(255,255,255,0.2); font-size: 14px; }

        /* ── Responsive ── */
        @media (max-width: 620px) {
          .st-page { padding: 14px 12px 32px; }
          .st-top-row { flex-direction: column; align-items: stretch; }
          .st-top-row .st-spacer { display: none; }
          .st-top-row .st-btn, .st-bottom-row .st-btn { width: 100%; }
          .st-bottom-row { flex-direction: column; }
          .st-search-wrap { width: 100%; }
        }
      `}</style>

      <div className="st-page">

        {/* ── Başlık ── */}
        <div className="st-header">
          <span className="st-title">Satış Listesi</span>
          {!loading && <span className="st-badge">{filtered.length} kayıt</span>}
        </div>

        {/* ── Filtre Kartı ── */}
        <div className="st-card">
          <form onSubmit={handleFilter}>
            <div className="st-top-row">
              {kisiOncelik === 5 && (
                <div className="st-field">
                  <span className="st-label">Firma</span>
                  <select className="st-select" value={firmaFilter} onChange={e => setFirmaFilter(e.target.value)} style={{ minWidth: 140 }}>
                    <option value="">Tümü</option>
                    {firmalar.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              )}
              <div className="st-field">
                <span className="st-label">Başlangıç</span>
                <input type="date" className="st-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="st-field">
                <span className="st-label">Bitiş</span>
                <input type="date" className="st-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div className="st-spacer" />
              <button type="submit" className="st-btn" style={{ alignSelf: 'flex-end' }}>Filtrele</button>
            </div>
            <div className="st-bottom-row">
              <div className="st-search-wrap">
                <i className="fa-solid fa-magnifying-glass st-search-icon" />
                <input type="text" className="st-input st-search-input" placeholder="İsim, barkod veya firma ara..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button type="button" className="st-btn st-btn-ghost" onClick={handleTemizle}>Temizle</button>
            </div>
          </form>
        </div>

        {/* ── Hata ── */}
        {dbError && (
          <div className="st-error">
            <i className="fa-solid fa-triangle-exclamation" />
            Veritabanına bağlanılamadı. Lütfen daha sonra tekrar deneyin.
          </div>
        )}

        {/* ── Tablo ── */}
        {loading
          ? <div className="st-loading">Yükleniyor...</div>
          : (
            <div className="st-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Firma</th>
                    <th>Müşteri</th>
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
                        <td className="td-firma">{r.firma_ad}</td>
                        <td className="td-musteri">{r.musteri_ad || r.musteri_soyad ? `${r.musteri_ad || ''} ${r.musteri_soyad || ''}`.trim() : '—'}</td>
                        <td className="td-barkod">{r.barkod_no}</td>
                        <td className="td-fiyat">{r.urun_fiyat}</td>
                        <td><span className="td-birim">{r.para_birimi}</span></td>
                        <td className="td-tarih">{formatDate(r.satis_tarih)}</td>
                      </tr>
                    ))
                    : <tr><td colSpan={6} className="st-empty">Kayıt bulunamadı.</td></tr>
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
