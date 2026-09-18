import { formatINR } from '../../utils/currency';

export default function OrderItemsTable({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            <th className="px-3 py-2 text-left">Product</th>
            <th className="px-3 py-2 text-left">Size</th>
            <th className="px-3 py-2 text-left">Color</th>
            <th className="px-3 py-2 text-center">Qty</th>
            <th className="px-3 py-2 text-right">Unit Price</th>
            <th className="px-3 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-3 py-3 font-medium text-[#1a1a1a]">{item.product_name}</td>
              <td className="px-3 py-3 text-gray-600">{item.size}</td>
              <td className="px-3 py-3 text-gray-600">{item.color}</td>
              <td className="px-3 py-3 text-center text-gray-600">{item.quantity}</td>
              <td className="px-3 py-3 text-right text-gray-600">{formatINR(item.unit_price)}</td>
              <td className="px-3 py-3 text-right font-semibold">{formatINR(item.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
