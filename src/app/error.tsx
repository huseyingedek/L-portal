'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[Portal Error]', error);
  }, [error]);

  const isDbError =
    error.message?.toLowerCase().includes('unknown database') ||
    error.message?.toLowerCase().includes('econnrefused') ||
    error.message?.toLowerCase().includes('enotfound') ||
    error.message?.toLowerCase().includes('connect') ||
    error.message?.toLowerCase().includes('access denied');

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg, #0d0f1c)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface, #13162a)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '40px 48px',
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* İkon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            backgroundColor: isDbError ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <i
            className={`fa-solid ${isDbError ? 'fa-database' : 'fa-triangle-exclamation'}`}
            style={{
              fontSize: 26,
              color: isDbError ? '#ef4444' : '#f59e0b',
            }}
          />
        </div>

        {/* Başlık */}
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: '0 0 10px' }}>
          {isDbError ? 'Veritabanına Bağlanılamadı' : 'Bir Hata Oluştu'}
        </h1>

        {/* Açıklama */}
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: '0 0 28px' }}>
          {isDbError
            ? 'Sunucu veya veritabanı şu an erişilemiyor. Lütfen ağ bağlantınızı kontrol edin ya da birkaç dakika sonra tekrar deneyin.'
            : 'Sayfa yüklenirken beklenmeyen bir sorun oluştu. Tekrar denemek için aşağıdaki butona tıklayın.'}
        </p>

        {/* Butonlar */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              backgroundColor: '#d63050',
              color: 'white',
              border: 'none',
              padding: '10px 22px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <i className="fa-solid fa-rotate-right" style={{ marginRight: 7 }} />
            Tekrar Dene
          </button>

          <Link
            href="/dashboard"
            style={{
              backgroundColor: 'rgba(255,255,255,0.07)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '10px 22px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="fa-solid fa-house" style={{ fontSize: 12 }} />
            Ana Menü
          </Link>
        </div>

        {/* Hata kodu (production'da gizle) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <p
            style={{
              marginTop: 28,
              fontSize: 11,
              color: '#374151',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: 8,
              padding: '8px 12px',
              fontFamily: 'monospace',
              wordBreak: 'break-word',
              textAlign: 'left',
            }}
          >
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
