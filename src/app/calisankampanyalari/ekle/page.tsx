'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';

const CKEDITOR_SRC = 'https://cdn.ckeditor.com/ckeditor5/36.0.1/classic/ckeditor.js';

function ckeditorHazir(): Promise<void> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).ClassicEditor) return resolve();
    const mevcut = document.getElementById('ckeditor-script') as HTMLScriptElement | null;
    if (mevcut) { mevcut.addEventListener('load', () => resolve()); return; }
    const s = document.createElement('script');
    s.id = 'ckeditor-script';
    s.src = CKEDITOR_SRC;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
}

export default function KampanyaEklePage() {
  const router = useRouter();
  const [gorselBaslik, setGorselBaslik] = useState('');
  const [baslik, setBaslik]             = useState('');
  const [gorsel, setGorsel]             = useState('');
  const [gorselYukleniyor, setGorselYukleniyor] = useState(false);
  const [msg, setMsg]                   = useState('');
  const [loading, setLoading]           = useState(false);
  const editorRef    = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let editor: any = null;
    let destroyed = false;

    ckeditorHazir().then(() => {
      if (destroyed || !containerRef.current || editorRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).ClassicEditor.create(containerRef.current, {
        // Sadece gerekli araclar: baslik, kalin, italik, link, listeler, geri/ileri
        toolbar: { items: ['heading', '|', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo'] },
        link: { defaultProtocol: 'http://' },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).then((ed: any) => {
      if (!ed) return;
      if (destroyed) { ed.destroy(); return; }
      editor = ed;
      editorRef.current = ed;
    }).catch(() => {});

    return () => {
      destroyed = true;
      if (editor) { editor.destroy().catch(() => {}); editor = null; }
      editorRef.current = null;
    };
  }, []);

  async function handleGorsel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setGorselYukleniyor(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('upload', file);
      const res = await fetch('/api/upload?module=calisankampanyalari', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setGorsel(data.url);
      else setMsg(data.error?.message || 'Görsel yüklenemedi.');
    } catch {
      setMsg('Görsel yüklenirken hata oluştu.');
    } finally {
      setGorselYukleniyor(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const editor = editorRef.current as { getData: () => string } | null;
    const icerik = editor ? editor.getData() : '';
    // Yuklenen gorseli icerigin basina gomuyoruz -> mevcut DB yapisina uygun (kampanya_icerik icinde)
    const gorselHtml = gorsel ? `<figure class="image"><img src="${gorsel}"></figure>` : '';
    const finalIcerik = gorselHtml + icerik;
    if (!finalIcerik.trim()) { setMsg('İçerik veya görsel ekleyin.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/kampanyalar/ekle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kampanya_gorsel_baslik: gorselBaslik, kampanya_baslik: baslik, kampanya_icerik: finalIcerik }),
      });
      const data = await res.json();
      if (data.success) { setMsg('Başarıyla yüklendi!'); setTimeout(() => router.push('/calisankampanyalari'), 1500); }
      else { setMsg(data.error || 'Başarısız.'); }
    } catch {
      setMsg('Bağlantı hatası, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      {/* Editör içeriği koyu ve okunur olsun */}
      <style>{`
        .ck.ck-editor__editable_inline { min-height: 200px; background: #ffffff; color: #1a1a2e; }
        .ck.ck-content, .ck.ck-content p, .ck.ck-content li,
        .ck.ck-content h1, .ck.ck-content h2, .ck.ck-content h3,
        .ck.ck-content h4, .ck.ck-content strong, .ck.ck-content a { color: #1a1a2e; }
        .ck.ck-content a { color: #1d4ed8; }
      `}</style>
      <div className="df-page-narrow">
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Anlaşmalı Kurum Ekle</h1>

        {msg && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13,
            backgroundColor: msg.includes('Başarı') ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${msg.includes('Başarı') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: msg.includes('Başarı') ? '#4ade80' : '#f87171',
          }}>{msg}</div>
        )}

        <form onSubmit={handleSubmit}>
          <table className="df-table" style={{ marginBottom: 16 }}>
            <tbody>
              <tr>
                <td className="df-label">Görsel Başlık</td>
                <td><input className="df-inp df-inp-full" value={gorselBaslik} onChange={e => setGorselBaslik(e.target.value)} required /></td>
              </tr>
              <tr>
                <td className="df-label">Detaylı Başlık</td>
                <td><input className="df-inp df-inp-full" value={baslik} onChange={e => setBaslik(e.target.value)} required /></td>
              </tr>
              <tr>
                <td className="df-label" style={{ verticalAlign: 'top', paddingTop: 10 }}>Görsel</td>
                <td>
                  <input type="file" accept="image/*" onChange={handleGorsel} />
                  {gorselYukleniyor && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>Yükleniyor...</span>}
                  {gorsel && (
                    <div style={{ marginTop: 10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gorsel} alt="Görsel" style={{ maxWidth: 240, borderRadius: 8, border: '1px solid var(--border)' }} />
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <td className="df-label" style={{ verticalAlign: 'top', paddingTop: 14 }}>İçerik</td>
                <td>
                  <div ref={containerRef} style={{ minHeight: 200 }} />
                </td>
              </tr>
              <tr>
                <td />
                <td style={{ paddingTop: 12 }}>
                  <button type="submit" className="df-btn-kaydet" disabled={loading}>
                    {loading ? 'Yükleniyor...' : 'Yükle'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </PageShell>
  );
}
