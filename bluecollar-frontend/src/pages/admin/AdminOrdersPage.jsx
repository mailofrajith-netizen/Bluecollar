import { useState, useEffect, useCallback } from 'react';
import OrderTable from '../../components/admin/OrderTable';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import Toast from '../../components/common/Toast';
import { getAdminOrders } from '../../api/admin';

const STATUS_OPTIONS = ['', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');

  const LIMIT = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await getAdminOrders(params);
      setOrders(res.data?.data?.orders ?? []);
      setTotal(res.data?.data?.pagination?.total ?? 0);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  function handleStatusUpdated(orderId, newStatus) {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  }

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div className="space-y-5">
      <Toast />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1a1a1a]">Orders</h1>
        <span className="text-sm text-gray-400">{total} total</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by order # or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s || 'All Statuses'}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        {loading ? <div className="py-16"><Spinner /></div> : (
          <>
            <OrderTable orders={orders} onStatusUpdated={handleStatusUpdated} />
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
