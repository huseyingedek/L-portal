'use client';

import { useState } from 'react';

interface Expense {
  CLIENT: string; EXTINVTYPE: string; EXTINVNUM: string;
  GROSSAMOUNT: string; CURRENCY: string; DOCDATE: string;
  LTEXT: string; COSTX: string; STATUS: string; COMPANY: string;
}

export default function MasrafOnayClient() {
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const [filters, setFilters] = useState({ exp_comp: '', exp_date: todayISO, exp_typp: '', exp_stat: '0', exp_islemtp: '0' });
  const [expenses, setExpenses]   = useState<Expense[]>([]);
  const [loading, setLoading]     = useState(false);
  const [refuseModal, setRefuseModal] = useState<{ open: boolean; row?: Expense }>({ open: false });
  const [refuseReason, setRefuseReason] = useState('');

  async function search() {
    setLoading(true);
    const payload = { ...filters, exp_date: filters.exp_date.replace(/-/g, '/') };
    const res  = await fetch('/api/expenses/list', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    try {
      const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      const rows = Array.isArray(parsed) ? parsed : parsed?.Records?.ROW;
      setExpenses(Array.isArray(rows) ? rows : rows ? [rows] : []);
    } catch { setExpenses([]); }
    setLoading(false);
  }

  async function confirm(row: Expense) {
    await fetch('/api/expenses/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp: row.COMPANY, exptyp: row.EXTINVTYPE, expnum: row.EXTINVNUM }) });
    search();
  }

  async function refuse() {
    if (!refuseModal.row) return;
    await fetch('/api/expenses/refuse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp: refuseModal.row.COMPANY, exptyp: refuseModal.row.EXTINVTYPE, expnum: refuseModal.row.EXTINVNUM, reason: refuseReason }) });
    setRefuseModal({ open: false }); setRefuseReason(''); search();
  }

  const set = (k: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFilters(f => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <div className="df-page">
        {/* Filtre — responsive grid */}
        <div className="df-form-grid" style={{ marginBottom: 10 }}>
          <div className="df-field">
            <label className="df-field-lbl">Firma</label>
            <input className="df-inp" value={filters.exp_comp} onChange={set('exp_comp')} />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Tarih</label>
            <input className="df-inp" type="date" value={filters.exp_date} onChange={set('exp_date')} />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Masraf Tipi</label>
            <input className="df-inp" value={filters.exp_typp} onChange={set('exp_typp')} />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Statü</label>
            <select className="df-inp" value={filters.exp_stat} onChange={set('exp_stat')}>
              <option value="0">Onaysız</option><option value="2">Onaylı</option>
              <option value="1">Red</option><option value="3">Tümü</option>
            </select>
          </div>
          <div className="df-field">
            <label className="df-field-lbl">İşlem Tipi</label>
            <select className="df-inp" value={filters.exp_islemtp} onChange={set('exp_islemtp')}>
              <option value="0">Hepsi</option><option value="2">Fatura</option><option value="1">Fiş</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <button className="df-btn-ara" onClick={search} style={{ width: 'auto', minWidth: 80 }}>
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
        </div>

        {/* Sonuç tablosu */}
        <div className="df-table-wrap">
          <table className="df-data-table">
            <thead>
              <tr>
                <th>Mağaza</th><th>Fat.Seri</th><th>Fat.No</th><th>Tutar</th>
                <th>P.Birimi</th><th>Tarih</th><th>Açıklama</th><th>Gider Açk.</th>
                <th>Onay</th><th>Red</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((row, i) => (
                <tr key={i}>
                  <td>{row.CLIENT}</td><td>{row.EXTINVTYPE}</td><td>{row.EXTINVNUM}</td>
                  <td>{row.GROSSAMOUNT}</td><td>{row.CURRENCY}</td><td>{row.DOCDATE}</td>
                  <td>{row.LTEXT}</td><td>{row.COSTX}</td>
                  <td>
                    {row.STATUS === '2' ? <span className="df-badge-onay">Onaylı</span>
                      : row.STATUS === '0' ? <button className="df-btn-onay" onClick={() => confirm(row)}>Onay</button>
                      : null}
                  </td>
                  <td>
                    {row.STATUS === '1' ? <span className="df-badge-red">Red</span>
                      : row.STATUS === '0' ? <button className="df-btn-red" onClick={() => setRefuseModal({ open: true, row })}>Red</button>
                      : null}
                  </td>
                </tr>
              ))}
              {!expenses.length && !loading && <tr><td colSpan={10} style={{ textAlign: 'center', padding: 20 }}>Arama yapın</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Red Modal */}
      {refuseModal.open && (
        <div className="df-modal-overlay">
          <div className="df-modal-box">
            <h5>Red Sebep Girişi</h5>
            <p>Lütfen Red Sebebini Giriniz.</p>
            <textarea className="df-inp" rows={4} value={refuseReason} onChange={e => setRefuseReason(e.target.value)} />
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button className="df-btn-red" onClick={refuse}>Kaydet</button>
              <button className="df-btn-kapat" onClick={() => setRefuseModal({ open: false })}>İptal</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
