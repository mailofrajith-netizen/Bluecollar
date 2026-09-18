const fields = [
  { key: 'name',             label: 'Full Name',        type: 'text',  required: true },
  { key: 'email',            label: 'Email Address',    type: 'email', required: true },
  { key: 'phone',            label: 'Phone Number',     type: 'tel',   required: true },
  { key: 'shipping_address', label: 'Address Line 1',   type: 'text',  required: true },
  { key: 'shipping_line2',   label: 'Address Line 2',   type: 'text',  required: false },
  { key: 'shipping_city',    label: 'City',             type: 'text',  required: true },
  { key: 'shipping_state',   label: 'State',            type: 'text',  required: true },
  { key: 'shipping_pincode', label: 'Pincode',          type: 'text',  required: true },
];

export default function AddressForm({ values, onChange, errors = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map(({ key, label, type, required }) => (
        <div key={key} className={key === 'shipping_address' || key === 'shipping_line2' ? 'sm:col-span-2' : ''}>
          <label className="block text-xs font-semibold text-[#6b6b6b] mb-1">
            {label} {required && <span className="text-red-400">*</span>}
          </label>
          <input
            type={type}
            value={values[key] ?? ''}
            onChange={(e) => onChange({ ...values, [key]: e.target.value })}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${
              errors[key] ? 'border-red-400' : 'border-[#e8e0d8]'
            }`}
            placeholder={label}
          />
          {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
        </div>
      ))}
    </div>
  );
}
