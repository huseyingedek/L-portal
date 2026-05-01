'use client';
import { useState } from 'react';

type Sonuc = {
  barkod: string;
  durum: 'basarili' | 'hata' | 'bekliyor';
  sure?: number;
  urunadi?: string;
  sonfiyat?: string;
  doviz?: string;
  model?: string;
  hata?: string;
};

export default function BarkodTestPage() {
  const [input, setInput]         = useState('');
  const [sonuclar, setSonuclar]   = useState<Sonuc[]>([]);
  const [calisıyor, setCalisıyor] = useState(false);
  const [ilerleme, setIlerleme]   = useState('');
  const [toplamSure, setToplamSure] = useState<number | null>(null);

  async function calistir() {
    const barkodlar = input
      .split(/[\n,;\s]+/)
      .map(b => b.trim().toUpperCase())
      .filter(b => b.length > 0);

    if (barkodlar.length === 0) return;

    setCalisıyor(true);
    setToplamSure(null);
    setSonuclar(barkodlar.map(b => ({ barkod: b, durum: 'bekliyor' })));
    const genelBaslangic = Date.now();

    for (let i = 0; i < barkodlar.length; i++) {
      const barkod = barkodlar[i];
      setIlerleme(`${i + 1} / ${barkodlar.length}`);

      const baslangic = Date.now();

      try {
        const res = await fetch('/api/fiyatgor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barkod_kodu: barkod, magaza_stok: '0' }),
        });

        const sure = ((Date.now() - baslangic) / 1000).toFixed(2);

        if (!res.ok) {
          setSonuclar(prev => prev.map(s =>
            s.barkod === barkod ? { ...s, durum: 'hata', sure: Number(sure), hata: `HTTP ${res.status}` } : s
          ));
          continue;
        }

        const data = await res.json();
        if (data.error) {
          setSonuclar(prev => prev.map(s =>
            s.barkod === barkod ? { ...s, durum: 'hata', sure: Number(sure), hata: data.error } : s
          ));
          continue;
        }

        const keys = Object.keys(data);
        const row  = keys.length > 0 ? data[keys[0]] : null;

        setSonuclar(prev => prev.map(s =>
          s.barkod === barkod ? {
            ...s,
            durum:    'basarili',
            sure:     Number(sure),
            urunadi:  row?.URUNADI        || '-',
            sonfiyat: row?.SONFIYAT       || '-',
            doviz:    row?.SPRICECURRENCY || '',
            model:    row?.MODEL          || '-',
          } : s
        ));
      } catch {
        const sure = ((Date.now() - baslangic) / 1000).toFixed(2);
        setSonuclar(prev => prev.map(s =>
          s.barkod === barkod ? { ...s, durum: 'hata', sure: Number(sure), hata: 'Bağlantı hatası' } : s
        ));
      }
    }

    setToplamSure(Number(((Date.now() - genelBaslangic) / 1000).toFixed(2)));
    setCalisıyor(false);
    setIlerleme('');
  }

  const basarili  = sonuclar.filter(s => s.durum === 'basarili').length;
  const hatali    = sonuclar.filter(s => s.durum === 'hata').length;
  const sureler   = sonuclar.filter(s => s.sure !== undefined).map(s => s.sure!);
  const ortSure   = sureler.length ? (sureler.reduce((a, b) => a + b, 0) / sureler.length).toFixed(2) : null;
  const maxSure   = sureler.length ? Math.max(...sureler).toFixed(2) : null;

  return (
    <div style={{ fontFamily: 'monospace', padding: 32, maxWidth: 960, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 16 }}>Barkod Toplu Test</h2>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={'Her satıra bir barkod\n1234567890\n9876543210\n...'}
        rows={10}
        style={{
          width: '100%', padding: 10, fontSize: 14,
          fontFamily: 'monospace', boxSizing: 'border-box',
          border: '1px solid #ccc', borderRadius: 4,
        }}
      />

      <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={calistir}
          disabled={calisıyor || !input.trim()}
          style={{
            padding: '8px 24px', fontSize: 14, cursor: 'pointer',
            background: calisıyor ? '#999' : '#1a1a2e', color: '#fff',
            border: 'none', borderRadius: 4,
          }}
        >
          {calisıyor ? `Çalışıyor... (${ilerleme})` : 'Tümünü Test Et'}
        </button>

        {sonuclar.length > 0 && !calisıyor && (
          <span style={{ fontSize: 13, color: '#444' }}>
            <span style={{ color: 'green' }}>✓ {basarili} başarılı</span>
            {hatali > 0 && <span style={{ color: 'red' }}>&nbsp; ✗ {hatali} hata</span>}
            {ortSure && <span style={{ color: '#555' }}>&nbsp;|&nbsp; ort: {ortSure}s &nbsp; maks: {maxSure}s</span>}
            {toplamSure !== null && <span style={{ color: '#1a1a2e', fontWeight: 600 }}>&nbsp;|&nbsp; toplam: {toplamSure}s</span>}
          </span>
        )}
      </div>

      {sonuclar.length > 0 && (
        <table style={{ marginTop: 24, width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={th}>#</th>
              <th style={th}>Barkod</th>
              <th style={th}>Süre</th>
              <th style={th}>Durum</th>
              <th style={th}>Ürün Adı</th>
              <th style={th}>Model</th>
              <th style={th}>Fiyat</th>
            </tr>
          </thead>
          <tbody>
            {sonuclar.map((s, i) => (
              <tr key={s.barkod} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={td}>{i + 1}</td>
                <td style={td}>{s.barkod}</td>
                <td style={{ ...td, color: s.sure !== undefined ? (s.sure > 5 ? 'red' : s.sure > 2 ? 'orange' : 'green') : '#999' }}>
                  {s.sure !== undefined ? `${s.sure}s` : '...'}
                </td>
                <td style={td}>
                  {s.durum === 'bekliyor' && <span style={{ color: '#999' }}>⏳</span>}
                  {s.durum === 'basarili' && <span style={{ color: 'green' }}>✓</span>}
                  {s.durum === 'hata'     && <span style={{ color: 'red' }}>✗ {s.hata}</span>}
                </td>
                <td style={td}>{s.urunadi  || '-'}</td>
                <td style={td}>{s.model    || '-'}</td>
                <td style={td}>{s.sonfiyat ? `${s.sonfiyat} ${s.doviz}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  padding: '8px 12px', textAlign: 'left',
  borderBottom: '2px solid #ddd', fontWeight: 600,
};

const td: React.CSSProperties = {
  padding: '6px 12px', borderBottom: '1px solid #eee',
};
