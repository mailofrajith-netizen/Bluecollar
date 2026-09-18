import { Link } from 'react-router-dom';

const FEATURES = [
  { label: 'WRINKLE FREE' },
  { label: 'PREMIUM FABRIC' },
  { label: 'PERFECT FIT' },
];

export default function HeroSection() {
  return (
    <section className="flex flex-col lg:flex-row" style={{ minHeight: '88vh' }}>

      {/* LEFT: cream text panel — 40% */}
      <div
        className="w-full lg:w-[40%] flex flex-col justify-center px-8 sm:px-12 lg:px-14 xl:px-16 py-16 lg:py-20 shrink-0"
        style={{ backgroundColor: '#f5f0eb' }}
      >
        <h1
          className="font-serif font-bold leading-[1.08] mb-4"
          style={{ color: '#1a2744', fontSize: 'clamp(2rem, 3.2vw, 3.5rem)' }}
        >
          Premium Shirts.<br />
          <span className="italic">Made for Everyday</span><br />
          Professionals.
        </h1>

        <div className="w-10 h-0.5 mb-5" style={{ backgroundColor: '#c8922a' }} />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-center gap-1.5">
              <span style={{ color: '#c8922a', fontSize: '10px' }}>✦</span>
              <span className="text-xs font-semibold tracking-wider" style={{ color: '#1a2744' }}>{f.label}</span>
            </div>
          ))}
        </div>

        <p className="text-sm leading-relaxed mb-8 max-w-xs" style={{ color: '#6b6b6b' }}>
          Designed for comfort. Built for style. Made to last.
        </p>

        <Link
          to="/products"
          className="inline-flex items-center gap-3 text-white text-xs font-bold px-8 py-4 hover:opacity-90 transition-opacity tracking-[0.18em] uppercase w-fit"
          style={{ backgroundColor: '#1a2744' }}
        >
          SHOP NOW
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* RIGHT: model photo — image is height-driven, full model visible */}
      <div
        className="w-full lg:w-[60%] flex items-center justify-center relative overflow-hidden"
        style={{ minHeight: '88vh', backgroundColor: '#f5f0eb' }}
      >
        <img
          src="/images/hero-model.jpg"
          alt="Bluecollar premium shirt model"
          style={{ height: '88vh', width: 'auto', maxWidth: '100%', display: 'block' }}
          onError={(e) => { e.currentTarget.style.opacity = '0'; }}
        />
        {/* Left blend into text panel */}
        <div
          className="absolute inset-y-0 left-0 w-1/4 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #f5f0eb 0%, transparent 100%)' }}
        />
      </div>

    </section>
  );
}
