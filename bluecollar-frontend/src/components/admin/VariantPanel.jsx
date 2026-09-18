import { useState, useEffect } from 'react';
import { addVariant, updateVariant, deleteVariant } from '../../api/admin';
import { getProduct } from '../../api/products';
import useToast from '../../hooks/useToast';
import { formatINR } from '../../utils/currency';

const EMPTY_VARIANT = { size: '', color: '', stock: '', price_override: '' };
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export default function VariantPanel({ productId, productSlug, onRefresh }) {
  const { showToast } = useToast();
  const [variants,    setVariants]    = useState([]);
  const [loadingVars, setLoadingVars] = useState(true);
  const [form,        setForm]        = useState(EMPTY_VARIANT);
  const [saving,      setSaving]      = useState(false);
  const [editId,      setEditId]      = useState(null);

  useEffect(() => {
    if (!productSlug) { setLoadingVars(false); return; }
    getProduct(productSlug)
      .then((res) => {
        const data = res.data?.data;
        setVariants(data?.variants ?? []);
      })
      .catch(() => setVariants([]))
      .finally(() => setLoadingVars(false));
  }, [productSlug]);

  function startEdit(v) {
    setEditId(v.id);
    setForm({ size: v.size, color: v.color, stock: v.stock, price_override: v.price_override ?? '' });
  }

  function cancelEdit() { setEditId(null); setForm(EMPTY_VARIANT); }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.size || !form.color || form.stock === '') { showToast('Size, color and stock are required.', 'error'); return; }
    setSaving(true);
    try {
      const payload = { size: form.size, color: form.color, stock: parseInt(form.stock, 10), price_override: form.price_override || null };
      if (editId) {
        await updateVariant(productId, editId, payload);
        setVariants((prev) => prev.map((v) => v.id === editId ? { ...v, ...payload } : v));
        showToast('Variant updated.', 'success');
        cancelEdit();
      } else {
        const res = await addVariant(productId, payload);
        const newVariant = res.data?.data?.variant ?? { ...payload, id: Date.now() };
        setVariants((prev) => [...prev, newVariant]);
        showToast('Variant added.', 'success');
        setForm(EMPTY_VARIANT);
      }
      onRefresh?.();
    } catch (err) {
      showToast(err.message || 'Failed to save variant.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(variantId) {
    if (!window.confirm('Delete this variant?')) return;
    try {
      await deleteVariant(productId, variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      showToast('Variant deleted.', 'success');
      onRefresh?.();
    } catch (err) {
      showToast(err.message || 'Failed to delete variant.', 'error');
    }
  }

  if (loadingVars) return (
    <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-400">
      <svg className="w-5 h-5 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading variants…
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Existing variants */}
      {variants.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left py-2 pr-3 font-semibold">Size</th>
                <th className="text-left py-2 pr-3 font-semibold">Color</th>
                <th className="text-right py-2 pr-3 font-semibold">Stock</th>
                <th className="text-right py-2 pr-3 font-semibold">Price Override</th>
                <th className="text-right py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {variants.map((v) => (
                <tr key={v.id} className={editId === v.id ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}>
                  <td className="py-2 pr-3 font-medium">{v.size}</td>
                  <td className="py-2 pr-3">{v.color}</td>
                  <td className="py-2 pr-3 text-right">{v.stock}</td>
                  <td className="py-2 pr-3 text-right">{v.price_override ? formatINR(parseFloat(v.price_override)) : '—'}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => startEdit(v)} className="text-blue-700 hover:text-blue-900 font-medium text-xs mr-3">Edit</button>
                    <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / edit form */}
      <div className="relative">
        {saving && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10 rounded-xl">
            <svg className="w-7 h-7 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}
        <form onSubmit={handleSave} className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-600">{editId ? 'Edit Variant' : 'Add New Variant'}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Size</label>
            <select
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select</option>
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Color</label>
            <input
              type="text"
              placeholder="e.g. Navy Blue"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Stock</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Price Override (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Optional"
              value={form.price_override}
              onChange={(e) => setForm({ ...form, price_override: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1a1a1a] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : editId ? 'Update Variant' : 'Add Variant'}
          </button>
          {editId && (
            <button type="button" onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2">
              Cancel
            </button>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}
