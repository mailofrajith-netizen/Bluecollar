import { useState, useEffect, useCallback } from 'react';
import ProductTable from '../../components/admin/ProductTable';
import ProductFormModal from '../../components/admin/ProductFormModal';
import VariantPanel from '../../components/admin/VariantPanel';
import ProductImagesPanel from '../../components/admin/ProductImagesPanel';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';
import { getAdminProducts, deleteProduct } from '../../api/admin';

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products,    setProducts]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [status,      setStatus]      = useState('');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [variantOpen, setVariantOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState(null);
  const [imagesOpen, setImagesOpen]     = useState(false);
  const [imagesProduct, setImagesProduct] = useState(null);

  const LIMIT = 15;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await getAdminProducts(params);
      setProducts(res.data?.data?.products ?? []);
      setTotal(res.data?.data?.pagination?.total ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function handleEdit(product) {
    setEditProduct(product);
    setModalOpen(true);
  }

  function handleManageVariants(product) {
    setVariantProduct(product);
    setVariantOpen(true);
  }

  function handleManageImages(product) {
    setImagesProduct(product);
    setImagesOpen(true);
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product.id);
      showToast('Product deleted.', 'success');
      fetchProducts();
    } catch (err) {
      showToast(err.message || 'Failed to delete product.', 'error');
    }
  }

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div className="space-y-5">
      <Toast />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1a1a1a]">Products</h1>
        <button
          onClick={() => { setEditProduct(null); setModalOpen(true); }}
          className="bg-[#1a1a1a] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
        >
          + Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-40 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        {loading ? <div className="py-16"><Spinner /></div> : (
          <>
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageVariants={handleManageVariants}
              onManageImages={handleManageImages}
            />
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editProduct}
        onSaved={fetchProducts}
        onManageVariants={(p) => {
          setModalOpen(false);
          setVariantProduct(p);
          setVariantOpen(true);
        }}
      />

      {variantOpen && variantProduct && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={() => setVariantOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-[#1a1a1a]">Variants — {variantProduct.name}</h2>
              <button onClick={() => setVariantOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>
            <VariantPanel
              productId={variantProduct.id}
              productSlug={variantProduct.slug}
              onRefresh={fetchProducts}
            />
          </div>
        </div>
      )}

      {imagesOpen && imagesProduct && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={() => setImagesOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-[#1a1a1a]">Images — {imagesProduct.name}</h2>
              <button onClick={() => setImagesOpen(false)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>
            <ProductImagesPanel
              productId={imagesProduct.id}
              productName={imagesProduct.name}
              onRefresh={fetchProducts}
            />
          </div>
        </div>
      )}
    </div>
  );
}
