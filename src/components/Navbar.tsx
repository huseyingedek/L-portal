'use client';

import Link from 'next/link';

interface NavbarProps {
  extraLinks?: React.ReactNode;
  showEditLink?: React.ReactNode;
  backButton?: boolean;
  showIasLinks?: boolean;
}

const IAS_LINKS = (
  <div className="flex items-center gap-0 text-xs" style={{ color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
    <a
      href="http://176.236.6.140:8099/caniasout.jnlp"
      target="_blank" rel="noreferrer"
      className="transition-colors hover:text-white"
      style={{ color: 'rgba(255,255,255,0.55)' }}
    >
      IAS Dış İp: 176.236.6.140:8099
    </a>
    <span className="mx-2" style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>
    <a
      href="http://192.168.1.50:8099/canias.jnlp"
      target="_blank" rel="noreferrer"
      className="transition-colors hover:text-white"
      style={{ color: 'rgba(255,255,255,0.55)' }}
    >
      IAS İç İp: 192.168.1.50:8099
    </a>
    <span className="mx-2" style={{ color: 'rgba(255,255,255,0.25)' }}>|</span>
    <a
      href="https://media.ias.com.tr/java8/windows/jre-8u191-windows-x64.exe"
      target="_blank" rel="noreferrer"
      className="transition-colors hover:text-white"
      style={{ color: 'rgba(255,255,255,0.55)' }}
    >
      JAVA
    </a>
  </div>
);

export default function Navbar({
  extraLinks,
  showEditLink,
  backButton = false,
  showIasLinks = false,
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
        {showIasLinks && <div className="hidden md:block">{IAS_LINKS}</div>}
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
