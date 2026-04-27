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
  const [message, setMessage]               = useState('');
  const [loading, setLoading]               = useState(false);
  const [verifyMode, setVerifyMode]         = useState(false);
  const [verCode, setVerCode]               = useState('');
  const [verLoading, setVerLoading]         = useState(false);
  const [verMessage, setVerMessage]         = useState('');

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
    setMessage('');
    try {
      const res = await fetch('/api/musteri', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.needsVerification) {
        setVerifyMode(true);
        return;
      }
      setMessage(data.success ? 'Müşteri kaydı başarıyla tamamlandı.' : data.error || 'Hata oluştu.');
    } catch {
      setMessage('Bağlantı hatası, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerLoading(true);
    setVerMessage('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = {};
    try {
      const res = await fetch('/api/musteri/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: verCode }),
      });
      data = await res.json();
    } catch {
      setVerMessage('Bağlantı hatası, lütfen tekrar deneyin.');
      setVerLoading(false);
      return;
    } finally {
      setVerLoading(false);
    }

    if (data.success) {
      const labelMap: Record<string, string> = {
        KVKK:       'Yalnızca KVKK Kabul Edildi!',
        ETK:        'Yalnızca ETK Kabul Edildi!',
        KVKK_ETK:   'KVKK ve ETK Kabul Edildi!',
        Reddedildi: 'KVKK ve ETK Reddedildi!',
      };
      const msg = labelMap[data.result as string] ?? 'Müşteri kaydı tamamlandı.';

      setVerifyMode(false);
      setVerCode('');

      if (data.result === 'KVKK') {
        // PHP'de KVKK sonrası redirect yok → sadece mesaj göster
        setMessage(msg);
      } else {
        // ETK / KVKK_ETK / Reddedildi → PHP redirect gibi formu sıfırla
        setMessage(msg);
        setForm({
          kisi_ad_soyad: '', kisi_tel: '', kisi_eposta: '', kisi_tc: '',
          kisi_vergi_dairesi: '', kisi_ulke: 'TR', kisi_sehir: '34',
          kisi_ilce: '', kisi_adres: '', kisi_dogum_tarihi: '1975-01-01',
          kisi_pasaport_numarasi: '', kisi_pasaport_tarihi: '',
          kisi_es_dogum_tarihi: '1975-01-01', kisi_evlilik_tarihi: '1975-01-01',
          kisi_yuzuk_olcusu: '', kisi_cinsiyet: 'Erkek', kisi_sms: '1', kisi_not: '',
        });
      }
    } else {
      setVerMessage(data.error || 'Doğrulama başarısız.');
    }
  }

  const isSuccess = message.includes('başarı') || message.includes('kabul') || message.includes('tamamlandı');

  return (
    <div style={{ padding: '28px 20px', maxWidth: 940, margin: '0 auto' }}>

      {/* SMS Doğrulama Modalı */}
      {verifyMode && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'var(--card-bg, #1e2230)', borderRadius: 16,
            padding: '32px 28px', maxWidth: 400, width: '90%',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <i className="fa-solid fa-message" style={{ fontSize: 32, color: 'var(--accent)', marginBottom: 12, display: 'block' }} />
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>
                SMS Doğrulama
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Müşterinin telefon numarasına SMS ile bir onay kodu gönderildi.
                Lütfen müşteriden kodu alarak aşağıya girin.
              </p>
            </div>

            <form onSubmit={handleVerify}>
              <input
                className="df-inp"
                type="text"
                placeholder="Onay kodunu girin..."
                value={verCode}
                onChange={e => setVerCode(e.target.value)}
                autoFocus
                style={{ textAlign: 'center', fontSize: 20, letterSpacing: 4, fontWeight: 700, marginBottom: 8 }}
                required
              />
              {verMessage && (
                <div style={{
                  padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 12,
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                }}>{verMessage}</div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => { setVerifyMode(false); setVerCode(''); setVerMessage(''); }}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13,
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={verLoading}
                  style={{
                    flex: 2, padding: '10px 0', borderRadius: 8, border: 'none',
                    background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  {verLoading ? 'Doğrulanıyor...' : 'Onayla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
            <label className="df-field-lbl">Tel No{form.kisi_sms === '1' ? ' *' : ''}</label>
            <input
              className="df-inp"
              type="number"
              value={form.kisi_tel}
              onChange={set('kisi_tel')}
              required={form.kisi_sms === '1'}
            />
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
