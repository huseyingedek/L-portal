'use client';

import { useState } from 'react';

interface Kayit {
  id: number; kisi_ad_soyad: string; kisi_gorev: string; kisi_resim: string;
  kisi_kayit_tarihi: string; kisi_onceki_gorevi: string; kisi_vekalet_suresi: string;
}

export default function IseAlimClient({ rows }: { rows: Kayit[] }) {
  const [modal, setModal] = useState<{ src: string; alt: string } | null>(null);

  if (rows.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>Kayıt bulunamadı.</p>;
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {rows.map(row => {
          const tarih = new Date(row.kisi_kayit_tarihi).toLocaleDateString('tr-TR');
          const hasVekalet = row.kisi_vekalet_suresi?.trim() !== '';
          return (
            <div key={row.id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={row.kisi_resim}
                alt={`${row.kisi_ad_soyad} - ${row.kisi_gorev}`}
                onClick={() => setModal({ src: row.kisi_resim, alt: `${row.kisi_ad_soyad} - ${row.kisi_gorev}` })}
                style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
              />
              <div style={{ padding: '16px 18px' }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', margin: '0 0 8px' }}>{row.kisi_ad_soyad} — {row.kisi_gorev}</p>
                <hr style={{ borderColor: 'var(--border)', margin: '8px 0 10px' }} />
                <small style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 12 }}>
                  {!hasVekalet
                    ? <>Değerli Çalışanlarımız,<br />Şirketimizde {row.kisi_onceki_gorevi} olarak görev yapmakta olan Sn. {row.kisi_ad_soyad} {tarih} tarihi itibariyle {row.kisi_gorev} olarak ataması yapılmıştır.<br />Sn. {row.kisi_ad_soyad} için yeni görevinde başarılar dileriz.</>
                    : <>Değerli Çalışanlarımız,<br />Şirketimizde {row.kisi_onceki_gorevi} olarak görev yapmakta olan Sn. {row.kisi_ad_soyad} {tarih} tarihi itibariyle <b>{row.kisi_vekalet_suresi}</b> süre boyunca {row.kisi_gorev} olarak ataması yapılmıştır.<br />Sn. {row.kisi_ad_soyad} için yeni görevinde başarılar dileriz.</>
                  }
                </small>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resim zoom modal */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{ position: 'fixed', zIndex: 9999, inset: 0, background: 'rgba(0,0,0,0.92)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ position: 'absolute', top: 16, right: 28, color: '#fff', fontSize: 36, fontWeight: 'bold', lineHeight: 1 }}>&times;</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={modal.src} alt={modal.alt} style={{ maxWidth: '90%', maxHeight: '85vh', borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }} />
          <p style={{ textAlign: 'center', color: '#ccc', padding: 10, fontSize: 13, marginTop: 8 }}>{modal.alt}</p>
        </div>
      )}
    </>
  );
}
