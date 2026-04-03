import Link from 'next/link';
import Navbar from './Navbar';

export interface SubHubItem {
  href: string;
  title: string;
  desc: string;
  color: string;
  icon?: string;
}

interface Props {
  items: SubHubItem[];
  title?: string;
  backButton?: boolean;
}

export default function SubHub({ items, title, backButton = false }: Props) {
  return (
    <div className="page">
      <header>
        <Navbar backButton={backButton} />
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px' }}>
        {title && (
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              {title}
            </h1>
          </div>
        )}

        <div style={{
          display: 'grid',
          gap: 18,
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        }}>
          {items.map((m) => (
            <Link key={m.href} href={m.href} className="pcard">
              <div className="pcard-icon" style={{ backgroundColor: m.color + '18' }}>
                <div className="pcard-icon-inner" style={{ backgroundColor: m.color }}>
                  <i className={m.icon ?? 'fa-solid fa-layer-group'} />
                </div>
              </div>
              <div className="pcard-body">
                <p className="pcard-title">{m.title}</p>
                <p className="pcard-desc">{m.desc}</p>
              </div>
              <div className="pcard-bar" style={{ backgroundColor: m.color }} />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
