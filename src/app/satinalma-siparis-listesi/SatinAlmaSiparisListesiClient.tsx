'use client';

interface PurchaseOrder {
  id: string;
  customerName: string;
  date: string;
  items: number;
  totalAmount: number;
  status: 'new' | 'updated' | 'completed';
}

const mockOrders: PurchaseOrder[] = [
  { id: '001', customerName: 'Ahmet Yılmaz',  date: '2026-04-17', items: 3, totalAmount: 9950.00,  status: 'updated' },
  { id: '002', customerName: 'Fatma Kaya',    date: '2026-04-16', items: 2, totalAmount: 5200.00,  status: 'new' },
  { id: '003', customerName: 'Ali Demir',     date: '2026-04-15', items: 4, totalAmount: 12850.00, status: 'completed' },
  { id: '004', customerName: 'Zeynep Şahin', date: '2026-04-14', items: 1, totalAmount: 3200.00,  status: 'updated' },
  { id: '005', customerName: 'Mehmet Günal', date: '2026-04-13', items: 5, totalAmount: 18500.00, status: 'new' },
  { id: '006', customerName: 'Ayşe Çetin',  date: '2026-04-12', items: 2, totalAmount: 6450.00,  status: 'completed' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const styles = `
  .sal-wrap {
    min-height: calc(100vh - 52px);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 28px 14px 60px;
  }

  .sal-container {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .sal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    gap: 20px;
  }

  .sal-title {
    font-size: 28px;
    font-weight: 700;
    color: #f5eaee;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .sal-table-section {
    background: linear-gradient(160deg, #421830 0%, #351226 100%);
    border: 1px solid rgba(214,48,80,0.15);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }

  .sal-table {
    width: 100%;
    border-collapse: collapse;
  }

  .sal-table thead {
    background: linear-gradient(135deg, rgba(214,48,80,0.15) 0%, rgba(214,48,80,0.08) 100%);
    border-bottom: 2px solid rgba(214,48,80,0.2);
  }

  .sal-table th {
    padding: 16px 20px;
    text-align: left;
    color: #f5eaee;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    border-right: 1px solid rgba(214,48,80,0.1);
  }

  .sal-table th:last-child { border-right: none; }

  .sal-table tbody tr {
    border-bottom: 1px solid rgba(214,48,80,0.1);
    transition: all 0.2s ease;
  }

  .sal-table tbody tr:hover { background: rgba(214,48,80,0.08); }
  .sal-table tbody tr.updated { background: rgba(214,48,80,0.12); }
  .sal-table tbody tr.updated:hover { background: rgba(214,48,80,0.16); }

  .sal-table td {
    padding: 16px 20px;
    color: #f5eaee;
    font-size: 14px;
    border-right: 1px solid rgba(214,48,80,0.1);
  }

  .sal-table td:last-child { border-right: none; }

  .sal-customer { font-weight: 600; color: #f59e0b; }
  .sal-date     { color: #8a6070; font-size: 13px; }

  .sal-items {
    background: rgba(245,158,11,0.15);
    color: #f59e0b;
    padding: 4px 8px;
    border-radius: 6px;
    display: inline-block;
    font-weight: 600;
    font-size: 13px;
  }

  .sal-total { font-weight: 700; color: #f59e0b; font-size: 15px; }

  .sal-actions { display: flex; gap: 8px; }

  .sal-btn {
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.2px;
    font-family: 'Inter', sans-serif;
  }

  .sal-btn.view {
    background: rgba(34,197,94,0.2);
    color: #86efac;
  }
  .sal-btn.view:hover { background: rgba(34,197,94,0.35); }

  .sal-btn.edit {
    background: rgba(99,102,241,0.2);
    color: #818cf8;
  }
  .sal-btn.edit:hover { background: rgba(99,102,241,0.35); }

  @media (max-width: 768px) {
    .sal-title { font-size: 22px; }
  }

  @media (max-width: 640px) {
    .sal-wrap { padding: 16px 12px 60px; }
    .sal-table th, .sal-table td { padding: 12px 10px; font-size: 12px; }
    .sal-actions { flex-direction: column; gap: 4px; }
    .sal-btn { width: 100%; padding: 6px 8px; font-size: 10px; }
  }
`;

export default function SatinAlmaSiparisListesiClient() {
  return (
    <>
      <style>{styles}</style>
      <div className="sal-wrap">
        <div className="sal-container">

          <div className="sal-header">
            <h1 className="sal-title">📋 SATIN ALMA SİPARİŞ LİSTESİ</h1>
          </div>

          <div className="sal-table-section">
            {mockOrders.length > 0 ? (
              <table className="sal-table">
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
                  {mockOrders.map((order) => (
                    <tr key={order.id} className={order.status === 'updated' ? 'updated' : ''}>
                      <td className="sal-customer">{order.customerName}</td>
                      <td className="sal-date">{new Date(order.date).toLocaleDateString('tr-TR')}</td>
                      <td><span className="sal-items">{order.items} ürün</span></td>
                      <td className="sal-total">{fmt(order.totalAmount)}₺</td>
                      <td>
                        <div className="sal-actions">
                          <button className="sal-btn view">👁 Görüntüle</button>
                          <button className="sal-btn edit">✏️ Düzenle</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#8a6070' }}>
                <p>Kayıtlı satın alma siparişi bulunmamaktadır.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
