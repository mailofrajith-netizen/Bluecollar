import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/admin',           label: 'Dashboard',  exact: true },
  { to: '/admin/products',  label: 'Products' },
  { to: '/admin/orders',    label: 'Orders' },
  { to: '/admin/users',     label: 'Users' },
  { to: '/admin/invoices',  label: 'Invoices' },
  { to: '/admin/settings',  label: 'Settings' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('bluecollar_admin_token');
    navigate('/admin/login', { replace: true });
  }

  return (
    <aside className="w-60 min-h-screen bg-[#1a1a1a] text-white flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <span className="text-lg font-semibold tracking-wide">Bluecollar</span>
        <span className="ml-2 text-xs text-white/50">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              [
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white text-[#1a1a1a]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
