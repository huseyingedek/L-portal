import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import VideoPage from '@/components/VideoPage';

export default async function Page() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');
  return <VideoPage title="Banko Aktarımları" videoSrc="/ias-vids/LIZINV01-kullanimi.mp4" />;
}
