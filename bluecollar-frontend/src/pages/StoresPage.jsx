const STORES = [
  {
    city: 'Bangalore',
    name: 'Bluecollar — Koramangala',
    address: '12th Main, 5th Block, Koramangala, Bangalore - 560095',
    phone: '+91 9555 280 207',
    hours: 'Mon–Sat: 10 AM – 8 PM | Sun: 11 AM – 7 PM',
    mapUrl: 'https://maps.google.com',
  },
  {
    city: 'Bangalore',
    name: 'Bluecollar — Indiranagar',
    address: '100 Feet Road, Indiranagar, Bangalore - 560038',
    phone: '+91 9555 280 207',
    hours: 'Mon–Sat: 10 AM – 8 PM | Sun: 11 AM – 7 PM',
    mapUrl: 'https://maps.google.com',
  },
  {
    city: 'Bangalore',
    name: 'Bluecollar — JP Nagar',
    address: '24th Main, Phase 6, JP Nagar, Bangalore - 560078',
    phone: '+91 9555 280 207',
    hours: 'Mon–Sat: 10 AM – 8 PM | Sun: 11 AM – 7 PM',
    mapUrl: 'https://maps.google.com',
  },
];

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="py-20 text-white text-center" style={{ backgroundColor: '#1a2744' }}>
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: '#c8922a' }}>VISIT US</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">Our Stores</h1>
          <div className="w-12 h-0.5 mx-auto mb-6" style={{ backgroundColor: '#c8922a' }} />
          <p className="text-lg text-gray-300">
            Find a Bluecollar store near you and experience our premium shirts in person.
          </p>
        </div>
      </section>

      {/* Stores grid */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORES.map((store) => (
              <div key={store.name} className="bg-white rounded-2xl border border-[#e8e0d8] p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold px-2 py-1 rounded uppercase tracking-wider text-white" style={{ backgroundColor: '#c8922a' }}>{store.city}</span>
                </div>
                <h3 className="font-bold text-[#1a2744] text-lg mb-3">{store.name}</h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#c8922a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    <span className="leading-relaxed">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 shrink-0 text-[#c8922a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
                    </svg>
                    <a href={`tel:${store.phone.replace(/\s/g,'')}`} className="hover:text-[#1a2744] transition-colors">{store.phone}</a>
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-[#c8922a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{store.hours}</span>
                  </div>
                </div>
                <a
                  href={store.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-full flex items-center justify-center gap-2 border text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-[#1a2744]"
                  style={{ borderColor: '#1a2744' }}
                >
                  Get Directions
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                  </svg>
                </a>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white rounded-2xl border border-[#e8e0d8] p-8 text-center">
            <h3 className="font-serif text-2xl font-bold text-[#1a2744] mb-3">Don't See Your City?</h3>
            <p className="text-gray-600 mb-6">We're expanding rapidly. Shop online or enquire about franchise opportunities in your city.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/products" className="inline-flex items-center justify-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1a2744' }}>
                Shop Online
              </a>
              <a href="/franchise" className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl border hover:bg-gray-50 transition-colors text-[#1a2744]" style={{ borderColor: '#1a2744' }}>
                Franchise Enquiry
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
