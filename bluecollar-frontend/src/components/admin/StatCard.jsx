export default function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? 'bg-[#1a1a1a] text-white border-transparent' : 'bg-white border-gray-100'}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${accent ? 'text-white/60' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ? 'text-white' : 'text-[#1a1a1a]'}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${accent ? 'text-white/50' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
}
