'use client';

import { useState, useEffect } from 'react';

interface Ulke  { COUNTRY: string; }
interface Sehir { CITY: string;    }

const YUZUK_OLCULERI = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];

export default function MusteriKaydiClient() {
  const [ulkeler,  setUlkeler]  = useState<{ kod: string; ad: string }[]>([]);
  const [sehirler, setSehirler] = useState<{ kod: string; ad: string }[]>([]);
  const [form, setForm] = useState({
    kisi_ad_soyad: '', kisi_tel: '', kisi_eposta: '', kisi_tc: '',
    kisi_vergi_dairesi: '', kisi_ulke: 'TR', kisi_sehir: '34',
    kisi_ilce: '', kisi_adres: '', kisi_dogum_tarihi: '1975-01-01',
    kisi_pasaport_numarasi: '', kisi_pasaport_tarihi: '',
    kisi_es_dogum_tarihi: '1975-01-01', kisi_evlilik_tarihi: '1975-01-01',
    kisi_yuzuk_olcusu: '', kisi_cinsiyet: 'Erkek', kisi_sms: '1', kisi_not: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/musteri?type=ulke').then(r => r.json()).then((data: Ulke[]) => {
      setUlkeler((data || []).map(u => {
        const p = (u.COUNTRY || '').split('-');
        return { kod: p[0], ad: p[1] || p[0] };
      }));
    });
  }, []);

  useEffect(() => {
    fetch(`/api/musteri?type=sehir&ulke=${form.kisi_ulke}`).then(r => r.json()).then((data: Sehir[]) => {
      setSehirler((data || []).map(s => {
        const p = (s.CITY || '').split('-');
        return { kod: p[0], ad: p[1] || p[0] };
      }));
    });
  }, [form.kisi_ulke]);

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/musteri', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(data.success ? 'Müşteri kaydı başarıyla tamamlandı.' : data.error || 'Hata oluştu.');
  }

  const isSuccess = message.includes('başarı');

  return (
    <div style={{ padding: '28px 20px', maxWidth: 940, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
        <i className="fa-solid fa-user-plus" style={{ marginRight: 10, color: 'var(--accent)' }} />
        Müşteri Kaydı
      </h1>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13,
          backgroundColor: isSuccess ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: isSuccess ? '#4ade80' : '#f87171',
        }}>{message}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="df-form-grid">

          <div className="df-field">
            <label className="df-field-lbl">Ad Soyad *</label>
            <input className="df-inp" type="text" value={form.kisi_ad_soyad} onChange={set('kisi_ad_soyad')} required />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Tel No</label>
            <input className="df-inp" type="number" value={form.kisi_tel} onChange={set('kisi_tel')} />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">E-Posta</label>
            <input className="df-inp" type="email" value={form.kisi_eposta} onChange={set('kisi_eposta')} />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">TC / Vergi No</label>
            <input className="df-inp" type="number" value={form.kisi_tc} onChange={set('kisi_tc')} />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Vergi Dairesi</label>
            <input className="df-inp" type="text" value={form.kisi_vergi_dairesi} onChange={set('kisi_vergi_dairesi')} />
          </div>

          <div className="df-field">
            <label className="df-field-lbl">Ülke</label>
            <select className="df-inp" value={form.kisi_ulke} onChange={set('kisi_ulke')}>
              {ulkeler.map(u => <option key={u.kod} value={u.kod}>{u.ad}</option>)}
            </select>
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Şehir</label>
            <select className="df-inp" value={form.kisi_sehir} onChange={set('kisi_sehir')}>
              <option value="">Seçiniz</option>
              {sehirler.map(s => <option key={s.kod} value={s.kod}>{s.ad}</option>)}
            </select>
          </div>
          <div className="df-field">
            <label className="df-field-lbl">İlçe</label>
            <input className="df-inp" type="text" value={form.kisi_ilce} onChange={set('kisi_ilce')} />
          </div>
          <div className="df-field df-field-full">
            <label className="df-field-lbl">Adres</label>
            <input className="df-inp" type="text" value={form.kisi_adres} onChange={set('kisi_adres')} />
          </div>

          <div className="df-field">
            <label className="df-field-lbl">Doğum Tarihi</label>
            <input className="df-inp" type="date" value={form.kisi_dogum_tarihi} onChange={set('kisi_dogum_tarihi')} />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Pasaport No</label>
            <input className="df-inp" type="text" value={form.kisi_pasaport_numarasi} onChange={set('kisi_pasaport_numarasi')} />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Pasaport Geçerlilik</label>
            <input className="df-inp" type="date" value={form.kisi_pasaport_tarihi} onChange={set('kisi_pasaport_tarihi')} />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Eş Doğum Tarihi</label>
            <input className="df-inp" type="date" value={form.kisi_es_dogum_tarihi} onChange={set('kisi_es_dogum_tarihi')} />
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Evlilik Tarihi</label>
            <input className="df-inp" type="date" value={form.kisi_evlilik_tarihi} onChange={set('kisi_evlilik_tarihi')} />
          </div>

          <div className="df-field">
            <label className="df-field-lbl">Yüzük Ölçüsü</label>
            <select className="df-inp" value={form.kisi_yuzuk_olcusu} onChange={set('kisi_yuzuk_olcusu')}>
              <option value="">Seçiniz</option>
              {YUZUK_OLCULERI.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="df-field">
            <label className="df-field-lbl">Cinsiyet</label>
            <select className="df-inp" value={form.kisi_cinsiyet} onChange={set('kisi_cinsiyet')}>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
            </select>
          </div>
          <div className="df-field" style={{ alignSelf: 'end', paddingBottom: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}>
              <input
                type="checkbox"
                checked={form.kisi_sms === '1'}
                onChange={e => setForm(f => ({ ...f, kisi_sms: e.target.checked ? '1' : '0' }))}
              />
              SMS Bildirimi
            </label>
          </div>

          <div className="df-field df-field-full">
            <label className="df-field-lbl">Müşteri Notları</label>
            <textarea className="df-inp" rows={4} value={form.kisi_not} onChange={set('kisi_not')} style={{ height: 100 }} />
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button type="submit" className="df-btn-kaydet" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
