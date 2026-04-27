'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageShell from '@/components/PageShell';

export default function IkEklePage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    kisi_kayit_tarihi: today,
    kisi_ad: '',
    kisi_soyad: '',
    kisi_eposta: '',
    kisi_gorev: '',
    kisi_tur: 'ise_alim',
    kisi_onceki_gorevi: '',
    kisi_vekalet_suresi: '',
  });
  const [resim, setResim]     = useState<File | null>(null);
  const [msg, setMsg]         = useState('');
  const [loading, setLoading] = useState(false);

  const isAtama = form.kisi_tur === 'gorev_atamasi';

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (resim) fd.append('kisi_resim', resim);
      const res = await fetch('/api/ik/ekle', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setMsg('Başarıyla kaydedildi!');
        setTimeout(() => router.push('/ik'), 1500);
      } else {
        setMsg(data.error || 'Hata oluştu.');
      }
    } catch {
      setMsg('Bağlantı hatası, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle = { display: 'flex', flexDirection: 'column' as const, gap: 6, marginBottom: 16 };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' };

  return (
    <PageShell>

      <div className="df-page-narrow">
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
          Kişi Ekle
        </h1>

        {msg && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13,
            backgroundColor: msg.includes('Başarı') ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${msg.includes('Başarı') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: msg.includes('Başarı') ? '#4ade80' : '#f87171',
          }}>{msg}</div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="df-form-grid">
            <div className="df-field">
              <label className="df-field-lbl">Tarih *</label>
              <input className="df-inp" type="date" value={form.kisi_kayit_tarihi} onChange={set('kisi_kayit_tarihi')} required />
            </div>
            <div className="df-field">
              <label className="df-field-lbl">Ad *</label>
              <input className="df-inp" type="text" value={form.kisi_ad} onChange={set('kisi_ad')} required />
            </div>
            <div className="df-field">
              <label className="df-field-lbl">Soyad *</label>
              <input className="df-inp" type="text" value={form.kisi_soyad} onChange={set('kisi_soyad')} required />
            </div>
            <div className="df-field">
              <label className="df-field-lbl">E-Posta *</label>
              <input className="df-inp" type="email" value={form.kisi_eposta} onChange={set('kisi_eposta')} required />
            </div>
            <div className="df-field">
              <label className="df-field-lbl">Görev *</label>
              <input className="df-inp" type="text" value={form.kisi_gorev} onChange={set('kisi_gorev')} required />
            </div>
            <div className="df-field df-field-full">
              <label className="df-field-lbl">Tür *</label>
              <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
                {[['ise_alim', 'İşe Alım'], ['gorev_atamasi', 'Atama-Görev Değişikliği']].map(([val, lbl]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
                    <input type="radio" name="kisi_tur" value={val} checked={form.kisi_tur === val} onChange={set('kisi_tur')} />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>
            {isAtama && (
              <>
                <div className="df-field">
                  <label className="df-field-lbl">Önceki Görevi *</label>
                  <input className="df-inp" type="text" value={form.kisi_onceki_gorevi} onChange={set('kisi_onceki_gorevi')} placeholder="Önceki görevi giriniz." required={isAtama} />
                </div>
                <div className="df-field">
                  <label className="df-field-lbl">Vekalet Süresi</label>
                  <input className="df-inp" type="text" value={form.kisi_vekalet_suresi} onChange={set('kisi_vekalet_suresi')} placeholder="Süresiz ise boş bırakınız." />
                </div>
              </>
            )}
            <div className="df-field">
              <label className="df-field-lbl">Resim *</label>
              <input className="df-inp" type="file" accept="image/*" onChange={e => setResim(e.target.files?.[0] || null)} required />
            </div>
          </div>

          <div>
            <button type="submit" className="df-btn-kaydet" disabled={loading}>
              {loading ? 'Yükleniyor...' : 'Kaydet'}
            </button>
          </div>

        </form>

        <div style={{ marginTop: 16 }}>
          <Link href="/ik" style={{ color: 'var(--accent)', fontSize: 13 }}>← Geri Dön</Link>
        </div>
      </div>
    </PageShell>
  );
}
