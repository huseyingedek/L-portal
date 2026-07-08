'use client';

import { Fragment, useState } from 'react';

// CANIAS picture response can come as: flat array, Records.ROW, ROW at root, or multiple image fields
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPictureRows(parsed: any): any[] {
  if (!parsed) return [];
  if (Array.isArray(parsed)) return parsed;
  if (parsed?.Records?.ROW) {
    const r = parsed.Records.ROW;
    return Array.isArray(r) ? r : [r];
  }
  if (parsed?.ROW) {
    const r = parsed.ROW;
    return Array.isArray(r) ? r : [r];
  }
  return typeof parsed === 'object' ? [parsed] : [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRawImages(raw: any): string[] {
  if (raw == null) return [];
  if (typeof raw === 'string') return [raw];
  if (Array.isArray(raw)) return raw.flatMap(item => extractRawImages(item));
  if (typeof raw === 'object') {
    if ('$value' in raw && typeof raw.$value === 'string') return [raw.$value];
    return [];
  }
  return [];
}

// Ham base64'ü temiz data-URI'ye çevirir: tüm boşluk/satır sonu/PEM işaretlerini atar,
// içerik türünü (PNG/JPEG/GIF/WEBP/PDF) base64 imzasından tespit eder.
function toDataUri(raw: string): string {
  const b64 = String(raw ?? '').replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '');
  if (b64.length < 10) return '';
  let mime = 'image/png';
  if (b64.startsWith('/9j/')) mime = 'image/jpeg';
  else if (b64.startsWith('iVBORw0KGgo')) mime = 'image/png';
  else if (b64.startsWith('R0lGOD')) mime = 'image/gif';
  else if (b64.startsWith('UklGR')) mime = 'image/webp';
  else if (b64.startsWith('JVBER')) mime = 'application/pdf';
  return `data:${mime};base64,${b64}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPictureSrcs(parsed: any): string[] {
  const rows = extractPictureRows(parsed);
  return rows.flatMap(row => {
    const sources = [row?.PICTURE, row?.IMST, row?.IMSTBT, row?.IMGBASE64];
    return sources.flatMap(src => extractRawImages(src)).map(raw => toDataUri(raw)).filter(s => s.length > 0);
  });
}

interface SharedDoc {
  CLIENT: string; BELGETIP: string; SHAREDNUMB: string;
  DOCDATE: string; VENDOR: string; NAME1: string;
  NETAMOUNT: string; CURRENCY: string; STATUS: string; COMPANY: string;
}
interface InvDetail {
  CLIENT: string; EXTINVTYPE: string; EXTINVNUM: string;
  NETAMOUNT: string; DOCDATE: string; LTEXT: string; COSTX: string; COMPANY: string;
}

export default function FaturaOnayClient() {
  const _today = new Date();
  const _todayISO = `${_today.getFullYear()}-${String(_today.getMonth()+1).padStart(2,'0')}-${String(_today.getDate()).padStart(2,'0')}`;
  const [filters, setFilters] = useState({ exp_comp: '', exp_date: _todayISO, exp_docn: '', exp_stat: '0', exp_islemtp: '2' });
  const [docs, setDocs]         = useState<SharedDoc[]>([]);
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails]   = useState<Record<string, InvDetail[]>>({});
  const [refuseModal, setRefuseModal] = useState<{ open: boolean; doc?: SharedDoc }>({ open: false });
  const [refuseReason, setRefuseReason] = useState('');
  const [fisModal, setFisModal] = useState<{ open: boolean; imgSrcs?: string[]; activeIndex?: number; loading?: boolean }>({ open: false });

  async function search() {
    setLoading(true);
    const comp = filters.exp_comp.trim();
    const docn = filters.exp_docn.trim();
    // Firma veya Belge No girildiyse tarihi yok say (o belgeyi tüm tarihlerde ara).
    // Aksi hâlde girilen tarihte gün-gün ara. Tarih boşsa /NaN/NaN yerine '' gönder.
    let exp_date = '';
    if (!comp && !docn && filters.exp_date) {
      const [y, m, d] = filters.exp_date.split('-');
      exp_date = `${y}/${parseInt(m)}/${parseInt(d)}`;
    }
    const payload = { ...filters, exp_date };
    const res  = await fetch('/api/expenses/shareddoc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    try {
      const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      const rows = Array.isArray(parsed) ? parsed : (parsed?.Records?.ROW ?? parsed?.ROW);
      let list: SharedDoc[] = Array.isArray(rows) ? rows : rows ? [rows] : [];
      // Güvenlik ağı: Canias belge no / firma'yı sunucuda süzmezse istemcide süz.
      if (docn) list = list.filter(x => String(x.SHAREDNUMB ?? '').toLowerCase().includes(docn.toLowerCase()));
      if (comp) list = list.filter(x => String(x.COMPANY ?? '').includes(comp) || String(x.CLIENT ?? '').includes(comp));
      // Sadece tarihle arandıysa: Canias o tarih ve SONRASINI döndürüyor → istemcide tam güne indir.
      if (!comp && !docn && filters.exp_date) {
        const [yy, mm, dd] = filters.exp_date.split('-');
        const gun = `${dd}.${mm}.${yy}`;   // 30.06.2026
        list = list.filter(x => String(x.DOCDATE ?? '').trim().startsWith(gun));
      }
      setDocs(list);
    } catch { setDocs([]); }
    setLoading(false);
  }

  // Detail satirlari yukle (orijinal mantik — dokunulmadi)
  async function loadDetail(doc: SharedDoc) {
    const key = doc.SHAREDNUMB;
    if (expanded === key) { setExpanded(null); return; }
    setExpanded(key);
    if (details[key]) return;
    const res  = await fetch('/api/expenses/shareddoc-detail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp: filters.exp_comp || '%', bt: doc.BELGETIP, sh: doc.SHAREDNUMB }) });
    const data = await res.json();
    try {
      const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      const rows = Array.isArray(parsed) ? parsed : (parsed?.Records?.ROW ?? parsed?.ROW);
      setDetails(d => ({ ...d, [key]: Array.isArray(rows) ? rows : rows ? [rows] : [] }));
    } catch { setDetails(d => ({ ...d, [key]: [] })); }
  }

  async function confirmDoc(doc: SharedDoc) {
    await fetch('/api/expenses/confirm-ver', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp: doc.COMPANY, sharenumb: doc.SHAREDNUMB, belgetip: doc.BELGETIP }) });
    search();
  }

  async function refuseDoc() {
    if (!refuseModal.doc) return;
    await fetch('/api/expenses/refuse-sh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp: refuseModal.doc.COMPANY, sharenumb: refuseModal.doc.SHAREDNUMB, reason: refuseReason }) });
    setRefuseModal({ open: false }); setRefuseReason(''); search();
  }

  // FIX: ana satir Fis — once detail yukle, oradan EXTINVTYPE+EXTINVNUM al
  // (BELGETIP shareddoc listesinde gelmiyor, bu yuzden orijinal beltip:undefined bozuktu)
  async function showFisDoc(doc: SharedDoc) {
    setFisModal({ open: true, loading: true });
    // Detail zaten yukluyse kullan, yoksa cek
    let items = details[doc.SHAREDNUMB];
    if (!items) {
      const res = await fetch('/api/expenses/shareddoc-detail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp: filters.exp_comp || '%', bt: doc.BELGETIP, sh: doc.SHAREDNUMB }) });
      const data = await res.json();
      try {
        const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
        const rows = Array.isArray(parsed) ? parsed : (parsed?.Records?.ROW ?? parsed?.ROW);
        items = Array.isArray(rows) ? rows : rows ? [rows] : [];
        setDetails(d => ({ ...d, [doc.SHAREDNUMB]: items! }));
      } catch { items = []; }
    }
    if (!items.length) { setFisModal({ open: true, imgSrcs: [], activeIndex: 0, loading: false }); return; }
    const first = items[0];
    const res  = await fetch('/api/expenses/picture-ver', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp: doc.COMPANY, numm: first.EXTINVNUM, beltip: first.EXTINVTYPE }) });
    const data = await res.json();
    try {
      const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      const imgSrcs = getPictureSrcs(parsed);
      setFisModal({ open: true, imgSrcs, activeIndex: 0, loading: false });
    } catch { setFisModal({ open: true, imgSrcs: [], activeIndex: 0, loading: false }); }
  }

  // FIX: detail satir Fis — comp olarak parent doc.COMPANY kullan
  // (InvDetail icinde COMPANY gelmiyor, bu yuzden orijinal comp:'' bozuktu)
  async function showFisDetail(d: InvDetail, parentComp: string) {
    setFisModal({ open: true, loading: true });
    const res  = await fetch('/api/expenses/picture-ver', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comp: parentComp, numm: d.EXTINVNUM, beltip: d.EXTINVTYPE }) });
    const data = await res.json();
    try {
      const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      const imgSrcs = getPictureSrcs(parsed);
      setFisModal({ open: true, imgSrcs, activeIndex: 0, loading: false });
    } catch { setFisModal({ open: true, imgSrcs: [], activeIndex: 0, loading: false }); }
  }

  const set = (k: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFilters(f => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <div className="df-page">
        {/* Filtre */}
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
            <label className="df-field-lbl">Belge No</label>
            <input className="df-inp" value={filters.exp_docn} onChange={set('exp_docn')} />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Statu</label>
            <select className="df-inp" value={filters.exp_stat} onChange={set('exp_stat')}>
              <option value="0">Onaysiz</option><option value="2">Onayli</option>
              <option value="1">Red</option><option value="3">Tumu</option>
            </select>
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Islem Tipi</label>
            <select className="df-inp" value={filters.exp_islemtp} onChange={set('exp_islemtp')}>
              <option value="2">Fatura</option><option value="0">Hepsi</option><option value="1">Fis</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <button className="df-btn-ara" onClick={search} style={{ width: 'auto', minWidth: 80 }}>
            {loading ? 'Araniyor...' : 'Ara'}
          </button>
        </div>

        <div className="df-table-wrap">
          <table className="df-data-table">
            <thead>
              <tr>
                <th>Magaza</th><th>Belge Tip</th><th>Belge No</th>
                <th>Tarih</th><th>Musteri No</th><th>Tedarikci</th>
                <th>Tutar</th><th>Para Birimi</th><th>Fis</th><th>Onay</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => (
                <Fragment key={i}>
                  <tr>
                    <td>{doc.CLIENT}</td><td>{doc.BELGETIP}</td>
                    <td style={{ fontWeight: 600 }}>
                      <button
                        onClick={() => loadDetail(doc)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', marginRight: 6, fontSize: 13 }}
                        title="Detay"
                      >
                        <i className={`fas ${expanded === doc.SHAREDNUMB ? 'fa-chevron-down' : 'fa-list-ul'}`} />
                      </button>
                      {doc.SHAREDNUMB}
                    </td>
                    <td>{doc.DOCDATE}</td><td>{doc.VENDOR}</td><td>{doc.NAME1}</td>
                    <td>{doc.NETAMOUNT}</td><td>{doc.CURRENCY}</td>
                    <td><button className="df-btn-fis" onClick={() => showFisDoc(doc)}>Fis</button></td>
                    <td>
                      {doc.STATUS === '2' ? <span className="df-badge-onay">Onayli</span>
                        : doc.STATUS === '0' ? <button className="df-btn-onay" onClick={() => confirmDoc(doc)}>Onay</button>
                        : null}
                    </td>
                  </tr>
                  {expanded === doc.SHAREDNUMB && (
                    <tr>
                      <td colSpan={10} style={{ padding: 0 }}>
                        <table className="df-data-table df-child-table">
                          <thead>
                            <tr><th>Magaza</th><th>Fat.Seri</th><th>Fat.No</th><th>Tutar</th><th>Tarih</th><th>Aciklama</th><th>Gider Ack.</th><th>Fis</th></tr>
                          </thead>
                          <tbody>
                            {(details[doc.SHAREDNUMB] || []).map((d, j) => (
                              <tr key={j}>
                                <td>{d.CLIENT}</td><td>{d.EXTINVTYPE}</td><td>{d.EXTINVNUM}</td>
                                <td>{d.NETAMOUNT}</td><td>{d.DOCDATE}</td><td>{d.LTEXT}</td><td>{d.COSTX}</td>
                                <td><button className="df-btn-fis" onClick={() => showFisDetail(d, doc.COMPANY)}>Fis</button></td>
                              </tr>
                            ))}
                            {!(details[doc.SHAREDNUMB] || []).length && <tr><td colSpan={8} style={{ textAlign: 'center' }}>Kayit yok</td></tr>}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {!docs.length && !loading && <tr><td colSpan={10} style={{ textAlign: 'center', padding: 20 }}>Arama yapin</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {refuseModal.open && (
        <div className="df-modal-overlay">
          <div className="df-modal-box">
            <h5>Red Sebep Girisi</h5>
            <p>Lutfen Red Sebebini Giriniz.</p>
            <textarea className="df-inp" rows={4} value={refuseReason} onChange={e => setRefuseReason(e.target.value)} />
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button className="df-btn-red" onClick={refuseDoc}>Kaydet</button>
              <button className="df-btn-kapat" onClick={() => setRefuseModal({ open: false })}>Iptal</button>
            </div>
          </div>
        </div>
      )}

      {fisModal.open && (
        <div className="df-modal-overlay" onClick={() => setFisModal({ open: false })}>
          <div className="df-modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h5>Fis Goruntule</h5>
            {fisModal.loading ? <p>Yukleniyor...</p>
              : fisModal.imgSrcs && fisModal.imgSrcs.length > 0 ? (
                <>
                  {fisModal.imgSrcs[fisModal.activeIndex ?? 0]?.startsWith('data:application/pdf')
                    ? <iframe
                        key={fisModal.activeIndex ?? 0}
                        src={fisModal.imgSrcs[fisModal.activeIndex ?? 0]}
                        title="Fis"
                        style={{ width: '100%', height: 480, border: 'none', background: '#fff' }}
                      />
                    : <img
                        key={fisModal.activeIndex ?? 0}
                        src={fisModal.imgSrcs[fisModal.activeIndex ?? 0]}
                        alt={`Fis ${(fisModal.activeIndex ?? 0) + 1}`}
                        className="df-modal-img"
                        style={{ opacity: 0, transition: 'opacity 0.2s ease' }}
                        onLoad={e => { e.currentTarget.style.opacity = '1'; }}
                        onError={e => { e.currentTarget.style.opacity = '1'; }}
                      />}
                  {fisModal.imgSrcs.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      {fisModal.imgSrcs.map((_, index) => (
                        <button
                          key={index}
                          className={`df-btn-kapak ${index === fisModal.activeIndex ? 'active' : ''}`}
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => setFisModal(f => ({ ...f, activeIndex: index }))}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : <p>Gorsel bulunamadi.</p>}
            <button className="df-btn-kapat" onClick={() => setFisModal({ open: false })}>Kapat</button>
          </div>
        </div>
      )}
    </>
  );
}
