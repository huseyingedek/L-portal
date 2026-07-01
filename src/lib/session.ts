import { SessionOptions } from 'iron-session';

export interface SessionData {
  login: number;
  usern: string;
  // Musteri kaydi SMS dogrulama
  musteri_kvkk?: string;
  musteri_etk?: string;
  musteri_veriler?: string;
  // Urun Takip - bayi oturumu
  bayi_firma_ad?: string;
  bayi_kisi_tel?: string;
  bayi_kisi_oncelik?: number;
  bayi_kisi_ad_soyad?: string;
  bayi_kisi_eposta?: string;
  // Bayi Odemeleri - ayri bayi oturumu
  odeme_firma_ad?: string;
  odeme_kisi_tel?: string;
  odeme_kisi_oncelik?: number;
  odeme_kisi_ad_soyad?: string;
  odeme_kisi_eposta?: string;
}

// Oturum suresi: 6 saat (sabit). Sure dolunca cerez gecersiz olur,
// sonraki her istekte kullanici login ekranina yonlenir.
const ALTI_SAAT = 6 * 60 * 60;

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD || 'lizay-portal-gizli-anahtar-en-az-32-karakter-olmali',
  cookieName: 'lizay_session',
  ttl: ALTI_SAAT,
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // canli (HTTPS) -> true, yerel dev (http) -> false
    maxAge: ALTI_SAAT,
  },
};
