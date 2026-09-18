import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="bg-cream min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-navy/10 mb-2 leading-none">404</p>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Page Not Found</h1>
        <p className="text-[#6b6b6b] text-sm mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-accent text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
