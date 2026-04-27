'use client';

import { useState } from 'react';

interface FormData {
  talep_tarihi: string;
  kisi_ad_soyad: string;
  kisi_tc: string;
  kisi_tel: string;
  kisi_birim: string;
  kisi_giris: string;
  kisi_izin_baslangic: string;
  kisi_izin_bitis: string;
  kisi_izin_yeri: string;
}

const FIELDS: { key: keyof FormData; label: string; type: string; required?: boolean }[] = [
  { key: 'talep_tarihi',        label: 'İzin Talep Tarihi',            type: 'date',   required: true },
  { key: 'kisi_ad_soyad',       label: 'Ad Soyad',                     type: 'text',   required: true },
  { key: 'kisi_tc',             label: 'TC No',                         type: 'number', required: true },
  { key: 'kisi_tel',            label: 'Tel No',                        type: 'number' },
  { key: 'kisi_birim',          label: 'Görev Departmanı',              type: 'text',   required: true },
  { key: 'kisi_giris',          label: 'İşe Giriş Tarihi',              type: 'date' },
  { key: 'kisi_izin_baslangic', label: 'İzin Başlangıç Tarihi',         type: 'date',   required: true },
  { key: 'kisi_izin_bitis',     label: 'İzin Bitiş (İşe Dönüş) Tarihi',type: 'date',   required: true },
  { key: 'kisi_izin_yeri',      label: 'İzinde Bulunacağı Yer',         type: 'text' },
];

export default function IzinFormuClient() {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<FormData>({
    talep_tarihi: today, kisi_ad_soyad: '', kisi_tc: '', kisi_tel: '',
    kisi_birim: '', kisi_giris: '', kisi_izin_baslangic: '', kisi_izin_bitis: '',
    kisi_izin_yeri: '',
  });
  const [loading, setLoading] = useState(false);

  function set(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/izin-formu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'Lizay-izin-formu.pdf'; a.click();
        URL.revokeObjectURL(url);
      } else {
        alert('PDF oluşturulamadı.');
      }
    } catch {
      alert('Bağlantı hatası, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '28px 20px', maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
        <i className="fa-solid fa-calendar-check" style={{ marginRight: 10, color: 'var(--accent)' }} />
        Yıllık İzin Talep Formu
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="df-form-grid">
          {FIELDS.map(f => (
            <div key={f.key} className="df-field">
              <label className="df-field-lbl">{f.label}{f.required && ' *'}</label>
              <input
                className="df-inp"
                type={f.type}
                value={form[f.key]}
                onChange={set(f.key)}
                required={f.required}
              />
            </div>
          ))}
        </div>

        <input type="hidden" name="kisi_izin_gun" value="" />

        <button type="submit" className="df-btn-kaydet" disabled={loading} style={{ marginTop: 8 }}>
          <i className="fa-solid fa-file-pdf" style={{ marginRight: 8 }} />
          {loading ? 'PDF Hazırlanıyor...' : 'PDF İndir'}
        </button>
      </form>
    </div>
  );
}
