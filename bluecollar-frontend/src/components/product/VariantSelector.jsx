export default function VariantSelector({ variants = [], selectedSize, selectedColor, onSizeChange, onColorChange }) {
  const sizes  = [...new Set(variants.map((v) => v.size))];
  const colors = selectedSize
    ? [...new Set(variants.filter((v) => v.size === selectedSize).map((v) => v.color))]
    : [...new Set(variants.map((v) => v.color))];

  function isSizeAvailable(size) {
    return variants.some((v) => v.size === size && v.stock > 0);
  }

  function isColorAvailable(color) {
    if (!selectedSize) return variants.some((v) => v.color === color && v.stock > 0);
    return variants.some((v) => v.size === selectedSize && v.color === color && v.stock > 0);
  }

  const selected = selectedSize && selectedColor
    ? variants.find((v) => v.size === selectedSize && v.color === selectedColor)
    : null;

  const isOutOfStock = selected && selected.stock === 0;

  return (
    <div className="space-y-4">
      {/* Sizes */}
      <div>
        <p className="text-sm font-semibold text-[#1a1a1a] mb-2">
          Size {selectedSize && <span className="font-normal text-[#6b6b6b]">— {selectedSize}</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const avail = isSizeAvailable(s);
            return (
              <button
                key={s}
                onClick={() => { if (avail) { onSizeChange(s); onColorChange(null); } }}
                disabled={!avail}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  s === selectedSize
                    ? 'bg-navy text-white border-navy'
                    : avail
                      ? 'bg-white text-[#1a1a1a] border-[#e8e0d8] hover:border-accent hover:text-accent'
                      : 'bg-cream text-[#6b6b6b] border-[#e8e0d8] cursor-not-allowed line-through'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      {selectedSize && (
        <div>
          <p className="text-sm font-semibold text-[#1a1a1a] mb-2">
            Color {selectedColor && <span className="font-normal text-[#6b6b6b]">— {selectedColor}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const avail = isColorAvailable(c);
              return (
                <button
                  key={c}
                  onClick={() => avail && onColorChange(c)}
                  disabled={!avail}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    c === selectedColor
                      ? 'bg-navy text-white border-navy'
                      : avail
                        ? 'bg-white text-[#1a1a1a] border-[#e8e0d8] hover:border-accent hover:text-accent'
                        : 'bg-cream text-[#6b6b6b] border-[#e8e0d8] cursor-not-allowed line-through'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isOutOfStock && (
        <p className="text-red-500 text-sm font-medium">This combination is out of stock.</p>
      )}
    </div>
  );
}
