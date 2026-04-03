import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions, SessionData } from '@/lib/session';
import db from '@/lib/db';
import PageShell from '@/components/PageShell';
import DbErrorBanner from '@/components/DbErrorBanner';

interface Kayit { id: number; kisi_ad_soyad: string; kisi_gorev: string; kisi_resim: string; kisi_kayit_tarihi: string; kisi_tur: string; }
const IK_ADMINS = ['EALPER', 'SGENC', 'MSAHINBAY', 'IYILMAZ', 'CICIGEN'];

export default async function KisilerPage() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (session.login !== 1) redirect('/');
  if (!IK_ADMINS.includes(session.usern)) redirect('/ik');

  let rows: Kayit[] = [];
  let dbError = false;
  try {
    const [r] = await db.query('SELECT * FROM KAYITLAR ORDER BY id DESC') as [Kayit[], unknown];
    rows = r;
  } catch { dbError = true; }

  return (
    <PageShell usern={session.usern}>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Kişiler</h1>
        {dbError ? <DbErrorBanner /> : (
          <div className="df-table-wrap">
            <table className="df-data-table">
              <thead><tr><th>Fotoğraf</th><th>Ad Soyad</th><th>Görev</th><th>Tür</th><th>Tarih</th></tr></thead>
              <tbody>
                {rows.map(k => (
                  <tr key={k.id}>
                    <td>{k.kisi_resim ? <img src={k.kisi_resim} alt="" style={{ width:40,height:40,borderRadius:'50%',objectFit:'cover' }} /> : <div style={{ width:40,height:40,borderRadius:'50%',backgroundColor:'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center' }}><i className="fa-solid fa-user" style={{ color:'var(--text-muted)' }} /></div>}</td>
                    <td style={{ fontWeight:600 }}>{k.kisi_ad_soyad}</td>
                    <td>{k.kisi_gorev}</td>
                    <td><span style={{ padding:'3px 10px',borderRadius:5,fontSize:11,fontWeight:600,backgroundColor:k.kisi_tur==='ise_alim'?'#ff780022':'#6c00ff22',color:k.kisi_tur==='ise_alim'?'#ff9944':'#a66eff' }}>{k.kisi_tur==='ise_alim'?'İşe Alım':'Atama-Görev'}</span></td>
                    <td style={{ color:'var(--text-muted)',fontSize:12 }}>{new Date(k.kisi_kayit_tarihi).toLocaleDateString('tr-TR')}</td>
                  </tr>
                ))}
                {rows.length===0 && <tr><td colSpan={5} style={{ textAlign:'center',padding:24 }}>Kayıt bulunamadı.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </PageShell>
  );
}
