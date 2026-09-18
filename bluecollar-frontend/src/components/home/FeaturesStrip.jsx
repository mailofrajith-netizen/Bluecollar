const features = [
  {
    label: 'Wrinkle Free',
    desc: 'Stay sharp all day without the iron.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2M3 12c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2M3 17c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2" />
      </svg>
    ),
  },
  {
    label: 'Premium Fabric',
    desc: 'High quality fabric for maximum comfort.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    label: 'Long Lasting',
    desc: 'Strong stitches and premium quality for durability.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    label: 'Perfect Fit',
    desc: 'Tailored to give you a smart and confident look.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

export default function FeaturesStrip() {
  return (
    <section className="text-white py-12" style={{ backgroundColor: '#1a2744' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {features.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-3">
              <div className="text-accent">{f.icon}</div>
              <span className="font-semibold text-sm text-white leading-tight">{f.label}</span>
              <span className="text-xs leading-relaxed" style={{ color: '#a0aec0' }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
