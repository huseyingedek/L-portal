'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  dosyaAdi: string;   // silme icin WHERE anahtari (ham kampanya_dosya_adi)
  editHref: string;   // duzenleme sayfasi linki
}

const menuItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
  padding: '8px 12px', fontSize: 13, textAlign: 'left', cursor: 'pointer',
  background: 'none', border: 'none', color: 'var(--text)', whiteSpace: 'nowrap',
};

export default function KurumActions({ dosyaAdi, editHref }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saniye, setSaniye] = useState(3);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Menü dışına tıklayınca kapat
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // Silme modalı açılınca 3 saniye geri say; buton bu süre boyunca pasif kalır
  useEffect(() => {
    if (!confirmOpen) return;
    setSaniye(3);
    const id = setInterval(() => {
      setSaniye(s => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [confirmOpen]);

  function silModalAc() {
    setOpen(false);
    setConfirmOpen(true);
  }

  async function sil() {
    if (saniye > 0 || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/kampanyalar/sil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dosya_adi: dosyaAdi }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) { setConfirmOpen(false); router.refresh(); }
      else alert(data.error || 'Silme başarısız.');
    } catch {
      alert('Bağlantı hatası.');
    } finally {
      setBusy(false);
    }
  }

  const silPasif = saniye > 0 || busy;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
        disabled={busy}
        title="İşlemler"
        aria-label="İşlemler"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 8, fontSize: 14, cursor: 'pointer',
          border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)',
          opacity: busy ? 0.5 : 1,
        }}
      >
        <i className="fas fa-ellipsis-v" />
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 36, right: 0, zIndex: 10, minWidth: 140,
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,0.45)', overflow: 'hidden', padding: 4,
          }}
        >
          <Link href={editHref} onClick={() => setOpen(false)} style={menuItem}>
            <i className="fas fa-pen" style={{ width: 14, textAlign: 'center' }} /> Düzenle
          </Link>
          <button type="button" onClick={silModalAc} style={{ ...menuItem, color: '#f87171' }}>
            <i className="fas fa-trash" style={{ width: 14, textAlign: 'center' }} /> Sil
          </button>
        </div>
      )}

      {confirmOpen && mounted && createPortal(
        <div
          className="df-modal-overlay"
          onClick={() => { if (!busy) setConfirmOpen(false); }}
        >
          <div className="df-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, textAlign: 'left' }}>
            <h5 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-triangle-exclamation" style={{ color: '#f87171' }} /> Kurumu Sil
            </h5>
            <p>Bu anlaşmalı kurumu kalıcı olarak silmek üzeresiniz. Bu işlem geri alınamaz.</p>
            <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, fontWeight: 600, fontSize: 13,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)',
                }}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={sil}
                disabled={silPasif}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, fontWeight: 600, fontSize: 13,
                  cursor: silPasif ? 'not-allowed' : 'pointer',
                  border: 'none', background: silPasif ? 'rgba(239,68,68,0.35)' : '#ef4444', color: '#fff',
                }}
              >
                {busy ? 'Siliniyor...' : saniye > 0 ? `Sil (${saniye})` : 'Sil'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
