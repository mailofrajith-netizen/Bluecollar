import { useParams, useLocation, Link } from 'react-router-dom';
import InvoiceDownloadButton from '../components/order/InvoiceDownloadButton';
import Toast from '../components/common/Toast';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const location        = useLocation();
  const order           = location.state?.order ?? null;
  const orderId         = location.state?.orderId ?? order?.id ?? null;

  function shareOnWhatsApp() {
    const text = `My Bluecollar order #${orderNumber} has been placed successfully!`;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  }

  return (
    <div className="bg-cream min-h-screen flex items-center justify-center px-4 py-16">
      <Toast />
      <div className="w-full max-w-lg text-center">
        {/* Success icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#1a1a1a]">Order Placed Successfully!</h1>
        <p className="text-[#6b6b6b] mt-2 text-sm">Thank you for your purchase. We'll get it ready for you.</p>

        {/* Order number highlight */}
        <div className="mt-6 bg-white border border-[#e8e0d8] rounded-xl p-4">
          <p className="text-xs text-[#6b6b6b] uppercase tracking-wider font-semibold">Order Number</p>
          <p className="text-xl font-bold text-accent mt-1 tracking-wide">{orderNumber}</p>
        </div>

        {order && (
          <div className="mt-4 bg-white border border-[#e8e0d8] rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6b6b6b]">Status</span>
              <span className="font-semibold text-green-600">{order.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6b6b6b]">Payment</span>
              <span className="font-semibold text-[#1a1a1a]">{order.payment_method}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6b6b6b]">Total</span>
              <span className="font-bold text-[#1a1a1a]">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <InvoiceDownloadButton orderId={orderId} orderNumber={orderNumber} />
          )}
          <button
            onClick={shareOnWhatsApp}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Share on WhatsApp
          </button>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/track-order"
            className="text-sm font-medium text-accent hover:text-orange-600 underline transition-colors"
          >
            Track Your Order
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  );
}
