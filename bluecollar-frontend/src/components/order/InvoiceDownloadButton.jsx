import { useState } from 'react';
import { getInvoice } from '../../api/orders';

export default function InvoiceDownloadButton({ orderId, orderNumber }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!orderId) return;
    setLoading(true);
    try {
      const res    = await getInvoice(orderId);
      const url    = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link   = document.createElement('a');
      link.href    = url;
      link.download = `invoice-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not download invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading || !orderId}
      className="flex items-center gap-2 bg-white border border-[#e8e0d8] text-[#1a1a1a] font-medium px-4 py-2.5 rounded-xl hover:bg-cream transition-colors text-sm disabled:opacity-50"
    >
      {loading ? (
        <span className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full" />
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      )}
      {loading ? 'Downloading…' : 'Download Invoice'}
    </button>
  );
}
