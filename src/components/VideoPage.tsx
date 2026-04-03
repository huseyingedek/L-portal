import PageShell from './PageShell';

interface Props {
  title: string;
  videoSrc: string;
}

export default function VideoPage({ title, videoSrc }: Props) {
  return (
    <PageShell>
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '28px 20px' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>
          {title}
        </h1>

        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          padding: 16,
        }}>
          <video width="800" height="480" controls style={{ maxWidth: '100%', borderRadius: 10, display: 'block' }}>
            <source src={videoSrc} type="video/mp4" />
            Tarayıcınız videoyu desteklemiyor.
          </video>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 20 }}>
          © <strong>Lizay Pırlanta</strong> — IAS Eğitim
        </p>
      </main>
    </PageShell>
  );
}
