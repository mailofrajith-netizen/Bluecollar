import { useState, useEffect } from 'react';
import Toast from '../../components/common/Toast';
import Spinner from '../../components/common/Spinner';
import useToast from '../../hooks/useToast';
import { getSettings, updateSettings } from '../../api/admin';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    announcement_text:   '',
    announcement_active: false,
    mail_enabled:        false,
    company_phone:       '',
    company_address:     '',
    company_email:       '',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    getSettings()
      .then((res) => {
        const s = res.data?.data ?? {};
        setForm({
          announcement_text:   s.announcement_text   ?? '',
          announcement_active: s.announcement_active === '1' || s.announcement_active === true,
          mail_enabled:        s.mail_enabled        === '1' || s.mail_enabled        === true,
          company_phone:       s.company_phone       ?? '',
          company_address:     s.company_address     ?? '',
          company_email:       s.company_email       ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        announcement_text:   form.announcement_text,
        announcement_active: form.announcement_active ? '1' : '0',
        mail_enabled:        form.mail_enabled        ? '1' : '0',
        company_phone:       form.company_phone,
        company_address:     form.company_address,
        company_email:       form.company_email,
      });
      showToast('Settings saved.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100';

  if (loading) return <div className="py-24"><Spinner /></div>;

  return (
    <div className="space-y-5 max-w-xl">
      <Toast />
      <h1 className="text-xl font-bold text-[#1a1a1a]">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Announcement Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-[#1a1a1a]">Announcement Bar</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Announcement Text</label>
            <input
              type="text"
              value={form.announcement_text}
              onChange={(e) => setForm({ ...form, announcement_text: e.target.value })}
              placeholder="Free shipping on orders above ₹1999!"
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.announcement_active}
                onChange={(e) => setForm({ ...form, announcement_active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
            </label>
            <span className="text-sm text-gray-600">Show announcement bar</span>
          </div>
        </div>

        {/* Contact & Business */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-[#1a1a1a]">Contact & Business</h2>
          <p className="text-xs text-gray-400 -mt-3">Shown in the footer, announcement bar, and Contact Us page.</p>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp / Phone Number</label>
            <input
              type="text"
              value={form.company_phone}
              onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
              placeholder="919555280207 (country code + number, no spaces)"
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">Enter digits only, e.g. <span className="font-mono">919876543210</span></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Business Address</label>
            <textarea
              rows={2}
              value={form.company_address}
              onChange={(e) => setForm({ ...form, company_address: e.target.value })}
              placeholder="Bluecollar Apparels, Bangalore, Karnataka"
              className={inputClass + ' resize-none'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Email</label>
            <input
              type="email"
              value={form.company_email}
              onChange={(e) => setForm({ ...form, company_email: e.target.value })}
              placeholder="orders@bluecollarshop.in"
              className={inputClass}
            />
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-[#1a1a1a] mb-4">Email Settings</h2>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.mail_enabled}
                onChange={(e) => setForm({ ...form, mail_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a1a1a]"></div>
            </label>
            <div>
              <span className="text-sm text-gray-600">Enable email sending</span>
              <p className="text-xs text-gray-400 mt-0.5">Required for email verification on registration and order confirmations</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#1a1a1a] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
