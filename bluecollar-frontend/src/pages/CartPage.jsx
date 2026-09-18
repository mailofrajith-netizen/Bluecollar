import { Link, useNavigate } from 'react-router-dom';
import CartItem    from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';
import Toast        from '../components/common/Toast';
import useCart      from '../hooks/useCart';

export default function CartPage() {
  const { cartItems } = useCart();
  const navigate      = useNavigate();

  if (!cartItems.length) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-4">
        <Toast />
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white border border-[#e8e0d8] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#6b6b6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Your cart is empty</h2>
          <p className="text-[#6b6b6b] mt-2 text-sm">Add some shirts to get started</p>
          <Link
            to="/products"
            className="mt-6 inline-block bg-navy text-white font-semibold px-8 py-3 rounded-lg text-sm hover:bg-[#2a3148] transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      <Toast />
      {/* Header */}
      <div className="bg-white border-b border-[#e8e0d8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Shopping Cart</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#e8e0d8] px-5 divide-y divide-[#e8e0d8]">
            {cartItems.map((item) => <CartItem key={item.variantId} item={item} />)}
          </div>

          {/* Summary */}
          <div>
            <OrderSummary onCheckout={() => navigate('/checkout')} />
          </div>
        </div>
      </div>
    </div>
  );
}
