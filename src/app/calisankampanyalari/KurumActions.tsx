'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  dosyaAdi: string;   // silme icin WHERE anahtari (ham kampanya_dosya_adi)
  editHref: string;   // duzenleme sayfasi linki
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, borderRadius: 8, fontSize: 12, cursor: 'pointer',
  border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)',
};

export default function KurumActions({ dosyaAdi, editHref }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function sil(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Bu anlaşmalı kurumu kalıcı olarak silmek istediğinize emin misiniz?')) return;
    setBusy(true);
    try {
      const res = await fetch('/api/kampanyalar/sil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dosya_adi: dosyaAdi }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) router.refresh();
      else alert(data.error || 'Silme başarısız.');
    } catch {
      alert('Bağlantı hatası.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <Link href={editHref} title="Düzenle" onClick={e => e.stopPropagation()} style={btnBase}>
        <i className="fas fa-pen" />
      </Link>
      <button
        type="button"
        onClick={sil}
        disabled={busy}
        title="Sil"
        style={{ ...btnBase, color: '#f87171', borderColor: 'rgba(248,113,113,0.4)', opacity: busy ? 0.5 : 1 }}
      >
        <i className="fas fa-trash" />
      </button>
    </div>
  );
}
