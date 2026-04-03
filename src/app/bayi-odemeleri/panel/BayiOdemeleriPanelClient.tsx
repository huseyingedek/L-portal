'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BayiOdemeleriPanelClient({ firmaAd }: { firmaAd: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/bayi-odemeleri/logout', { method: 'POST' });
    router.push('/bayi-odemeleri');
  }

  return (
    <>
      <style>{`
        .card-text { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; }
        .bd-placeholder-img { font-size:1.525rem; text-anchor:middle; user-select:none; font-family:calibri; }
        @media (min-width:768px) { .bd-placeholder-img-lg { font-size:3.5rem; } }
        .bg-light {
          background: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%) !important;
          min-height: calc(100vh - 56px);
        }
        .card { border-radius: 11%; }
        .bd-placeholder-img { border-radius: 18%; }
      `}</style>

      <header>
        <div className="navbar navbar-dark bg-dark shadow-sm">
          <div className="container d-flex justify-content-between">
            <p className="navbar-brand d-flex align-items-center" style={{ margin: 0 }}>
              <strong>Lizay Pırlanta Ürün Takip Sayfası - {firmaAd}</strong>
            </p>
            <p className="navbar-brand d-flex align-items-center" style={{ margin: 0 }}>
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Çıkış
              </button>
            </p>
          </div>
        </div>
      </header>

      <main role="main">
        <div className="album py-5 bg-light">
          <div className="container">
            <div className="row">

              <div className="col-md-4">
                <Link href="/odeme-sayfasi" style={{ textDecoration: 'none' }}>
                  <div className="card mb-4 shadow-sm">
                    <svg className="bd-placeholder-img card-img-top" width="100%" height="225"
                      xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img">
                      <title>IYZICO</title>
                      <rect width="100%" height="100%" fill="#6c00ff" />
                      <text x="50%" y="50%" fill="#eceeef" dy=".3em" textAnchor="middle">IYZICO</text>
                    </svg>
                    <div className="card-body">
                      <p className="card-text" style={{ color: 'black' }}>Iyzico ile Öde</p>
                    </div>
                  </div>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
