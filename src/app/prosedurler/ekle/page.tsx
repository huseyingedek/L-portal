'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';

export default function ProsedurEklePage() {
  const router = useRouter();
  const [gorselBaslik, setGorselBaslik] = useState('');
  const [baslik, setBaslik]             = useState('');
  const [msg, setMsg]                   = useState('');
  const [loading, setLoading]           = useState(false);
  const editorRef  = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.ckeditor.com/ckeditor5/36.0.1/classic/ckeditor.js';
    script.onload = () => {
      const win = window as unknown as { ClassicEditor: { create: (el: Element, cfg: object) => Promise<unknown> } };
      if (containerRef.current && win.ClassicEditor) {
        win.ClassicEditor.create(containerRef.current, {
          link: { defaultProtocol: 'http://' },
          mediaEmbed: { previewsInData: true },
          ckfinder: { uploadUrl: '/api/upload?module=prosedurler' },
        }).then((editor: unknown) => {
          editorRef.current = editor;
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const editor = editorRef.current as { getData: () => string } | null;
    const icerik = editor ? editor.getData() : '';
    if (!icerik.trim()) { setMsg('İçerik boş olamaz.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/prosedurler/ekle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prosedur_gorsel_baslik: gorselBaslik, prosedur_baslik: baslik, prosedur_icerik: icerik }),
      });
      const data = await res.json();
      if (data.success) { setMsg('Başarıyla yüklendi!'); setTimeout(() => router.push('/prosedurler'), 1500); }
      else { setMsg(data.error || 'Başarısız.'); }
    } catch {
      setMsg('Bağlantı hatası, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="df-page-narrow">
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Prosedür Ekle</h1>

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
