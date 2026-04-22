'use client';

import { useState } from 'react';

interface ProductCard {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  checked: boolean;
}

const mockProducts: ProductCard[] = [
  {
    id: '1',
    sku: 'SKU-001',
    name: 'Altın Yüzük',
    quantity: 50,
    price: 350,
    checked: false,
  },
  {
    id: '2',
    sku: 'SKU-002',
    name: 'Gümüş Kolyé',
    quantity: 30,
    price: 220,
    checked: false,
  },
  {
    id: '3',
    sku: 'SKU-003',
    name: 'Altın Bilezik',
    quantity: 45,
    price: 280,
    checked: false,
  },
  {
    id: '4',
    sku: 'SKU-004',
    name: 'Pırlanta Yüzük',
    quantity: 20,
    price: 1200,
    checked: false,
  },
  {
    id: '5',
    sku: 'SKU-005',
    name: 'Gümüş Bilezik',
    quantity: 60,
    price: 150,
    checked: false,
  },
  {
    id: '6',
    sku: 'SKU-006',
    name: 'Çelik Saat',
    quantity: 15,
    price: 450,
    checked: false,
  },
];

const styles = `
  .mal-kabul-wrap {
    background: linear-gradient(135deg, #2e0f20 0%, #3d1228 100%);
    min-height: 100vh;
    padding: 12px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .mal-kabul-container {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .mal-kabul-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .mal-kabul-header-left {
    flex: 1;
  }

  .mal-kabul-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .mal-kabul-title {
    font-size: 28px;
    font-weight: 700;
    color: #f59e0b;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .mal-kabul-search-section {
    margin-bottom: 8px;
  }

  .mal-kabul-search-input {
    width: 100%;
    padding: 12px 16px;
    background: rgba(245, 234, 238, 0.1);
    border: 2px solid #d63050;
    border-radius: 8px;
    color: #f5eaee;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  .mal-kabul-search-input:focus {
    outline: none;
    background: rgba(245, 234, 238, 0.15);
    box-shadow: 0 0 12px rgba(214, 48, 80, 0.4);
  }

  .mal-kabul-search-input::placeholder {
    color: #b09fb8;
  }

  .mal-kabul-products-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
  }

  .mal-kabul-product-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(245, 234, 238, 0.05);
    border: 1px solid rgba(214, 48, 80, 0.3);
    border-radius: 8px;
    padding: 12px;
    transition: all 0.3s ease;
  }

  .mal-kabul-product-card:hover {
    background: rgba(245, 234, 238, 0.08);
    border-color: rgba(214, 48, 80, 0.5);
    box-shadow: 0 4px 12px rgba(214, 48, 80, 0.2);
  }

  .mal-kabul-checkbox-wrapper {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .mal-kabul-checkbox-wrapper input[type="checkbox"] {
    width: 22px;
    height: 22px;
    cursor: pointer;
    accent-color: #d63050;
  }

  .mal-kabul-product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

  .mal-kabul-product-name {
    color: #f59e0b;
    font-weight: 700;
    font-size: 15px;
    margin: 0;
  }

  .mal-kabul-product-details {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: #b09fb8;
  }

  .mal-kabul-product-sku {
    color: #9b8aa0;
  }

  .mal-kabul-empty {
    text-align: center;
    padding: 40px 20px;
    color: #b09fb8;
    font-size: 14px;
  }

  .mal-kabul-footer {
    display: none;
  }

  .mal-kabul-btn {
    padding: 12px 32px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .mal-kabul-btn-confirm {
    background: linear-gradient(135deg, #d63050 0%, #e54a64 100%);
    color: #fff;
  }

  .mal-kabul-btn-confirm:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(214, 48, 80, 0.4);
  }

  .mal-kabul-btn-confirm:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .mal-kabul-btn-cancel {
    background: rgba(214, 48, 80, 0.15);
    color: #f5eaee;
    border: 1px solid rgba(214, 48, 80, 0.3);
  }

  .mal-kabul-btn-cancel:hover {
    background: rgba(214, 48, 80, 0.25);
  }

  @media (max-width: 640px) {
    .mal-kabul-title {
      font-size: 22px;
    }

    .mal-kabul-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .mal-kabul-header-right {
      width: 100%;
      justify-content: space-between;
    }

    .mal-kabul-btn {
      flex: 1;
      font-size: 13px;
      padding: 10px 12px;
    }

    .mal-kabul-product-card {
      padding: 10px;
    }

    .mal-kabul-product-details {
      flex-wrap: wrap;
      font-size: 12px;
    }
  }

  @media (max-width: 480px) {
    .mal-kabul-wrap {
      padding: 8px;
    }

    .mal-kabul-title {
      font-size: 18px;
    }

    .mal-kabul-header-right {
      width: 100%;
    }

    .mal-kabul-btn {
      font-size: 12px;
      padding: 8px 10px;
    }
  }
`;

export default function MalKabulClient() {
  const [products, setProducts] = useState<ProductCard[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleCheckbox = (id: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p))
    );
  };

  const handleConfirm = () => {
    const selectedProducts = products.filter((p) => p.checked);
    console.log('✓ Teslim alınan ürünler:', selectedProducts);
    alert(`${selectedProducts.length} ürün teslim alındı!`);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const checkedCount = products.filter((p) => p.checked).length;

  return (
    <>
      <style>{styles}</style>
      <div className="mal-kabul-wrap">
        <div className="mal-kabul-container">
          {/* ─── HEADER ─── */}
          <div className="mal-kabul-header">
            <div className="mal-kabul-header-left">
              <h1 className="mal-kabul-title">🚚 MAL KABUL</h1>
            </div>
            <div className="mal-kabul-header-right">
              <button
                className="mal-kabul-btn mal-kabul-btn-confirm"
                onClick={handleConfirm}
                disabled={checkedCount === 0}
              >
                ✓ TESLİM AL ({checkedCount})
              </button>
              <button
                className="mal-kabul-btn mal-kabul-btn-cancel"
                onClick={() => setProducts(products.map((p) => ({ ...p, checked: false })))}
                disabled={checkedCount === 0}
              >
                ✕ İPTAL
              </button>
            </div>
          </div>

          {/* ─── SEARCH ─── */}
          <div className="mal-kabul-search-section">
            <input
              type="text"
              className="mal-kabul-search-input"
              placeholder="🔍 Barkod veya ürün adını aratınız..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* ─── PRODUCT CARDS ─── */}
          <div className="mal-kabul-products-section">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="mal-kabul-product-card">
                  <div className="mal-kabul-checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={product.checked}
                      onChange={() => handleToggleCheckbox(product.id)}
                    />
                  </div>
                  <div className="mal-kabul-product-info">
                    <p className="mal-kabul-product-name">{product.name}</p>
                    <div className="mal-kabul-product-details">
                      <span className="mal-kabul-product-sku">{product.sku}</span>
                      <span>📦 {product.quantity} adet</span>
                      <span>💰 {product.price.toLocaleString('tr-TR')}₺</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="mal-kabul-empty">
                <p>❌ Aratılan ürün bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
