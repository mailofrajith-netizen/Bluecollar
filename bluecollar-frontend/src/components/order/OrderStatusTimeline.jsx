const STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function OrderStatusTimeline({ currentStatus }) {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <span className="text-2xl">✕</span>
        <div>
          <p className="font-semibold text-red-700">Order Cancelled</p>
          <p className="text-xs text-red-500 mt-0.5">This order has been cancelled</p>
        </div>
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-2">
      {STEPS.map((step, i) => {
        const done    = i < currentIdx;
        const active  = i === currentIdx;
        const future  = i > currentIdx;
        return (
          <div key={step} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2 ${
              done   ? 'bg-blue-700 border-blue-700 text-white' :
              active ? 'bg-white border-blue-700 text-blue-700' :
                       'bg-gray-100 border-gray-200 text-gray-300'
            }`}>
              {done ? '✓' : i + 1}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${future ? 'text-gray-400' : 'text-[#1a1a1a]'}`}>{step}</p>
              {active && <p className="text-xs text-blue-600 font-medium">Current status</p>}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`absolute left-3.5 w-0.5 h-4 mt-7 ${done ? 'bg-blue-700' : 'bg-gray-200'}`} style={{ display: 'none' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
