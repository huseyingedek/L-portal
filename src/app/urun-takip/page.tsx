'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UrunTakipPage() {
  const router = useRouter();

  // Tab: 'kayit' | 'giris' | 'sifre'
  const [tab, setTab] = useState<'kayit' | 'giris' | 'sifre'>('kayit');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Kayıt formu
  const [firmaAd, setFirmaAd]         = useState('');
  const [adSoyad, setAdSoyad]         = useState('');
  const [eposta, setEposta]           = useState('');
  const [tel, setTel]                 = useState('');
  const [sifre, setSifre]             = useState('');

  // Giriş formu
  const [girisKisiTel, setGirisKisiTel]   = useState('');
  const [girisSifre, setGirisSifre]       = useState('');

  // Şifremi unuttum
  const [remindEposta, setRemindEposta]   = useState('');

  function inputValue(val: string) {
    let v = val.replace(/^[0+]+/, '');
    v = '0' + v;
    if (v.length > 11) v = v.slice(0, 11);
    return v;
  }

  async function handleKayit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const res = await fetch('/api/urun-takip/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firma_ad: firmaAd, kisi_ad_soyad: adSoyad, kisi_eposta: eposta, kisi_tel: tel, kisi_password: sifre }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      alert('Başarıyla kayıt olundu!');
      setTab('giris');
    } else {
      alert(data.error || 'Başarısız.');
    }
  }

  async function handleGiris(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const res = await fetch('/api/urun-takip/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kisi_tel: girisKisiTel, kisi_password: girisSifre }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push('/urun-takip/panel');
    } else {
      alert(data.error || 'Giriş bilgileriniz hatalı.');
    }
  }

  return (
    <>
      <style>{`
        body { background: #1a1a2e; }
        #form { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        #userform { background: #fff; border-radius: 8px; padding: 24px; max-width: 480px; width: 100%; }
        .nav-tabs { display: flex; list-style: none; padding: 0; margin: 0 0 16px 0; border-bottom: 2px solid #ddd; }
        .nav-tabs li { margin-right: 4px; }
        .nav-tabs li a { display: block; padding: 8px 16px; cursor: pointer; color: #555; text-decoration: none; border-radius: 4px 4px 0 0; }
        .nav-tabs li.active a { background: #e21234; color: #fff; font-weight: bold; }
        .form-group { margin-bottom: 14px; }
        .form-group label { font-weight: bold; display: block; margin-bottom: 4px; font-size: 13px; }
        .form-control { width: 100%; padding: 8px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
        h2 { text-align: center; text-transform: uppercase; margin-bottom: 16px; font-size: 18px; }
        .btn { width: 100%; padding: 10px; background: #e21234; color: #fff; border: none; border-radius: 4px; font-size: 15px; cursor: pointer; margin-top: 8px; }
        .btn:disabled { background: #aaa; }
        .float-right { float: right; color: #e21234; cursor: pointer; font-size: 13px; margin-bottom: 8px; }
      `}</style>

      <div id="form">
        <div className="container">
          <div id="userform">
            <ul className="nav-tabs">
              <li className={tab === 'kayit' ? 'active' : ''}>
                <a onClick={() => setTab('kayit')}>Kayıt Ol</a>
              </li>
              <li className={tab === 'giris' ? 'active' : ''}>
                <a onClick={() => setTab('giris')}>Giriş Yap</a>
              </li>
            </ul>

            {/* KAYIT OL */}
            {tab === 'kayit' && (
              <form onSubmit={handleKayit}>
                <h2>Kayıt Ol</h2>
                <div className="form-group">
                  <label>Firma Adı <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-control" value={firmaAd} onChange={e => setFirmaAd(e.target.value)} required autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>Ad Soyad</label>
                  <input className="form-control" value={adSoyad} onChange={e => setAdSoyad(e.target.value)} autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>E-Posta <span style={{ color: 'red' }}>*</span></label>
                  <input type="email" className="form-control" value={eposta} onChange={e => setEposta(e.target.value)} required autoComplete="off" />
                </div>
                <div className="form-group">
                  <label>Telefon Numarası <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="tel"
                    className="form-control"
                    value={tel}
                    maxLength={11}
                    onChange={e => setTel(inputValue(e.target.value))}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label>Şifre <span style={{ color: 'red' }}>*</span></label>
                  <input type="password" className="form-control" value={sifre} onChange={e => setSifre(e.target.value)} required autoComplete="off" />
                </div>
                <button type="submit" className="btn" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Kayıt Ol'}</button>
                {msg && <p style={{ marginTop: 8, color: 'red' }}>{msg}</p>}
              </form>
            )}

            {/* GİRİŞ YAP */}
            {tab === 'giris' && (
              <form onSubmit={handleGiris}>
                <h2>Giriş Yap</h2>
                <div className="form-group">
                  <label>Telefon Numarası <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="tel"
                    className="form-control"
                    value={girisKisiTel}
                    maxLength={11}
                    onChange={e => setGirisKisiTel(inputValue(e.target.value))}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label>Şifre <span style={{ color: 'red' }}>*</span></label>
                  <input type="password" className="form-control" value={girisSifre} onChange={e => setGirisSifre(e.target.value)} required autoComplete="off" />
                </div>
                <a className="float-right" onClick={() => setTab('sifre')}>Şifremi Unuttum</a>
                <button type="submit" className="btn" disabled={loading}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</button>
              </form>
            )}

            {/* ŞİFREMİ UNUTTUM */}
            {tab === 'sifre' && (
              <form onSubmit={e => { e.preventDefault(); alert('Şifre hatırlatma: ' + remindEposta); setTab('giris'); }}>
                <h2>Şifremi Unuttum</h2>
                <div className="form-group">
                  <label>E-Posta <span style={{ color: 'red' }}>*</span></label>
                  <input type="email" className="form-control" value={remindEposta} onChange={e => setRemindEposta(e.target.value)} required autoComplete="off" />
                </div>
                <button type="submit" className="btn">Şifremi Gönder</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
