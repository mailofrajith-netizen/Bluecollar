import { formatINR } from '../../utils/currency';
import useCart from '../../hooks/useCart';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { variantId, productName, size, color, price, quantity, image } = item;

  const imgSrc = image ? `${import.meta.env.VITE_API_BASE_URL}/storage/${image}` : null;

  return (
    <div className="flex gap-4 py-4 border-b border-[#e8e0d8] last:border-0">
      {/* Image */}
      <div className="w-20 h-20 shrink-0 bg-cream rounded-xl overflow-hidden">
        {imgSrc
          ? <img src={imgSrc} alt={productName} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">👔</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1a1a1a] text-sm leading-tight">{productName}</p>
        <p className="text-xs text-[#6b6b6b] mt-0.5">{size} · {color}</p>
        <p className="text-sm font-bold text-accent mt-1">{formatINR(price * quantity)}</p>
      </div>

      {/* Quantity + remove */}
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => removeFromCart(variantId)}
          className="text-[#6b6b6b] hover:text-red-400 text-lg leading-none transition-colors"
          aria-label="Remove"
        >
          ×
        </button>
        <div className="flex items-center border border-[#e8e0d8] rounded-lg overflow-hidden">
          <button
            onClick={() => updateQuantity(variantId, quantity - 1)}
            className="px-2.5 py-1 text-[#6b6b6b] hover:bg-cream transition-colors text-sm font-bold"
          >
            −
          </button>
          <span className="px-3 py-1 text-sm font-semibold text-[#1a1a1a] border-x border-[#e8e0d8]">
            {quantity}
          </span>
          <button
            onClick={() => updateQuantity(variantId, quantity + 1)}
            className="px-2.5 py-1 text-[#6b6b6b] hover:bg-cream transition-colors text-sm font-bold"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
