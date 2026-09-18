import { Link } from 'react-router-dom';

const VALUES = [
  {
    title: 'Wrinkle-Free Promise',
    desc: 'Every shirt we make is engineered to stay crisp from the first meeting to the last. No ironing. Ever.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2M3 12c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2" />
      </svg>
    ),
  },
  {
    title: 'Premium Fabric Only',
    desc: 'We source only the finest wrinkle-resistant twill and poplin fabrics, selected for comfort, durability, and a sharp appearance.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    title: 'Built for the Modern Professional',
    desc: 'Designed for people who move fast, work hard, and need to look sharp — without spending time at the ironing board.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: 'Fair & Transparent Pricing',
    desc: 'Premium quality doesn\'t have to mean premium prices. We cut out the middleman so you get more for less.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const STATS = [
  { number: '10,000+', label: 'Happy Customers' },
  { number: '4.9/5',   label: 'Average Rating' },
  { number: '8+',      label: 'Shirt Styles' },
  { number: '7 Days',  label: 'Easy Returns' },
];

export default function AboutPage() {
  return (
    <div className="bg-cream">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-navy-dark py-24 px-4" style={{ background: '#0a0e1a' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-5">Our Story</p>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Shirts That Work<br />
            <span className="italic text-accent">As Hard As You Do.</span>
          </h1>
          <p className="text-gray-300 text-base leading-relaxed max-w-xl mx-auto">
            Bluecollar was born from a simple frustration — great shirts that need ironing every single morning.
            We set out to fix that. One wrinkle-free shirt at a time.
          </p>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="bg-navy py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl font-bold text-accent mb-1">{s.number}</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">Our Mission</p>
            <h2 className="font-serif text-4xl font-bold text-[#1a1a1a] leading-tight mb-6">
              Look Sharp.<br />Every Single Day.
            </h2>
            <p className="text-[#6b6b6b] text-sm leading-relaxed mb-5">
              We believe the way you dress affects how you feel and how others perceive you. A crisp, well-fitted shirt
              signals professionalism, confidence, and attention to detail — without saying a word.
            </p>
            <p className="text-[#6b6b6b] text-sm leading-relaxed mb-8">
              Bluecollar is built on the idea that premium shouldn't be painful. No ironing. No fuss.
              Just shirts that keep you looking sharp from the boardroom to the evening out.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-accent text-white text-xs font-semibold px-7 py-3.5 hover:bg-orange-600 transition-colors tracking-widest uppercase"
            >
              Shop the Collection
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Visual card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1f2e', minHeight: '360px', position: 'relative' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2M3 12c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2M3 17c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2" />
                </svg>
              </div>
              <p className="font-serif text-2xl font-bold text-white mb-3">100% Wrinkle Free</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Our proprietary fabric technology keeps every shirt smooth and sharp all day long — no iron required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ background: '#f5f0eb' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">What We Stand For</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1a1a1a]">The Bluecollar Way</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-xl p-7 border border-[#e8e0d8]">
                <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-5">
                  {v.icon}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1a1a1a] mb-3">{v.title}</h3>
                <p className="text-sm text-[#6b6b6b] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-navy text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">Ready to Upgrade?</p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-6">
          Your Wardrobe Deserves Better.
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Explore our full range of wrinkle-free shirts. Find your perfect fit, colour, and style today.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-accent text-white text-xs font-semibold px-8 py-4 hover:bg-orange-600 transition-colors tracking-widest uppercase"
        >
          Shop All Shirts
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </section>

    </div>
  );
}
