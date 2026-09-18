import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import FilterPanel  from '../components/product/FilterPanel';
import SortDropdown from '../components/product/SortDropdown';
import ProductGrid  from '../components/product/ProductGrid';
import Pagination   from '../components/common/Pagination';
import Toast        from '../components/common/Toast';

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,    setProducts]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [showFilter,  setShowFilter]  = useState(false);

  const [filters, setFilters] = useState({
    sizes:    [],
    colors:   [],
    minPrice: '',
    maxPrice: '',
  });
  const [search, setSearch]     = useState(searchParams.get('search') || '');
  const [sort,   setSort]       = useState(searchParams.get('sort')   || '');
  const [page,   setPage]       = useState(Number(searchParams.get('page')) || 1);

  const LIMIT = 16;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: LIMIT,
        sort:  sort || undefined,
      };
      if (search)           params.search    = search;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (filters.sizes.length)  params.size  = filters.sizes[0];
      if (filters.colors.length) params.color = filters.colors[0];

      const res = await getProducts(params);
      setProducts(res.data?.data?.items      ?? []);
      setTotal(res.data?.data?.total ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const p = {};
    if (page > 1) p.page = page;
    if (sort)     p.sort = sort;
    if (search)   p.search = search;
    setSearchParams(p, { replace: true });
  }, [page, sort, search]);

  function handleSort(val) { setSort(val); setPage(1); }
  function handleSearch(e) { setSearch(e.target.value); setPage(1); }
  function handleFilters(f) { setFilters(f); setPage(1); }

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div className="bg-cream min-h-screen">
      <Toast />
      {/* Page header */}
      <div className="bg-white border-b border-[#e8e0d8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-1">OUR COLLECTION</p>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">All Shirts</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`lg:w-64 shrink-0 ${showFilter ? '' : 'hidden lg:block'}`}>
            <FilterPanel filters={filters} onChange={handleFilters} />
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                className="lg:hidden flex items-center gap-2 border border-[#e8e0d8] bg-white rounded-lg px-4 py-2 text-sm font-medium text-[#1a1a1a] hover:border-accent transition-colors"
                onClick={() => setShowFilter((v) => !v)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Filters
              </button>
              <input
                type="text"
                placeholder="Search shirts…"
                value={search}
                onChange={handleSearch}
                className="flex-1 min-w-40 border border-[#e8e0d8] bg-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              />
              <SortDropdown value={sort} onChange={handleSort} />
              <span className="text-sm text-[#6b6b6b] whitespace-nowrap">{total} products</span>
            </div>

            <ProductGrid products={products} loading={loading} />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
