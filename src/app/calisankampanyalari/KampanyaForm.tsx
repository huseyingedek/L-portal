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

// İçeriğin başındaki ana görseli (figure.image) ayırır: {src, rest}
function ayirGorsel(html: string): { src: string; rest: string } {
  const m = html.match(/<figure[^>]*class="[^"]*image[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<\/figure>/i);
  if (m) return { src: m[1], rest: html.replace(m[0], '').trim() };
  return { src: '', rest: html };
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
  // Duzenlemede mevcut gorsel icerikten ayrilir; ayri alanda yonetilir.
  const [gorsel, setGorsel] = useState(() =>
    duzenle && initial?.kampanya_icerik ? ayirGorsel(initial.kampanya_icerik).src : ''
  );
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
      // Duzenlemede gorseli ayirdiktan sonra kalan icerik editore yuklenir (gorsel editore girmez).
      const icerik = initial?.kampanya_icerik ?? '';
      const rest = duzenle && icerik ? ayirGorsel(icerik).rest : icerik;
      if (rest) ed.setData(rest);
      editor = ed;
      editorRef.current = ed;
    }).catch(() => {});

    return () => {
      destroyed = true;
      if (editor) { editor.destroy().catch(() => {}); editor = null; }
      editorRef.current = null;
    };
  }, [duzenle, initial]);

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
      if (data.url) setGorsel(data.url); // yeni gorsel eskisinin yerini alir
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
    // Tek ana gorsel: secili olan (yeni ya da korunan) icerigin basina eklenir. Kaldirildiysa hic eklenmez.
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
        .kf-responsive .df-table { table-layout: fixed; }
        .kf-responsive .df-inp, .kf-responsive .df-inp-full { box-sizing: border-box; max-width: 100%; }
        .kf-responsive img { max-width: 100%; height: auto; }
        @media (max-width: 640px) {
          .kf-responsive .df-table,
          .kf-responsive .df-table tbody,
          .kf-responsive .df-table tr,
          .kf-responsive .df-table td { display: block; width: 100%; }
          .kf-responsive .df-table td { border: none; padding: 4px 0; }
          .kf-responsive .df-table tr { border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 10px; }
          .kf-responsive .df-table .df-label {
            background: none; text-align: left; padding: 8px 0 2px; text-transform: uppercase;
            font-size: 11px; letter-spacing: 0.05em;
          }
          .kf-responsive .df-inp, .kf-responsive .df-inp-full { width: 100%; }
        }
      `}</style>
      <div className="df-page-narrow kf-responsive">
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
                <td><input type="date" className="df-inp" value={gecerlilik} onChange={e => setGecerlilik(e.target.value)} /></td>
              </tr>
              <tr>
                <td className="df-label" style={{ verticalAlign: 'top', paddingTop: 10 }}>Görsel</td>
                <td>
                  {gorsel ? (
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gorsel} alt="Görsel" style={{ maxWidth: 240, borderRadius: 8, border: '1px solid var(--border)', display: 'block' }} />
                      <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <label style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                          Değiştir
                          <input type="file" accept="image/*" onChange={handleGorsel} style={{ display: 'none' }} />
                        </label>
                        <button type="button" onClick={() => setGorsel('')} style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 12, borderRadius: 8, border: '1px solid rgba(248,113,113,0.4)', background: 'var(--surface)', color: '#f87171' }}>
                          Kaldır
                        </button>
                        {gorselYukleniyor && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Yükleniyor...</span>}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input type="file" accept="image/*" onChange={handleGorsel} />
                      {gorselYukleniyor && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>Yükleniyor...</span>}
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
