import { useState, useEffect } from 'react';
import StatCard from '../../components/admin/StatCard';
import OrderTable from '../../components/admin/OrderTable';
import Spinner from '../../components/common/Spinner';
import { getAdminOrders } from '../../api/admin';
import { formatINR } from '../../utils/currency';

export default function AdminDashboard() {
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    getAdminOrders({ page: 1, limit: 5 })
      .then((res) => {
        const data = res.data?.data;
        const orders = data?.orders ?? [];
        setRecentOrders(orders);
        const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount ?? 0), 0);
        setStats({
          total:     data?.pagination?.total ?? 0,
          revenue:   totalRevenue,
          pending:   orders.filter((o) => o.status === 'Pending').length,
          delivered: orders.filter((o) => o.status === 'Delivered').length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleStatusUpdated(orderId, newStatus) {
    setRecentOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  }

  if (loading) return <div className="py-24"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1a1a1a]">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders"       value={stats?.total ?? 0}                    accent />
        <StatCard label="Pending (Recent)"  value={stats?.pending ?? 0}                  sub="In last 5 orders" />
        <StatCard label="Delivered (Recent)" value={stats?.delivered ?? 0}               sub="In last 5 orders" />
        <StatCard label="Recent Revenue"    value={formatINR(stats?.revenue ?? 0)}       sub="Last 5 orders" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-[#1a1a1a] mb-4">Recent Orders</h2>
        <OrderTable orders={recentOrders} onStatusUpdated={handleStatusUpdated} />
      </div>
    </div>
  );
}
