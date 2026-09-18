import { useState } from 'react';
import { updateOrderStatus } from '../../api/admin';
import useToast from '../../hooks/useToast';

const TRANSITIONS = {
  Pending:    ['Confirmed', 'Cancelled'],
  Confirmed:  ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped:    ['Delivered', 'Cancelled'],
  Delivered:  [],
  Cancelled:  [],
};

const STATUS_COLORS = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Confirmed:  'bg-blue-100 text-blue-700',
  Processing: 'bg-indigo-100 text-indigo-700',
  Shipped:    'bg-purple-100 text-purple-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-600',
};

export default function StatusUpdateDropdown({ orderId, currentStatus, onUpdated }) {
  const { showToast } = useToast();
  const [updating, setUpdating] = useState(false);
  const allowed = TRANSITIONS[currentStatus] ?? [];

  if (!allowed.length) {
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[currentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
        {currentStatus}
      </span>
    );
  }

  async function handleChange(e) {
    const newStatus = e.target.value;
    if (!newStatus) return;
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      showToast(`Order moved to ${newStatus}`, 'success');
      onUpdated?.(newStatus);
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <select
      defaultValue=""
      onChange={handleChange}
      disabled={updating}
      className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
    >
      <option value="" disabled>{currentStatus}</option>
      {allowed.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
