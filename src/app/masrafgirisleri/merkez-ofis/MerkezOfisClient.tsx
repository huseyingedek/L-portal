'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function parseRows(raw: unknown): unknown[] {
  try {
    const str = typeof raw === 'string' ? raw : JSON.stringify(raw);
    const parsed = JSON.parse(str);
    if (parsed?.Records?.ROW) return Array.isArray(parsed.Records.ROW) ? parsed.Records.ROW : [parsed.Records.ROW];
    if (Array.isArray(parsed)) return parsed;
    if (parsed?.Record) return Array.isArray(parsed.Record) ? parsed.Record : [parsed.Record];
    const keys = Object.keys(parsed || {});
    if (keys.length > 0 && typeof parsed[keys[0]] === 'object') return Object.values(parsed);
    return [];
  } catch { return []; }
}

interface CostType { MASRAFTIP: string; STEXT: string; }
interface BusArea  { BUSAREA: string;   STEXT: string; }

const CURRENCIES = [
  { value: '0', label: 'TL' },
  { value: '1', label: 'DOLAR' },
  { value: '2', label: 'EURO' },
  { value: '3', label: 'HAS' },
  { value: '4', label: 'STERLİN' },
  { value: '5', label: 'İSVİÇRE FRANGI' },
];

export default function MerkezOfisClient() {
  const todayISO = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    InvoiceSharedNumb: '',
    InvoiceDate: todayISO,
    InvoiceQuine: '',
    InvoiceNumber: '',
    InvoiceAmount: '',
    exp_paratp: '0',
    CostType: '',
    Stext: '',
    ppaytype: 'Nakit',
    BusArea: '',
  });
  const [imageFile, setImageFile]         = useState<File | null>(null);
  const [costTypes, setCostTypes]         = useState<CostType[]>([]);
  const [busAreas, setBusAreas]           = useState<BusArea[]>([]);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showBusModal,  setShowBusModal]  = useState(false);
  const [message, setMessage]             = useState('');
  const [loading, setLoading]             = useState(false);
  const [costTypeName, setCostTypeName]   = useState('');
  const [busAreaName,  setBusAreaName]    = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const docn = params.get('docnumb') || '';
    if (docn) setForm(f => ({ ...f, InvoiceSharedNumb: docn }));
  }, []);

  async function loadCostTypes() {
    const res  = await fetch('/api/expenses/costtype', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp: '' }) });
    const data = await res.json();
    setCostTypes(parseRows(data.data) as CostType[]);
    setShowCostModal(true);
  }

  async function loadBusAreas() {
    const res  = await fetch('/api/expenses/busarea', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp: '' }) });
    const data = await res.json();
    setBusAreas(parseRows(data.data) as BusArea[]);
    setShowBusModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'InvoiceDate' && v) {
          const [y, m, d] = v.split('-');
          fd.append(k, `${y}/${parseInt(m)}/${parseInt(d)}`);
        } else { fd.append(k, v); }
      });
      if (imageFile) fd.append('InvoiceImage', imageFile);
      const res  = await fetch('/api/expenses/commit', { method: 'POST', body: fd });
      const data = await res.json();
      setMessage(data.success ? 'Kayıt işlemi tamamlanmıştır.' : data.error || 'Hata oluştu.');
    } catch {
      setMessage('Bağlantı hatası oluştu, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {message ? (
        <div className="df-success">
          <p>{message}</p>
          <Link href="/masrafgirisleri/merkez-ofis">Yeni Masraf Girişi</Link>
          <Link href="/dashboard">Ana Menü</Link>
        </div>
      ) : (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>Merkez Ofis Masraf Girişi</h1>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input type="hidden" name="InvoiceSharedNumb" value={form.InvoiceSharedNumb} />

            <div className="df-form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="df-field">
                <label className="df-field-lbl">Tarih</label>
                <input className="df-inp" type="date" value={form.InvoiceDate} onChange={e => setForm(f => ({ ...f, InvoiceDate: e.target.value }))} />
              </div>

              <div className="df-field">
                <label className="df-field-lbl">Fatura Serisi</label>
                <input className="df-inp" type="text" value={form.InvoiceQuine} onChange={e => setForm(f => ({ ...f, InvoiceQuine: e.target.value }))} />
              </div>

              <div className="df-field">
                <label className="df-field-lbl">İş Alanı</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="df-inp" type="text" value={form.BusArea} readOnly style={{ flex: 1, minWidth: 0, width: 'auto' }} />
                  <button type="button" className="df-btn-liste" onClick={loadBusAreas}>Liste</button>
                </div>
                {busAreaName && <span style={{ fontSize: 12, color: 'var(--accent)', marginTop: 3 }}>{busAreaName}</span>}
              </div>

              <div className="df-field">
                <label className="df-field-lbl">Fatura No</label>
                <input className="df-inp" type="text" value={form.InvoiceNumber} onChange={e => setForm(f => ({ ...f, InvoiceNumber: e.target.value }))} />
              </div>

              <div className="df-field">
                <label className="df-field-lbl">Fatura Tutarı</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="df-inp" type="text" value={form.InvoiceAmount}
                    onChange={e => setForm(f => ({ ...f, InvoiceAmount: e.target.value.replace(/[^0-9.]/g, '') }))}
                    onKeyDown={e => { const ok = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End','.']; if (!/[0-9]/.test(e.key) && !ok.includes(e.key)) e.preventDefault(); }}
                    style={{ flex: 1, minWidth: 0, width: 'auto' }} />
                  <select className="df-inp" value={form.exp_paratp} onChange={e => setForm(f => ({ ...f, exp_paratp: e.target.value }))}
                    style={{ width: 'auto', flexShrink: 0 }}>
                    {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="df-field">
                <label className="df-field-lbl">Masraf Tipi</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input className="df-inp" type="text" value={form.CostType} readOnly style={{ flex: 1, minWidth: 0, width: 'auto' }} />
                  <button type="button" className="df-btn-liste" onClick={loadCostTypes}>Liste</button>
                </div>
                {costTypeName && <span style={{ fontSize: 12, color: 'var(--accent)', marginTop: 3 }}>{costTypeName}</span>}
              </div>

              <div className="df-field">
                <label className="df-field-lbl">Ödeme Türü</label>
                <select className="df-inp" value={form.ppaytype} onChange={e => setForm(f => ({ ...f, ppaytype: e.target.value }))}>
                  <option value="Nakit">Nakit</option>
                  <option value="Kart">Kart</option>
                </select>
              </div>

              <div className="df-field">
                <label className="df-field-lbl">Açıklama</label>
                <textarea className="df-inp" value={form.Stext} onChange={e => setForm(f => ({ ...f, Stext: e.target.value }))} />
              </div>

              <div className="df-field">
                <label className="df-field-lbl">Fatura Resmi</label>
                <input className="df-inp" type="file" accept="image/*;capture=camera" onChange={e => setImageFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <button type="submit" className="df-btn-kaydet" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
        </div>
      )}

      {/* Masraf Tipi Modal */}
      {showCostModal && (
        <div className="df-modal-overlay" onClick={() => setShowCostModal(false)}>
          <div className="df-modal-box" onClick={e => e.stopPropagation()}>
            <h5>Masraf Tipi Seçim</h5>
            <table className="df-data-table">
              <thead><tr><th>Kod</th><th>Açıklama</th></tr></thead>
              <tbody>
                {costTypes.length > 0 ? costTypes.map((ct, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={() => { setForm(f => ({ ...f, CostType: ct.MASRAFTIP })); setCostTypeName(ct.STEXT); setShowCostModal(false); }}>
                    <td>{ct.MASRAFTIP}</td><td>{ct.STEXT}</td>
                  </tr>
                )) : <tr><td colSpan={2}>Veri bulunamadı.</td></tr>}
              </tbody>
            </table>
            <button className="df-btn-kapat" onClick={() => setShowCostModal(false)}>Kapat</button>
          </div>
        </div>
      )}

      {/* İş Alanı Modal */}
      {showBusModal && (
        <div className="df-modal-overlay" onClick={() => setShowBusModal(false)}>
          <div className="df-modal-box" onClick={e => e.stopPropagation()}>
            <h5>İş Alanı Seçim</h5>
            <table className="df-data-table">
              <thead><tr><th>İA</th><th>Açıklama</th></tr></thead>
              <tbody>
                {busAreas.length > 0 ? busAreas.map((ba, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={() => { setForm(f => ({ ...f, BusArea: ba.BUSAREA })); setBusAreaName(ba.STEXT); setShowBusModal(false); }}>
                    <td>{ba.BUSAREA}</td><td>{ba.STEXT}</td>
                  </tr>
                )) : <tr><td colSpan={2}>Veri bulunamadı.</td></tr>}
              </tbody>
            </table>
            <button className="df-btn-kapat" onClick={() => setShowBusModal(false)}>Kapat</button>
          </div>
        </div>
      )}
    </>
  );
}
