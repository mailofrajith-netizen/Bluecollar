import { Link } from 'react-router-dom';
import StatusUpdateDropdown from './StatusUpdateDropdown';
import { formatINR } from '../../utils/currency';

const STATUS_COLORS = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Confirmed:  'bg-blue-100 text-blue-700',
  Processing: 'bg-indigo-100 text-indigo-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-600',
};

export default function OrderTable({ orders, onStatusUpdated }) {
  if (!orders.length) {
    return <p className="text-gray-400 text-sm py-8 text-center">No orders found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
            <th className="text-left py-3 pr-4 font-semibold">Order</th>
            <th className="text-left py-3 pr-4 font-semibold">Customer</th>
            <th className="text-left py-3 pr-4 font-semibold">Date</th>
            <th className="text-right py-3 pr-4 font-semibold">Total</th>
            <th className="text-left py-3 pr-4 font-semibold">Status</th>
            <th className="text-left py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-3 pr-4">
                <Link to={`/admin/orders/${order.id}`} className="font-semibold text-blue-700 hover:text-blue-900">
                  {order.order_number}
                </Link>
              </td>
              <td className="py-3 pr-4 text-gray-700">
                <div>{order.customer_name || order.name || '—'}</div>
                <div className="text-xs text-gray-400">{order.customer_email || order.email || ''}</div>
              </td>
              <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </td>
              <td className="py-3 pr-4 text-right font-medium">
                {formatINR(parseFloat(order.total_amount))}
              </td>
              <td className="py-3 pr-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
              </td>
              <td className="py-3">
                <StatusUpdateDropdown
                  orderId={order.id}
                  currentStatus={order.status}
                  onUpdated={(newStatus) => onStatusUpdated?.(order.id, newStatus)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
