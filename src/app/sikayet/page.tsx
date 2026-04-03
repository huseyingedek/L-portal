'use client';

import { useState } from 'react';

export default function SikayetPage() {
  const [isim, setIsim]   = useState('');
  const [mesaj, setMesaj] = useState('');
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/sikayet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isim, mesaj }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setSent(true);
    } else {
      setError(data.error || 'Bir Sorun Oluştu');
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css?family=Poppins:400,500,600,700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Poppins',sans-serif; }
        .container-contact100 {
          width:100%; min-height:100vh; display:flex; align-items:center; justify-content:center;
          background: url('/img/bgyeniters.jpg') no-repeat center center fixed; background-size:cover;
        }
        .contact100-map { position:absolute; top:0; left:0; width:50%; height:100%; }
        .wrap-contact100 {
          width:520px; background:#fff; border-radius:10px; padding:50px 50px 50px;
          position:relative; z-index:1;
        }
        .contact100-form-title {
          display:block; font-size:28px; font-weight:700; color:#333; line-height:1.2; text-align:center;
          padding-bottom:30px;
        }
        .wrap-input100 { position:relative; width:100%; margin-bottom:20px; }
        .label-input100 { display:block; font-size:13px; font-weight:600; color:#555; margin-bottom:6px; }
        .input100 {
          display:block; width:100%; padding:12px 16px; font-size:14px;
          border:1px solid #ccc; border-radius:5px; outline:none; transition:all 0.3s;
        }
        .input100:focus { border-color:#e21234; box-shadow:0 0 0 2px rgba(226,18,52,0.15); }
        textarea.input100 { min-height:120px; resize:vertical; }
        .container-contact100-form-btn { display:flex; justify-content:center; padding-top:10px; }
        .contact100-form-btn {
          width:100%; padding:14px; background:#e21234; color:#fff; border:none; border-radius:5px;
          font-size:16px; font-weight:600; cursor:pointer; transition:background 0.3s;
        }
        .contact100-form-btn:hover { background:#c0102d; }
        .contact100-form-btn:disabled { background:#aaa; }
        .check_mark { display:flex; justify-content:center; margin-bottom:20px; }
        .sa-icon.sa-success { width:80px; height:80px; border:4px solid #4caf50; border-radius:50%;
          display:flex; align-items:center; justify-content:center; }
        .sa-icon.sa-success::before { content:'✓'; font-size:40px; color:#4caf50; }
        .success-msg { text-align:center; font-size:15px; color:#333; line-height:1.8; }
        .error-msg { text-align:center; color:red; margin-top:10px; font-size:14px; }
        .validate-input[data-empty="true"] .input100 { border-color:#e21234; }
      `}</style>

      <div className="container-contact100">
        <div className="wrap-contact100">
          {!sent ? (
            <form className="contact100-form" onSubmit={handleSubmit}>
              <span className="contact100-form-title">Şikayet/Öneri</span>

              <div className="wrap-input100">
                <span className="label-input100">Başlık</span>
                <input
                  className="input100"
                  type="text"
                  name="isim"
                  placeholder="Başlık Giriniz..."
                  value={isim}
                  onChange={e => setIsim(e.target.value)}
                  required
                />
              </div>

              <div className="wrap-input100">
                <span className="label-input100">Mesajınız</span>
                <textarea
                  className="input100"
                  name="mesaj"
                  placeholder="Mesajınızı Yazınız..."
                  value={mesaj}
                  onChange={e => setMesaj(e.target.value)}
                  required
                />
              </div>

              <div className="container-contact100-form-btn">
                <button id="checkMark" className="contact100-form-btn" disabled={loading}>
                  {loading ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>

              {error && <p className="error-msg">{error}</p>}
            </form>
          ) : (
            <div>
              <div className="check_mark">
                <div className="sa-icon sa-success animate" />
              </div>
              <p className="success-msg">
                Mesajınız Gönderilmiştir.<br />
                En kısa sürede incelenecek ve işlem sağlanacaktır.<br />
                <a href="/" style={{ color: '#e21234', fontWeight: 600 }}>Ana Sayfaya Dön</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
