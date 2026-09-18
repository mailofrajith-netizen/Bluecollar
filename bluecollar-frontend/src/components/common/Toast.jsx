import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';

const BG = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-700' };

export default function Toast() {
  const { toasts } = useContext(ToastContext);

  if (!toasts?.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${BG[t.type] ?? BG.info} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
