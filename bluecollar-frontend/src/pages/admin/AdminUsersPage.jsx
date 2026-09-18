import { useState, useEffect, useCallback } from 'react';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import { getAdminUsers } from '../../api/admin';

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');

  const LIMIT = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      const res = await getAdminUsers(params);
      const d = res.data?.data ?? {};
      const registered = (d.registered ?? []).map((u) => ({ ...u, type: 'registered' }));
      const guests     = (d.guests     ?? []).map((u) => ({ ...u, name: u.guest_name, email: u.guest_email, phone: u.guest_phone, type: 'guest' }));
      setUsers([...registered, ...guests]);
      setTotal((d.total_registered ?? 0) + (d.total_guests ?? 0));
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1a1a1a]">Users</h1>
        <span className="text-sm text-gray-400">{total} total</span>
      </div>

      <input
        type="text"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        {loading ? <div className="py-16"><Spinner /></div> : (
          <>
            {users.length === 0
              ? <p className="text-gray-400 text-sm text-center py-8">No users found.</p>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                        <th className="text-left py-3 pr-4 font-semibold">Name</th>
                        <th className="text-left py-3 pr-4 font-semibold">Email</th>
                        <th className="text-left py-3 pr-4 font-semibold">Phone</th>
                        <th className="text-center py-3 pr-4 font-semibold">Orders</th>
                        <th className="text-left py-3 pr-4 font-semibold">Type</th>
                        <th className="text-left py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((u) => (
                        <tr key={u.id ?? u.email} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 pr-4 font-medium text-[#1a1a1a]">{u.name || '—'}</td>
                          <td className="py-3 pr-4 text-gray-600">{u.email}</td>
                          <td className="py-3 pr-4 text-gray-600">{u.phone || '—'}</td>
                          <td className="py-3 pr-4 text-center text-gray-600">{u.order_count ?? 0}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              u.type === 'registered' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {u.type === 'registered' ? 'Registered' : 'Guest'}
                            </span>
                          </td>
                          <td className="py-3">
                            {u.type === 'registered' ? (
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {u.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
