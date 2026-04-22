'use client';

import { useState } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
}

// Örnek veriler
const mockCartItems: CartItem[] = [
    { id: '1', name: 'Altın Yüzük - Roza', price: 2450.00, quantity: 2, total: 4900.00 },
    { id: '2', name: 'Gümüş Kolyé', price: 1850.00, quantity: 1, total: 1850.00 },
    { id: '3', name: 'Altın Bilezik - 18K', price: 3200.00, quantity: 1, total: 3200.00 },
];

const fmt = (n: number) =>
    new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const styles = `
  .satis-wrap {
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

  .satis-container {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  /* ─── HEADER ─── */
  .satis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    gap: 20px;
  }

  .satis-title {
    font-size: 28px;
    font-weight: 700;
    color: #f5eaee;
    margin: 0;
    letter-spacing: -0.5px;
  }

.btn-save {
  padding: 12px 22px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #d63050 0%, #a82040 100%);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(214,48,80,0.35);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  white-space: nowrap;
}

  .btn-save:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(214,48,80,0.45);
  }

  .btn-save:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(214,48,80,0.35);
  }

  /* ─── FORM SECTION ─── */
  .satis-form-section {
    background: linear-gradient(160deg, #421830 0%, #351226 100%);
    border: 1px solid rgba(214,48,80,0.15);
    border-radius: 18px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  }

  .satis-form-with-button {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .satis-form-section:hover {
    border-color: rgba(214,48,80,0.3);
    box-shadow: 0 6px 20px rgba(214,48,80,0.15);
  }

  .satis-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  @media (max-width: 768px) {
    .satis-form-grid {
      grid-template-columns: 1fr;
    }
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    font-size: 13px;
    color: #8a6070;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .form-input {
    padding: 14px 16px;
    border-radius: 12px;
    border: 2px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.08);
    color: #f5eaee;
    font-size: 15px;
    outline: none;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s ease;
  }

  .form-input::placeholder {
    color: #8a6070;
  }

  .form-input:focus {
    border-color: #d63050;
    background: rgba(255,255,255,0.12);
    box-shadow: 0 0 0 3px rgba(214,48,80,0.15);
  }

  /* ─── CART ITEMS SECTION ─── */
  .satis-cart-section {
    margin-bottom: 28px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #f5eaee;
    margin: 0 0 12px 0;
    letter-spacing: -0.3px;
    text-transform: uppercase;
  }

  .cart-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 16px;
  }

  .cart-header-title {
    font-size: 16px;
    font-weight: 700;
    color: #f5eaee;
    margin: 0;
    letter-spacing: -0.3px;
    text-transform: uppercase;
  }

.summary-items {
  display: flex;
  gap: 16px;
  background: linear-gradient(160deg, #421830 0%, #351226 100%);
  border: 1px solid rgba(214,48,80,0.15);
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  justify-content: flex-end; /* SAĞA YASLA */
  margin-top: 12px;
}

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .summary-label {
    font-size: 10px;
    color: #8a6070;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  .summary-value {
    font-size: 17px;
    font-weight: 700;
    color: #f59e0b;
  }

  .cart-table {
    background: linear-gradient(160deg, #421830 0%, #351226 100%);
    border: 1px solid rgba(214,48,80,0.15);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  }

  .cart-table:hover {
    border-color: rgba(214,48,80,0.25);
    box-shadow: 0 6px 20px rgba(214,48,80,0.15);
  }

  .cart-table-head {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 16px;
    padding: 18px;
    background: linear-gradient(135deg, rgba(214,48,80,0.15) 0%, rgba(214,48,80,0.08) 100%);
    border-bottom: 2px solid rgba(214,48,80,0.2);
  }

  @media (max-width: 768px) {
    .cart-table-head {
      grid-template-columns: 1fr 1fr;
    }
  }

  .table-header-cell {
    font-size: 12px;
    color: #8a6070;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  .cart-table-body {
    display: flex;
    flex-direction: column;
  }

  .cart-item-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 16px;
    padding: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    align-items: center;
  }

  @media (max-width: 768px) {
    .cart-item-row {
      grid-template-columns: 1fr 1fr;
    }
  }

  .cart-item-row:last-child {
    border-bottom: none;
  }

  .cart-item-name {
    font-size: 14px;
    font-weight: 600;
    color: #f5eaee;
    margin: 0;
  }

  .cart-item-value {
    font-size: 14px;
    color: #f59e0b;
    font-weight: 600;
  }

  .cart-item-total {
    font-size: 15px;
    font-weight: 700;
    color: #f5eaee;
  }

  /* ─── SUMMARY ─── */
  .satis-summary {
    width: 100%;
    max-width: 1120px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(214,48,80,0.15);
    border-radius: 12px;
    padding: 14px 20px;
    display: flex;
    justify-content: flex-end;
    gap: 32px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .summary-label {
    font-size: 12px;
    color: #8a6070;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .summary-value {
    font-size: 18px;
    font-weight: 700;
    color: #f59e0b;
  }

  /* ─── EMPTY STATE ─── */
  .empty-row {
    padding: 20px;
    text-align: center;
    color: #8a6070;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    .cart-section-header {
      flex-wrap: wrap;
    }

    .summary-items {
      flex-wrap: wrap;
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    .satis-wrap {
      padding: 16px 12px 60px;
    }

    .satis-header {
      margin-bottom: 20px;
    }

    .satis-title {
      font-size: 24px;
    }

    .btn-save {
      width: 48px;
      height: 48px;
      font-size: 20px;
    }

    .satis-form-section {
      padding: 16px;
      margin-bottom: 20px;
    }

    .satis-cart-section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 15px;
    }

    .cart-item-row {
      padding: 14px;
    }

    .cart-item-name {
      font-size: 13px;
    }

    .cart-item-value,
    .cart-item-total {
      font-size: 13px;
    }

    .summary-items {
      gap: 16px;
      
    }
  }
`;

export default function SatissiparisiClient() {
    const [customerName, setCustomerName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [cartItems] = useState<CartItem[]>(mockCartItems);

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);

    return (
        <>
            <style>{styles}</style>
            <div className="satis-wrap">
                <div className="satis-container">
                    {/* ─── HEADER ─── */}
                    <div className="satis-header">
                        <h1 className="satis-title">📋 SATIŞ SİPARİŞİ DETAY</h1>
                        <button className="btn-save" title="Sipariş Kaydet">Kaydet</button>
                    </div>

                    {/* ─── FORM SECTION ─── */}
                    <div className="satis-form-with-button">
                        <div className="satis-form-section">
                            <div className="satis-form-grid">
                                <div className="form-field">
                                    <label className="form-label">Müşteri Adı Soyadı</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Müşteri adını giriniz..."
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Tarih</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                       
                    </div>

                    {/* ─── CART ITEMS ─── */}
                    <div className="satis-cart-section">
                        <div className="cart-section-header">
                            <h2 className="cart-header-title">📦 Sepetteki Ürünler</h2>

                        </div>
                        <div className="cart-table">
                            <div className="cart-table-head">
                                <div className="table-header-cell">Ürün Adı</div>
                                <div className="table-header-cell">Birim Fiyat</div>
                                <div className="table-header-cell">Miktar</div>
                                <div className="table-header-cell">Toplam</div>
                            </div>
                            <div className="cart-table-body">
                                {cartItems.length > 0 ? (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="cart-item-row">
                                            <p className="cart-item-name">{item.name}</p>
                                            <div className="cart-item-value">{fmt(item.price)}₺</div>
                                            <div className="cart-item-value">{item.quantity}</div>
                                            <div className="cart-item-total">{fmt(item.total)}₺</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-row">Sepette ürün bulunmamaktadır.</div>
                                )}
                            </div>
                        </div>
                        <div className="summary-items">
                            <div className="summary-item">
                                <span className="summary-label">Toplam Ürün</span>
                                <span className="summary-value">{totalQuantity}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Toplam Tutar</span>
                                <span className="summary-value">{fmt(totalAmount)}₺</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
