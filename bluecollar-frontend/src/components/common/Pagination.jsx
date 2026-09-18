export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end   = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const btn      = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
  const active   = 'bg-navy text-white';
  const inactive = 'bg-white text-[#6b6b6b] border border-[#e8e0d8] hover:border-accent hover:text-accent';
  const disabled = 'opacity-40 cursor-not-allowed bg-white text-[#6b6b6b] border border-[#e8e0d8]';

  return (
    <div className="flex items-center gap-1 justify-center mt-6">
      <button
        className={`${btn} ${currentPage === 1 ? disabled : inactive}`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹ Prev
      </button>

      {start > 1 && (
        <>
          <button className={`${btn} ${inactive}`} onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className="px-2 text-[#6b6b6b]">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`${btn} ${p === currentPage ? active : inactive}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-[#6b6b6b]">…</span>}
          <button className={`${btn} ${inactive}`} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        className={`${btn} ${currentPage === totalPages ? disabled : inactive}`}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next ›
      </button>
    </div>
  );
}
