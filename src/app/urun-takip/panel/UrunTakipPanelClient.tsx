'use client';

import Link from 'next/link';
import UrunTakipLayout from '../_components/UrunTakipLayout';

const GOLD = '#F7CA18';

const CARDS = [
  { href: '/urun-takip/fiyatgor',      emoji: '💎', title: 'Fiyat Gör',         desc: 'Barkod ile ürün fiyatı sorgula' },
  { href: '/urun-takip/satis-ekle',    emoji: '➕', title: 'Satış Ekle',         desc: 'Yeni satış kaydı oluştur' },
  { href: '/urun-takip/satis-tablosu', emoji: '📋', title: 'Satışları Listele', desc: 'Tüm satış kayıtlarını görüntüle' },
];

export default function UrunTakipPanelClient({ firmaAd }: { firmaAd: string }) {
  return (
    <UrunTakipLayout firmaAd={firmaAd} activeHref="/urun-takip/panel">
      <style>{`
        .panel-wrap { padding: 24px 16px; }
        .panel-welcome { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .panel-desc { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 24px; }
        .panel-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 14px;
        }
        .panel-card {
          text-decoration: none;
          background: linear-gradient(135deg, #1a1c20, #222428);
          border: 1px solid rgba(247,202,24,0.25);
          border-radius: 14px;
          padding: 20px 16px;
          display: flex; flex-direction: column; gap: 12;
          transition: border-color 0.2s, transform 0.15s, box-shadow 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .panel-card:active {
          transform: scale(0.97);
          border-color: ${GOLD};
        }
        .panel-card-emoji { font-size: 28px; line-height: 1; }
        .panel-card-title { color: #fff; font-weight: 700; font-size: 14px; margin-top: 4px; }
        .panel-card-desc { color: rgba(255,255,255,0.4); font-size: 11px; margin-top: 3px; line-height: 1.4; }

        @media (hover: hover) {
          .panel-card:hover {
            border-color: ${GOLD};
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(247,202,24,0.1);
          }
        }
        @media (max-width: 400px) {
          .panel-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .panel-card { padding: 16px 12px; }
        }
      `}</style>

      <div className="panel-wrap">
        <div className="panel-welcome">
          Hoş geldiniz, <span style={{ color: GOLD }}>{firmaAd}</span>
        </div>
        <div className="panel-desc">Hızlı işlem yapmak için kartları kullanın.</div>

        <div className="panel-grid">
          {CARDS.map(card => (
            <Link key={card.href} href={card.href} className="panel-card">
              <div className="panel-card-emoji">{card.emoji}</div>
              <div>
                <div className="panel-card-title">{card.title}</div>
                <div className="panel-card-desc">{card.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </UrunTakipLayout>
  );
}
