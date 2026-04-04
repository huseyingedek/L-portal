'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Orijinal PHP'deki lizzusername cookie'sini oku
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)lizzusername=([^;]*)/);
    if (match) setUsername(decodeURIComponent(match[1]));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Spinner devam etsin, sayfa geçişi tamamlanana kadar
        window.location.href = '/dashboard';
        return;
      } else {
        const data = await res.json();
        setError(data.error || 'Giriş başarısız');
      }
    } catch {
      setError('Bağlantı hatası');
    }
    setLoading(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css?family=Oswald');

        * { box-sizing: border-box; }

        ::selection { background: black; color: #333; }
        ::-moz-selection { background: rgba(0,0,0,.5); color: red; }

        @media only screen and (max-width: 768px) {
          body, html {
            background-color: black;
            background-size: cover;
            box-shadow: 2px 2px 10px #0a0a0a;
            margin: 0; padding: 0;
            font-family: 'Open Sans', sans-serif;
          }
        }

        @media only screen and (min-width: 768px) {
          body, html {
            background: url(/img/bgyeni.jpg) no-repeat center center fixed;
            -webkit-background-size: cover;
            background-size: cover;
            box-shadow: 2px 2px 10px #0a0a0a;
            margin: 0; padding: 0;
            font-family: 'Open Sans', sans-serif;
          }
        }

        .mobile-screen {
          position: absolute;
          margin: auto;
          top: 0; left: 0; bottom: 0; right: 0;
          width: 400px;
          height: 500px;
          background: rgba(3,3,3,.7);
          overflow: hidden;
        }

        .header {
          position: relative;
          margin: 0; padding: 0;
          width: 100%; height: auto;
          background: rgba(3,3,3,.1);
        }

        h1 {
          margin: 0;
          padding: 10px 0;
          text-align: center;
          font-weight: 300;
          font-size: 21px;
          color: rgba(255,255,255,.5);
        }

        .logo {
          position: relative;
          width: 220px;
          height: 120px;
          margin: auto;
          background: url(/img/logo-beyaz-siyah.png) no-repeat center;
          background-size: cover;
          transition: all .2s ease-in-out;
        }

        form {
          position: absolute;
          bottom: 30px;
          width: 100%;
        }

        input, .login-btn {
          font-family: 'Open Sans', sans-serif;
          position: relative;
          display: block;
          margin: 20px auto;
          padding: 10px;
          width: 84%;
        }

        input {
          border: none;
          border-left: 5px solid rgb(225, 40, 54);
          background: none;
          color: #fff;
          font-weight: 300;
          font-size: 18px;
          transition: all .2s ease-in-out;
        }

        input:focus {
          outline: 0;
          background: rgba(225, 40, 54,.2);
          border-radius: 20px;
          border-color: transparent;
        }

        .login-btn {
          border-radius: 4px;
          text-align: center;
          background: rgb(225, 40, 54);
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 18px;
          font-weight: 300;
        }

        .login-btn:hover { background: rgb(200, 30, 44); }

        .bayi-btn {
          display: block;
          width: 84%;
          margin: 20px auto;
          padding: 10px;
          border-radius: 4px;
          text-align: center;
          background: rgb(225, 40, 54);
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 18px;
          font-weight: 300;
          text-decoration: none;
        }

        .error-msg {
          color: #ff6b6b;
          text-align: center;
          font-size: 14px;
          margin: -10px 0 10px;
        }
      `}</style>

      <div className="mobile-screen">
        <a href="https://mobile.lizaypirlanta.com/urun-takip/" className="bayi-btn">
          Bayi Web Girişi
        </a>

        <div className="header">
          <h1>Canias ile Giriş</h1>
        </div>

        <div className="logo" />

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Canias Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Canias Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading} style={{
            opacity: loading ? 0.8 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {loading && (
              <span style={{
                width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                borderTop: '2px solid white', borderRadius: '50%',
                display: 'inline-block', animation: 'spin 0.8s linear infinite',
              }} />
            )}
            {loading ? 'Giriş yapılıyor...' : 'Oturum Aç'}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>
      </div>
    </>
  );
}
