import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import UrunTakipFiyatgorClient from './UrunTakipFiyatgorClient';

export default async function UrunTakipFiyatgorPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.bayi_firma_ad) {
    redirect('/urun-takip');
  }

  return <UrunTakipFiyatgorClient firmaAd={session.bayi_firma_ad} />;
}
