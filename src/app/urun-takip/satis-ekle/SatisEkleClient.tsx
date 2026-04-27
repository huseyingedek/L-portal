'use client';

import { useState } from 'react';
import UrunTakipLayout from '../_components/UrunTakipLayout';

const GOLD = '#F7CA18';

export default function SatisEkleClient({ firmaAd }: { firmaAd: string }) {
  const [satisTarih, setSatisTarih]     = useState('');
  const [barkodNo, setBarkodNo]         = useState('');
  const [fiyatDisplay, setFiyatDisplay] = useState('');
  const [paraBirimi, setParaBirimi]     = useState('TRY');
  const [musteriAd, setMusteriAd]       = useState('');
  const [musteriSoyad, setMusteriSoyad] = useState('');
  const [loading, setLoading]           = useState(false);

  function handleFiyatChange(val: string) {
    // Sadece rakam ve virgül kabul et
    const onlyNums = val.replace(/[^0-9,]/g, '');
    const parts = onlyNums.split(',');
    const intPart = parts[0].replace(/\./g, '');
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    setFiyatDisplay(parts.length > 1 ? `${formatted},${parts[1].slice(0, 2)}` : formatted);
  }

  function fiyatToNumber(): string {
    // 1.200,50 → 1200.50 (API için)
    return fiyatDisplay.replace(/\./g, '').replace(',', '.');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/urun-takip/satis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barkod_no: barkodNo,
          urun_fiyat: fiyatToNumber(),
          para_birimi: paraBirimi,
          satis_tarih: satisTarih,
          musteri_ad: musteriAd,
          musteri_soyad: musteriSoyad,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Başarıyla eklendi!');
        setSatisTarih(''); setBarkodNo(''); setFiyatDisplay(''); setParaBirimi('TRY');
        setMusteriAd(''); setMusteriSoyad('');
      } else {
        alert(data.error || 'Hata oluştu.');
      }
    } catch {
      alert('Bağlantı hatası, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <UrunTakipLayout firmaAd={firmaAd} activeHref="/urun-takip/satis-ekle">
      <style>{`
        .se-wrap {
          padding: 24px 16px;
          max-width: 480px;
          margin: 0 auto;
          width: 100%;
        }
        .se-title { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 22px; }
        .se-group { margin-bottom: 18px; }
        .se-label {
          display: block; font-size: 12px;
          color: rgba(255,255,255,0.45); margin-bottom: 7px;
          font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
          font-family: 'Dosis', sans-serif;
        }
        .se-input, .se-select {
          width: 100%; padding: 13px 14px;
          background: rgba(237,235,250,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px; color: #fff; font-size: 15px; outline: none;
          font-family: 'Dosis', sans-serif; transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .se-input:focus, .se-select:focus { border-color: ${GOLD}; background: rgba(247,202,24,0.04); }
        .se-input::placeholder { color: rgba(255,255,255,0.2); }
        .se-select option { background: #1c1e21; color: #fff; }
        .se-btn {
          margin-top: 10px; padding: 15px; width: 100%;
          border: 2px solid ${GOLD}; border-radius: 8px;
          background: transparent; color: ${GOLD}; font-size: 16px;
          font-family: 'Dosis', sans-serif; font-weight: 600;
          text-transform: uppercase; cursor: pointer;
          letter-spacing: 0.06em; transition: all 0.25s;
        }
        .se-btn:hover:not(:disabled) { background: ${GOLD}; color: #111; }
        .se-btn:disabled { border-color: #444; color: #444; cursor: not-allowed; }
        @media (max-width: 480px) {
          .se-input, .se-select { font-size: 16px; padding: 14px; }
        }
      `}</style>

      <div className="se-wrap">
        <div className="se-title">➕ Satış Ekle</div>
        <form onSubmit={handleSubmit}>
          <div className="se-group">
            <label className="se-label">Müşteri Adı</label>
            <input type="text" className="se-input" maxLength={30} value={musteriAd} onChange={e => setMusteriAd(e.target.value)} placeholder="Müşteri adı" autoComplete="off" required />
          </div>
          <div className="se-group">
            <label className="se-label">Müşteri Soyadı</label>
            <input type="text" className="se-input" maxLength={80} value={musteriSoyad} onChange={e => setMusteriSoyad(e.target.value)} placeholder="Müşteri soyadı" autoComplete="off" required />
          </div>
          <div className="se-group">
            <label className="se-label">Barkod Numarası</label>
            <input type="text" className="se-input" maxLength={8} value={barkodNo} onChange={e => setBarkodNo(e.target.value)} required placeholder="Barkod No" autoComplete="off" />
          </div>
          <div className="se-group">
            <label className="se-label">Tarih</label>
            <input type="date" className="se-input" value={satisTarih} onChange={e => setSatisTarih(e.target.value)} required />
          </div>
          <div className="se-group">
            <label className="se-label">Fiyat</label>
            <input type="text" inputMode="decimal" className="se-input" value={fiyatDisplay} onChange={e => handleFiyatChange(e.target.value)} required placeholder="0" autoComplete="off" />
          </div>
          <div className="se-group">
            <label className="se-label">Para Birimi</label>
            <select className="se-select" value={paraBirimi} onChange={e => setParaBirimi(e.target.value)}>
              <option value="TRY">(₺) Türk Lirası</option>
              <option value="USD">($) Dolar</option>
              <option value="EUR">(€) Euro</option>
              <option value="GBP">(£) Pound</option>
            </select>
          </div>
          <button type="submit" className="se-btn" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </div>
    </UrunTakipLayout>
  );
}
