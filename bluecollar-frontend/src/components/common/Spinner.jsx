export default function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  return (
    <div className="flex justify-center items-center p-8">
      <div className={`${s} animate-spin rounded-full border-4 border-gray-200 border-t-blue-700`} />
    </div>
  );
}
