'use client';

interface SalesOrder {
  id: string;
  customerName: string;
  date: string;
  items: number;
  totalAmount: number;
  status: 'new' | 'updated' | 'completed';
}

const mockSalesOrders: SalesOrder[] = [
  { id: '001', customerName: 'Ahmet Yılmaz', date: '2026-04-17', items: 3, totalAmount: 9950.00, status: 'updated' },
  { id: '002', customerName: 'Fatma Kaya', date: '2026-04-16', items: 2, totalAmount: 5200.00, status: 'new' },
  { id: '003', customerName: 'Ali Demir', date: '2026-04-15', items: 4, totalAmount: 12850.00, status: 'completed' },
  { id: '004', customerName: 'Zeynep Şahin', date: '2026-04-14', items: 1, totalAmount: 3200.00, status: 'updated' },
  { id: '005', customerName: 'Mehmet Günal', date: '2026-04-13', items: 5, totalAmount: 18500.00, status: 'new' },
  { id: '006', customerName: 'Ayşe Çetin', date: '2026-04-12', items: 2, totalAmount: 6450.00, status: 'completed' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const styles = `
  .liste-wrap {
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

  .liste-container {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  /* ─── HEADER ─── */
  .liste-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    gap: 20px;
  }

  .liste-title {
    font-size: 28px;
    font-weight: 700;
    color: #f5eaee;
    margin: 0;
    letter-spacing: -0.5px;
  }

  /* ─── TABLE SECTION ─── */
  .liste-table-section {
    background: linear-gradient(160deg, #421830 0%, #351226 100%);
    border: 1px solid rgba(214,48,80,0.15);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }

  .liste-table {
    width: 100%;
    border-collapse: collapse;
  }

  .liste-table thead {
    background: linear-gradient(135deg, rgba(214,48,80,0.15) 0%, rgba(214,48,80,0.08) 100%);
    border-bottom: 2px solid rgba(214,48,80,0.2);
  }

  .liste-table th {
    padding: 16px 20px;
    text-align: left;
    color: #f5eaee;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    border-right: 1px solid rgba(214,48,80,0.1);
  }

  .liste-table th:last-child {
    border-right: none;
  }

  .liste-table tbody tr {
    border-bottom: 1px solid rgba(214,48,80,0.1);
    transition: all 0.2s ease;
  }

  .liste-table tbody tr:hover {
    background: rgba(214,48,80,0.08);
  }

  .liste-table tbody tr.updated {
    background: rgba(214,48,80,0.12);
  }

  .liste-table tbody tr.updated:hover {
    background: rgba(214,48,80,0.16);
  }

  .liste-table td {
    padding: 16px 20px;
    color: #f5eaee;
    font-size: 14px;
    border-right: 1px solid rgba(214,48,80,0.1);
  }

  .liste-table td:last-child {
    border-right: none;
  }

  .customer-name {
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

  /* ─── ACTIONS COLUMN ─── */
  .actions-cell {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    background: rgba(214,48,80,0.2);
    color: #f5eaee;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.2px;
    font-family: 'Inter', sans-serif;
  }

  .action-btn:hover {
    background: rgba(214,48,80,0.35);
    box-shadow: 0 2px 8px rgba(214,48,80,0.2);
  }

  .action-btn.edit {
    background: rgba(99,102,241,0.2);
    color: #818cf8;
  }

  .action-btn.edit:hover {
    background: rgba(99,102,241,0.35);
  }

  .action-btn.view {
    background: rgba(34,197,94,0.2);
    color: #86efac;
  }

  .action-btn.view:hover {
    background: rgba(34,197,94,0.35);
  }

  /* ─── EMPTY STATE ─── */
  .liste-empty {
    padding: 40px 20px;
    text-align: center;
    color: #8a6070;
  }

  .liste-empty p {
    font-size: 16px;
    margin: 0;
  }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 768px) {
    .liste-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .liste-title {
      font-size: 24px;
    }
  }

  @media (max-width: 640px) {
    .liste-wrap {
      padding: 16px 12px 60px;
    }

    .liste-table {
      font-size: 12px;
    }

    .liste-table th,
    .liste-table td {
      padding: 12px 10px;
    }

    .actions-cell {
      flex-direction: column;
      gap: 4px;
    }

    .action-btn {
      padding: 6px 8px;
      font-size: 10px;
      width: 100%;
    }

    .customer-name {
      font-size: 13px;
    }

    .order-total {
      font-size: 13px;
    }
  }
`;

export default function SatissiparisiListesiClient() {
  const displayOrders = mockSalesOrders;

  return (
    <>
      <style>{styles}</style>
      <div className="liste-wrap">
        <div className="liste-container">
          {/* ─── HEADER ─── */}
          <div className="liste-header">
            <h1 className="liste-title">📋 SATIŞ SİPARİŞİ LİSTESİ</h1>
          </div>

          {/* ─── TABLE ─── */}
          <div className="liste-table-section">
            {displayOrders.length > 0 ? (
              <table className="liste-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Müşteri Adı</th>
                    <th style={{ width: '15%' }}>Tarih</th>
                    <th style={{ width: '12%' }}>Ürün Adedi</th>
                    <th style={{ width: '18%' }}>Toplam Tutar</th>
                    <th style={{ width: '30%' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {displayOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={order.status === 'updated' ? 'updated' : ''}
                    >
                      <td className="customer-name">{order.customerName}</td>
                      <td className="order-date">{new Date(order.date).toLocaleDateString('tr-TR')}</td>
                      <td>
                        <span className="order-items">{order.items} ürün</span>
                      </td>
                      <td className="order-total">{fmt(order.totalAmount)}₺</td>
                      <td>
                        <div className="actions-cell">
                          <button className="action-btn view">👁 Görüntüle</button>
                          <button className="action-btn edit">✏️ Düzenle</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="liste-empty">
                <p>❌ Kayıtlı satış siparişi bulunmamaktadır.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
