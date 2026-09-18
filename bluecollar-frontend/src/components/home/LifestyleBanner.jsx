import { Link } from 'react-router-dom';

export default function LifestyleBanner() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: '#1a2744', minHeight: '360px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <div className="w-10 h-0.5 mb-5" style={{ backgroundColor: '#c8922a' }} />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
              Premium Quality.<br />
              Honest Pricing.
            </h2>
            <p className="text-lg font-medium mb-2" style={{ color: '#c8922a' }}>Work. Meet. Repeat.</p>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: '#a0aec0' }}>
              Our shirts keep you ready for everything.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 border-2 text-white text-xs font-bold px-7 py-3.5 hover:bg-white hover:text-[#1a2744] transition-all duration-200 tracking-[0.18em] uppercase"
              style={{ borderColor: 'white' }}
            >
              SHOP COLLECTIONS
            </Link>
          </div>

          {/* Right: shirts image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm aspect-[4/3] rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <img
                src="/images/shirts-stack.jpg"
                alt="Premium Bluecollar shirts"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.opacity = '0'; }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
