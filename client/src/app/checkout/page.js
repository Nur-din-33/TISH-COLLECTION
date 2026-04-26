'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import AuthGuard from '../../components/layout/AuthGuard';
import Footer from '../../components/layout/Footer';
import { useCartStore, useAuthStore } from '../../lib/store';
import { ordersApi, paymentsApi } from '../../lib/api';
import toast from 'react-hot-toast';

function CheckoutContent() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const total = mounted ? getTotal() : 0;

  const [form, setForm] = useState({
    shippingAddress: '',
    shippingCity: 'Nairobi',
    phone: '',
    notes: '',
  });
  const [step, setStep]           = useState('details');
  const [orderId, setOrderId]     = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setForm((f) => ({
        ...f,
        phone: user.phone || '',
        shippingAddress: user.address || '',
        shippingCity: user.city || 'Nairobi',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (mounted && items.length === 0 && step !== 'done') {
      router.push('/cart');
    }
  }, [mounted, items, step, router]);

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!form.shippingAddress || !form.phone) {
      toast.error('Please fill in your delivery address and phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await ordersApi.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        ...form,
      });
      setOrderId(res.data.order.id);
      setOrderNumber(res.data.order.orderNumber);
      setStep('payment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaPayment = async () => {
    setLoading(true);
    setStep('processing');
    try {
      await paymentsApi.initiateMpesa({ orderId, phone: form.phone });
      toast.success('M-Pesa request sent! Check your phone and enter your PIN.');

      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        if (attempts > 24) {
          clearInterval(interval);
          toast.error('Payment timeout. Please try again.');
          setStep('payment');
          setLoading(false);
          return;
        }
        try {
          const statusRes = await paymentsApi.checkStatus(orderId);
          if (statusRes.data?.status?.ResultCode === 0) {
            clearInterval(interval);
            clearCart();
            setStep('done');
            setLoading(false);
          }
        } catch {}
      }, 5000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed.');
      setStep('payment');
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">

        {/* Step: Delivery Details */}
        {step === 'details' && (
          <form onSubmit={handlePlaceOrder}>
            <h1 className="text-2xl font-bold text-surface-900 mb-8 tracking-tight">Delivery Details</h1>
            <div className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Phone Number (M-Pesa) *</label>
                <input type="tel" placeholder="e.g. 0712345678" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field" required />
                <p className="text-xs text-surface-400 mt-1">Payment request will be sent to this number</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Delivery Address *</label>
                <input type="text" placeholder="e.g. Tom Mboya St, Apartment 3B" value={form.shippingAddress}
                  onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">City / Town *</label>
                <input type="text" placeholder="e.g. Nairobi" value={form.shippingCity}
                  onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Order Notes (optional)</label>
                <textarea rows={3} placeholder="Special delivery instructions..." value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field resize-none" />
              </div>
            </div>

            {/* Order summary */}
            <div className="card mt-4">
              <h3 className="font-semibold text-surface-900 mb-3">Order Summary</h3>
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm py-1.5 text-surface-600">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-medium text-surface-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-surface-100 mt-3 pt-3 flex justify-between font-bold text-surface-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-5 py-3.5 text-base">
              {loading ? 'Placing Order...' : 'Place Order & Pay with M-Pesa'}
            </button>
          </form>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-surface-900 mb-2 tracking-tight">Pay with M-Pesa</h1>
            <p className="text-surface-500 mb-8">Order #{orderNumber}</p>
            <div className="card">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-500 text-xl font-bold">M</span>
              </div>
              <h2 className="text-2xl font-bold text-surface-900 mb-2">{formatPrice(total)}</h2>
              <p className="text-surface-500 text-sm mb-6">
                We&apos;ll send an M-Pesa prompt to <strong>{form.phone}</strong>. Enter your PIN to complete.
              </p>
              <button onClick={handleMpesaPayment} disabled={loading}
                className="btn-accent w-full py-3.5 text-base">
                {loading ? 'Sending Request...' : 'Pay with M-Pesa'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-2 border-surface-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-surface-900 mb-3">Waiting for Payment...</h2>
            <p className="text-surface-500 mb-1">Check your phone <strong>{form.phone}</strong></p>
            <p className="text-surface-400 text-sm">Enter your M-Pesa PIN to complete the payment.</p>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-green-600 text-3xl font-bold">&#10003;</span>
            </div>
            <h2 className="text-3xl font-bold text-surface-900 mb-3">Payment Confirmed</h2>
            <p className="text-surface-600 mb-1">Order <strong>#{orderNumber}</strong> is confirmed.</p>
            <p className="text-surface-500 mb-8 text-sm">You&apos;ll receive an SMS with updates.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/orders" className="btn-primary">Track My Order</a>
              <a href="/products" className="btn-secondary">Continue Shopping</a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutContent />
    </AuthGuard>
  );
}
