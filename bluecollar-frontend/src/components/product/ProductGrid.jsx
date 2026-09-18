import ProductCard from './ProductCard';
import Spinner from '../common/Spinner';

export default function ProductGrid({ products, loading }) {
  if (loading) return <Spinner />;
  if (!products?.length) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <span className="text-5xl mb-4">🔍</span>
      <p className="text-lg font-medium">No products found</p>
      <p className="text-sm mt-1">Try adjusting your filters</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
