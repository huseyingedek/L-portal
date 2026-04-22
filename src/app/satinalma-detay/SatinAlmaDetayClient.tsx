'use client';

interface PurchaseOrder {
  id: string;
  supplierName: string;
  date: string;
  items: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'completed';
}

// Örnek veriler
const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'SAT-001', supplierName: 'Premium Jewelry Ltd.', date: '2026-04-17', items: 30, totalAmount: 68250.00, status: 'pending' },
  { id: 'SAT-002', supplierName: 'Altın Merkezi A.Ş.', date: '2026-04-16', items: 45, totalAmount: 125800.00, status: 'approved' },
  { id: 'SAT-003', supplierName: 'Gümüş Eşya Ltd.', date: '2026-04-15', items: 20, totalAmount: 42500.00, status: 'completed' },
  { id: 'SAT-004', supplierName: 'Kristal Tasarım Inc.', date: '2026-04-14', items: 15, totalAmount: 31200.00, status: 'pending' },
  { id: 'SAT-005', supplierName: 'Elmas Alanı Ltd.', date: '2026-04-13', items: 50, totalAmount: 185000.00, status: 'approved' },
  { id: 'SAT-006', supplierName: 'Takı Dünyası A.Ş.', date: '2026-04-12', items: 25, totalAmount: 58900.00, status: 'completed' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const styles = `
  .satinalma-detay-wrap {
    min-height: calc(100vh - 52px);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 28px 14px 60px;
    margin: 0 auto;
  }

  .satinalma-detay-container {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  /* ─── HEADER ─── */
  .satinalma-detay-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    gap: 20px;
  }

  .satinalma-detay-title {
    font-size: 28px;
    font-weight: 700;
    color: #f5eaee;
    margin: 0;
    letter-spacing: -0.5px;
  }

  /* ─── TABLE SECTION ─── */
  .satinalma-detay-table-section {
    background: linear-gradient(160deg, #421830 0%, #351226 100%);
    border: 1px solid rgba(214,48,80,0.15);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }

  .satinalma-detay-table {
    width: 100%;
    border-collapse: collapse;
  }

  .satinalma-detay-table thead {
    background: linear-gradient(135deg, rgba(214,48,80,0.15) 0%, rgba(214,48,80,0.08) 100%);
    border-bottom: 2px solid rgba(214,48,80,0.2);
  }

  .satinalma-detay-table th {
    padding: 16px 20px;
    text-align: left;
    color: #f5eaee;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    border-right: 1px solid rgba(214,48,80,0.1);
  }

  .satinalma-detay-table th:last-child {
    border-right: none;
  }

  .satinalma-detay-table tbody tr {
    border-bottom: 1px solid rgba(214,48,80,0.1);
    transition: all 0.2s ease;
  }

  .satinalma-detay-table tbody tr:hover {
    background: rgba(214,48,80,0.08);
  }

  .satinalma-detay-table td {
    padding: 16px 20px;
    color: #f5eaee;
    font-size: 14px;
    border-right: 1px solid rgba(214,48,80,0.1);
  }

  .satinalma-detay-table td:last-child {
    border-right: none;
  }

  .supplier-name {
    font-weight: 600;
    color: #f59e0b;
  }

  .order-date {
    color: #8a6070;
    font-size: 13px;
  }

  .order-items {
    background: rgba(245,158,11,0.15);
    color: #f59e0b;
    padding: 4px 8px;
    border-radius: 6px;
    display: inline-block;
    font-weight: 600;
    font-size: 13px;
  }

  .order-total {
    font-weight: 700;
    color: #f59e0b;
    font-size: 15px;
  }

  /* ─── STATUS BADGE ─── */
  .status-badge {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2px;
    display: inline-block;
  }

  .status-pending {
    background: rgba(245,158,11,0.2);
    color: #f59e0b;
  }

  .status-approved {
    background: rgba(34,197,94,0.2);
    color: #86efac;
  }

  .status-completed {
    background: rgba(99,102,241,0.2);
    color: #818cf8;
  }

  /* ─── EMPTY STATE ─── */
  .satinalma-detay-empty {
    padding: 40px 20px;
    text-align: center;
    color: #8a6070;
  }

  .satinalma-detay-empty p {
    font-size: 16px;
    margin: 0;
  }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 768px) {
    .satinalma-detay-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .satinalma-detay-title {
      font-size: 24px;
    }
  }

  @media (max-width: 640px) {
    .satinalma-detay-wrap {
      padding: 16px 12px 60px;
    }

    .satinalma-detay-table {
      font-size: 12px;
    }

    .satinalma-detay-table th,
    .satinalma-detay-table td {
      padding: 12px 10px;
    }

    .supplier-name {
      font-size: 13px;
    }

    .order-total {
      font-size: 13px;
    }
  }
`;

export default function SatinAlmaDetayClient() {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'approved':
        return 'Onaylandı';
      case 'completed':
        return 'Tamamlandı';
      default:
        return '';
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="satinalma-detay-wrap">
        <div className="satinalma-detay-container">
          {/* ─── HEADER ─── */}
          <div className="satinalma-detay-header">
            <h1 className="satinalma-detay-title">🛒 SATIN ALMA SİPARİŞLERİ</h1>
          </div>

          {/* ─── TABLE ─── */}
          <div className="satinalma-detay-table-section">
            {mockPurchaseOrders.length > 0 ? (
              <table className="satinalma-detay-table">
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Tedarikçi Adı</th>
                    <th style={{ width: '15%' }}>Tarih</th>
                    <th style={{ width: '12%' }}>Ürün Adedi</th>
                    <th style={{ width: '18%' }}>Toplam Tutar</th>
                    <th style={{ width: '35%' }}>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPurchaseOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="supplier-name">{order.supplierName}</td>
                      <td className="order-date">{new Date(order.date).toLocaleDateString('tr-TR')}</td>
                      <td>
                        <span className="order-items">{order.items} ürün</span>
                      </td>
                      <td className="order-total">{fmt(order.totalAmount)}₺</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="satinalma-detay-empty">
                <p>❌ Kayıtlı satın alma siparişi bulunmamaktadır.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
