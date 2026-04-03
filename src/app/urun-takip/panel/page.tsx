import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import UrunTakipPanelClient from './UrunTakipPanelClient';

export default async function UrunTakipPanelPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.bayi_firma_ad) {
    redirect('/urun-takip');
  }

  return <UrunTakipPanelClient firmaAd={session.bayi_firma_ad} />;
}
