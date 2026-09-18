import { formatINR } from '../../utils/currency';

export default function ProductTable({ products, onEdit, onDelete, onManageVariants, onManageImages }) {
  if (!products.length) {
    return <p className="text-gray-400 text-sm py-8 text-center">No products found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
            <th className="text-left py-3 pr-4 font-semibold">Product</th>
            <th className="text-right py-3 pr-4 font-semibold">Price</th>
            <th className="text-center py-3 pr-4 font-semibold">Discount</th>
            <th className="text-center py-3 pr-4 font-semibold">Stock</th>
            <th className="text-center py-3 pr-4 font-semibold">Variants</th>
            <th className="text-center py-3 pr-4 font-semibold">Status</th>
            <th className="text-right py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((product) => {
            const discount = parseFloat(product.discount_percent ?? 0);
            const salePrice = discount > 0
              ? parseFloat(product.base_price) * (1 - discount / 100)
              : null;
            const stock = product.total_stock != null ? parseInt(product.total_stock) : null;

            return (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 pr-4">
                  <div className="font-medium text-[#1a1a1a]">{product.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{product.slug}</div>
                </td>
                <td className="py-3 pr-4 text-right">
                  {salePrice ? (
                    <div>
                      <div className="font-medium text-green-700">{formatINR(salePrice)}</div>
                      <div className="text-xs text-gray-400 line-through">{formatINR(parseFloat(product.base_price))}</div>
                    </div>
                  ) : (
                    <div className="font-medium">{formatINR(parseFloat(product.base_price))}</div>
                  )}
                </td>
                <td className="py-3 pr-4 text-center">
                  {discount > 0 ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                      {discount}% OFF
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-center">
                  {stock != null ? (
                    <span className={`text-xs font-semibold ${stock === 0 ? 'text-red-600' : stock <= 10 ? 'text-orange-600' : 'text-gray-700'}`}>
                      {stock === 0 ? 'Out' : stock}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-center text-gray-600">{product.variant_count ?? '—'}</td>
                <td className="py-3 pr-4 text-center">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => onManageImages?.(product)}
                    className="text-purple-600 hover:text-purple-800 font-medium mr-3 text-xs"
                  >
                    Images
                  </button>
                  <button
                    onClick={() => onManageVariants?.(product)}
                    className="text-gray-500 hover:text-gray-700 font-medium mr-3 text-xs"
                  >
                    Variants
                  </button>
                  <button
                    onClick={() => onEdit?.(product)}
                    className="text-blue-700 hover:text-blue-900 font-medium mr-3 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete?.(product)}
                    className="text-red-500 hover:text-red-700 font-medium text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
