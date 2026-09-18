import { Link } from 'react-router-dom';

const STATS = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '50+',     label: 'Styles Available' },
  { value: '7-Day',   label: 'Easy Returns' },
];

export default function AboutSection() {
  return (
    <section className="py-16 lg:py-20" style={{ backgroundColor: '#f5f0eb' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: image panel */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden" style={{ backgroundColor: '#e8e0d8' }}>
              <img
                src="/images/about-shirts.jpg"
                alt="Bluecollar premium wrinkle-free shirts"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.opacity = '0'; }}
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 -right-4 sm:right-4 rounded-2xl px-6 py-4 shadow-xl" style={{ backgroundColor: '#1a2744' }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: '#c8922a' }}>Est. 2020</p>
              <p className="text-white font-bold text-sm">Crafted for Professionals</p>
            </div>
          </div>

          {/* Right: content */}
          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: '#c8922a' }}>OUR STORY</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-5" style={{ color: '#1a2744' }}>
              Built for the<br />
              <span className="italic">Modern Professional</span>
            </h2>
            <div className="w-10 h-0.5 mb-6" style={{ backgroundColor: '#c8922a' }} />
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#4a4a4a' }}>
              At Bluecollar, we believe that looking sharp shouldn't come at the cost of comfort. Our wrinkle-free shirts are engineered with premium fabric technology — so you go from morning meetings to evening events without missing a beat.
            </p>
            <p className="text-sm leading-relaxed mb-8" style={{ color: '#4a4a4a' }}>
              Every stitch is crafted with precision. Every fabric is chosen for its breathability, durability, and ease of care. We're not just selling shirts — we're giving professionals their confidence back.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y" style={{ borderColor: '#e8e0d8' }}>
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-bold text-xl mb-0.5" style={{ color: '#1a2744' }}>{s.value}</p>
                  <p className="text-xs" style={{ color: '#6b6b6b' }}>{s.label}</p>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-3 text-white text-xs font-bold px-7 py-3.5 hover:opacity-90 transition-opacity tracking-[0.15em] uppercase rounded-sm"
              style={{ backgroundColor: '#1a2744' }}
            >
              LEARN MORE
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
