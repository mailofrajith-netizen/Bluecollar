import { useState, useEffect, useRef } from 'react';
import { addProductImage, deleteProductImage } from '../../api/admin';
import useToast from '../../hooks/useToast';

const BASE = import.meta.env.VITE_API_BASE_URL + '/storage/';

export default function ProductImagesPanel({ productId, productName, onRefresh }) {
  const { showToast } = useToast();
  const fileRef           = useRef(null);
  const [images,        setImages]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [uploading,     setUploading]     = useState(false);
  const [preview,       setPreview]       = useState(null);
  const [isPrimary,     setIsPrimary]     = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    fetchImages();
  }, [productId]);

  async function fetchImages() {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}`,
      );
      const json = await res.json();
      const data = json?.data;
      setImages(data?.images ?? []);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPreview(files.length === 1
      ? URL.createObjectURL(files[0])
      : null);
    setSelectedCount(files.length);
  }

  async function handleUpload(e) {
    e.preventDefault();
    const files = Array.from(fileRef.current?.files ?? []);
    if (!files.length) { showToast('Please select at least one image.', 'error'); return; }
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append('image', files[i]);
        fd.append('is_primary', (isPrimary && i === 0) ? '1' : '0');
        fd.append('alt_text', productName ?? '');
        await addProductImage(productId, fd);
      }
      showToast(files.length === 1 ? 'Image uploaded.' : `${files.length} images uploaded.`, 'success');
      setPreview(null);
      setSelectedCount(0);
      setIsPrimary(false);
      if (fileRef.current) fileRef.current.value = '';
      await fetchImages();
      onRefresh?.();
    } catch (err) {
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId) {
    if (!window.confirm('Delete this image?')) return;
    try {
      await deleteProductImage(productId, imageId);
      showToast('Image deleted.', 'success');
      await fetchImages();
      onRefresh?.();
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error');
    }
  }

  return (
    <div className="space-y-5">
      {/* Existing images */}
      <div>
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">
          Current Images
          {images.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-500">({images.length} total)</span>
          )}
        </h3>

        {loading ? (
          <div className="text-sm text-gray-400 py-4 text-center">Loading…</div>
        ) : images.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-sm text-gray-400">No images yet. Upload one below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border-2 border-gray-100 aspect-square bg-gray-50">
                <img
                  src={BASE + img.image_path}
                  alt={img.alt_text || 'Product image'}
                  className="w-full h-full object-cover"
                />
                {/* Primary badge */}
                {img.is_primary == 1 && (
                  <span className="absolute top-1.5 left-1.5 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                    Primary
                  </span>
                )}
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Delete image"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload new image */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Upload New Image</h3>
        <div className="relative">
          {uploading && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10 rounded-xl">
              <svg className="w-7 h-7 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          )}
          <form onSubmit={handleUpload} className="space-y-3">
            <div>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG or WebP — max 2 MB per image</p>
              {selectedCount > 1 && (
                <p className="text-xs text-green-600 mt-1 font-medium">{selectedCount} images selected</p>
              )}
            </div>

            {preview && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setPreview(null); setSelectedCount(0); if (fileRef.current) fileRef.current.value = ''; }}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-accent accent-orange-500"
              />
              <span className="text-sm text-gray-700">Set first image as primary (main display image)</span>
            </label>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-[#1a1a1a] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload Image
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
