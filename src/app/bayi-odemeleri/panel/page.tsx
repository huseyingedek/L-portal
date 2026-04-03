import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import BayiOdemeleriPanelClient from './BayiOdemeleriPanelClient';

export default async function BayiOdemeleriPanelPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.odeme_firma_ad) {
    redirect('/bayi-odemeleri');
  }

  return <BayiOdemeleriPanelClient firmaAd={session.odeme_firma_ad} />;
}
