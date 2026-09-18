import { useState, useEffect, useRef } from 'react';

export default function ImageGallery({ images = [] }) {
  const [active, setActive]   = useState(0);
  const [paused, setPaused]   = useState(false);
  const intervalRef           = useRef(null);

  const base = import.meta.env.VITE_API_BASE_URL + '/storage/';

  useEffect(() => {
    setActive(0);
  }, [images]);

  useEffect(() => {
    if (images.length <= 1) return;
    if (paused) return;

    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(intervalRef.current);
  }, [images.length, paused]);

  if (!images.length) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-8xl">
        👔
      </div>
    );
  }

  function goTo(i) {
    setActive(i);
    clearInterval(intervalRef.current);
    setPaused(false);
  }

  function prev() {
    goTo((active - 1 + images.length) % images.length);
  }

  function next() {
    goTo((active + 1) % images.length);
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="aspect-square overflow-hidden rounded-2xl bg-gray-50 relative group"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <img
          key={active}
          src={base + images[active].image_path}
          alt={images[active].alt_text || 'Product image'}
          className="w-full h-full object-cover transition-opacity duration-500"
        />

        {/* Arrows — visible on hover */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Next image"
            >
              <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all ${i === active ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id ?? i}
              onClick={() => goTo(i)}
              className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${
                i === active ? 'border-accent' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={base + img.image_path}
                alt={img.alt_text || ''}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
