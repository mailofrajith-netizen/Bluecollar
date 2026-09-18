import { Navigate, Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';

/**
 * Layout for all admin panel pages.
 * Guards access by checking localStorage for 'bluecollar_admin_token'.
 * Redirects to /admin/login if the token is absent.
 */
export default function AdminLayout() {
  const token = localStorage.getItem('bluecollar_admin_token');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
