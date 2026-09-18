import { formatINR } from '../../utils/currency';
import useCart from '../../hooks/useCart';

const FREE_THRESHOLD = 1999;
const FLAT_SHIPPING  = 99;
const GST_RATE       = 0.05;

export default function OrderSummary({ onCheckout, showButton = true }) {
  const { subtotal } = useCart();
  const shipping     = subtotal >= FREE_THRESHOLD ? 0 : FLAT_SHIPPING;
  const gst          = Math.round(subtotal * GST_RATE * 100) / 100;
  const total        = subtotal + shipping + gst;

  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d8] p-5 space-y-3">
      <h3 className="font-semibold text-[#1a1a1a] text-base mb-4">Order Summary</h3>

      <div className="flex justify-between text-sm text-[#6b6b6b]">
        <span>Subtotal</span>
        <span className="font-medium">{formatINR(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-[#6b6b6b]">
        <span>Shipping</span>
        <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
          {shipping === 0 ? 'FREE' : formatINR(shipping)}
        </span>
      </div>
      {shipping > 0 && (
        <p className="text-xs text-[#6b6b6b]">Add {formatINR(FREE_THRESHOLD - subtotal)} more for free shipping</p>
      )}
      <div className="flex justify-between text-sm text-[#6b6b6b]">
        <span>GST (5%)</span>
        <span className="font-medium">{formatINR(gst)}</span>
      </div>
      <div className="flex justify-between text-base font-bold text-[#1a1a1a] pt-3 border-t border-[#e8e0d8]">
        <span>Total</span>
        <span>{formatINR(total)}</span>
      </div>

      {showButton && onCheckout && (
        <button
          onClick={onCheckout}
          className="w-full mt-4 bg-navy text-white font-semibold py-3 rounded-xl hover:bg-[#2a3148] transition-colors text-sm"
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}
