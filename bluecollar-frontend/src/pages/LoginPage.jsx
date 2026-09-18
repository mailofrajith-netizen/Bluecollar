import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Toast from '../components/common/Toast';
import useAuth  from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { login, resendVerification } from '../api/auth';

export default function LoginPage() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { login: setAuth } = useAuth();
  const { showToast } = useToast();
  const from           = location.state?.from?.pathname || '/account';
  const successMessage = location.state?.successMessage ?? '';

  const [form,            setForm]            = useState({ email: '', password: '' });
  const [errors,          setErrors]          = useState({});
  const [submitting,      setSubmitting]       = useState(false);
  const [unverifiedEmail, setUnverifiedEmail]  = useState('');
  const [resending,       setResending]        = useState(false);

  function validate() {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email is required.';
    if (!form.password.trim()) e.password = 'Password is required.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setUnverifiedEmail('');
    setSubmitting(true);
    try {
      const res = await login({ email: form.email.trim(), password: form.password });
      const { token, user } = res.data?.data ?? {};
      setAuth(token, user);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 403 && err.errors?.email_not_verified) {
        setUnverifiedEmail(form.email.trim());
      } else {
        showToast(err.message || 'Login failed. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      await resendVerification(unverifiedEmail);
      showToast('Verification email sent! Please check your inbox.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to resend verification email.', 'error');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="bg-cream min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Toast />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">B</span>
            <span className="font-bold text-xl text-[#1a1a1a]">bluecollar</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Welcome back</h1>
          <p className="text-[#6b6b6b] text-sm mt-1">Sign in to your Bluecollar account</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {unverifiedEmail && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm">
            <p className="font-semibold text-amber-800 mb-1">Email not verified</p>
            <p className="text-amber-700 mb-3">Please verify your email address before signing in. Check your inbox for the verification link.</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-accent font-semibold hover:text-orange-600 transition-colors disabled:opacity-50"
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e8e0d8] p-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6b6b6b] mb-1">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors bg-cream ${errors.email ? 'border-red-400' : 'border-[#e8e0d8]'}`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6b6b6b] mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors bg-cream ${errors.password ? 'border-red-400' : 'border-[#e8e0d8]'}`}
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm disabled:opacity-50 mt-2"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-[#6b6b6b] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-medium hover:text-orange-600 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
