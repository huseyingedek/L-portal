'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';

interface UrunRow {
  BARKOD: string; URUNADI: string; SONFIYAT: string; SABITFIYAT: string;
  SPRICECURRENCY: string; DIAMOND: string | number; COLORCLARITY: string;
  COLORSTONE: string | string[]; GOLDK: string; AGIRLIK: string;
  STOKDURUMU: string | number; STOKACIKLAMA: string; IMGBASE64: string;
  MODEL?: string;
}
interface CartItem {
  uid: string;
  product: UrunRow;
  options: UrunRow[];
  qty: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const toStr = (v: unknown): string => {
  if (Array.isArray(v)) return v.join(', ');
  if (v === null || v === undefined) return '';
  return String(v);
};

/* ─── CSS ─── */
const styles = `
  .fiyat-wrap {
    min-height: calc(100vh - 52px);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 14px 80px;
  }
  .fiyat-search {
    display: flex;
    gap: 10px;
    width: 100%;
    max-width: 520px;
    margin-bottom: 6px;
  }
  .fiyat-input-wrap {
    flex: 1;
    position: relative;
    min-width: 0;
  }
  .fiyat-input-wrap input {
    width: 100%;
    padding: 13px 50px 13px 18px;
    border-radius: 12px;
    border: 2px solid rgba(255,255,255,0.4);
    background: rgba(255,255,255,0.96);
    color: #1a1a2e;
    font-size: 16px;
    outline: none;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    box-sizing: border-box;
  }
  .btn-camera {
    position: absolute;
    right: 7px;
    top: 50%;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: none;
    background: rgba(197,48,48,0.12);
    color: #c53030;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .btn-camera:hover  { background: rgba(197,48,48,0.22); }
  .btn-camera:active { background: rgba(197,48,48,0.32); }
  .fiyat-search button.btn-add {
    padding: 13px 22px;
    border-radius: 12px;
    border: none;
    background: #c53030;
    color: white;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 2px 12px rgba(197,48,48,0.35);
    flex-shrink: 0;
  }
  /* ─ Header ─ */
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .btn-clear {
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.35);
    color: white; border-radius: 8px;
    padding: 7px 14px; font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    white-space: nowrap;
  }
  .btn-send {
    background: rgba(197,48,48,0.75);
    border: 1px solid rgba(197,48,48,0.5);
    color: white; border-radius: 8px;
    padding: 7px 14px; font-size: 13px; font-weight: 600;
    cursor: not-allowed; display: flex; align-items: center; gap: 6px;
    opacity: 0.85; white-space: nowrap;
  }
  /* ─ Toplam ─ */
  .cart-total {
    background: rgba(255,255,255,0.97);
    border-radius: 14px;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 6px;
  }
  /* ─ Swipe card ─ */
  .swipe-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 18px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  }
  .swipe-delete-btn {
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 80px;
    background: #e53e3e;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: white;
    font-size: 22px;
    cursor: pointer;
    border-radius: 0 18px 18px 0;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .swipe-delete-btn span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .swipe-card-inner {
    background: rgba(255,255,255,0.97);
    border-radius: 18px;
    overflow: hidden;
    position: relative;
    z-index: 1;
    transition: transform 0.2s ease;
    touch-action: pan-y;
  }
  /* ─ Kart içi ─ */
  .card-main-row {
    display: flex;
    gap: 0;
  }
  .card-img-box {
    width: 180px;
    min-width: 180px;
    flex-shrink: 0;
    background: #f8f8f8;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #f0f0f0;
  }
  .card-img-box img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
  .card-info {
    flex: 1;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .card-bottom {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-top: 6px;
    gap: 8px;
  }
  /* ─── Scanner Modal ─── */
  .scanner-overlay {
    position: fixed;
    inset: 0;
    z-index: 300;
    background: rgba(0,0,0,0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .scanner-header {
    position: absolute;
    top: 0; left: 0; right: 0;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
  }
  .scanner-title {
    color: white;
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    flex: 1;
    text-shadow: 0 1px 4px rgba(0,0,0,0.6);
  }
  .scanner-close {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    color: white;
    border-radius: 50%;
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 16px;
    flex-shrink: 0;
  }
  .scanner-flip {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    color: white;
    border-radius: 50%;
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 15px;
    flex-shrink: 0;
  }
  .scanner-video-wrap {
    position: relative;
    width: min(94vw, 440px);
    aspect-ratio: 1 / 1;
    border-radius: 20px;
    overflow: hidden;
    background: #111;
  }
  .scanner-video-wrap video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  /* Tarama çerçevesi köşeleri */
  .scanner-frame {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .scanner-frame::before,
  .scanner-frame::after {
    content: '';
    position: absolute;
    width: 52px; height: 52px;
    border-color: #c53030;
    border-style: solid;
  }
  .scanner-frame::before {
    top: 18px; left: 18px;
    border-width: 4px 0 0 4px;
    border-radius: 6px 0 0 0;
  }
  .scanner-frame::after {
    top: 18px; right: 18px;
    border-width: 4px 4px 0 0;
    border-radius: 0 6px 0 0;
  }
  .scanner-frame-bottom {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .scanner-frame-bottom::before,
  .scanner-frame-bottom::after {
    content: '';
    position: absolute;
    width: 52px; height: 52px;
    border-color: #c53030;
    border-style: solid;
  }
  .scanner-frame-bottom::before {
    bottom: 18px; left: 18px;
    border-width: 0 0 4px 4px;
    border-radius: 0 0 0 6px;
  }
  .scanner-frame-bottom::after {
    bottom: 18px; right: 18px;
    border-width: 0 4px 4px 0;
    border-radius: 0 0 6px 0;
  }
  /* Tarama çizgisi animasyonu */
  @keyframes scanLine {
    0%   { top: 14%; opacity: 1; }
    50%  { top: 82%; opacity: 1; }
    100% { top: 14%; opacity: 1; }
  }
  .scanner-line {
    position: absolute;
    left: 14%; right: 14%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #c53030, transparent);
    animation: scanLine 2s ease-in-out infinite;
    border-radius: 2px;
  }
  .scanner-hint {
    margin-top: 20px;
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    text-align: center;
    max-width: 300px;
  }
  .scanner-error {
    color: #fc8181;
    font-size: 14px;
    text-align: center;
    padding: 0 24px;
    margin-top: 16px;
    line-height: 1.5;
  }
  /* ─── MOBİL ─── */
  @media (max-width: 480px) {
    .fiyat-wrap { background-attachment: scroll; padding: 18px 10px 70px; }
    .fiyat-input-wrap input { padding: 11px 46px 11px 14px; font-size: 15px; }
    .fiyat-search button.btn-add { padding: 11px 16px; font-size: 14px; }
    .btn-clear span, .btn-send span { display: none; }
    .btn-clear, .btn-send { padding: 7px 11px; }
    .card-main-row { flex-direction: column; }
    .card-img-box {
      width: 100%; min-width: unset;
      border-right: none; border-bottom: 1px solid #f0f0f0;
    }
    .card-img-box img { width: 100%; height: 180px; object-fit: cover; }
    .card-info { padding: 12px 14px; }
    .cart-total { padding: 12px 16px; }
    .scanner-video-wrap { width: 96vw; aspect-ratio: 3/4; }
  }
  @media (max-width: 360px) {
    .card-bottom { gap: 6px; }
  }
`;

/* ═══════════════════════════════════════════════════════
   BARCODE SCANNER MODAL
═══════════════════════════════════════════════════════ */
interface ScannerModalProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

function BarcodeScannerModal({ onDetected, onClose }: ScannerModalProps) {
  const videoRef      = useRef<HTMLVideoElement>(null);
  const controlsRef   = useRef<{ stop: () => void } | null>(null);
  const onDetectedRef = useRef(onDetected);
  const [error, setError]       = useState('');
  const [cameras, setCameras]   = useState<MediaDeviceInfo[]>([]);
  const [camIndex, setCamIndex] = useState(0);
  const detectedRef             = useRef(false);

  useEffect(() => { onDetectedRef.current = onDetected; }, [onDetected]);

  function stopCamera() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    const video = videoRef.current;
    if (video?.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
    BrowserMultiFormatReader.releaseAllStreams();
  }

  const startScanning = useCallback(async (deviceId?: string, cancelled?: { current: boolean }) => {
    if (!videoRef.current) return;
    setError('');

    try {
      stopCamera();
      // OS'un stream'i tam serbest bırakması için bekle
      await new Promise(r => setTimeout(r, 150));
      if (cancelled?.current) return;

      const reader = new BrowserMultiFormatReader();
      const constraints: MediaTrackConstraints = deviceId
        ? { deviceId: { exact: deviceId } }
        : { facingMode: 'environment' };

      const controls = await reader.decodeFromConstraints(
        { video: constraints },
        videoRef.current,
        (result, err) => {
          if (result && !detectedRef.current) {
            detectedRef.current = true;
            onDetectedRef.current(result.getText());
          }
          if (err && !(err instanceof NotFoundException)) {
            console.warn('[scanner]', err);
          }
        }
      );

      // StrictMode cleanup çalıştıysa controls'ü hemen durdur
      if (cancelled?.current) {
        controls.stop();
        BrowserMultiFormatReader.releaseAllStreams();
      } else {
        controlsRef.current = controls;
      }
    } catch (e: unknown) {
      if (cancelled?.current) return;
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
        setError('Kamera izni reddedildi. Lütfen tarayıcı ayarlarından kamera iznini verin.');
      } else if (msg.toLowerCase().includes('notfound') || msg.toLowerCase().includes('devicenotfound')) {
        setError('Kamera bulunamadı. Cihazınızda kamera olduğundan emin olun.');
      } else {
        setError('Kamera başlatılamadı: ' + msg);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cancelled = { current: false };

    BrowserMultiFormatReader.listVideoInputDevices()
      .then(devices => {
        if (cancelled.current) return;
        setCameras(devices);
        const backIdx = devices.findIndex(d =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('arka') ||
          d.label.toLowerCase().includes('environment')
        );
        const idx = backIdx >= 0 ? backIdx : 0;
        setCamIndex(idx);
        startScanning(devices[idx]?.deviceId, cancelled);
      })
      .catch(() => { if (!cancelled.current) startScanning(undefined, cancelled); });

    document.body.style.overflow = 'hidden';

    return () => {
      cancelled.current = true;
      stopCamera();
      document.body.style.overflow = '';
    };
  }, []);

  function flipCamera() {
    if (cameras.length < 2) return;
    const next = (camIndex + 1) % cameras.length;
    setCamIndex(next);
    detectedRef.current = false;
    stopCamera();
    setTimeout(() => startScanning(cameras[next].deviceId), 300);
  }

  return (
    <div className="scanner-overlay">
      <div className="scanner-header">
        <button className="scanner-flip" onClick={flipCamera} title="Kamera değiştir"
          style={{ visibility: cameras.length >= 2 ? 'visible' : 'hidden' }}>
          <i className="fa-solid fa-rotate" />
        </button>
        <span className="scanner-title">Barkod veya QR kodu kameraya tutun</span>
        <button className="scanner-close" onClick={onClose} title="Kapat">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {error ? (
        <div className="scanner-error">
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
          {error}
        </div>
      ) : (
        <>
          <div className="scanner-video-wrap">
            <video ref={videoRef} muted playsInline autoPlay />
            <div className="scanner-frame" />
            <div className="scanner-frame-bottom" />
            <div className="scanner-line" />
          </div>
          <p className="scanner-hint">
            Barkodu çerçeve içinde ortalayın. Tespit edilince otomatik kapanır.
          </p>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function FiyatgorClient() {
  const [barkod, setBarkod]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [notFound, setNotFound]       = useState(false);
  const [licenseError, setLicenseError] = useState(false);
  const [cart, setCart]               = useState<CartItem[]>([]);
  const [magazaStok, setMagazaStok]   = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const inputRef                      = useRef<HTMLInputElement>(null);
  const magazaStokRef                 = useRef(magazaStok);

  useEffect(() => { magazaStokRef.current = magazaStok; }, [magazaStok]);
  useEffect(() => { if (!loading) inputRef.current?.focus(); }, [loading]);

  async function searchWithCode(kod: string) {
    const trimmed = kod.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setNotFound(false);
    setLicenseError(false);

    const MAX_ATTEMPTS = 3;
    let data: Record<string, unknown> | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch('/api/fiyatgor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barkod_kodu: trimmed, magaza_stok: magazaStokRef.current ? '1' : '0' }),
        });
        const json = await res.json();
        if (json && !json.error) {
          data = json;
          break;
        }
        // Hata döndü; son deneme değilse kısa bekle ve tekrar dene
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(r => setTimeout(r, 1200));
        }
      } catch {
        // Ağ/timeout hatası; son deneme değilse kısa bekle ve tekrar dene
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(r => setTimeout(r, 1200));
        }
      }
    }

    setLoading(false);
    setBarkod('');

    if (!data) {
      setLicenseError(true);
      return;
    }

    let options: UrunRow[] = [];
    if (data.ROW) {
      const r = data.ROW;
      options = Array.isArray(r) ? r : [r];
    } else {
      const keys = Object.keys(data).filter(k => !isNaN(Number(k))).sort((a, b) => +a - +b);
      if (keys.length === 0) { setNotFound(true); return; }
      options = keys.map(k => data[k] as UrunRow);
    }

    const uid = trimmed + '_' + Date.now();
    const existing = cart.find(
      c => c.product.BARKOD === options[0].BARKOD &&
           c.product.STOKACIKLAMA === options[0].STOKACIKLAMA
    );
    if (existing) {
      setCart(prev => {
        const updated = prev.map(c =>
          c.uid === existing.uid ? { ...c, qty: c.qty + 1 } : c
        );
        const idx = updated.findIndex(c => c.uid === existing.uid);
        if (idx > 0) {
          const [item] = updated.splice(idx, 1);
          return [item, ...updated];
        }
        return updated;
      });
    } else {
      setCart(prev => [{ uid, product: options[0], options, qty: 1 }, ...prev]);
    }
  }

  function handleManualSearch() {
    searchWithCode(barkod);
  }

  function handleScanned(code: string) {
    setScannerOpen(false);
    searchWithCode(code);
  }

  function changeQty(uid: string, delta: number) {
    setCart(prev =>
      prev.map(c => c.uid === uid ? { ...c, qty: Math.max(0, c.qty + delta) } : c)
          .filter(c => c.qty > 0)
    );
  }
  function removeItem(uid: string) { setCart(prev => prev.filter(c => c.uid !== uid)); }
  function changeStore(uid: string, b: string) {
    setCart(prev => prev.map(c => {
      if (c.uid !== uid) return c;
      const found = c.options.find(o => o.BARKOD === b);
      return found ? { ...c, product: found } : c;
    }));
  }

  const cartTotal = cart.reduce((s, c) => s + Number(c.product.SONFIYAT) * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <>
      <style>{styles}</style>

      {/* Scanner modal */}
      {scannerOpen && (
        <BarcodeScannerModal
          onDetected={handleScanned}
          onClose={() => setScannerOpen(false)}
        />
      )}

      <div className="fiyat-wrap" style={{ backgroundImage: "url('/fiyatgor-bg.jpg')" }}>

        {/* Loading */}
        {loading && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            backgroundColor: 'rgba(0,0,0,0.38)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: 'white', borderRadius: 16, padding: '28px 44px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
              <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 34, color: '#c53030' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>Sorgulanıyor...</span>
            </div>
          </div>
        )}

        {/* Logo */}
        <Image src="/fiyatgor-logo.png" width={300} height={100} alt="Lizay"
          style={{ width: 'clamp(110px, 14vw, 220px)', height: 'auto', marginBottom: 22 }} />

        {/* Arama */}
        <div className="fiyat-search">
          <div className="fiyat-input-wrap">
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              value={barkod}
              onChange={e => { setBarkod(e.target.value); setNotFound(false); setLicenseError(false); }}
              onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
              placeholder="Barkod okutun veya girin..."
              autoFocus
            />
            <button
              className="btn-camera"
              onClick={() => setScannerOpen(true)}
              disabled={loading}
              title="Kamera ile tara"
            >
              <i className="fa-solid fa-camera" />
            </button>
          </div>
          <button className="btn-add" onClick={handleManualSearch} disabled={loading}>
            <i className="fa-solid fa-barcode" style={{ marginRight: 6 }} />
            Ekle
          </button>
        </div>

        {/* Mağaza stok filtresi */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8,
          cursor: 'pointer', marginBottom: 4,
          color: 'rgba(255,255,255,0.9)',
          fontSize: 13, fontWeight: 500,
          textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          userSelect: 'none',
          width: '100%', maxWidth: 520, justifyContent: 'flex-start',
        }}>
          <input
            type="checkbox"
            checked={magazaStok}
            onChange={e => setMagazaStok(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#c53030', cursor: 'pointer' }}
          />
          Bulunduğu mağaza stoklarını göster
        </label>

        {/* Bulunamadı */}
        {notFound && (
          <div style={{
            marginTop: 10,
            backgroundColor: 'rgba(254,215,215,0.97)', color: '#742a2a',
            padding: '10px 18px', borderRadius: 10,
            fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="fa-solid fa-triangle-exclamation" />
            Bu barkoda ait ürün bulunamadı.
          </div>
        )}

        {/* Lisans hatası */}
        {licenseError && (
          <div style={{
            marginTop: 10,
            backgroundColor: 'rgba(255,237,213,0.97)', color: '#7c2d12',
            padding: '10px 18px', borderRadius: 10,
            fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8,
            maxWidth: 520, width: '100%',
          }}>
            <i className="fa-solid fa-clock-rotate-left" />
            Lisans sayısı aşıldı, tekrar deneyebilir misiniz?
          </div>
        )}

        {/* ─── Sepet ─── */}
        {cart.length > 0 && (
          <div style={{ width: '100%', maxWidth: 820, marginTop: 20 }}>

            {/* Başlık + butonlar */}
            <div className="cart-header">
              <span style={{
                color: 'white', fontWeight: 700, fontSize: 16,
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <i className="fa-solid fa-cart-shopping" />
                Sepet
                <span style={{
                  background: '#c53030', color: 'white',
                  borderRadius: 20, padding: '1px 9px', fontSize: 12, fontWeight: 700,
                }}>{cartCount}</span>
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-clear" onClick={() => setCart([])}>
                  <i className="fa-solid fa-trash" /><span>Sepeti Temizle</span>
                </button>
                <button className="btn-send" disabled>
                  <i className="fa-solid fa-paper-plane" /><span>CANİAS&apos;a Gönder</span>
                </button>
              </div>
            </div>

            {/* ── TOPLAM — ÜSTTE ── */}
            <div className="cart-total">
              <div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {cartCount} ürün · {cart.length} kalem
                </div>
                <div style={{ fontSize: 11, color: '#aaa' }}>← sola kaydırarak ürün silebilirsiniz</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#c53030', letterSpacing: '-0.5px' }}>
                {fmt(cartTotal)} ₺
              </div>
            </div>

            {/* ── Kartlar — en son eklenen en üstte ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cart.map(item => (
                <CartCard
                  key={item.uid}
                  item={item}
                  onQty={d => changeQty(item.uid, d)}
                  onRemove={() => removeItem(item.uid)}
                  onStoreChange={b => changeStore(item.uid, b)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Boş */}
        {cart.length === 0 && !notFound && (
          <div style={{
            marginTop: 40, color: 'rgba(255,255,255,0.65)',
            textAlign: 'center', fontSize: 15,
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}>
            <i className="fa-solid fa-barcode"
              style={{ fontSize: 44, display: 'block', marginBottom: 12, opacity: 0.5 }} />
            Barkod okutun veya girerek ürün ekleyin
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   CART CARD — swipe to delete
═══════════════════════════════════════════════════════ */
interface CartCardProps {
  item: CartItem;
  onQty: (delta: number) => void;
  onRemove: () => void;
  onStoreChange: (barkod: string) => void;
}

const SNAP_OPEN  = -80;
const SNAP_CLOSE = -30;

function CartCard({ item, onQty, onRemove, onStoreChange }: CartCardProps) {
  const { product, options, qty } = item;
  const unitPrice  = Number(product.SONFIYAT);
  const totalPrice = unitPrice * qty;
  const hasOptions = options.length > 1;

  const [offset, setOffset]     = useState(0);
  const startX    = useRef(0);
  const startOff  = useRef(0);
  const dragging  = useRef(false);

  const f = (n: number) =>
    new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  function onTouchStart(e: React.TouchEvent) {
    startX.current   = e.touches[0].clientX;
    startOff.current = offset;
    dragging.current = true;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging.current) return;
    const dx  = e.touches[0].clientX - startX.current;
    const raw = startOff.current + dx;
    const clamped = Math.min(0, Math.max(SNAP_OPEN, raw));
    setOffset(clamped);
  }

  function onTouchEnd() {
    dragging.current = false;
    if (offset < SNAP_CLOSE) {
      setOffset(SNAP_OPEN);
    } else {
      setOffset(0);
    }
  }

  function onMouseDown(e: React.MouseEvent) {
    startX.current   = e.clientX;
    startOff.current = offset;
    dragging.current = true;
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx  = e.clientX - startX.current;
    const raw = startOff.current + dx;
    setOffset(Math.min(0, Math.max(SNAP_OPEN, raw)));
  }
  function onMouseUp() {
    dragging.current = false;
    if (offset < SNAP_CLOSE) setOffset(SNAP_OPEN);
    else setOffset(0);
  }

  const deleteReveal = Math.abs(offset);

  const badges = [
    product.GOLDK   ? { icon: 'fa-ring',        label: product.GOLDK }         : null,
    product.AGIRLIK ? { icon: 'fa-weight-scale', label: `${product.AGIRLIK} gr` } : null,
    toStr(product.COLORSTONE)
      ? { icon: 'fa-gem', label: toStr(product.COLORSTONE) } : null,
  ].filter(Boolean);

  return (
    <div className="swipe-wrapper">
      <div
        className="swipe-delete-btn"
        style={{ opacity: deleteReveal / 80 }}
        onClick={() => { setOffset(0); onRemove(); }}
      >
        <i className="fa-solid fa-trash-can" />
        <span>SİL</span>
      </div>

      <div
        className="swipe-card-inner"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div className="card-main-row">

          <div className="card-img-box">
            {product.IMGBASE64
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={product.IMGBASE64} alt={product.URUNADI} draggable={false} />
              : <i className="fa-solid fa-gem" style={{ fontSize: 38, color: '#ccc' }} />
            }
          </div>

          <div className="card-info">

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {Number(product.DIAMOND) > 0 ? `${product.DIAMOND} Ct ` : ''}{product.URUNADI}
                </div>
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{product.BARKOD}</div>
              </div>
              <button
                onClick={() => onRemove()}
                title="Kaldır"
                style={{
                  background: 'none', border: 'none', color: '#ddd',
                  cursor: 'pointer', fontSize: 18, padding: '0 2px', flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e53e3e')}
                onMouseLeave={e => (e.currentTarget.style.color = '#ddd')}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Rozetler (sol) + Fiyat (sağ) — aynı satır */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, marginTop: 6, paddingTop: 8, borderTop: '1px solid #f2f2f2' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 7px' }}>
                {badges.map((b, i) => b && (
                  <span key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12, color: '#555', background: '#f4f4f4',
                    borderRadius: 6, padding: '3px 9px',
                  }}>
                    <i className={`fa-solid ${b.icon}`} style={{ fontSize: 10, color: '#999' }} />
                    {b.label}
                  </span>
                ))}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 1 }}>
                  {qty > 1 ? `${f(unitPrice)} ₺ × ${qty}` : 'Birim Fiyat'}
                </div>
                <div style={{ fontSize: 21, fontWeight: 800, color: '#c53030', lineHeight: 1 }}>
                  {f(totalPrice)} ₺
                </div>
              </div>
            </div>

            <div className="card-bottom">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => onQty(-1)}
                  style={{
                    width: 40, height: 40,
                    borderRadius: '10px 0 0 10px',
                    border: '1.5px solid #e2e2e2', borderRight: 'none',
                    background: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666',
                  }}
                >
                  <i className="fa-solid fa-minus" style={{ fontSize: 12 }} />
                </button>
                <div style={{
                  width: 46, height: 40,
                  border: '1.5px solid #e2e2e2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 15, color: '#1a1a2e', background: '#fafafa',
                }}>
                  {qty}
                </div>
                <button
                  onClick={() => onQty(+1)}
                  style={{
                    width: 40, height: 40,
                    borderRadius: '0 10px 10px 0',
                    border: '1.5px solid #e2e2e2', borderLeft: 'none',
                    background: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666',
                  }}
                >
                  <i className="fa-solid fa-plus" style={{ fontSize: 12 }} />
                </button>
              </div>
            </div>

          </div>
        </div>

        <div style={{
          borderTop: '1px solid #f0f0f0', padding: '9px 14px',
          display: 'flex', alignItems: 'center', gap: 9,
          background: '#fafafa',
        }}>
          <i className="fa-solid fa-store" style={{ color: '#bbb', fontSize: 12, flexShrink: 0 }} />
          {hasOptions ? (
            <select
              value={product.BARKOD}
              onChange={e => onStoreChange(e.target.value)}
              style={{
                flex: 1, padding: '6px 10px',
                borderRadius: 8, border: '1px solid #e0e0e0',
                fontSize: 13, color: '#333', background: 'white',
                cursor: 'pointer', outline: 'none', minWidth: 0,
              }}
            >
              {options.map(o => (
                <option key={o.BARKOD} value={o.BARKOD}>
                  {o.STOKACIKLAMA} — {new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2 }).format(Number(o.SONFIYAT))} ₺
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: 12, color: '#999' }}>
              {product.STOKACIKLAMA || 'Mağaza bilgisi yok'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
