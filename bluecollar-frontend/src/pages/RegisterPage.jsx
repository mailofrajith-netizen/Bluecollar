import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/common/Toast';
import useToast from '../hooks/useToast';
import { register } from '../api/auth';

export default function RegisterPage() {
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
  });
  const [errors,           setErrors]           = useState({});
  const [submitting,       setSubmitting]       = useState(false);
  const [verifyEmailSent,  setVerifyEmailSent]  = useState(false);
  const [registeredEmail,  setRegisteredEmail]  = useState('');

  function validate() {
    const e = {};
    if (!form.name.trim())                    e.name     = 'Full name is required.';
    if (!form.email.trim())                   e.email    = 'Email is required.';
    if (!form.phone.trim())                   e.phone    = 'Phone number is required.';
    if (!form.password)                       e.password = 'Password is required.';
    else if (form.password.length < 8)        e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm)       e.confirm  = 'Passwords do not match.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password });
      const data = res.data?.data ?? {};
      if (data.requires_verification) {
        setRegisteredEmail(form.email.trim());
        setVerifyEmailSent(true);
      } else {
        navigate('/login', { replace: true, state: { successMessage: 'Account created successfully! Please sign in.' } });
      }
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function field(key, label, type = 'text', placeholder = '') {
    return (
      <div>
        <label className="block text-xs font-semibold text-[#6b6b6b] mb-1">{label}</label>
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder={placeholder}
          className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors bg-cream ${errors[key] ? 'border-red-400' : 'border-[#e8e0d8]'}`}
        />
        {errors[key] && <p className="text-xs text-red-600 mt-1">{errors[key]}</p>}
      </div>
    );
  }

  if (verifyEmailSent) {
    return (
      <div className="bg-cream min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-accent/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Check your email</h1>
          <p className="text-[#6b6b6b] text-sm mb-1">We sent a verification link to</p>
          <p className="font-semibold text-[#1a1a1a] mb-6">{registeredEmail}</p>
          <p className="text-[#6b6b6b] text-sm mb-8">Click the link in the email to verify your account and start shopping.</p>
          <Link to="/login" className="inline-block bg-accent text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm">
            Go to Login
          </Link>
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Create your account</h1>
          <p className="text-[#6b6b6b] text-sm mt-1">Join Bluecollar and enjoy seamless shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e8e0d8] p-8 space-y-4">
          {field('name',     'Full Name',        'text',     'John Doe')}
          {field('email',    'Email Address',    'email',    'you@example.com')}
          {field('phone',    'Phone Number',     'tel',      '+91 9876543210')}
          {field('password', 'Password',         'password', '••••••••')}
          {field('confirm',  'Confirm Password', 'password', '••••••••')}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm disabled:opacity-50 mt-2"
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-[#6b6b6b] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-medium hover:text-orange-600 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
