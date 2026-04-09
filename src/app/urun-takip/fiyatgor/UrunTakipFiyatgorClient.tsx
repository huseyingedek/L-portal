'use client';

import UrunTakipLayout from '../_components/UrunTakipLayout';
import FiyatgorClient from '@/app/fiyatgor/FiyatgorClient';

export default function UrunTakipFiyatgorClient({ firmaAd }: { firmaAd: string }) {
  return (
    <UrunTakipLayout firmaAd={firmaAd} activeHref="/urun-takip/fiyatgor">
      <FiyatgorClient />
    </UrunTakipLayout>
  );
}
