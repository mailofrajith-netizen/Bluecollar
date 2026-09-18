import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import Toast from '../../components/common/Toast';
import OrderStatusTimeline from '../../components/order/OrderStatusTimeline';
import OrderItemsTable from '../../components/order/OrderItemsTable';
import StatusUpdateDropdown from '../../components/admin/StatusUpdateDropdown';
import { getAdminOrder, downloadInvoice } from '../../api/admin';
import { formatINR } from '../../utils/currency';
import useToast from '../../hooks/useToast';

export default function AdminOrderDetailPage() {
  const { id }        = useParams();
  const { showToast } = useToast();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOrder(id)
      .then((res) => {
        const payload = res.data?.data;
        if (!payload) { setOrder(null); return; }
        // Merge items and history into the order object for easy access
        setOrder({ ...payload.order, items: payload.items ?? [], status_history: payload.history ?? [] });
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDownloadInvoice() {
    try {
      const res = await downloadInvoice(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `invoice-${order.order_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message || 'Failed to download invoice.', 'error');
    }
  }

  function handleStatusUpdated(newStatus) {
    setOrder((prev) => ({ ...prev, status: newStatus }));
  }

  if (loading) return <div className="py-24"><Spinner /></div>;
  if (!order)  return (
    <div className="py-24 text-center">
      <p className="text-gray-400">Order not found.</p>
      <Link to="/admin/orders" className="text-blue-700 text-sm mt-2 inline-block">← Back to orders</Link>
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <Toast />
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/orders" className="text-sm text-gray-500 hover:text-gray-700">← Orders</Link>
          <h1 className="text-xl font-bold text-[#1a1a1a] mt-1">{order.order_number}</h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusUpdateDropdown
            orderId={order.id}
            currentStatus={order.status}
            onUpdated={handleStatusUpdated}
          />
          <button
            onClick={handleDownloadInvoice}
            className="text-sm bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl hover:bg-blue-800 transition-colors"
          >
            Download Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Customer & Shipping */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1a1a1a] mb-3">Customer</h2>
            <div className="space-y-1.5 text-sm">
              <p><span className="text-gray-500 w-20 inline-block">Name</span> {order.guest_name || order.user_name || '—'}</p>
              <p><span className="text-gray-500 w-20 inline-block">Email</span> {order.guest_email || order.user_email || '—'}</p>
              <p><span className="text-gray-500 w-20 inline-block">Phone</span> {order.guest_phone || '—'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1a1a1a] mb-3">Shipping Address</h2>
            <p className="text-sm text-gray-700">
              {order.shipping_address}<br />
              {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
            </p>
            {order.notes && <p className="text-sm text-gray-500 mt-2">Note: {order.notes}</p>}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1a1a1a] mb-4">Items</h2>
            <OrderItemsTable items={order.items ?? []} />
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1a1a1a] mb-3">Order Summary</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatINR(parseFloat(order.subtotal ?? 0))}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={parseFloat(order.shipping_charge ?? 0) === 0 ? 'text-green-600' : ''}>
                  {parseFloat(order.shipping_charge ?? 0) === 0 ? 'FREE' : formatINR(parseFloat(order.shipping_charge))}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (5%)</span><span>{formatINR(parseFloat(order.gst_amount ?? 0))}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1a1a1a] pt-2 border-t border-gray-100">
                <span>Total</span><span>{formatINR(parseFloat(order.total_amount))}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Payment</span><span className="font-medium">{order.payment_method}</span>
              </div>
              <div className="flex justify-between text-gray-600 mt-1">
                <span>Placed</span>
                <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-[#1a1a1a] mb-4">Order Timeline</h2>
            <OrderStatusTimeline currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
