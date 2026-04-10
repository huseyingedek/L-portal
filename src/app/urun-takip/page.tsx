'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UrunTakipPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'kayit' | 'giris' | 'sifre'>('giris');
  const [loading, setLoading] = useState(false);

  const [firmaAd, setFirmaAd]   = useState('');
  const [adSoyad, setAdSoyad]   = useState('');
  const [eposta, setEposta]     = useState('');
  const [tel, setTel]           = useState('');
  const [sifre, setSifre]       = useState('');

  const [girisKisiTel, setGirisKisiTel] = useState('');
  const [girisSifre, setGirisSifre]     = useState('');
  const [remindEposta, setRemindEposta] = useState('');

  function inputValue(val: string) {
    let v = val.replace(/^[0+]+/, '');
    v = '0' + v;
    if (v.length > 11) v = v.slice(0, 11);
    return v;
  }

  async function handleKayit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
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
    const res = await fetch('/api/urun-takip/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kisi_tel: girisKisiTel, kisi_password: girisSifre }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      window.location.href = '/urun-takip/panel';
    } else {
      alert(data.error || 'Giriş bilgileriniz hatalı.');
    }
  }

  const GOLD = '#F7CA18';

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(237,235,250,0.1)',
    border: '1px solid #fff',
    borderRadius: 0,
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Dosis', sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 300,
    color: 'rgba(255,255,255,0.5)',
    display: 'block',
    marginBottom: 2,
    fontFamily: "'Dosis', sans-serif",
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: 14,
    color: '#fff',
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css?family=Dosis:300,400,700" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; }
        body {
          background: #1c1e21 url('/img/bgyeni.jpg') center center / cover no-repeat;
          font-family: 'Dosis', sans-serif;
          min-height: 100vh;
        }
        #urun-form {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
        }
        #userform {
          background: rgba(0,0,0,0.82);
          width: 100%;
          max-width: 420px;
          border: 1px solid rgba(247,202,24,0.2);
        }
        .ut-tabs {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          border-bottom: 0;
        }
        .ut-tabs li {
          flex: 1;
        }
        .ut-tabs li a {
          display: block;
          padding: 18px 0;
          text-align: center;
          text-transform: uppercase;
          font-size: 18px;
          font-family: 'Dosis', sans-serif;
          font-weight: 400;
          color: #F7CA18;
          background: rgba(90,90,90,0.5);
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s;
          letter-spacing: 0.03em;
        }
        .ut-tabs li.active a {
          background: #F7CA18;
          color: #fff;
        }
        .ut-tabs li:not(.active) a:hover {
          background: #F7CA18;
          color: #fff;
        }
        .tab-content { padding: 20px; }
        .tab-content h2 {
          margin: 10px 0 18px 0;
          color: #fff;
          text-transform: uppercase;
          font-size: 22px;
          font-weight: 400;
          font-family: 'Dosis', sans-serif;
          letter-spacing: 0.05em;
        }
        .ut-input {
          width: 100%;
          padding: 10px;
          background: rgba(237,235,250,0.1);
          border: 1px solid #fff;
          border-radius: 0;
          color: #fff;
          font-size: 14px;
          outline: none;
          font-family: 'Dosis', sans-serif;
          transition: border-color 0.2s;
        }
        .ut-input:focus { border-color: #F7CA18; }
        .ut-input::placeholder { color: rgba(255,255,255,0.35); text-transform: uppercase; font-weight: 700; }
        .ut-label {
          font-size: 12px;
          font-weight: 300;
          color: rgba(255,255,255,0.5);
          display: block;
          margin-bottom: 2px;
          font-family: 'Dosis', sans-serif;
        }
        .ut-req { color: #F7CA18; margin-left: 2px; }
        .ut-group { margin-bottom: 14px; color: #fff; }
        .ut-btn {
          width: 100%;
          margin-top: 24px;
          padding: 15px;
          border: 2px solid #F7CA18;
          border-radius: 0;
          background: transparent;
          color: #F7CA18;
          font-size: 18px;
          font-family: 'Dosis', sans-serif;
          font-weight: 300;
          text-transform: uppercase;
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: all 0.3s;
        }
        .ut-btn:hover:not(:disabled) { background: #F7CA18; color: #fff; }
        .ut-btn:disabled { border-color: #888; color: #888; cursor: not-allowed; }
        .ut-sifre-link {
          float: right;
          color: #F7CA18;
          cursor: pointer;
          font-size: 13px;
          text-decoration: underline;
          font-family: 'Dosis', sans-serif;
        }
      `}</style>

      <div id="urun-form">
        <div id="userform">
          <ul className="ut-tabs">
            <li className={tab === 'giris' || tab === 'sifre' ? 'active' : ''}>
              <a onClick={() => setTab('giris')}>Giriş Yap</a>
            </li>
            <li className={tab === 'kayit' ? 'active' : ''}>
              <a onClick={() => setTab('kayit')}>Kayıt Ol</a>
            </li>
          </ul>

          <div className="tab-content">

            {/* KAYIT OL */}
            {tab === 'kayit' && (
              <form onSubmit={handleKayit}>
                <h2>Kayıt Ol</h2>
                <div className="ut-group">
                  <label className="ut-label">Firma Adı <span className="ut-req">*</span></label>
                  <input className="ut-input" value={firmaAd} onChange={e => setFirmaAd(e.target.value)} required autoComplete="off" placeholder="FİRMA ADINIZ" />
                </div>
                <div className="ut-group">
                  <label className="ut-label">Ad Soyad</label>
                  <input className="ut-input" value={adSoyad} onChange={e => setAdSoyad(e.target.value)} autoComplete="off" placeholder="ADINIZ SOYADINIZ" />
                </div>
                <div className="ut-group">
                  <label className="ut-label">E-Posta <span className="ut-req">*</span></label>
                  <input type="email" className="ut-input" value={eposta} onChange={e => setEposta(e.target.value)} required autoComplete="off" placeholder="E-POSTANIZ" />
                </div>
                <div className="ut-group">
                  <label className="ut-label">Telefon Numarası <span className="ut-req">*</span></label>
                  <input type="tel" className="ut-input" value={tel} maxLength={11}
                    onChange={e => setTel(inputValue(e.target.value))} required autoComplete="off" placeholder="TELEFON NUMARANIZ" />
                </div>
                <div className="ut-group">
                  <label className="ut-label">Şifre <span className="ut-req">*</span></label>
                  <input type="password" className="ut-input" value={sifre} onChange={e => setSifre(e.target.value)} required autoComplete="off" placeholder="ŞİFRENİZ" />
                </div>
                <button type="submit" className="ut-btn" disabled={loading}>
                  {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </button>
              </form>
            )}

            {/* GİRİŞ YAP */}
            {tab === 'giris' && (
              <form onSubmit={handleGiris}>
                <h2>Giriş Yap</h2>
                <div className="ut-group">
                  <label className="ut-label">Telefon Numarası <span className="ut-req">*</span></label>
                  <input type="tel" className="ut-input" value={girisKisiTel} maxLength={11}
                    onChange={e => setGirisKisiTel(inputValue(e.target.value))} required autoComplete="off" placeholder="TELEFON NUMARANIZ" />
                </div>
                <div className="ut-group">
                  <label className="ut-label">Şifre <span className="ut-req">*</span></label>
                  <input type="password" className="ut-input" value={girisSifre} onChange={e => setGirisSifre(e.target.value)} required autoComplete="off" placeholder="ŞİFRENİZ" />
                </div>
                <a className="ut-sifre-link" onClick={() => setTab('sifre')}>Şifremi Unuttum</a>
                <button type="submit" className="ut-btn" disabled={loading}>
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>
              </form>
            )}

            {/* ŞİFREMİ UNUTTUM */}
            {tab === 'sifre' && (
              <form onSubmit={e => { e.preventDefault(); alert('Şifre hatırlatma: ' + remindEposta); setTab('giris'); }}>
                <h2>Şifremi Unuttum</h2>
                <div className="ut-group">
                  <label className="ut-label">E-Posta <span className="ut-req">*</span></label>
                  <input type="email" className="ut-input" value={remindEposta} onChange={e => setRemindEposta(e.target.value)} required autoComplete="off" placeholder="E-POSTANIZ" />
                </div>
                <button type="submit" className="ut-btn">Şifremi Gönder</button>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
