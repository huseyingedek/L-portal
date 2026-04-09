import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import FiyatgorClient from '@/app/fiyatgor/FiyatgorClient';

export default async function UrunTakipFiyatgorPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.bayi_firma_ad) {
    redirect('/urun-takip');
  }

  return <FiyatgorClient />;
}
