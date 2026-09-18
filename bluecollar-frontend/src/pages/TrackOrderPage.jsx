import { useState, useEffect } from 'react';
import Toast from '../components/common/Toast';
import OrderStatusTimeline from '../components/order/OrderStatusTimeline';
import OrderItemsTable from '../components/order/OrderItemsTable';
import { trackOrder, getOrders, getOrder } from '../api/orders';
import useAuth from '../hooks/useAuth';

export default function TrackOrderPage() {
  const { user } = useAuth();

  const [form,       setForm]       = useState({ order_number: '', email: '' });
  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const [myOrders,   setMyOrders]   = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setListLoading(true);
    getOrders()
      .then((res) => setMyOrders(res.data?.data ?? []))
      .catch(() => setMyOrders([]))
      .finally(() => setListLoading(false));
  }, [user]);

  async function selectOrder(id) {
    setSelectedId(id);
    setError('');
    setDetailLoading(true);
    try {
      const res = await getOrder(id);
      const raw = res.data?.data ?? {};
      setOrder({ ...raw.order, items: raw.items ?? [] });
    } catch (err) {
      setError(err.message || 'Could not load order details.');
      setOrder(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.order_number.trim() || !form.email.trim()) {
      setError('Please enter both your order number and email address.');
      return;
    }
    setError('');
    setSelectedId(null);
    setLoading(true);
    try {
      const res = await trackOrder({ order_number: form.order_number.trim(), email: form.email.trim() });
      setOrder(res.data?.data ?? null);
    } catch (err) {
      setError(err.message || 'Order not found. Please check your details and try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full border border-[#e8e0d8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-cream transition-colors';

  function statusBadge(status) {
    if (status === 'Delivered') return 'bg-green-100 text-green-700';
    if (status === 'Cancelled') return 'bg-red-100 text-red-600';
    return 'bg-accent/10 text-accent';
  }

  return (
    <div className="bg-cream min-h-screen">
      <Toast />
      <div className="bg-white border-b border-[#e8e0d8]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-1">ORDER TRACKING</p>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Track Your Order</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Logged-in order list */}
        {user && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Your Orders</h2>
            {listLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#6b6b6b]">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Loading your orders…
              </div>
            ) : myOrders.length === 0 ? (
              <p className="text-sm text-[#6b6b6b]">No orders found.</p>
            ) : (
              <div className="space-y-2">
                {myOrders.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => selectOrder(o.id)}
                    className={`w-full text-left bg-white rounded-xl border px-4 py-3 flex items-center justify-between transition-colors hover:border-accent/60 ${
                      selectedId === o.id ? 'border-accent ring-2 ring-accent/20' : 'border-[#e8e0d8]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-accent truncate">{o.order_number}</p>
                        <p className="text-xs text-[#6b6b6b] mt-0.5">
                          {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}₹{parseFloat(o.total_amount).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ml-2 ${statusBadge(o.status)}`}>
                      {o.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 border-t border-[#e8e0d8]" />
              <span className="text-xs text-[#6b6b6b] font-medium">or track by order number</span>
              <div className="flex-1 border-t border-[#e8e0d8]" />
            </div>
          </div>
        )}

        {!user && (
          <p className="text-[#6b6b6b] text-sm mb-8">Enter your order number and email to check the status of your order.</p>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e8e0d8] p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6b6b6b] mb-1">Order Number</label>
            <input
              type="text"
              placeholder="e.g. BC-2024-00123"
              value={form.order_number}
              onChange={(e) => setForm({ ...form, order_number: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6b6b6b] mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Looking up order…' : 'Track Order'}
          </button>
        </form>

        {detailLoading && (
          <div className="mt-8 flex items-center gap-2 text-sm text-[#6b6b6b]">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            Loading order details…
          </div>
        )}

        {order && !detailLoading && (
          <div className="mt-8 space-y-5">
            <div className="bg-white rounded-xl border border-[#e8e0d8] p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-[#6b6b6b] uppercase tracking-wider font-semibold">Order Number</p>
                  <p className="text-lg font-bold text-accent">{order.order_number}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#6b6b6b] text-xs">Payment</span>
                  <p className="font-medium text-[#1a1a1a]">{order.payment_method}</p>
                </div>
                <div>
                  <span className="text-[#6b6b6b] text-xs">Total</span>
                  <p className="font-bold text-[#1a1a1a]">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                </div>
                {order.shipping_city && (
                  <div className="col-span-2">
                    <span className="text-[#6b6b6b] text-xs">Shipping to</span>
                    <p className="font-medium text-[#1a1a1a]">{order.shipping_address}, {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e8e0d8] p-6">
              <h2 className="font-bold text-[#1a1a1a] mb-4">Order Progress</h2>
              <OrderStatusTimeline currentStatus={order.status} />
            </div>

            {order.items?.length > 0 && (
              <div className="bg-white rounded-xl border border-[#e8e0d8] p-6">
                <h2 className="font-bold text-[#1a1a1a] mb-4">Items Ordered</h2>
                <OrderItemsTable items={order.items} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
