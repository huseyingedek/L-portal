'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  sku: string;
  status: 'available' | 'low' | 'out';
}

interface SearchedProduct extends Product {
  timestamp: number;
}

const mockStokData: Product[] = [
  { id: '1', name: 'Altın Yüzük - Roza', category: 'Yüzük', price: 2450.00, quantity: 15, sku: 'ALT-YUZ-001', status: 'available' },
  { id: '2', name: 'Gümüş Kolyé', category: 'Kolyé', price: 1850.00, quantity: 8, sku: 'GUM-KOL-001', status: 'available' },
  { id: '3', name: 'Altın Bilezik - 18K', category: 'Bilezik', price: 3200.00, quantity: 0, sku: 'ALT-BIL-001', status: 'out' },
  { id: '4', name: 'Gümüş Halka', category: 'Halka', price: 1200.00, quantity: 3, sku: 'GUM-HAL-001', status: 'low' },
  { id: '5', name: 'Elmas Kolye - Emas', category: 'Kolyé', price: 8500.00, quantity: 2, sku: 'ELM-KOL-001', status: 'low' },
  { id: '6', name: 'Perle Küpe', category: 'Küpe', price: 950.00, quantity: 25, sku: 'PER-KUP-001', status: 'available' },
  { id: '7', name: 'Zirkon Taç', category: 'Aksesuarlar', price: 1500.00, quantity: 12, sku: 'ZIR-TAC-001', status: 'available' },
  { id: '8', name: 'Bakır Takı', category: 'Diğer', price: 450.00, quantity: 0, sku: 'BAK-TAK-001', status: 'out' },
  { id: '9', name: 'Kristal Bilezik', category: 'Bilezik', price: 1100.00, quantity: 7, sku: 'KRI-BIL-001', status: 'available' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const styles = `
  .satinalma-wrap {
    min-height: calc(100vh - 52px);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 14px 60px;
  }

  /* ─── HEADER ─── */
  .satinalma-header {
    width: 100%;
    max-width: 1120px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    gap: 20px;
  }

  .satinalma-title {
    font-size: 28px;
    font-weight: 700;
    color: #f5eaee;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .satinalma-header-buttons {
    display: flex;
    gap: 12px;
  }

  .btn-cart {
    padding: 12px 20px;
    border-radius: 10px;
    border: 2px solid rgba(214,48,80,0.4);
    background: linear-gradient(135deg, rgba(214,48,80,0.15) 0%, rgba(214,48,80,0.08) 100%);
    color: #f5eaee;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.3px;
  }

  .btn-cart:hover {
    background: linear-gradient(135deg, rgba(214,48,80,0.25) 0%, rgba(214,48,80,0.15) 100%);
    border-color: rgba(214,48,80,0.6);
    box-shadow: 0 2px 8px rgba(214,48,80,0.35);
  }

  .btn-cart:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(214,48,80,0.35);
  }

  .cart-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .cart-badge-circle {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d63050 0%, #a82040 100%);
    color: white;
    font-weight: 700;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(214,48,80,0.4);
    border: 2px solid rgba(58, 20, 40, 1);
  }

  /* ─── SEARCH BAR ─── */
  .satinalma-search-bar {
    width: 100%;
    max-width: 1120px;
    display: flex;
    gap: 10px;
    margin-bottom: 28px;
  }

  .satinalma-search-input-wrap {
    flex: 1;
    position: relative;
    min-width: 0;
  }

  .satinalma-search-input-wrap input {
    width: 100%;
    padding: 14px 50px 14px 18px;
    border-radius: 12px;
    border: 2px solid rgba(255,255,255,0.4);
    background: rgba(255,255,255,0.96);
    color: #1a1a2e;
    font-size: 16px;
    outline: none;
    transition: all 0.2s ease;
  }

  .satinalma-search-input-wrap input:focus {
    border-color: #d63050;
    box-shadow: 0 0 0 3px rgba(214,48,80,0.15);
  }

  .btn-search-icon {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #8a6070;
    transition: all 0.2s ease;
  }

  .btn-search-icon:hover {
    color: #d63050;
  }

  /* ─── SECTIONS ─── */
  .satinalma-section-title {
    width: 100%;
    max-width: 1120px;
    font-size: 15px;
    font-weight: 700;
    color: #f5eaee;
    margin: 0 0 16px 0;
    letter-spacing: -0.3px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .satinalma-section-title span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d63050 0%, #a82040 100%);
    color: white;
    font-size: 11px;
    font-weight: 700;
  }

  /* ─── GRID ─── */
  .satinalma-grid {
    width: 100%;
    max-width: 1120px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 0;
  }

  @media (max-width: 900px) {
    .satinalma-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .satinalma-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
  }

  @media (max-width: 480px) {
    .satinalma-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ─── PRODUCT CARD ─── */
  .satinalma-card {
    background: linear-gradient(160deg, #421830 0%, #351226 100%);
    border: 1px solid rgba(214,48,80,0.2);
    border-radius: 14px;
    overflow: hidden;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }

  .satinalma-card:hover {
    border-color: rgba(214,48,80,0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(214,48,80,0.15);
  }

  .satinalma-card-image {
    position: relative;
    width: 100%;
    height: 150px;
    background: linear-gradient(135deg, rgba(214,48,80,0.1) 0%, rgba(214,48,80,0.05) 100%);
    border-bottom: 1px solid rgba(214,48,80,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .satinalma-card-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }

  .badge-available {
    background: #10b981;
    color: white;
  }

  .badge-low {
    background: #f59e0b;
    color: white;
  }

  .badge-out {
    background: #ef4444;
    color: white;
  }

  .satinalma-card-image-placeholder {
    color: #8a6070;
    font-size: 14px;
    font-weight: 600;
  }

  .satinalma-card-body {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }

  .satinalma-product-name {
    font-size: 15px;
    font-weight: 700;
    color: #f5eaee;
    margin: 0;
    line-height: 1.3;
  }

  .satinalma-product-category {
    font-size: 12px;
    color: #8a6070;
    margin: 0;
  }

  .satinalma-product-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .satinalma-info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .satinalma-info-label {
    font-size: 12px;
    color: #8a6070;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .satinalma-info-value {
    font-size: 14px;
    font-weight: 700;
    color: #f5eaee;
  }

  .satinalma-info-value.price {
    color: #f59e0b;
    font-size: 15px;
  }

  .satinalma-info-value.quantity {
    background: rgba(16,185,129,0.15);
    color: #10b981;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .satinalma-info-value.quantity.low {
    background: rgba(245,158,11,0.15);
    color: #f59e0b;
  }

  .satinalma-info-value.quantity.out {
    background: rgba(239,68,68,0.15);
    color: #ef4444;
  }

  /* ─── CARD FOOTER ─── */
  .satinalma-card-footer {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  .btn-add-to-cart {
    flex: 1;
    padding: 11px 16px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #d63050 0%, #a82040 100%);
    color: white;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.3px;
    box-shadow: 0 2px 8px rgba(214,48,80,0.25);
  }

  .btn-add-to-cart:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(214,48,80,0.35);
  }

  .btn-add-to-cart:active {
    transform: translateY(0px);
    box-shadow: 0 2px 6px rgba(214,48,80,0.25);
  }

  .btn-add-to-cart:disabled {
    background: #8a6070;
    cursor: not-allowed;
    box-shadow: 0 2px 8px rgba(138,96,112,0.25);
  }

  .btn-remove-search {
    padding: 11px 12px;
    border-radius: 10px;
    border: none;
    background: rgba(214,48,80,0.3);
    color: #f5eaee;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-remove-search:hover {
    background: rgba(214,48,80,0.5);
  }

  /* ─── SEPARATOR ─── */
  .satinalma-section-separator {
    width: 100%;
    max-width: 1120px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(214,48,80,0.4), transparent);
    margin: 32px 0;
  }

  /* ─── EMPTY STATE ─── */
  .satinalma-empty {
    width: 100%;
    max-width: 1120px;
    padding: 40px 20px;
    text-align: center;
    color: #8a6070;
  }

  .satinalma-empty p {
    font-size: 16px;
    margin: 0;
  }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 640px) {
    .satinalma-wrap {
      padding: 16px 12px 60px;
    }

    .satinalma-header {
      margin-bottom: 16px;
    }

    .satinalma-title {
      font-size: 24px;
    }

    .satinalma-search-bar {
      margin-bottom: 20px;
    }

    .satinalma-card-body {
      padding: 12px;
      gap: 8px;
    }

    .satinalma-product-name {
      font-size: 14px;
    }

    .satinalma-product-category {
      font-size: 11px;
    }
  }
`;

export default function SatinAlmaClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedProducts, setSearchedProducts] = useState<SearchedProduct[]>([]);
  const [cartCount, setCartCount] = useState<number>(1);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase().trim();
    setSearchQuery(e.target.value);

    if (query === '') {
      return;
    }

    const found = mockStokData.find(
      (product) =>
        product.sku.toLowerCase() === query ||
        product.name.toLowerCase().includes(query) ||
        product.id === query
    );

    if (found && !searchedProducts.some(p => p.id === found.id)) {
      setSearchedProducts([
        { ...found, timestamp: Date.now() },
        ...searchedProducts.filter(p => p.id !== found.id),
      ]);
      setSearchQuery('');
    }
  };

  const handleBarcodKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.currentTarget;
      const query = input.value.toLowerCase().trim();

      if (query === '') return;

      const found = mockStokData.find(
        (product) =>
          product.sku.toLowerCase() === query ||
          product.name.toLowerCase().includes(query) ||
          product.id === query
      );

      if (found && !searchedProducts.some(p => p.id === found.id)) {
        setSearchedProducts([
          { ...found, timestamp: Date.now() },
          ...searchedProducts.filter(p => p.id !== found.id),
        ]);
        setSearchQuery('');
      }
    }
  };

  const removeSearchedProduct = (id: string) => {
    setSearchedProducts(searchedProducts.filter(p => p.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return 'Stokta';
      case 'low':
        return 'Az Stok';
      case 'out':
        return 'Tükendi';
      default:
        return '';
    }
  };

  const getQuantityClass = (quantity: number, status: string) => {
    if (status === 'out' || quantity === 0) return 'out';
    if (status === 'low') return 'low';
    return '';
  };

  return (
    <>
      <style>{styles}</style>
      <div className="satinalma-wrap">
        {/* ─── HEADER ─── */}
        <div className="satinalma-header">
          <h1 className="satinalma-title">🛒 SATINALMA</h1>
          <div className="satinalma-header-buttons">
            <div className="cart-badge">
              <button className="btn-cart">
                🛒 SEPET
              </button>
              {cartCount > 0 && (
                <div className="cart-badge-circle">{cartCount}</div>
              )}
            </div>
          </div>
        </div>

        {/* ─── SEARCH BAR ─── */}
        <div className="satinalma-search-bar">
          <div className="satinalma-search-input-wrap">
            <input
              type="text"
              placeholder="Barkod tarayın veya ürün adı yazın..."
              value={searchQuery}
              onChange={handleSearch}
              onKeyPress={handleBarcodKeyPress}
              autoComplete="off"
            />
            <button className="btn-search-icon">📱</button>
          </div>
        </div>

        {/* ─── YENİ ÜRÜNLER BÖLÜMÜ ─── */}
        {searchedProducts.length > 0 && (
          <>
            <div className="satinalma-section-title">
              ✨ YENİ ÜRÜNLER
              <span>{searchedProducts.length}</span>
            </div>
            <div className="satinalma-grid">
              {searchedProducts.map((product) => (
                <div key={`searched-${product.id}`} className="satinalma-card">
                  {/* Card Image */}
                  <div className="satinalma-card-image">
                    <div className={`satinalma-card-badge badge-${product.status}`}>
                      {getStatusBadge(product.status)}
                    </div>
                    <div className="satinalma-card-image-placeholder">
                      📷 Ürün Görseli
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="satinalma-card-body">
                    <h3 className="satinalma-product-name">{product.name}</h3>
                    <p className="satinalma-product-category">{product.category}</p>

                    <div className="satinalma-product-info">
                      <div className="satinalma-info-item">
                        <span className="satinalma-info-label">Fiyat</span>
                        <span className="satinalma-info-value price">
                          {fmt(product.price)}₺
                        </span>
                      </div>
                      <div className="satinalma-info-item">
                        <span className="satinalma-info-label">Stok</span>
                        <span
                          className={`satinalma-info-value quantity ${getQuantityClass(
                            product.quantity,
                            product.status
                          )}`}
                        >
                          {product.quantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="satinalma-card-footer">
                    <button
                      className="btn-add-to-cart"
                      disabled={product.status === 'out'}
                      onClick={handleAddToCart}
                    >
                      🛒 SEPETE EKLE
                    </button>
                    <button
                      className="btn-remove-search"
                      onClick={() => removeSearchedProduct(product.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SEPARATOR */}
            <div className="satinalma-section-separator" />
          </>
        )}

        {/* ─── ÜRÜNLERİMİZ BÖLÜMÜ ─── */}
        <div className="satinalma-section-title">
          📦 ÜRÜNLERİMİZ
          <span>{mockStokData.length}</span>
        </div>

        {mockStokData.length > 0 ? (
          <div className="satinalma-grid">
            {mockStokData.map((product) => (
              <div key={`stock-${product.id}`} className="satinalma-card">
                {/* Card Image */}
                <div className="satinalma-card-image">
                  <div className={`satinalma-card-badge badge-${product.status}`}>
                    {getStatusBadge(product.status)}
                  </div>
                  <div className="satinalma-card-image-placeholder">
                    📷 Ürün Görseli
                  </div>
                </div>

                {/* Card Body */}
                <div className="satinalma-card-body">
                  <h3 className="satinalma-product-name">{product.name}</h3>
                  <p className="satinalma-product-category">{product.category}</p>

                  <div className="satinalma-product-info">
                    <div className="satinalma-info-item">
                      <span className="satinalma-info-label">Fiyat</span>
                      <span className="satinalma-info-value price">
                        {fmt(product.price)}₺
                      </span>
                    </div>
                    <div className="satinalma-info-item">
                      <span className="satinalma-info-label">Stok</span>
                      <span
                        className={`satinalma-info-value quantity ${getQuantityClass(
                          product.quantity,
                          product.status
                        )}`}
                      >
                        {product.quantity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="satinalma-card-footer">
                  <button
                    className="btn-add-to-cart"
                    disabled={product.status === 'out'}
                    onClick={handleAddToCart}
                  >
                    🛒 SEPETE EKLE
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="satinalma-empty">
            <p>❌ Stokta ürün bulunamadı.</p>
          </div>
        )}
      </div>
    </>
  );
}
