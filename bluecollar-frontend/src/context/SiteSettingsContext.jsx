import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axios';

const DEFAULTS = {
  announcementText:   'Free Shipping on orders above ₹999',
  announcementActive: '0',
  whatsappNumber:     '919555280207',
  address:            'Bluecollar Apparels, Bangalore, Karnataka',
  contactEmail:       'orders@bluecollarshop.in',
};

const SiteSettingsContext = createContext(DEFAULTS);

export function formatPhone(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '+91 9555 280 207';
  const local = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
  return `+91 ${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    apiClient.get('/api/settings/public')
      .then((res) => {
        const d = res.data?.data ?? {};
        setSettings({
          announcementText:   d.announcement_text   || DEFAULTS.announcementText,
          announcementActive: d.announcement_active ?? '0',
          whatsappNumber:     d.company_phone       || DEFAULTS.whatsappNumber,
          address:            d.company_address     || DEFAULTS.address,
          contactEmail:       d.company_email       || DEFAULTS.contactEmail,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
