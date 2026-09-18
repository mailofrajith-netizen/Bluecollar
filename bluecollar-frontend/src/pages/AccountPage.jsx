import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/common/Toast';
import Spinner from '../components/common/Spinner';
import InvoiceDownloadButton from '../components/order/InvoiceDownloadButton';
import useAuth  from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { getProfile, updateProfile } from '../api/auth';
import { getOrders } from '../api/orders';
import { formatINR } from '../utils/currency';

const TABS = ['My Profile', 'My Orders'];

const inputCls = (err) =>
  `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors bg-cream ${err ? 'border-red-400' : 'border-[#e8e0d8]'}`;

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState('My Profile');

  // Profile state
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', current_password: '', new_password: '', confirm: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Orders state
  const [orders,       setOrders]       = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage,   setOrdersPage]   = useState(1);
  const [ordersTotal,  setOrdersTotal]  = useState(0);
  const ORDERS_LIMIT = 10;

  useEffect(() => {
    getProfile()
      .then((res) => {
        const u = res.data?.data;
        if (u) setProfileForm((prev) => ({ ...prev, name: u.name ?? '', phone: u.phone ?? '' }));
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  useEffect(() => {
    if (tab !== 'My Orders') return;
    setOrdersLoading(true);
    getOrders({ page: ordersPage, limit: ORDERS_LIMIT })
      .then((res) => {
        setOrders(res.data?.data?.orders ?? []);
        setOrdersTotal(res.data?.data?.pagination?.total ?? 0);
      })
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [tab, ordersPage]);

  function validateProfile() {
    const e = {};
    if (!profileForm.name.trim())  e.name = 'Name is required.';
    if (!profileForm.phone.trim()) e.phone = 'Phone is required.';
    if (profileForm.new_password) {
      if (profileForm.new_password.length < 8) e.new_password = 'Password must be at least 8 characters.';
      if (profileForm.new_password !== profileForm.confirm) e.confirm = 'Passwords do not match.';
      if (!profileForm.current_password.trim()) e.current_password = 'Current password is required to change password.';
    }
    return e;
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    setProfileErrors({});
    setSavingProfile(true);
    try {
      const payload = { name: profileForm.name.trim(), phone: profileForm.phone.trim() };
      if (profileForm.new_password) {
        payload.current_password = profileForm.current_password;
        payload.new_password     = profileForm.new_password;
      }
      await updateProfile(payload);
      setProfileForm((prev) => ({ ...prev, current_password: '', new_password: '', confirm: '' }));
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  const totalOrderPages = Math.ceil(ordersTotal / ORDERS_LIMIT) || 1;

  return (
    <div className="bg-cream min-h-screen">
      <Toast />
      {/* Header */}
      <div className="bg-white border-b border-[#e8e0d8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">My Account</h1>
            {user?.name && <p className="text-[#6b6b6b] text-sm mt-0.5">Hi, {user.name}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 mb-8 border-b border-[#e8e0d8]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors ${
                tab === t
                  ? 'text-accent border-b-2 border-accent -mb-px'
                  : 'text-[#6b6b6b] hover:text-[#1a1a1a]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* My Profile */}
        {tab === 'My Profile' && (
          loadingProfile
            ? <div className="py-16"><Spinner /></div>
            : (
              <div className="bg-white rounded-xl border border-[#e8e0d8] p-6 max-w-md">
                <h2 className="font-bold text-[#1a1a1a] mb-5">Personal Information</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6b6b6b] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className={inputCls(profileErrors.name)}
                    />
                    {profileErrors.name && <p className="text-xs text-red-600 mt-1">{profileErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6b6b6b] mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                      className="w-full border border-[#e8e0d8] rounded-lg px-3 py-2.5 text-sm bg-cream text-[#6b6b6b] cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6b6b6b] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className={inputCls(profileErrors.phone)}
                    />
                    {profileErrors.phone && <p className="text-xs text-red-600 mt-1">{profileErrors.phone}</p>}
                  </div>

                  <div className="pt-2 border-t border-[#e8e0d8]">
                    <p className="text-xs font-semibold text-[#6b6b6b] mb-3">Change Password (leave blank to keep current)</p>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="password"
                          placeholder="Current password"
                          value={profileForm.current_password}
                          onChange={(e) => setProfileForm({ ...profileForm, current_password: e.target.value })}
                          className={inputCls(profileErrors.current_password)}
                        />
                        {profileErrors.current_password && <p className="text-xs text-red-600 mt-1">{profileErrors.current_password}</p>}
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="New password"
                          value={profileForm.new_password}
                          onChange={(e) => setProfileForm({ ...profileForm, new_password: e.target.value })}
                          className={inputCls(profileErrors.new_password)}
                        />
                        {profileErrors.new_password && <p className="text-xs text-red-600 mt-1">{profileErrors.new_password}</p>}
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={profileForm.confirm}
                          onChange={(e) => setProfileForm({ ...profileForm, confirm: e.target.value })}
                          className={inputCls(profileErrors.confirm)}
                        />
                        {profileErrors.confirm && <p className="text-xs text-red-600 mt-1">{profileErrors.confirm}</p>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full bg-accent text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )
        )}

        {/* My Orders */}
        {tab === 'My Orders' && (
          ordersLoading
            ? <div className="py-16"><Spinner /></div>
            : orders.length === 0
              ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white border border-[#e8e0d8] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#6b6b6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                  </div>
                  <p className="text-[#6b6b6b] text-sm">You haven't placed any orders yet.</p>
                </div>
              )
              : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl border border-[#e8e0d8] p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-xs text-[#6b6b6b] uppercase tracking-wider font-semibold">Order</p>
                          <p className="font-bold text-accent">{order.order_number}</p>
                          <p className="text-xs text-[#6b6b6b] mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                            'bg-accent/10 text-accent'
                          }`}>
                            {order.status}
                          </span>
                          <p className="font-bold text-[#1a1a1a] mt-2">{formatINR(parseFloat(order.total_amount))}</p>
                        </div>
                      </div>
                      {order.item_count > 0 && (
                        <div className="text-sm text-[#6b6b6b] mb-3">
                          {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                        </div>
                      )}
                      <InvoiceDownloadButton orderId={order.id} orderNumber={order.order_number} />
                    </div>
                  ))}

                  {totalOrderPages > 1 && (
                    <div className="flex justify-center gap-2 pt-4">
                      {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setOrdersPage(p)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            p === ordersPage
                              ? 'bg-accent text-white'
                              : 'bg-white border border-[#e8e0d8] text-[#6b6b6b] hover:border-accent hover:text-accent'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
        )}
      </div>
    </div>
  );
}
