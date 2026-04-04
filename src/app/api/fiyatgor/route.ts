import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { callCaniasService } from '@/lib/canias';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const body = await req.json();
  const barkod_kodu = (body.barkod_kodu || '').trim().toUpperCase();
  const magaza_stok = body.magaza_stok === '1' ? '1' : '0';

  if (!barkod_kodu) {
    return NextResponse.json({ error: 'Barkod boş olamaz' }, { status: 400 });
  }

  let result = await callCaniasService('RetailBatchCheckV2', ['P2000C', barkod_kodu, magaza_stok]);

  // magaza_stok=1 ile hata aldıysak 0 ile tekrar dene
  if (result.status === 'FL' && magaza_stok === '1') {
    result = await callCaniasService('RetailBatchCheckV2', ['P2000C', barkod_kodu, '0']);
  }

  if (result.status === 'FL') {
    return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
  }

  let sonuc_json: Record<string, Record<string, string>> | null;
  try {
    sonuc_json = JSON.parse(result.response);
  } catch {
    return NextResponse.json({ error: 'Veri parse hatası', raw: result.response }, { status: 500 });
  }

  // CANIAS boş/null döndürdüyse bulunamadı say
  if (!sonuc_json || typeof sonuc_json !== 'object') {
    return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
  }

  const ana_data: Record<string, Record<string, string>> = {};

  // PHP test.php — isset($sonuc_json["ROW"]) karşılığı
  if ('ROW' in sonuc_json) {
    // Benzer ürün yok
    for (const [, value] of Object.entries(sonuc_json)) {
      ana_data['ROW'] = ana_data['ROW'] || {};
      ana_data['ROW']['BARKOD'] = barkod_kodu;

      const d1row = String(value['D1TEXT'] || '');
      const d2row = String(value['D2TEXT'] || '');
      if (d2row && d2row !== '') {
        ana_data['ROW']['DIAMOND'] = String(
          parseFloat(d1row.substring(3, 7) || '0') +
          parseFloat(d2row.substring(3, 7) || '0')
        );
      } else {
        ana_data['ROW']['DIAMOND'] = d1row.substring(3, 7).trim();
      }

      ana_data['ROW']['COLORSTONE']    = value['D3TEXT'] || '';
      ana_data['ROW']['URUNADI']       = value['DETCOLOR'] || '';
      ana_data['ROW']['SONFIYAT']      = value['SPRICE'] || '';
      ana_data['ROW']['SABITFIYAT']    = value['SABITFIYAT'] || '';
      ana_data['ROW']['GOLDK']         = value['ISMATGRP'] || '';
      ana_data['ROW']['AGIRLIK']       = value['QUANTITYX'] || '';
      ana_data['ROW']['STOKDURUMU']    = value['ISSTCK'] || '';
      ana_data['ROW']['STOKACIKLAMA']  = value['ISWARE'] || '';
      ana_data['ROW']['MODEL']         = value['MATERIAL'] || '';
      ana_data['ROW']['SPRICECURRENCY']= value['SPRICECURRENCY'] || '';
      ana_data['ROW']['COLORCLARITY']  = d1row.substring(7, 14);

      const picture = (value['PICTURE'] || '')
        .replace('-----BEGIN CERTIFICATE-----', '')
        .replace('-----END CERTIFICATE-----', '');
      ana_data['ROW']['IMGBASE64'] = 'data:image/png;base64,' + picture;
    }
  } else {
    // Benzer ürün var
    for (const [key, value] of Object.entries(sonuc_json)) {
      ana_data[key] = {};
      ana_data[key]['BARKOD'] = value['BARKOD'] || barkod_kodu;

      const d1 = String(value['D1TEXT'] || '');
      const d2 = String(value['D2TEXT'] || '');
      if (d2 && d2 !== '') {
        ana_data[key]['DIAMOND'] = String(
          parseFloat(d1.substring(3, 7) || '0') +
          parseFloat(d2.substring(3, 7) || '0')
        );
      } else {
        ana_data[key]['DIAMOND'] = d1.substring(3, 7).trim();
      }

      ana_data[key]['COLORSTONE']    = value['D3TEXT'] || '';
      ana_data[key]['URUNADI']       = value['DETCOLOR'] || '';
      ana_data[key]['SONFIYAT']      = value['SPRICE'] || '';
      ana_data[key]['SABITFIYAT']    = value['SABITFIYAT'] || '';
      ana_data[key]['GOLDK']         = value['ISMATGRP'] || '';
      ana_data[key]['AGIRLIK']       = value['QUANTITYX'] || '';
      ana_data[key]['STOKDURUMU']    = value['ISSTCK'] || '';
      ana_data[key]['STOKACIKLAMA']  = value['ISWARE'] || '';
      ana_data[key]['MODEL']         = value['MATERIAL'] || '';
      ana_data[key]['SPRICECURRENCY']= value['SPRICECURRENCY'] || '';
      ana_data[key]['COLORCLARITY']  = String(value['D1TEXT'] || '').substring(7, 14);

      const picture = (value['PICTURE'] || '')
        .replace('-----BEGIN CERTIFICATE-----', '')
        .replace('-----END CERTIFICATE-----', '');
      ana_data[key]['IMGBASE64'] = 'data:image/png;base64,' + picture;
    }
  }

  return NextResponse.json(ana_data);
}
