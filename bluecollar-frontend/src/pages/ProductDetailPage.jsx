import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../api/products';
import ImageGallery   from '../components/product/ImageGallery';
import VariantSelector from '../components/product/VariantSelector';
import SizeGuideModal  from '../components/product/SizeGuideModal';
import Spinner         from '../components/common/Spinner';
import Toast           from '../components/common/Toast';
import useCart         from '../hooks/useCart';
import useToast        from '../hooks/useToast';
import { formatINR }   from '../utils/currency';

export default function ProductDetailPage() {
  const { slug }      = useParams();
  const navigate      = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product,       setProduct]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [selectedSize,  setSelectedSize]  = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sizeGuide,     setSizeGuide]     = useState(false);

  useEffect(() => {
    setLoading(true);
    getProduct(slug)
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          // API returns { product: {...}, images: [...], variants: [...] } — flatten it
          setProduct({
            ...(data.product ?? data),
            images:           data.images           ?? [],
            variants:         data.variants         ?? [],
            grouped_variants: data.grouped_variants ?? {},
          });
        } else {
          setProduct(null);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="bg-cream min-h-screen py-24 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!product) return (
    <div className="bg-cream min-h-screen py-24 text-center">
      <p className="text-xl font-semibold text-[#6b6b6b]">Product not found</p>
    </div>
  );

  const variants       = product.variants ?? [];
  const images         = product.images   ?? [];
  const selected       = selectedSize && selectedColor
    ? variants.find((v) => v.size === selectedSize && v.color === selectedColor)
    : null;
  const basePrice      = selected?.price_override ?? product.base_price;
  const discountPct    = parseFloat(product.discount_percent ?? 0);
  const price          = discountPct > 0
    ? Math.round(basePrice * (1 - discountPct / 100))
    : basePrice;
  const inStock        = selected ? selected.stock > 0 : false;
  const canAdd         = selected && inStock;

  function handleAddToCart() {
    if (!canAdd) return;
    const img = images.find((i) => i.is_primary)?.image_path ?? images[0]?.image_path ?? null;
    addToCart({
      variantId:   selected.id,
      productId:   product.id,
      productName: product.name,
      size:        selectedSize,
      color:       selectedColor,
      price,           // already discounted
      originalPrice: discountPct > 0 ? basePrice : undefined,
      quantity:    1,
      image:       img,
    });
    showToast('Added to cart!', 'success');
  }

  function handleBuyNow() {
    handleAddToCart();
    navigate('/cart');
  }

  return (
    <div className="bg-cream min-h-screen">
      <Toast />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <ImageGallery images={images} />

          {/* Info */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <p className="text-2xl font-bold text-accent">{formatINR(price)}</p>
                {discountPct > 0 && (
                  <>
                    <p className="text-lg text-gray-400 line-through">{formatINR(basePrice)}</p>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                      {discountPct}% OFF
                    </span>
                  </>
                )}
              </div>
              {selected && selected.stock > 0 && selected.stock <= 5 && (
                <p className="text-sm text-orange-500 mt-1">Only {selected.stock} left in stock!</p>
              )}
            </div>

            {product.description && (
              <p className="text-[#6b6b6b] text-sm leading-relaxed">{product.description}</p>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#1a1a1a]">Select Size & Color</span>
                <button
                  onClick={() => setSizeGuide(true)}
                  className="text-xs text-accent hover:text-orange-600 font-medium underline transition-colors"
                >
                  Size Guide
                </button>
              </div>
              <VariantSelector
                variants={variants}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSizeChange={setSelectedSize}
                onColorChange={setSelectedColor}
              />
            </div>

            {!selected && (
              <p className="text-sm text-[#6b6b6b]">Please select a size and color to continue.</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!canAdd}
                className="flex-1 bg-navy text-white font-semibold py-3 rounded-lg hover:bg-[#2a3148] transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {!selected ? 'Select a Variant' : !inStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!canAdd}
                className="flex-1 bg-accent text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            <div className="flex flex-wrap gap-4 pt-3 border-t border-[#e8e0d8]">
              <div className="flex items-center gap-2 text-xs text-[#6b6b6b]">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>100% Wrinkle-Free</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6b6b6b]">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>7-Day Returns</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6b6b6b]">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
                <span>Free Shipping ₹1999+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SizeGuideModal isOpen={sizeGuide} onClose={() => setSizeGuide(false)} />
    </div>
  );
}
