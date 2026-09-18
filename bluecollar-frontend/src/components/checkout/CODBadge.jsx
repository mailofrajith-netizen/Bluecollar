export default function CODBadge() {
  return (
    <div className="flex items-center gap-3 border border-amber-300 bg-amber-50 text-amber-800 rounded-xl px-4 py-3">
      <span className="text-xl">💵</span>
      <div>
        <p className="text-sm font-semibold">Cash on Delivery</p>
        <p className="text-xs text-amber-700 mt-0.5">Pay when your order arrives at your door</p>
      </div>
    </div>
  );
}
