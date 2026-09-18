import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: '7-Day Easy Returns',
    body: 'We offer a hassle-free 7-day return window from the date of delivery. If you are not fully satisfied with your purchase, you can return it for an exchange or store credit.',
  },
  {
    title: 'Eligibility Conditions',
    body: null,
    bullets: [
      'Item must be unused, unwashed, and in original condition with all tags attached.',
      'Return request must be raised within 7 days of delivery.',
      'Items on clearance sale or marked as non-returnable are not eligible.',
      'Original packaging must be intact.',
    ],
  },
  {
    title: 'How to Initiate a Return',
    body: null,
    bullets: [
      'Contact us via WhatsApp at +91 9555 280 207 or email orders@bluecollar.in.',
      'Share your order number and reason for return.',
      'Our team will guide you through the pickup or drop-off process.',
      'Once the item is received and inspected, we will process your exchange or credit within 3–5 business days.',
    ],
  },
  {
    title: 'Exchange Policy',
    body: 'We currently offer exchanges for a different size or colour of the same product, subject to availability. Exchanges are processed after the original item passes quality inspection.',
  },
  {
    title: 'Non-Returnable Items',
    body: 'Items that are damaged due to misuse, washed, altered, or missing tags will not be accepted for return. Bluecollar reserves the right to reject returns that do not meet the above conditions.',
  },
  {
    title: 'Refund Policy',
    body: 'Since we currently operate on Cash on Delivery (COD) only, refunds are issued as store credit or exchanged for another product. No cash refunds are provided.',
  },
  {
    title: 'Need Help?',
    body: null,
    cta: true,
  },
];

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="py-16 text-white text-center" style={{ backgroundColor: '#1a2744' }}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="w-10 h-0.5 mx-auto mb-5" style={{ backgroundColor: '#c8922a' }} />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">Return Policy</h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            Your satisfaction is our priority. We make returns simple and straightforward.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-[#1a2744] mb-3 flex items-center gap-2">
                <span className="w-1 h-5 rounded-sm inline-block" style={{ backgroundColor: '#c8922a' }} />
                {s.title}
              </h2>
              {s.body && (
                <p className="text-sm text-[#4a4a4a] leading-relaxed">{s.body}</p>
              )}
              {s.bullets && (
                <ul className="space-y-2 mt-1">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-[#4a4a4a] leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#c8922a' }} />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
              {s.cta && (
                <div className="bg-white border border-[#e8e0d8] rounded-2xl p-6 mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1a2744] mb-1">Contact our support team</p>
                    <p className="text-sm text-[#4a4a4a]">
                      WhatsApp / Call: <a href="tel:+919555280207" className="text-accent font-medium hover:underline">+91 9555 280 207</a>
                    </p>
                    <p className="text-sm text-[#4a4a4a]">
                      Email: <a href="mailto:orders@bluecollar.in" className="text-accent font-medium hover:underline">orders@bluecollar.in</a>
                    </p>
                  </div>
                  <a
                    href="https://wa.me/919555280207?text=Hi!%20I%20need%20help%20with%20a%20return."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white text-xs font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#25d366' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp Us
                  </a>
                </div>
              )}
            </div>
          ))}

          <div className="text-center pt-4">
            <Link
              to="/"
              className="text-sm font-semibold text-[#1a2744] hover:text-accent transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
