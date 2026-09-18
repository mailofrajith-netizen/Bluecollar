import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/currency';

const COLOR_MAP = {
  White: '#f5f5f5', Blue: '#3b82f6', Black: '#1a1a1a', Grey: '#9ca3af',
  Navy: '#1e3a5f', Beige: '#d4b896', Red: '#ef4444', Green: '#22c55e',
};

export default function ProductCard({ product }) {
  const { name, slug, base_price, primary_image, available_sizes = [], available_colors = [] } = product;
  const imgSrc = primary_image
    ? `${import.meta.env.VITE_API_BASE_URL}/storage/${primary_image}`
    : null;

  return (
    <Link
      to={`/products/${slug}`}
      className="group block bg-white rounded-xl overflow-hidden border border-[#e8e0d8] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
        )}
        {/* Wishlist */}
        <button
          className="absolute top-3 right-3 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center hover:bg-white hover:text-red-500 transition-colors text-gray-400"
          onClick={(e) => e.preventDefault()}
          aria-label="Add to wishlist"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-[#1a1a1a] text-sm leading-tight line-clamp-2 mb-1">{name}</h3>
        <p className="font-bold text-accent text-sm mb-2">{formatINR(base_price)}</p>
        {/* Color swatches */}
        {available_colors.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-1">
            {available_colors.slice(0, 5).map((c) => (
              <span
                key={c}
                title={c}
                className="w-4 h-4 rounded-full border border-[#e8e0d8] shrink-0"
                style={{ backgroundColor: COLOR_MAP[c] ?? '#ccc' }}
              />
            ))}
          </div>
        )}
        {/* Size tags (fallback if no colors) */}
        {available_colors.length === 0 && available_sizes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {available_sizes.slice(0, 4).map((s) => (
              <span key={s} className="text-xs bg-cream text-[#6b6b6b] border border-[#e8e0d8] px-1.5 py-0.5 rounded font-medium">
                {s}
              </span>
            ))}
            {available_sizes.length > 4 && (
              <span className="text-xs text-[#6b6b6b]">+{available_sizes.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
