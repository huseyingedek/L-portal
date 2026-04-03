interface Props {
  message?: string;
}

export default function DbErrorBanner({ message }: Props) {
  return (
    <div
      style={{
        margin: '24px auto',
        maxWidth: 560,
        backgroundColor: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 14,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: 'rgba(239,68,68,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <i className="fa-solid fa-database" style={{ color: '#ef4444', fontSize: 16 }} />
      </div>
      <div>
        <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 14, color: '#fca5a5' }}>
          Veritabanına Bağlanılamadı
        </p>
        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
          {message || 'Sunucu veya veritabanı şu an erişilemiyor. Lütfen birkaç dakika sonra tekrar deneyin.'}
        </p>
      </div>
    </div>
  );
}
