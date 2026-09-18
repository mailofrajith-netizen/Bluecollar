import { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { createProduct, updateProduct, addProductImage } from '../../api/admin';
import useToast from '../../hooks/useToast';

const EMPTY = {
  name: '',
  description: '',
  base_price: '',
  discount_percent: '',
  status: 'active',
};

export default function ProductFormModal({ isOpen, onClose, product, onSaved, onManageVariants }) {
  const { showToast } = useToast();
  const fileRef             = useRef(null);
  const [form,         setForm]         = useState(EMPTY);
  const [errors,       setErrors]       = useState({});
  const [saving,       setSaving]       = useState(false);
  const [preview,      setPreview]      = useState(null);
  const [selectedCount,setSelectedCount]= useState(0);

  const isEdit = !!product;

  useEffect(() => {
    if (isOpen) {
      setForm(product
        ? {
            name:             product.name,
            description:      product.description ?? '',
            base_price:       product.base_price,
            // Normalize: 0 or 0.00 from DB → empty string (shows blank, not "0")
            discount_percent: parseFloat(product.discount_percent) > 0
              ? String(parseFloat(product.discount_percent))
              : '',
            status:           product.status ?? 'active',
          }
        : EMPTY
      );
      setErrors({});
      setPreview(null);
      setSelectedCount(0);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [isOpen, product]);

  function validate() {
    const e = {};
    if (!form.name.trim())      e.name       = 'Product name is required.';
    if (!form.base_price)       e.base_price = 'Base price is required.';
    else if (parseFloat(form.base_price) <= 0) e.base_price = 'Price must be greater than 0.';
    if (form.discount_percent !== '') {
      const d = parseFloat(form.discount_percent);
      if (isNaN(d) || d < 0 || d > 90) e.discount_percent = 'Discount must be between 0 and 90.';
    }
    return e;
  }

  function handleFile(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setSelectedCount(files.length);
    setPreview(files.length === 1 ? URL.createObjectURL(files[0]) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      if (isEdit) {
        const jsonData = {
          name:             form.name.trim(),
          description:      form.description.trim(),
          base_price:       parseFloat(form.base_price),
          status:           form.status,
          // Always send discount so clearing the field (empty → 0) correctly removes it
          discount_percent: form.discount_percent !== '' ? parseFloat(form.discount_percent) : 0,
        };
        await updateProduct(product.id, jsonData);

        const file = fileRef.current?.files?.[0];
        if (file) {
          const fd = new FormData();
          fd.append('image', file);
          fd.append('is_primary', '1');
          fd.append('alt_text', form.name.trim());
          await addProductImage(product.id, fd);
        }
        showToast('Product updated.', 'success');
      } else {
        const fd = new FormData();
        fd.append('name',        form.name.trim());
        fd.append('description', form.description.trim());
        fd.append('base_price',  form.base_price);
        fd.append('status',      form.status);
        if (form.discount_percent !== '') fd.append('discount_percent', form.discount_percent);
        const files = Array.from(fileRef.current?.files ?? []);
        if (files.length > 0) fd.append('image', files[0]);
        const res = await createProduct(fd);
        if (files.length > 1) {
          const newId = res.data?.data?.product?.id;
          if (newId) {
            for (let i = 1; i < files.length; i++) {
              const imgFd = new FormData();
              imgFd.append('image', files[i]);
              imgFd.append('is_primary', '0');
              imgFd.append('alt_text', form.name.trim());
              await addProductImage(newId, imgFd);
            }
          }
        }
        showToast(
          files.length > 1
            ? `Product created with ${files.length} images.`
            : 'Product created. Use the Variants button to set stock.',
          'success'
        );
      }
      onSaved?.();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const discountedPrice = form.base_price && form.discount_percent
    ? (parseFloat(form.base_price) * (1 - parseFloat(form.discount_percent) / 100)).toFixed(2)
    : null;

  const totalStock    = parseInt(product?.total_stock  ?? 0);
  const variantCount  = parseInt(product?.variant_count ?? 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add New Product'}>
      <div className="relative">
        {saving && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10 rounded-xl">
            <svg className="w-7 h-7 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Classic Oxford Shirt"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Product description…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Base Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                placeholder="1499"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.base_price ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.base_price && <p className="text-xs text-red-600 mt-1">{errors.base_price}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Discount (%)
                <span className="ml-1 text-gray-400 font-normal">0–90</span>
              </label>
              <input
                type="number"
                min="0"
                max="90"
                step="1"
                value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                placeholder="0"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.discount_percent ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.discount_percent && <p className="text-xs text-red-600 mt-1">{errors.discount_percent}</p>}
              {discountedPrice && (
                <p className="text-xs text-green-600 mt-1">Selling price: ₹{discountedPrice}</p>
              )}
            </div>

            {/* Stock column */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Stock</label>
              {isEdit ? (
                <div className="border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {totalStock === 0
                      ? <span className="text-red-600">Out of stock</span>
                      : <span className={totalStock <= 10 ? 'text-orange-600' : 'text-gray-700'}>{totalStock} units</span>
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{variantCount} variant{variantCount !== 1 ? 's' : ''}</p>
                  <button
                    type="button"
                    onClick={() => onManageVariants?.(product)}
                    className="mt-2 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    Manage Variants &amp; Stock →
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Stock is set per size/colour variant. After creating this product, click <strong>Variants</strong> in the product list to add sizes and set stock.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Product Image{!isEdit && 's'}
              {!isEdit && <span className="ml-1 text-gray-400 font-normal">(select multiple)</span>}
            </label>
            <input
              ref={fileRef}
              type="file"
              multiple={!isEdit}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG or WebP — max 2 MB each</p>
            {selectedCount > 1 && (
              <p className="text-xs text-green-600 mt-1 font-medium">{selectedCount} images selected</p>
            )}
            {preview && <img src={preview} alt="preview" className="mt-2 h-20 rounded-lg object-cover" />}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#1a1a1a] text-white font-semibold px-5 py-2 rounded-xl hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
