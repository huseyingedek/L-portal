import { SessionOptions } from 'iron-session';

export interface SessionData {
  login: number;
  usern: string;
  // Ürün Takip - bayi oturumu
  bayi_firma_ad?: string;
  bayi_kisi_tel?: string;
  bayi_kisi_oncelik?: number;
  bayi_kisi_ad_soyad?: string;
  bayi_kisi_eposta?: string;
  // Bayi Ödemeleri - ayrı bayi oturumu
  odeme_firma_ad?: string;
  odeme_kisi_tel?: string;
  odeme_kisi_oncelik?: number;
  odeme_kisi_ad_soyad?: string;
  odeme_kisi_eposta?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD || 'lizay-portal-gizli-anahtar-en-az-32-karakter-olmali',
  cookieName: 'lizay_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7200,
  },
};
