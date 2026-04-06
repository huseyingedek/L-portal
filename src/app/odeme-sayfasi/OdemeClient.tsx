'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const FIELDS = [
  { key: 'odeme_tc',     label: 'T.C Kimlik No',         type: 'text',   maxLen: 11,  digits: true,  required: true },
  { key: 'odeme_kisi',   label: 'Ad Soyad',               type: 'text',   maxLen: 80,  digits: false, required: true },
  { key: 'odeme_tel',    label: 'Telefon Numarası',        type: 'tel',    maxLen: 11,  digits: true,  required: true },
  { key: 'odeme_email',  label: 'E-Posta Adresi',          type: 'email',  maxLen: 100, digits: false, required: true },
  { key: 'odeme_fatura', label: 'Fatura Adresi',           type: 'text',   maxLen: 200, digits: false, required: true },
  { key: 'odeme_tutar',  label: 'Ödeme Miktarı (TL)',      type: 'text',   maxLen: 10,  digits: true,  required: true },
] as const;

type FormKey = (typeof FIELDS)[number]['key'];

export default function OdemeClient() {
  const [form, setForm] = useState<Record<FormKey, string>>({
    odeme_tc: '', odeme_kisi: '', odeme_tel: '', odeme_email: '', odeme_fatura: '', odeme_tutar: '',
  });
  const [hata, setHata]       = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState('');

  useEffect(() => {
    setStatus(new URLSearchParams(window.location.search).get('status') || '');
  }, []);

  function handleChange(key: FormKey, value: string, digitsOnly: boolean) {
    if (digitsOnly && !/^\d*$/.test(value)) return;
    if (key === 'odeme_tel') {
      value = value.replace(/^[0+]/, '');
      value = '0' + value;
      if (value.length > 11) value = value.slice(0, 11);
    }
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata('');
    if (parseInt(form.odeme_tutar) > 500000) {
      setHata("Ödeme miktarı 500.000 TL'den fazla olamaz.");
      return;
    }
    const parts = form.odeme_kisi.trim().split(' ');
    if (parts[0].length < 2 || parts.length < 2 || parts[1].length < 2) {
      setHata('Kart sahibinin adını ve soyadını tam giriniz.');
      return;
    }
    setLoading(true);
    const res  = await fetch('/api/odeme', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.paymentPageUrl) window.location.href = data.paymentPageUrl;
    else setHata(data.error || 'Ödeme başlatılamadı.');
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 16px',
    }}>
      {/* Mini başlık */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg,#d63050,#a82040)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="fa-solid fa-gem" style={{ color: 'white', fontSize: 14 }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Lizay Pırlanta</span>
      </div>

      {/* Başarı / Hata sonuç */}
      {status === 'success' && (
        <div style={{
          width: '100%', maxWidth: 480,
          backgroundColor: 'rgba(34,197,94,0.12)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 14, padding: '20px 24px',
          textAlign: 'center', marginBottom: 20,
          color: '#4ade80', fontWeight: 600,
        }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: 28, marginBottom: 8, display: 'block' }} />
          Ödemeniz başarıyla alınmıştır. Teşekkürler!
        </div>
      )}
      {(status === 'err' || status === 'failure') && (
        <div style={{
          width: '100%', maxWidth: 480,
          backgroundColor: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 14, padding: '20px 24px',
          textAlign: 'center', marginBottom: 20,
          color: '#f87171', fontWeight: 600,
        }}>
          <i className="fa-solid fa-circle-xmark" style={{ fontSize: 28, marginBottom: 8, display: 'block' }} />
          Ödeme işlemi başarısız oldu. Lütfen tekrar deneyiniz.
        </div>
      )}

      {/* Form kartı */}
      <div style={{
        width: '100%', maxWidth: 480,
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '28px 28px 24px',
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          <i className="fa-solid fa-credit-card" style={{ marginRight: 8, color: 'var(--accent)' }} />
          Güvenli Ödeme
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 22 }}>
          Ödeme işleminiz iyzico altyapısı ile güvence altındadır.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FIELDS.map(f => (
              <div key={f.key} className="df-field">
                <label className="df-field-lbl">{f.label}{f.required && ' *'}</label>
                <input
                  className="df-inp"
                  type={f.type}
                  maxLength={f.maxLen}
                  value={form[f.key]}
                  onChange={e => handleChange(f.key, e.target.value, f.digits)}
                  required={f.required}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
          </div>

          {hata && (
            <div style={{
              margin: '14px 0 0',
              padding: '10px 14px',
              backgroundColor: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              fontSize: 13,
              color: '#f87171',
            }}>{hata}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', marginTop: 20,
              padding: '13px',
              backgroundColor: loading ? 'rgba(214,48,80,0.4)' : 'var(--accent)',
              color: 'white',
              border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading
              ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: 8 }} />Yönlendiriliyor...</>
              : <><i className="fa-solid fa-lock" style={{ marginRight: 8 }} />Ödemeyi Tamamla</>
            }
          </button>
        </form>
      </div>

      {/* Alt bilgi */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="fa-solid fa-shield-check" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>256-bit SSL · iyzico ile güvende</span>
      </div>

      <Link href="/dashboard" style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>
        ← Ana Menüye Dön
      </Link>
    </div>
  );
}
