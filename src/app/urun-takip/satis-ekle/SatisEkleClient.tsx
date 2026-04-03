'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SatisEkleClient({ firmaAd }: { firmaAd: string }) {
  const [satisTarih, setSatisTarih]   = useState('');
  const [barkodNo, setBarkodNo]       = useState('');
  const [urunFiyat, setUrunFiyat]     = useState('');
  const [paraBirimi, setParaBirimi]   = useState('TRY');
  const [loading, setLoading]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/urun-takip/satis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barkod_no: barkodNo, urun_fiyat: urunFiyat, para_birimi: paraBirimi, satis_tarih: satisTarih }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      alert('Başarıyla eklendi! Ekleme sayfasına geri yönlendiriliyorsunuz.');
      setSatisTarih('');
      setBarkodNo('');
      setUrunFiyat('');
      setParaBirimi('TRY');
    } else {
      alert(data.error || 'Hata oluştu.');
    }
  }

  return (
    <>
      <style>{`
        body { font-family: sans-serif; }
        .navbar { background-color: #343A40; color: white; padding: 10px 0; }
        .container { max-width: 800px; margin: 0 auto; padding: 0 15px; }
        .d-flex { display: flex; }
        .justify-content-between { justify-content: space-between; }
        .form-group { margin-bottom: 14px; }
        .form-group label { font-weight: bold; display: block; margin-bottom: 4px; font-size: 14px; }
        .form-control { width: 100%; padding: 8px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
        .btn-primary { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 15px; cursor: pointer; }
        .btn-primary:disabled { background: #aaa; }
        a { color: white; text-decoration: none; font-weight: bold; }
        h2 { margin: 16px 0 8px; }
        hr { margin: 8px 0 16px; }
      `}</style>

      <header>
        <div className="navbar">
          <div className="container d-flex justify-content-between">
            <Link href="/urun-takip/panel">
              <strong style={{ color: 'white' }}>Geri Dön</strong>
            </Link>
            <strong>Lizay Pırlanta Satış Ekleme Sayfası - {firmaAd}</strong>
          </div>
        </div>
      </header>

      <div className="container">
        <h2>Lizay Pırlanta</h2>
        <hr />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="satis_tarih">Tarih:</label>
            <input
              type="date"
              className="form-control"
              id="satis_tarih"
              value={satisTarih}
              onChange={e => setSatisTarih(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="barkod_no">Barkod Numarası:</label>
            <input
              type="text"
              className="form-control"
              id="barkod_no"
              maxLength={8}
              value={barkodNo}
              onChange={e => setBarkodNo(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="urun_fiyat">Fiyat:</label>
            <input
              type="number"
              className="form-control"
              id="urun_fiyat"
              value={urunFiyat}
              onChange={e => setUrunFiyat(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="para_birimi">Para Birimi:</label>
            <select
              className="form-control"
              id="para_birimi"
              value={paraBirimi}
              onChange={e => setParaBirimi(e.target.value)}
            >
              <option value="TRY">(₺) Türk Lirası</option>
              <option value="USD">($) Dolar</option>
              <option value="EUR">(€) Euro</option>
              <option value="GBP">(£) Pound</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Yükleniyor...' : 'Yükle'}
          </button>
        </form>
      </div>
    </>
  );
}
