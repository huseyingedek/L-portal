import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import MalKabulClient from './MalKabulClient';
import PageShell from '@/components/PageShell';

export const metadata = {
  title: 'Mal Kabul | Lizay Portal',
};

export default async function MalKabulPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');

  return (
    <PageShell usern={session.usern}>
      <MalKabulClient />
    </PageShell>
  );
}
