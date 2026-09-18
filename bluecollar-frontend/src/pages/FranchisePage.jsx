export default function FranchisePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="py-20 text-white text-center" style={{ backgroundColor: '#1a2744' }}>
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: '#c8922a' }}>BUSINESS OPPORTUNITY</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">Our Franchise</h1>
          <div className="w-12 h-0.5 mx-auto mb-6" style={{ backgroundColor: '#c8922a' }} />
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            Partner with Bluecollar and bring premium wrinkle-free shirts to your city.
          </p>
        </div>
      </section>

      {/* Why Franchise */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center text-[#1a2744] mb-12">Why Franchise With Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Proven Brand', desc: 'Join a brand trusted by 10,000+ customers across India with a strong digital presence.' },
              { title: 'Low Investment', desc: 'Start your franchise with a competitive investment and high return potential.' },
              { title: 'Full Support', desc: 'Get complete training, marketing materials, and ongoing support from our team.' },
              { title: 'Exclusive Territory', desc: 'Operate as the exclusive Bluecollar franchise in your designated territory.' },
              { title: 'Premium Products', desc: 'Sell high-demand premium wrinkle-free shirts that sell themselves.' },
              { title: 'Fast ROI', desc: 'Most franchises break even within 6-12 months of operation.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-[#e8e0d8] shadow-sm">
                <div className="w-8 h-0.5 mb-4" style={{ backgroundColor: '#c8922a' }} />
                <h3 className="font-bold text-[#1a2744] text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-white text-center" style={{ backgroundColor: '#1a2744' }}>
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8">Contact us today and our franchise team will get back to you within 24 hours.</p>
          <a
            href="https://wa.me/919555280207?text=Hi%2C%20I%27m%20interested%20in%20Bluecollar%20franchise%20opportunities."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-white font-bold text-sm px-8 py-4 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#25d366', borderRadius: '8px' }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enquire on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
