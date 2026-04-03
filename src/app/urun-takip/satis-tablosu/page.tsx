import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import SatisTablosuClient from './SatisTablosuClient';

export default async function SatisTablosuPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.bayi_firma_ad) {
    redirect('/urun-takip');
  }

  return (
    <SatisTablosuClient
      firmaAd={session.bayi_firma_ad}
      kisiOncelik={session.bayi_kisi_oncelik ?? 3}
    />
  );
}
