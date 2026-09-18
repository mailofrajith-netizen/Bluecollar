import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';

const NAV_LINKS = [
  { label: 'HOME',          to: '/' },
  { label: 'COLLECTIONS',   to: '/products' },
  { label: 'OUR FRANCHISE', to: '/franchise' },
  { label: 'OUR STORES',    to: '/stores' },
  { label: 'ABOUT US',      to: '/about' },
  { label: 'CONTACT',       to: '/contact' },
];

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo.svg');
  const [logoFailed, setLogoFailed] = useState(false);

  function handleLogoError() {
    if (logoSrc === '/logo.svg') {
      setLogoSrc('/logo.png');
    } else if (logoSrc === '/logo.png') {
      setLogoSrc('/logo.jpg');
    } else {
      setLogoFailed(true);
    }
  }

  function handleLogout() { logout(); navigate('/'); setOpen(false); }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e8e0d8] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden text-[#1a1a1a] p-1"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />}
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {!logoFailed ? (
              <img
                src={logoSrc}
                alt="Bluecollar"
                className="h-12 w-auto max-w-[200px] object-contain"
                onError={handleLogoError}
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center text-white font-bold text-sm">B</span>
                <span className="font-bold text-lg text-[#1a1a1a] tracking-tight">bluecollar</span>
              </div>
            )}
          </Link>
        </div>

        {/* Center: desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `text-xs font-semibold tracking-widest transition-colors ${isActive ? 'text-accent' : 'text-[#1a1a1a] hover:text-accent'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right: icons */}
        <div className="flex items-center gap-4">
          <button className="hidden md:block text-[#1a1a1a] hover:text-accent transition-colors" aria-label="Search">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/account" className="text-[#1a1a1a] hover:text-accent transition-colors" aria-label="Account">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </Link>
                <button onClick={handleLogout} className="text-xs font-medium text-[#6b6b6b] hover:text-red-500 transition-colors">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-[#1a1a1a] hover:text-accent transition-colors" aria-label="Login">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            )}
          </div>

          <Link to="/cart" className="relative text-[#1a1a1a] hover:text-accent transition-colors" aria-label="Cart">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-white border-t border-[#e8e0d8] px-4 py-5 space-y-4 shadow-lg">
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} onClick={() => setOpen(false)} className="block text-xs font-semibold tracking-widest text-[#1a1a1a] hover:text-accent transition-colors">{label}</Link>
          ))}
          <div className="border-t border-[#e8e0d8] pt-4">
            {isAuthenticated ? (
              <>
                <Link to="/account" onClick={() => setOpen(false)} className="block text-xs font-semibold tracking-widest text-[#1a1a1a] hover:text-accent mb-3 transition-colors">MY ACCOUNT</Link>
                <button onClick={handleLogout} className="text-xs font-semibold tracking-widest text-red-500 w-full text-left">LOGOUT</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block text-xs font-semibold tracking-widest text-accent">SIGN IN</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
