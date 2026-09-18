import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../api/products';
import Spinner from '../common/Spinner';
import { formatINR } from '../../utils/currency';

const COLLECTIONS = [
  { label: 'Formal Shirts',  desc: 'Crafted for boardrooms',       category: 'formal',  gradient: 'linear-gradient(160deg, #d4c5b0 0%, #b8a898 40%, #8c7b6b 100%)' },
  { label: 'Solid Shirts',   desc: 'Timeless. Versatile.',          category: 'solid',   gradient: 'linear-gradient(160deg, #8faec8 0%, #5b82a6 40%, #2d5478 100%)' },
  { label: 'Casual Shirts',  desc: 'Relaxed yet refined',           category: 'casual',  gradient: 'linear-gradient(160deg, #b0b8b4 0%, #8a9490 40%, #5e6e6a 100%)' },
  { label: 'Dark Shirts',    desc: 'Bold. Sharp. Confident.',       category: 'dark',    gradient: 'linear-gradient(160deg, #2e3a4a 0%, #1e2a38 40%, #0e1620 100%)' },
  { label: 'Check Shirts',   desc: 'Patterns that stand out.',      category: 'check',   gradient: 'linear-gradient(160deg, #c8b8a4 0%, #a89880 40%, #7e7060 100%)' },
];

const BASE = import.meta.env.VITE_API_BASE_URL + '/storage/';

/* ─── Collections Grid — uses real product images from API ─── */
export function CollectionsGrid() {
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    // Fetch featured products and use their images for the collection cards
    getProducts({ limit: 5, sort: 'featured' })
      .then((res) => {
        const items = res.data?.data?.items ?? [];
        setProductImages(items.map((p) => p.primary_image ?? null));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">EXPLORE OUR COLLECTION</p>
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a1a1a]">Designed for Every Occasion</h2>
            <Link to="/products" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#1a1a1a] hover:text-accent transition-colors whitespace-nowrap tracking-widest uppercase">
              VIEW ALL COLLECTIONS
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {COLLECTIONS.map((col, idx) => {
            const imgSrc = productImages[idx] ? BASE + productImages[idx] : null;
            return (
              <Link
                key={col.label}
                to={`/products?category=${col.category}`}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden"
              >
                {/* Background gradient always present */}
                <div className="absolute inset-0" style={{ background: col.gradient }} />
                {/* Real product image overlay */}
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={col.label}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {/* Dark overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-2/5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 100%)' }} />
                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-3.5">
                  <p className="text-white font-semibold text-sm leading-tight mb-0.5">{col.label}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-white/70 text-xs">{col.desc}</p>
                    <svg className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/products" className="text-xs font-semibold tracking-widest text-accent uppercase">VIEW ALL COLLECTIONS →</Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Best Sellers / Customer Favorites ─── */
export function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [offset, setOffset]     = useState(0);
  const VISIBLE = 4;

  useEffect(() => {
    getProducts({ limit: 8, sort: 'featured' })
      .then((res) => setProducts(res.data?.data?.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible  = products.slice(offset, offset + VISIBLE);
  const canPrev  = offset > 0;
  const canNext  = offset + VISIBLE < products.length;

  return (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">BEST SELLERS</p>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a1a1a]">Customer Favorites</h2>
            <div className="flex items-center gap-4">
              <Link to="/products" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#1a1a1a] hover:text-accent transition-colors whitespace-nowrap tracking-widest uppercase">
                VIEW ALL SHIRTS
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <div className="flex gap-2">
                <button onClick={() => setOffset((o) => Math.max(0, o - VISIBLE))} disabled={!canPrev}
                  className="w-8 h-8 rounded-full border border-[#e8e0d8] flex items-center justify-center hover:border-navy hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[#1a1a1a]">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button onClick={() => setOffset((o) => Math.min(products.length - VISIBLE, o + VISIBLE))} disabled={!canNext}
                  className="w-8 h-8 rounded-full border border-[#e8e0d8] flex items-center justify-center hover:border-navy hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[#1a1a1a]">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? <Spinner /> : products.length === 0 ? (
          <p className="text-[#6b6b6b] text-center py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {visible.map((p, idx) => <BestSellerCard key={p.id} product={p} isBestSeller={idx === 0} />)}
          </div>
        )}
      </div>
    </section>
  );
}

const COLOR_HEX = {
  'Steel Blue': '#5B7FA6', 'Wine': '#8B2942', 'Aqua Blue': '#5FBCD3',
  'Light Blue': '#87CEEB', 'Dusty Pink': '#D4A5A5', 'Black': '#1A1A1A',
  'Turquoise': '#40E0D0', 'Light Pink': '#FFB6C1',
  White: '#f5f5f5', Blue: '#3b82f6', Grey: '#9ca3af', Navy: '#1e3a5f',
  Beige: '#d4b896', Red: '#ef4444', Green: '#22c55e',
};

function StarRating({ rating = 4.8, count }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-1 mt-1.5">
      <div className="flex">
        {[1,2,3,4,5].map((i) => (
          <svg key={i} className={`w-3 h-3 ${i <= full ? 'text-yellow-400 fill-yellow-400' : (i === full + 1 && half) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count && <span className="text-xs text-gray-500">({count.toLocaleString()})</span>}
    </div>
  );
}

function BestSellerCard({ product, isBestSeller }) {
  const { name, slug, base_price, discount_percent, primary_image, available_colors = [] } = product;
  const discount = parseFloat(discount_percent ?? 0);
  const salePrice = discount > 0 ? base_price * (1 - discount / 100) : null;
  const imgSrc = primary_image
    ? `${import.meta.env.VITE_API_BASE_URL}/storage/${primary_image}`
    : null;
  const reviewCount = 800 + (available_colors.length * 100);

  return (
    <Link to={`/products/${slug}`} className="group block bg-white rounded-xl overflow-hidden border border-[#e8e0d8] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="aspect-[3/4] overflow-hidden bg-[#f5f0eb] relative">
        {imgSrc ? (
          <img src={imgSrc} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#e8e0d8] to-[#d4c8bc]">
            <svg className="w-12 h-12 text-[#b0a090]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75v-3m0 0a3 3 0 00-3 3v.75m3-3.75a3 3 0 013 3v.75M6.75 8.25H5.25A2.25 2.25 0 003 10.5v9a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 19.5v-9a2.25 2.25 0 00-2.25-2.25H17.25" />
            </svg>
            <span className="text-xs text-[#8c7c6c] font-medium tracking-wide uppercase">No Image</span>
          </div>
        )}
        {isBestSeller && (
          <span className="absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase" style={{ backgroundColor: '#c8922a' }}>Best Seller</span>
        )}
        <button
          className="absolute top-3 right-3 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center hover:bg-white hover:text-red-500 transition-colors text-gray-400"
          onClick={(e) => e.preventDefault()}
          aria-label="Add to wishlist"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        {/* Color swatches overlaid on image bottom */}
        {available_colors.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {available_colors.slice(0, 4).map((c) => (
              <span key={c} title={c} className="w-4 h-4 rounded-full border-2 border-white shadow-sm shrink-0"
                style={{ backgroundColor: COLOR_HEX[c] ?? '#ccc' }} />
            ))}
            {available_colors.length > 4 && <span className="text-[9px] text-white font-bold bg-black/50 rounded-full px-1 flex items-center">+{available_colors.length - 4}</span>}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-[#1a1a1a] text-sm leading-tight line-clamp-2 mb-1">{name}</h3>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-bold text-[#1a1a1a] text-sm">{formatINR(salePrice ?? base_price)}</span>
          {salePrice && (
            <>
              <span className="text-xs text-gray-400 line-through">{formatINR(base_price)}</span>
              <span className="text-xs font-semibold text-green-600">({Math.round(discount)}% OFF)</span>
            </>
          )}
        </div>
        <StarRating rating={4.8} count={reviewCount} />
      </div>
    </Link>
  );
}

/* ─── Default export: both sections (used as fallback if HomePage imports this directly) ─── */
export default function ProductShowcase() {
  return (
    <>
      <CollectionsGrid />
      <BestSellers />
    </>
  );
}
