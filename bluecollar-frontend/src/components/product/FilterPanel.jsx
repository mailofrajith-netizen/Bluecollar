const SIZES  = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const COLORS = ['White', 'Blue', 'Black', 'Grey', 'Navy', 'Beige'];

const COLOR_MAP = {
  White: '#f5f5f5', Blue: '#3b82f6', Black: '#1a1a1a', Grey: '#9ca3af',
  Navy: '#1e3a5f', Beige: '#d4b896',
};

export default function FilterPanel({ filters, onChange }) {
  function toggleSize(size) {
    const sizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onChange({ ...filters, sizes });
  }

  function toggleColor(color) {
    const colors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onChange({ ...filters, colors });
  }

  function clearAll() {
    onChange({ sizes: [], colors: [], minPrice: '', maxPrice: '' });
  }

  const hasFilters = filters.sizes.length > 0 || filters.colors.length > 0 || filters.minPrice || filters.maxPrice;

  return (
    <div className="bg-white rounded-xl border border-[#e8e0d8] p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#1a1a1a] text-sm">Filters</h3>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-accent hover:text-orange-600 font-medium transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Size */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6b6b6b] mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filters.sizes.includes(s)
                  ? 'bg-navy text-white border-navy'
                  : 'bg-cream text-[#1a1a1a] border-[#e8e0d8] hover:border-navy'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6b6b6b] mb-3">Color</p>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => toggleColor(c)}
              title={c}
              className={`flex flex-col items-center gap-1 group`}
            >
              <span
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  filters.colors.includes(c)
                    ? 'border-accent scale-110'
                    : 'border-[#e8e0d8] hover:border-accent'
                }`}
                style={{ backgroundColor: COLOR_MAP[c] ?? '#ccc' }}
              />
              <span className="text-[10px] text-[#6b6b6b]">{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6b6b6b] mb-3">Price Range (₹)</p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className="w-full border border-[#e8e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent bg-cream transition-colors"
          />
          <span className="text-[#6b6b6b] shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className="w-full border border-[#e8e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent bg-cream transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
