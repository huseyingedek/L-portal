import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import SatisEkleClient from './SatisEkleClient';

export default async function SatisEklePage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.bayi_firma_ad) {
    redirect('/urun-takip');
  }

  return <SatisEkleClient firmaAd={session.bayi_firma_ad} />;
}
