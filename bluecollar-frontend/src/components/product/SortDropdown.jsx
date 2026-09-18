const OPTIONS = [
  { value: '',           label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'featured',   label: 'Featured' },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-[#e8e0d8] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-white transition-colors"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
