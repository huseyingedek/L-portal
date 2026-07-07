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

export interface KampanyaInitial {
  kampanya_gorsel_baslik: string;
  kampanya_baslik: string;
  kampanya_icerik: string;
  kampanya_gecerlilik: string; // YYYY-MM-DD veya ''
}

interface Props {
  mode: 'ekle' | 'duzenle';
  slug?: string;               // duzenle: WHERE anahtari (ham kampanya_dosya_adi)
  initial?: KampanyaInitial;
}

export default function KampanyaForm({ mode, slug, initial }: Props) {
  const router = useRouter();
  const duzenle = mode === 'duzenle';
  const [gorselBaslik, setGorselBaslik] = useState(initial?.kampanya_gorsel_baslik ?? '');
  const [baslik, setBaslik]             = useState(initial?.kampanya_baslik ?? '');
  const [gecerlilik, setGecerlilik]     = useState(initial?.kampanya_gecerlilik ?? '');
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
        toolbar: { items: ['heading', '|', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList', '|', 'undo', 'redo'] },
        link: { defaultProtocol: 'http://' },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).then((ed: any) => {
      if (!ed) return;
      if (destroyed) { ed.destroy(); return; }
      if (initial?.kampanya_icerik) ed.setData(initial.kampanya_icerik);
      editor = ed;
      editorRef.current = ed;
    }).catch(() => {});

    return () => {
      destroyed = true;
      if (editor) { editor.destroy().catch(() => {}); editor = null; }
      editorRef.current = null;
    };
  }, [initial]);

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
    // Yeni yuklenen gorsel icerigin basina eklenir; duzenlemede eski gorsel zaten icerikte.
    const gorselHtml = gorsel ? `<figure class="image"><img src="${gorsel}"></figure>` : '';
    const finalIcerik = gorselHtml + icerik;
    if (!finalIcerik.trim()) { setMsg('İçerik veya görsel ekleyin.'); return; }
    setLoading(true);
    try {
      const endpoint = duzenle ? '/api/kampanyalar/guncelle' : '/api/kampanyalar/ekle';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dosya_adi: slug ?? '',
          kampanya_gorsel_baslik: gorselBaslik,
          kampanya_baslik: baslik,
          kampanya_icerik: finalIcerik,
          kampanya_gecerlilik: gecerlilik || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(duzenle ? 'Güncellendi!' : 'Başarıyla yüklendi!');
        setTimeout(() => { router.push('/calisankampanyalari'); router.refresh(); }, 1200);
      } else { setMsg(data.error || 'Başarısız.'); }
    } catch {
      setMsg('Bağlantı hatası, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <style>{`
        .ck.ck-editor__editable_inline { min-height: 200px; background: #ffffff; color: #1a1a2e; }
        .ck.ck-content, .ck.ck-content p, .ck.ck-content li,
        .ck.ck-content h1, .ck.ck-content h2, .ck.ck-content h3,
        .ck.ck-content h4, .ck.ck-content strong, .ck.ck-content a { color: #1a1a2e; }
        .ck.ck-content a { color: #1d4ed8; }
      `}</style>
      <div className="df-page-narrow">
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
          {duzenle ? 'Anlaşmalı Kurum Düzenle' : 'Anlaşmalı Kurum Ekle'}
        </h1>

        {msg && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13,
            backgroundColor: (msg.includes('Başarı') || msg.includes('Güncellendi')) ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${(msg.includes('Başarı') || msg.includes('Güncellendi')) ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: (msg.includes('Başarı') || msg.includes('Güncellendi')) ? '#4ade80' : '#f87171',
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
                <td className="df-label">Geçerlilik Tarihi</td>
                <td>
                  <input type="date" className="df-inp" value={gecerlilik} onChange={e => setGecerlilik(e.target.value)} />
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>(bilgilendirme amaçlı, boş bırakılabilir)</span>
                </td>
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
                  {duzenle && !gorsel && (
                    <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      Mevcut görsel içerikte korunur. Yeni görsel seçerseniz başa eklenir.
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
                    {loading ? (duzenle ? 'Güncelleniyor...' : 'Yükleniyor...') : (duzenle ? 'Güncelle' : 'Yükle')}
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
