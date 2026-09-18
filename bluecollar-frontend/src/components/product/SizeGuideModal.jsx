import Modal from '../common/Modal';

const SIZE_CHART = [
  { size: 'XS',   chest: '36–37', shoulder: '16.5', length: '28' },
  { size: 'S',    chest: '38–39', shoulder: '17',   length: '28.5' },
  { size: 'M',    chest: '40–41', shoulder: '17.5', length: '29' },
  { size: 'L',    chest: '42–43', shoulder: '18',   length: '29.5' },
  { size: 'XL',   chest: '44–45', shoulder: '18.5', length: '30' },
  { size: 'XXL',  chest: '46–47', shoulder: '19',   length: '30.5' },
  { size: 'XXXL', chest: '48–50', shoulder: '19.5', length: '31' },
];

export default function SizeGuideModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Size Guide">
      <p className="text-sm text-[#6b6b6b] mb-4">All measurements are in inches. For best fit, measure over a well-fitting shirt.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream text-[#6b6b6b]">
              <th className="text-left px-3 py-2 font-semibold">Size</th>
              <th className="text-left px-3 py-2 font-semibold">Chest (in)</th>
              <th className="text-left px-3 py-2 font-semibold">Shoulder (in)</th>
              <th className="text-left px-3 py-2 font-semibold">Length (in)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e0d8]">
            {SIZE_CHART.map((row) => (
              <tr key={row.size} className="hover:bg-cream transition-colors">
                <td className="px-3 py-2 font-semibold text-[#1a1a1a]">{row.size}</td>
                <td className="px-3 py-2 text-[#6b6b6b]">{row.chest}</td>
                <td className="px-3 py-2 text-[#6b6b6b]">{row.shoulder}</td>
                <td className="px-3 py-2 text-[#6b6b6b]">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-[#6b6b6b]">Note: Measurements may vary slightly by style. When in doubt, size up.</p>
    </Modal>
  );
}
