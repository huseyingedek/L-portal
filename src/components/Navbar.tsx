'use client';

import Link from 'next/link';

interface NavbarProps {
  extraLinks?: React.ReactNode;
  showEditLink?: React.ReactNode;
  backButton?: boolean;
}


export default function Navbar({
  extraLinks,
  showEditLink,
  backButton = false,
}: NavbarProps) {

  const logo = (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#d63050,#a82040)' }}
      >
        <i className="fa-solid fa-gem text-white" style={{ fontSize: 12 }} />
      </div>
      <span className="font-bold text-sm tracking-wide" style={{ color: 'var(--nav-text)' }}>
        Lizay
      </span>
    </Link>
  );

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-5 h-13"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderBottom: '1px solid var(--nav-border)',
        height: 52,
      }}
    >
      {/* Sol */}
      <div className="flex items-center gap-4">
        {logo}
      </div>

      {/* Sağ */}
      <div className="flex items-center gap-2">
        {showEditLink}
        {extraLinks}

        {backButton && (
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              color: 'rgba(255,255,255,0.65)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <i className="fa fa-chevron-left" style={{ fontSize: 10 }} />
            Geri Dön
          </button>
        )}
      </div>
    </nav>
  );
}
