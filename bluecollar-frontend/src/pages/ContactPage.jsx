import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

const ICON_EMAIL = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);
const ICON_TRACK = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-9 5.25-9-5.25v-2.25" />
  </svg>
);
const ICON_RETURN = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export default function ContactPage() {
  const { contactEmail } = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const contactCards = [
    { label: 'Email Us',            value: contactEmail,              desc: 'We reply within 24 hours',        icon: ICON_EMAIL  },
    { label: 'Track Your Order',    value: 'Use our Track Order page', desc: 'Enter your order ID and email',  icon: ICON_TRACK  },
    { label: 'Returns & Exchanges', value: '7-day easy returns',       desc: 'Hassle-free, no questions asked', icon: ICON_RETURN },
  ];

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="bg-cream">

      {/* Hero */}
      <section className="py-20 px-4 text-center" style={{ background: '#0a0e1a' }}>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-4">Get In Touch</p>
        <h1 className="font-serif text-5xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Have a question about your order, sizing, or our shirts? We're here to help.
        </p>
      </section>

      {/* Info cards */}
      <section className="py-14 px-4 bg-navy">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {contactCards.map((c) => (
            <div key={c.label} className="rounded-xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 text-accent" style={{ background: 'rgba(232,114,42,0.15)', border: '1px solid rgba(232,114,42,0.25)' }}>
                {c.icon}
              </div>
              <p className="text-white font-semibold text-sm mb-1">{c.label}</p>
              <p className="text-accent text-sm font-medium mb-1">{c.value}</p>
              <p className="text-gray-400 text-xs">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact form + track order */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Form */}
          <div className="bg-white rounded-2xl p-8 border border-[#e8e0d8] shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-6">Send Us a Message</h2>

            {sent ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="font-semibold text-[#1a1a1a] mb-2">Message Sent!</p>
                <p className="text-sm text-[#6b6b6b]">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider mb-1.5">Name</label>
                    <input
                      name="name" value={form.name} onChange={handleChange} required
                      placeholder="Your name"
                      className="w-full border border-[#e8e0d8] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#aaa] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 bg-cream transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider mb-1.5">Email</label>
                    <input
                      name="email" value={form.email} onChange={handleChange} required type="email"
                      placeholder="your@email.com"
                      className="w-full border border-[#e8e0d8] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#aaa] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 bg-cream transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider mb-1.5">Subject</label>
                  <input
                    name="subject" value={form.subject} onChange={handleChange} required
                    placeholder="Order issue, sizing question..."
                    className="w-full border border-[#e8e0d8] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#aaa] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 bg-cream transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider mb-1.5">Message</label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange} required rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full border border-[#e8e0d8] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#aaa] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 bg-cream transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent text-white text-xs font-semibold py-3.5 hover:bg-orange-600 transition-colors tracking-widest uppercase"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Track order CTA */}
          <div className="flex flex-col gap-5">
            <div className="bg-navy rounded-2xl p-8 text-white flex-1">
              <h3 className="font-serif text-xl font-bold mb-3">Track Your Order</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Already placed an order? Use our order tracking page to get real-time updates on your delivery.
              </p>
              <Link
                to="/track-order"
                className="inline-flex items-center gap-2 border border-white/40 text-white text-xs font-semibold px-6 py-3 hover:bg-white/10 transition-all tracking-widest uppercase"
              >
                Track My Order
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-[#e8e0d8]">
              <h3 className="font-serif text-xl font-bold text-[#1a1a1a] mb-3">Returns & Exchanges</h3>
              <p className="text-[#6b6b6b] text-sm leading-relaxed mb-4">
                Not satisfied? We offer 7-day hassle-free returns. Your satisfaction is our priority.
              </p>
              <p className="text-xs text-[#6b6b6b]">
                Email us at <span className="text-accent font-semibold">{contactEmail}</span> with your order number.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
