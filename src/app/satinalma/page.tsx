import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import SatinAlmaClient from './SatinAlmaClient';
import PageShell from '@/components/PageShell';

export default async function SatinAlmaPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');
  return (
    <PageShell usern={session.usern}>
      <SatinAlmaClient />
    </PageShell>
  );
}
