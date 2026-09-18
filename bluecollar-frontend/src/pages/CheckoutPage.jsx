import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AddressForm  from '../components/checkout/AddressForm';
import CODBadge     from '../components/checkout/CODBadge';
import Toast        from '../components/common/Toast';
import Spinner      from '../components/common/Spinner';
import { formatINR } from '../utils/currency';
import useCart      from '../hooks/useCart';
import useAuth      from '../hooks/useAuth';
import useToast     from '../hooks/useToast';
import { placeOrder }  from '../api/orders';
import { getProfile }  from '../api/auth';

const FREE_THRESHOLD = 1999;
const FLAT_SHIPPING  = 99;
const GST_RATE       = 0.05;

export default function CheckoutPage() {
  const navigate      = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [form,    setForm]    = useState({
    name: '', email: '', phone: '',
    shipping_address: '', shipping_line2: '',
    shipping_city: '', shipping_state: '', shipping_pincode: '',
    notes: '',
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(isAuthenticated);
  const formRef = useRef(null);

  const shipping = subtotal >= FREE_THRESHOLD ? 0 : FLAT_SHIPPING;
  const gst      = Math.round(subtotal * GST_RATE * 100) / 100;
  const total    = subtotal + shipping + gst;

  useEffect(() => {
    if (!isAuthenticated) { setLoadingProfile(false); return; }
    getProfile()
      .then((res) => {
        const u = res.data?.data;
        if (u) setForm((prev) => ({ ...prev, name: u.name ?? '', email: u.email ?? '', phone: u.phone ?? '' }));
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [isAuthenticated]);

  if (!cartItems.length) {
    navigate('/cart');
    return null;
  }

  function validate() {
    const e = {};
    if (!form.name.trim())             e.name             = 'Full name is required.';
    if (!form.email.trim())            e.email            = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email   = 'Enter a valid email address.';
    const phone = form.phone.trim().replace(/[\s\-()]/g, '');
    if (!phone)                        e.phone            = 'Phone number is required.';
    else if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(phone)) e.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6–9).';
    if (!form.shipping_address.trim()) e.shipping_address = 'Address is required.';
    if (!form.shipping_city.trim())    e.shipping_city    = 'City is required.';
    if (!form.shipping_state.trim())   e.shipping_state   = 'State is required.';
    const pincode = form.shipping_pincode.trim();
    if (!pincode)                      e.shipping_pincode = 'Pincode is required.';
    else if (!/^\d{6}$/.test(pincode)) e.shipping_pincode = 'Enter a valid 6-digit pincode.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      formRef.current?.querySelector('[class*="border-red"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const payload = {
        items:            cartItems.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
        shipping_address: form.shipping_address,
        shipping_line2:   form.shipping_line2 || undefined,
        shipping_city:    form.shipping_city,
        shipping_state:   form.shipping_state,
        shipping_pincode: form.shipping_pincode,
        name:             form.name,
        email:            form.email,
        phone:            form.phone,
        notes:            form.notes || undefined,
      };
      const res = await placeOrder(payload);
      const order = res.data?.data?.order;
      if (!order?.order_number) throw new Error('Order placement failed. Please try again.');
      clearCart();
      navigate(`/order-confirmation/${order.order_number}`, { state: { orderId: order.id, order } });
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length) {
        // Backend returns arrays per field; normalize to first-message strings
        const normalized = Object.fromEntries(
          Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
        );
        setErrors(normalized);
        showToast('Please fix the highlighted fields and try again.', 'error');
        setTimeout(() => {
          formRef.current?.querySelector('[class*="border-red"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingProfile) return (
    <div className="bg-cream min-h-screen py-24 flex items-center justify-center">
      <Spinner />
    </div>
  );

  return (
    <div className="bg-cream min-h-screen">
      <Toast />
      {/* Header */}
      <div className="bg-white border-b border-[#e8e0d8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Checkout</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Address */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-[#e8e0d8] p-6">
                <h2 className="font-bold text-[#1a1a1a] mb-4">Delivery Information</h2>
                <AddressForm values={form} onChange={setForm} errors={errors} />
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-[#6b6b6b] mb-1">Order Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any special instructions for your order…"
                    rows={3}
                    className="w-full border border-[#e8e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-cream transition-colors resize-none"
                  />
                </div>
              </div>
              <CODBadge />
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#e8e0d8] p-5 space-y-3">
                <h3 className="font-bold text-[#1a1a1a]">Order Summary</h3>
                {cartItems.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-sm">
                    <span className="text-[#6b6b6b] truncate max-w-[180px]">{item.productName} × {item.quantity}</span>
                    <span className="font-medium shrink-0 ml-2">{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-[#e8e0d8] pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-[#6b6b6b]">
                    <span>Subtotal</span><span>{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#6b6b6b]">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#6b6b6b]">
                    <span>GST (5%)</span><span>{formatINR(gst)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#1a1a1a] pt-2 border-t border-[#e8e0d8]">
                    <span>Total</span><span>{formatINR(total)}</span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm disabled:opacity-50"
              >
                {submitting ? 'Placing Order…' : 'Place Order (COD)'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
