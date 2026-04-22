'use client';

import { useState } from 'react';

/* ─── Örnek veri ─── */
interface BARow {
  tarih:     string;
  belgeNo:   string;
  belgeTipi: 'Fatura' | 'Sipariş' | 'Dekont';
  aciklama:  string;
  borc:      number;
  alacak:    number;
  bakiye:    number;
}

const MOCK_DATA: BARow[] = [
  { tarih: '2026-04-01', belgeNo: 'FTR-2026-001', belgeTipi: 'Fatura',  aciklama: 'Nisan ayı ürün satışı',        borc: 45200.00, alacak: 0,         bakiye: 45200.00 },
  { tarih: '2026-04-03', belgeNo: 'DKT-2026-012', belgeTipi: 'Dekont',  aciklama: 'Banka havalesi — ödeme',       borc: 0,        alacak: 20000.00,  bakiye: 25200.00 },
  { tarih: '2026-04-05', belgeNo: 'SIP-2026-034', belgeTipi: 'Sipariş', aciklama: 'Yüzük koleksiyonu siparişi',   borc: 18750.00, alacak: 0,         bakiye: 43950.00 },
  { tarih: '2026-04-07', belgeNo: 'FTR-2026-002', belgeTipi: 'Fatura',  aciklama: 'Bilezik — 22 Ayar',            borc: 32100.00, alacak: 0,         bakiye: 76050.00 },
  { tarih: '2026-04-09', belgeNo: 'DKT-2026-013', belgeTipi: 'Dekont',  aciklama: 'Kısmi ödeme tahsilatı',        borc: 0,        alacak: 40000.00,  bakiye: 36050.00 },
  { tarih: '2026-04-10', belgeNo: 'SIP-2026-035', belgeTipi: 'Sipariş', aciklama: 'Pırlanta yüzük siparişi',      borc: 67500.00, alacak: 0,         bakiye: 103550.00 },
  { tarih: '2026-04-12', belgeNo: 'FTR-2026-003', belgeTipi: 'Fatura',  aciklama: 'Küpe seti — Roza serisi',      borc: 9800.00,  alacak: 0,         bakiye: 113350.00 },
  { tarih: '2026-04-14', belgeNo: 'DKT-2026-014', belgeTipi: 'Dekont',  aciklama: 'Ödeme — EFT',                  borc: 0,        alacak: 50000.00,  bakiye: 63350.00 },
  { tarih: '2026-04-15', belgeNo: 'SIP-2026-036', belgeTipi: 'Sipariş', aciklama: 'Kolye — Altın zincirleme',     borc: 15400.00, alacak: 0,         bakiye: 78750.00 },
  { tarih: '2026-04-17', belgeNo: 'FTR-2026-004', belgeTipi: 'Fatura',  aciklama: 'Nisan 2. parti ürün faturas',  borc: 28900.00, alacak: 0,         bakiye: 107650.00 },
];

/* ─── Belge içerikleri (mock) ─── */
const MOCK_BELGELER: Record<string, string> = {
  'FTR-2026-001': `
    <div style="font-family:sans-serif;color:#111;padding:0">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
        <div>
          <div style="font-size:22px;font-weight:800;color:#d63050">LİZAY PIRLANTA</div>
          <div style="font-size:12px;color:#666;margin-top:4px">Bağcılar Mah. Kuyumcular Çarşısı No:12<br/>İstanbul / Türkiye</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:700;color:#333">FATURA</div>
          <div style="font-size:13px;color:#666;margin-top:4px">No: FTR-2026-001</div>
          <div style="font-size:13px;color:#666">Tarih: 01.04.2026</div>
        </div>
      </div>
      <hr style="border:none;border-top:2px solid #d63050;margin-bottom:20px"/>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <thead>
          <tr style="background:#d63050;color:#fff">
            <th style="padding:10px 12px;text-align:left;font-size:12px">Ürün Açıklaması</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px">Miktar</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px">Birim Fiyat</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px">Tutar</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:10px 12px;font-size:13px">Altın Yüzük — Roza Serisi 18K</td>
            <td style="padding:10px 12px;text-align:center;font-size:13px">3</td>
            <td style="padding:10px 12px;text-align:right;font-size:13px">8.500,00 ₺</td>
            <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:600">25.500,00 ₺</td>
          </tr>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:10px 12px;font-size:13px">Pırlanta Taşlı Kolye</td>
            <td style="padding:10px 12px;text-align:center;font-size:13px">2</td>
            <td style="padding:10px 12px;text-align:right;font-size:13px">9.850,00 ₺</td>
            <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:600">19.700,00 ₺</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background:#f9f9f9">
            <td colspan="3" style="padding:10px 12px;text-align:right;font-size:13px;font-weight:700">Toplam (KDV Dahil)</td>
            <td style="padding:10px 12px;text-align:right;font-size:15px;font-weight:800;color:#d63050">45.200,00 ₺</td>
          </tr>
        </tfoot>
      </table>
      <div style="font-size:11px;color:#999;margin-top:16px">Ödeme Vadesi: 30 gün • IBAN: TR00 0000 0000 0000 0000 0000 00</div>
    </div>`,

  'DKT-2026-012': `
    <div style="font-family:sans-serif;color:#111;padding:0">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
        <div>
          <div style="font-size:22px;font-weight:800;color:#10b981">DEKONT</div>
          <div style="font-size:13px;color:#666;margin-top:4px">Ödeme Dekontu</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:13px;color:#666">No: DKT-2026-012</div>
          <div style="font-size:13px;color:#666">Tarih: 03.04.2026</div>
        </div>
      </div>
      <hr style="border:none;border-top:2px solid #10b981;margin-bottom:20px"/>
      <table style="width:100%;border-collapse:collapse">
        <tr style="border-bottom:1px solid #eee"><td style="padding:10px;font-weight:600;font-size:13px;width:180px">İşlem Türü</td><td style="padding:10px;font-size:13px">Banka Havalesi (EFT)</td></tr>
        <tr style="border-bottom:1px solid #eee"><td style="padding:10px;font-weight:600;font-size:13px">Gönderen</td><td style="padding:10px;font-size:13px">Mağaza Cari Hesabı</td></tr>
        <tr style="border-bottom:1px solid #eee"><td style="padding:10px;font-weight:600;font-size:13px">Alıcı</td><td style="padding:10px;font-size:13px">Lizay Pırlanta A.Ş.</td></tr>
        <tr style="border-bottom:1px solid #eee"><td style="padding:10px;font-weight:600;font-size:13px">Açıklama</td><td style="padding:10px;font-size:13px">Nisan ayı ödeme 1. taksit</td></tr>
        <tr style="background:#f0fdf4"><td style="padding:12px;font-weight:700;font-size:14px">Ödenen Tutar</td><td style="padding:12px;font-size:18px;font-weight:800;color:#10b981">20.000,00 ₺</td></tr>
      </table>
    </div>`,

  'SIP-2026-034': `
    <div style="font-family:sans-serif;color:#111;padding:0">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
        <div>
          <div style="font-size:22px;font-weight:800;color:#3b82f6">SİPARİŞ</div>
          <div style="font-size:13px;color:#666;margin-top:4px">Satış Siparişi</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:13px;color:#666">No: SIP-2026-034</div>
          <div style="font-size:13px;color:#666">Tarih: 05.04.2026</div>
          <div style="margin-top:6px;background:#dbeafe;color:#1d4ed8;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;display:inline-block">ONAYLANDI</div>
        </div>
      </div>
      <hr style="border:none;border-top:2px solid #3b82f6;margin-bottom:20px"/>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <thead>
          <tr style="background:#3b82f6;color:#fff">
            <th style="padding:10px 12px;text-align:left;font-size:12px">Ürün</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px">Adet</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px">Birim Fiyat</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px">Toplam</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:10px 12px;font-size:13px">Yüzük Koleksiyonu — Çeşitli (Lot)</td>
            <td style="padding:10px 12px;text-align:center;font-size:13px">1 Lot</td>
            <td style="padding:10px 12px;text-align:right;font-size:13px">18.750,00 ₺</td>
            <td style="padding:10px 12px;text-align:right;font-size:13px;font-weight:600">18.750,00 ₺</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background:#eff6ff">
            <td colspan="3" style="padding:10px 12px;text-align:right;font-weight:700;font-size:13px">Sipariş Tutarı</td>
            <td style="padding:10px 12px;text-align:right;font-size:15px;font-weight:800;color:#3b82f6">18.750,00 ₺</td>
          </tr>
        </tfoot>
      </table>
      <div style="font-size:11px;color:#999">Teslimat Tarihi: 10.04.2026 • Teslim Yeri: Merkez Depo</div>
    </div>`,
};

/* Belge bulunamayanlar için generic görünüm */
function genericBelge(row: BARow): string {
  const renk = row.belgeTipi === 'Fatura' ? '#d63050' : row.belgeTipi === 'Dekont' ? '#10b981' : '#3b82f6';
  const tutar = row.borc > 0
    ? `<tr style="background:#fef2f2"><td style="padding:12px;font-weight:700;font-size:14px">Borç Tutarı</td><td style="padding:12px;font-size:18px;font-weight:800;color:#d63050">${row.borc.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td></tr>`
    : `<tr style="background:#f0fdf4"><td style="padding:12px;font-weight:700;font-size:14px">Alacak Tutarı</td><td style="padding:12px;font-size:18px;font-weight:800;color:#10b981">${row.alacak.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td></tr>`;
  return `
    <div style="font-family:sans-serif;color:#111;padding:0">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
        <div style="font-size:22px;font-weight:800;color:${renk}">${row.belgeTipi.toUpperCase()}</div>
        <div style="text-align:right">
          <div style="font-size:13px;color:#666">No: ${row.belgeNo}</div>
          <div style="font-size:13px;color:#666">Tarih: ${row.tarih.split('-').reverse().join('.')}</div>
        </div>
      </div>
      <hr style="border:none;border-top:2px solid ${renk};margin-bottom:20px"/>
      <table style="width:100%;border-collapse:collapse">
        <tr style="border-bottom:1px solid #eee"><td style="padding:10px;font-weight:600;font-size:13px;width:160px">Belge No</td><td style="padding:10px;font-size:13px">${row.belgeNo}</td></tr>
        <tr style="border-bottom:1px solid #eee"><td style="padding:10px;font-weight:600;font-size:13px">Tarih</td><td style="padding:10px;font-size:13px">${row.tarih.split('-').reverse().join('.')}</td></tr>
        <tr style="border-bottom:1px solid #eee"><td style="padding:10px;font-weight:600;font-size:13px">Açıklama</td><td style="padding:10px;font-size:13px">${row.aciklama}</td></tr>
        ${tutar}
      </table>
    </div>`;
}

/* ─── Para formatı ─── */
const fmt = (n: number) =>
  n === 0 ? '' : n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── Belge tipi badge rengi ─── */
const tipRenk: Record<string, { bg: string; color: string }> = {
  Fatura:  { bg: 'rgba(214,48,80,0.12)',  color: '#d63050' },
  Sipariş: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
  Dekont:  { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
};

/* ─── Bileşen ─── */
export default function BorcAlacakClient() {
  const today       = new Date();
  const todayStr    = today.toISOString().split('T')[0];
  const firstOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

  const [dateStart, setDateStart] = useState(firstOfMonth);
  const [dateEnd,   setDateEnd]   = useState(todayStr);
  const [rows, setRows]           = useState<BARow[]>([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);

  const [belgeModal, setBelgeModal] = useState<{
    open: boolean; row: BARow | null;
  }>({ open: false, row: null });

  function search() {
    setLoading(true);
    // Tarih aralığına göre mock veriyi filtrele
    setTimeout(() => {
      const filtered = MOCK_DATA.filter(r => r.tarih >= dateStart && r.tarih <= dateEnd);
      setRows(filtered);
      setLoading(false);
      setSearched(true);
    }, 400);
  }

  // Toplamlar
  const toplamBorc   = rows.reduce((s, r) => s + r.borc, 0);
  const toplamAlacak = rows.reduce((s, r) => s + r.alacak, 0);
  const netBakiye    = rows.length > 0 ? rows[rows.length - 1].bakiye : 0;

  return (
    <div className="df-page" style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #d63050, #a82040)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(214,48,80,0.4)',
        }}>
          <i className="fa-solid fa-scale-balanced" style={{ color: '#fff', fontSize: 16 }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Borç / Alacak Takibi
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Cari hesap ekstresi — tarih aralığına göre listele, belgeni görüntüle
          </p>
        </div>
      </div>

      {/* Filtre */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '16px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 14,
        flexWrap: 'wrap',
      }}>
        <div className="df-field" style={{ minWidth: 160 }}>
          <label className="df-field-lbl">Başlangıç Tarihi</label>
          <input className="df-inp" type="date" value={dateStart}
            onChange={e => setDateStart(e.target.value)} />
        </div>
        <div className="df-field" style={{ minWidth: 160 }}>
          <label className="df-field-lbl">Bitiş Tarihi</label>
          <input className="df-inp" type="date" value={dateEnd}
            onChange={e => setDateEnd(e.target.value)} />
        </div>
        <button
          className="df-btn-ara"
          onClick={search}
          disabled={loading}
          style={{ width: 'auto', minWidth: 110, marginBottom: 0 }}
        >
          {loading
            ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />Yükleniyor</>
            : <><i className="fa-solid fa-magnifying-glass" style={{ marginRight: 6 }} />Listele</>
          }
        </button>
      </div>

      {/* Özet kartlar */}
      {searched && rows.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: 12, marginBottom: 18,
        }}>
          {[
            { label: 'Toplam Borç',   value: toplamBorc,          color: '#ef4444', icon: 'fa-solid fa-arrow-up-right-dots' },
            { label: 'Toplam Alacak', value: toplamAlacak,        color: '#10b981', icon: 'fa-solid fa-arrow-down-right-dots' },
            { label: 'Net Bakiye',    value: Math.abs(netBakiye), color: netBakiye > 0 ? '#ef4444' : '#10b981', icon: 'fa-solid fa-scale-balanced',
              alt: netBakiye > 0 ? 'Borçlu' : 'Alacaklı' },
          ].map(c => (
            <div key={c.label} style={{
              background: 'var(--surface)', border: `1px solid ${c.color}28`,
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: c.color + '1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className={c.icon} style={{ color: c.color, fontSize: 14 }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: c.color, marginTop: 2 }}>
                  {c.value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </div>
                {c.alt && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{c.alt}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tablo */}
      {searched && (
        rows.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
            color: 'var(--text-muted)',
          }}>
            <i className="fa-solid fa-inbox" style={{ fontSize: 28, display: 'block', marginBottom: 10, opacity: 0.3 }} />
            Seçilen tarih aralığında kayıt bulunamadı.
          </div>
        ) : (
          <div className="df-table-wrap">
            <table className="df-data-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Belge Tipi</th>
                  <th>Belge No</th>
                  <th>Açıklama</th>
                  <th style={{ textAlign: 'right' }}>Borç (₺)</th>
                  <th style={{ textAlign: 'right' }}>Alacak (₺)</th>
                  <th style={{ textAlign: 'right' }}>Bakiye (₺)</th>
                  <th style={{ textAlign: 'center' }}>Belge</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const tr = tipRenk[row.belgeTipi] ?? tipRenk.Fatura;
                  const bakiyeArtida = row.bakiye > 0;
                  return (
                    <tr key={i}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {row.tarih.split('-').reverse().join('.')}
                      </td>
                      <td>
                        <span style={{
                          background: tr.bg, color: tr.color,
                          padding: '2px 8px', borderRadius: 5,
                          fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
                          whiteSpace: 'nowrap',
                        }}>
                          {row.belgeTipi}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {row.belgeNo}
                      </td>
                      <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={row.aciklama}>
                        {row.aciklama}
                      </td>
                      <td style={{
                        textAlign: 'right', whiteSpace: 'nowrap',
                        fontWeight: row.borc > 0 ? 700 : 400,
                        color: row.borc > 0 ? '#ef4444' : 'var(--text-muted)',
                      }}>
                        {fmt(row.borc)}
                      </td>
                      <td style={{
                        textAlign: 'right', whiteSpace: 'nowrap',
                        fontWeight: row.alacak > 0 ? 700 : 400,
                        color: row.alacak > 0 ? '#10b981' : 'var(--text-muted)',
                      }}>
                        {fmt(row.alacak)}
                      </td>
                      <td style={{
                        textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 700,
                        color: bakiyeArtida ? '#ef4444' : '#10b981',
                      }}>
                        {row.bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setBelgeModal({ open: true, row })}
                          style={{
                            background: 'rgba(59,130,246,0.1)',
                            border: '1px solid rgba(59,130,246,0.28)',
                            color: '#60a5fa',
                            borderRadius: 7,
                            padding: '4px 11px',
                            fontSize: 11.5, fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            whiteSpace: 'nowrap',
                            transition: 'all 0.13s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(59,130,246,0.22)';
                            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.28)';
                          }}
                        >
                          <i className="fa-solid fa-file-lines" style={{ fontSize: 11 }} />
                          Göster
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {!searched && !loading && (
        <div style={{
          textAlign: 'center', padding: '52px 20px',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          color: 'var(--text-muted)',
        }}>
          <i className="fa-solid fa-scale-balanced" style={{ fontSize: 34, display: 'block', marginBottom: 12, opacity: 0.22 }} />
          <p style={{ margin: 0, fontSize: 13 }}>Tarih aralığı seçip <strong style={{ color: 'var(--text-dim)' }}>Listele</strong> butonuna tıklayın.</p>
        </div>
      )}

      {/* ─── Belge Modal ─── */}
      {belgeModal.open && belgeModal.row && (() => {
        const row = belgeModal.row;
        const html = MOCK_BELGELER[row.belgeNo] ?? genericBelge(row);
        const tr = tipRenk[row.belgeTipi] ?? tipRenk.Fatura;
        return (
          <div
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(5px)',
              zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20,
            }}
            onClick={e => { if (e.target === e.currentTarget) setBelgeModal({ open: false, row: null }); }}
          >
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              width: '100%', maxWidth: 720,
              maxHeight: '88vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 28px 90px rgba(0,0,0,0.65)',
            }}>
              {/* Modal başlık */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: tr.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="fa-solid fa-file-lines" style={{ color: tr.color, fontSize: 13 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
                      {row.belgeTipi} — {row.belgeNo}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {row.tarih.split('-').reverse().join('.')} · {row.aciklama}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setBelgeModal({ open: false, row: null })}
                  style={{
                    background: 'rgba(255,255,255,0.06)', border: 'none',
                    color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
                    width: 30, height: 30, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, transition: 'all 0.13s', flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              {/* Belge içeriği */}
              <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
                <div
                  style={{ background: '#fff', borderRadius: 10, padding: '24px 28px' }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
