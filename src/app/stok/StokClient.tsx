'use client';

import { useState } from 'react';
import Image from 'next/image';

interface StokProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
  status: 'available' | 'low' | 'out';
}

interface SearchedProduct extends StokProduct {
  timestamp: number;
}

// Örnek stok verileri - Statik (API yok)
const mockStokData: StokProduct[] = [
  {
    id: '1',
    name: 'Altın Yüzük - Roza',
    category: 'Yüzükler',
    price: 2450.00,
    quantity: 45,
    image: '/img/placeholder-1.jpg',
    sku: 'RNG-RZ-001',
    status: 'available',
  },
  {
    id: '2',
    name: 'Gümüş Kolyé',
    category: 'Kolyeler',
    price: 1850.00,
    quantity: 8,
    image: '/img/placeholder-2.jpg',
    sku: 'NLC-SLV-002',
    status: 'low',
  },
  {
    id: '3',
    name: 'Altın Bilezik - 18K',
    category: 'Bilezikler',
    price: 3200.00,
    quantity: 0,
    image: '/img/placeholder-3.jpg',
    sku: 'BRC-18K-003',
    status: 'out',
  },
  {
    id: '4',
    name: 'Taş Set - Safir',
    category: 'Taşlar',
    price: 850.00,
    quantity: 156,
    image: '/img/placeholder-4.jpg',
    sku: 'STN-SPH-004',
    status: 'available',
  },
  {
    id: '5',
    name: 'Altın Küpe - Pırlanta',
    category: 'Küpeler',
    price: 1650.00,
    quantity: 12,
    image: '/img/placeholder-5.jpg',
    sku: 'EAR-DMD-005',
    status: 'low',
  },
  {
    id: '6',
    name: 'Gümüş Bilezik - Özel',
    category: 'Bilezikler',
    price: 925.00,
    quantity: 34,
    image: '/img/placeholder-6.jpg',
    sku: 'BRC-SLV-006',
    status: 'available',
  },
  {
    id: '7',
    name: 'Altın Kolye - 22K',
    category: 'Kolyeler',
    price: 4100.00,
    quantity: 5,
    image: '/img/placeholder-7.jpg',
    sku: 'NLC-22K-007',
    status: 'low',
  },
  {
    id: '8',
    name: 'Gümüş Yüzük - Vintage',
    category: 'Yüzükler',
    price: 780.00,
    quantity: 78,
    image: '/img/placeholder-8.jpg',
    sku: 'RNG-VTG-008',
    status: 'available',
  },
  {
    id: '9',
    name: 'Altın Taş Set - Kırmızı',
    category: 'Taşlar',
    price: 1200.00,
    quantity: 0,
    image: '/img/placeholder-9.jpg',
    sku: 'STN-RED-009',
    status: 'out',
  },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const styles = `
  .stok-wrap {
    min-height: calc(100vh - 52px);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 14px 80px;
  }

  /* ─── HEADER ─── */
  .stok-header {
    width: 100%;
    max-width: 1120px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 12px;
    flex-wrap: wrap;
  }

  .stok-title {
    font-size: 28px;
    font-weight: 700;
    color: #f5eaee;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .stok-header-buttons {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .btn-cart {
    padding: 12px 22px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #d63050 0%, #a82040 100%);
    color: white;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(214,48,80,0.35);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-cart:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(214,48,80,0.45);
  }

  /* ─── CART BADGE ─── */
  .cart-badge {
    position: relative;
    display: flex;
    align-items: center;
  }

  .cart-badge-circle {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d63050 0%, #a82040 100%);
    border: 2px solid #2e0f20;
    color: white;
    font-weight: 700;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
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
  .stok-search-bar {
    width: 100%;
    max-width: 1120px;
    display: flex;
    gap: 10px;
    margin-bottom: 28px;
  }

  .stok-search-input-wrap {
    flex: 1;
    position: relative;
    min-width: 0;
  }

  .stok-search-input-wrap input {
    width: 100%;
    padding: 14px 50px 14px 18px;
    border-radius: 12px;
    border: 2px solid rgba(255,255,255,0.4);
    background: rgba(255,255,255,0.96);
    color: #1a1a2e;
    font-size: 16px;
    outline: none;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }

  .stok-search-input-wrap input::placeholder {
    color: #8a6070;
  }

  .stok-search-input-wrap input:focus {
    border-color: #d63050;
    box-shadow: 0 0 0 3px rgba(214,48,80,0.15), 0 2px 12px rgba(0,0,0,0.15);
  }

  .btn-search-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: none;
    background: rgba(197,48,48,0.12);
    color: #d63050;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .btn-search-icon:hover {
    background: rgba(197,48,48,0.22);
  }

  /* ─── GRID LAYOUT ─── */
  .stok-grid {
    width: 100%;
    max-width: 1120px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  /* ─── SECTION SEPARATOR ─── */
  .stok-section-separator {
    width: 100%;
    max-width: 1120px;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(214,48,80,0.4) 25%, rgba(214,48,80,0.4) 75%, transparent 100%);
    margin: 32px 0;
    border: none;
  }

  .stok-section-title {
    width: 100%;
    max-width: 1120px;
    font-size: 18px;
    font-weight: 700;
    color: #f5eaee;
    margin: 24px 0 20px 0;
    letter-spacing: -0.3px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stok-section-title span {
    font-size: 14px;
    color: #8a6070;
    font-weight: 500;
    background: rgba(214,48,80,0.1);
    padding: 2px 8px;
    border-radius: 6px;
  }

  @media (max-width: 900px) {
    .stok-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
  }

  @media (max-width: 640px) {
    .stok-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
  }

  @media (max-width: 480px) {
    .stok-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }

  /* ─── PRODUCT CARD ─── */
  .stok-card {
    background: linear-gradient(160deg, #421830 0%, #351226 100%);
    border: 1px solid rgba(214,48,80,0.15);
    border-radius: 18px;
    overflow: hidden;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    cursor: default;
  }

  .stok-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 28px rgba(214,48,80,0.2);
    border-color: rgba(214,48,80,0.35);
  }

  /* ─── CARD IMAGE ─── */
  .stok-card-image {
    width: 100%;
    aspect-ratio: 1 / 1;
    background: linear-gradient(135deg, #3a1428 0%, #2e0f20 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .stok-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .stok-card:hover .stok-card-image img {
    transform: scale(1.05);
  }

  .stok-card-image-placeholder {
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8a6070;
    font-size: 14px;
    text-align: center;
    padding: 12px;
  }

  /* ─── CARD STATUS BADGE ─── */
  .stok-card-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }

  .badge-available {
    background: rgba(16,185,129,0.2);
    color: #10b981;
  }

  .badge-low {
    background: rgba(245,158,11,0.2);
    color: #f59e0b;
  }

  .badge-out {
    background: rgba(239,68,68,0.2);
    color: #ef4444;
  }

  /* ─── CARD CONTENT ─── */
  .stok-card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }

  .stok-product-name {
    font-size: 16px;
    font-weight: 700;
    color: #f5eaee;
    margin: 0;
    line-height: 1.3;
    letter-spacing: -0.3px;
  }

  .stok-product-category {
    font-size: 12px;
    color: #8a6070;
    margin: 0;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stok-product-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid rgba(255,255,255,0.08);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    gap: 8px;
  }

  .stok-info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }

  .stok-info-label {
    font-size: 11px;
    color: #8a6070;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .stok-info-value {
    font-size: 16px;
    font-weight: 700;
    color: #f5eaee;
    margin-top: 2px;
  }

  .stok-info-value.price {
    color: #f59e0b;
  }

  .stok-info-value.quantity {
    color: #10b981;
  }

  .stok-info-value.quantity.low {
    color: #f59e0b;
  }

  .stok-info-value.quantity.out {
    color: #ef4444;
  }

  /* ─── CARD FOOTER ─── */
  .stok-card-footer {
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
    background: rgba(239,68,68,0.25);
    color: #ef4444;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 2px 8px rgba(239,68,68,0.15);
    flex-shrink: 0;
  }

  .btn-remove-search:hover {
    background: rgba(239,68,68,0.35);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239,68,68,0.25);
  }

  .btn-remove-search:active {
    transform: translateY(0px);
    box-shadow: 0 2px 6px rgba(239,68,68,0.15);
  }

  /* ─── EMPTY STATE ─── */
  .stok-empty {
    text-align: center;
    padding: 60px 20px;
    color: #8a6070;
  }

  .stok-empty p {
    font-size: 16px;
    margin: 0;
  }

  @media (max-width: 640px) {
    .stok-wrap {
      padding: 16px 12px 60px;
    }

    .stok-header {
      margin-bottom: 16px;
    }

    .stok-title {
      font-size: 24px;
    }

    .stok-search-bar {
      margin-bottom: 20px;
    }

    .stok-card-body {
      padding: 12px;
      gap: 8px;
    }

    .stok-product-name {
      font-size: 14px;
    }

    .stok-product-category {
      font-size: 11px;
    }
  }
`;

export default function StokClient() {
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

    // Barkod veya ürün ile eşleşeni bul
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
      setSearchQuery(''); // Input'u temizle
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
      <div className="stok-wrap">
        {/* ─── HEADER ─── */}
        <div className="stok-header">
          <h1 className="stok-title">📦 STOK YÖNETİMİ</h1>
          <div className="stok-header-buttons">
            <div className="cart-badge">
              <button className="btn-cart">
                🛒 SEPETİ AÇ
              </button>
              {cartCount > 0 && (
                <div className="cart-badge-circle">{cartCount}</div>
              )}
            </div>
          </div>
        </div>

        {/* ─── SEARCH BAR ─── */}
        <div className="stok-search-bar">
          <div className="stok-search-input-wrap">
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

        {/* ─── ARANAN ÜRÜNLER BÖLÜMÜ ─── */}
        {searchedProducts.length > 0 && (
          <>
            <div className="stok-section-title">
              🔍 ARANAN ÜRÜNLER
              <span>{searchedProducts.length}</span>
            </div>
            <div className="stok-grid">
              {searchedProducts.map((product) => (
                <div key={`searched-${product.id}`} className="stok-card">
                  {/* Card Image */}
                  <div className="stok-card-image">
                    <div className={`stok-card-badge badge-${product.status}`}>
                      {getStatusBadge(product.status)}
                    </div>
                    <div className="stok-card-image-placeholder">
                      📷 Ürün Görseli
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="stok-card-body">
                    <h3 className="stok-product-name">{product.name}</h3>
                    <p className="stok-product-category">{product.category}</p>

                    <div className="stok-product-info">
                      <div className="stok-info-item">
                        <span className="stok-info-label">Fiyat</span>
                        <span className="stok-info-value price">
                          {fmt(product.price)}₺
                        </span>
                      </div>
                      <div className="stok-info-item">
                        <span className="stok-info-label">Stok</span>
                        <span
                          className={`stok-info-value quantity ${getQuantityClass(
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
                  <div className="stok-card-footer">
                    <button
                      className="btn-add-to-cart"
                      disabled={product.status === 'out'}
                      onClick={handleAddToCart}
                    >
                      🛒 SEPETİ EKLE
                    </button>
                    <button
                      className="btn-remove-search"
                      onClick={() => removeSearchedProduct(product.id)}
                      title="Sil"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SEPARATOR */}
            <div className="stok-section-separator" />
          </>
        )}

        {/* ─── ÜRÜNLERİMİZ BÖLÜMÜ ─── */}
        <div className="stok-section-title">
          📦 ÜRÜNLERİMİZ
          <span>{mockStokData.length}</span>
        </div>

        {mockStokData.length > 0 ? (
          <div className="stok-grid">
            {mockStokData.map((product) => (
              <div key={`stock-${product.id}`} className="stok-card">
                {/* Card Image */}
                <div className="stok-card-image">
                  <div className={`stok-card-badge badge-${product.status}`}>
                    {getStatusBadge(product.status)}
                  </div>
                  <div className="stok-card-image-placeholder">
                    📷 Ürün Görseli
                  </div>
                </div>

                {/* Card Body */}
                <div className="stok-card-body">
                  <h3 className="stok-product-name">{product.name}</h3>
                  <p className="stok-product-category">{product.category}</p>

                  <div className="stok-product-info">
                    <div className="stok-info-item">
                      <span className="stok-info-label">Fiyat</span>
                      <span className="stok-info-value price">
                        {fmt(product.price)}₺
                      </span>
                    </div>
                    <div className="stok-info-item">
                      <span className="stok-info-label">Stok</span>
                      <span
                        className={`stok-info-value quantity ${getQuantityClass(
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
                <div className="stok-card-footer">
                  <button
                    className="btn-add-to-cart"
                    disabled={product.status === 'out'}
                    onClick={handleAddToCart}
                  >
                    🛒 SEPETİ EKLE
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="stok-empty">
            <p>❌ Stokta ürün bulunamadı.</p>
          </div>
        )}
      </div>
    </>
  );
}
