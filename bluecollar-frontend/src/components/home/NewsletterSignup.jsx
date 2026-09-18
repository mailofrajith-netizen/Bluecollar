import { useState } from 'react';
import { subscribe } from '../../api/newsletter';
import useToast from '../../hooks/useToast';

export default function NewsletterSignup() {
  const { showToast } = useToast();
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribe(email);
      showToast("You're subscribed! Welcome to the Bluecollar family.", 'success');
      setEmail('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-navy text-white py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-4">NEWSLETTER</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Stay in the Loop</h2>
        <p className="mt-3 text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
          Get early access to new collections, exclusive offers, and style tips delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-accent hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}
