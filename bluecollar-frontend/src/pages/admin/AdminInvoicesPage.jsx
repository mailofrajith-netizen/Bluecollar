import { useState, useEffect, useCallback } from 'react';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import { getAdminInvoices, downloadInvoice } from '../../api/admin';
import { formatINR } from '../../utils/currency';

export default function AdminInvoicesPage() {
  const { showToast } = useToast();
  const [invoices,    setInvoices]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [downloading, setDownloading] = useState(null);

  const LIMIT = 20;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminInvoices({ page, limit: LIMIT });
      setInvoices(res.data?.data?.invoices ?? []);
      setTotal(res.data?.data?.pagination?.total ?? 0);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  async function handleDownload(invoice) {
    setDownloading(invoice.id);
    try {
      const res = await downloadInvoice(invoice.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `invoice-${invoice.order_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message || 'Failed to download invoice.', 'error');
    } finally {
      setDownloading(null);
    }
  }

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div className="space-y-5">
      <Toast />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1a1a1a]">Invoices</h1>
        <span className="text-sm text-gray-400">{total} invoices</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        {loading ? <div className="py-16"><Spinner /></div> : (
          <>
            {invoices.length === 0
              ? <p className="text-gray-400 text-sm text-center py-8">No invoices found.</p>
              : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                        <th className="text-left py-3 pr-4 font-semibold">Order #</th>
                        <th className="text-left py-3 pr-4 font-semibold">Customer</th>
                        <th className="text-left py-3 pr-4 font-semibold">Date</th>
                        <th className="text-right py-3 pr-4 font-semibold">Amount</th>
                        <th className="text-center py-3 pr-4 font-semibold">Status</th>
                        <th className="text-right py-3 font-semibold">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 pr-4 font-semibold text-blue-700">{inv.order_number}</td>
                          <td className="py-3 pr-4">
                            <div className="text-gray-700">{inv.customer_name || '—'}</div>
                            <div className="text-xs text-gray-400">{inv.customer_email || ''}</div>
                          </td>
                          <td className="py-3 pr-4 text-gray-500">
                            {new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 pr-4 text-right font-medium">{formatINR(parseFloat(inv.total_amount))}</td>
                          <td className="py-3 pr-4 text-center">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              inv.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                              inv.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDownload(inv)}
                              disabled={downloading === inv.id}
                              className="text-xs font-semibold text-blue-700 hover:text-blue-900 disabled:opacity-50"
                            >
                              {downloading === inv.id ? 'Downloading…' : 'PDF'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
