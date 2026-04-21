'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useCartStore, useAuthStore } from '../../lib/store';
import { ordersApi, paymentsApi } from '../../lib/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();

  // Use state to avoid SSR hydration issues with Zustand
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

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [mounted, user, router]);

  // Redirect if cart empty
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
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Delivery Details</h1>
            <div className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (M-Pesa) *</label>
                <input type="tel" placeholder="e.g. 0712345678" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field" required />
                <p className="text-xs text-gray-400 mt-1">Payment request will be sent to this number</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                <input type="text" placeholder="e.g. Tom Mboya St, Apartment 3B" value={form.shippingAddress}
                  onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Town *</label>
                <input type="text" placeholder="e.g. Nairobi" value={form.shippingCity}
                  onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (optional)</label>
                <textarea rows={3} placeholder="Special delivery instructions..." value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field resize-none" />
              </div>
            </div>

            {/* Order summary */}
            <div className="card mt-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm py-1.5 text-gray-600">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t mt-3 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-red-700">{formatPrice(total)}</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-5 py-3 text-base">
              {loading ? 'Placing Order...' : 'Place Order & Pay with M-Pesa'}
            </button>
          </form>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pay with M-Pesa</h1>
            <p className="text-gray-500 mb-6">Order #{orderNumber}</p>
            <div className="card">
              <div className="text-6xl mb-4">📱</div>
              <h2 className="text-xl font-bold text-green-700 mb-2">{formatPrice(total)}</h2>
              <p className="text-gray-600 text-sm mb-6">
                We'll send an M-Pesa prompt to <strong>{form.phone}</strong>. Enter your PIN to complete.
              </p>
              <button onClick={handleMpesaPayment} disabled={loading}
                className="btn-primary w-full py-3 text-base bg-green-700 hover:bg-green-800">
                {loading ? 'Sending Request...' : '💚 Pay with M-Pesa'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 animate-bounce">📲</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Waiting for Payment...</h2>
            <p className="text-gray-500 mb-2">Check your phone <strong>{form.phone}</strong></p>
            <p className="text-gray-500">Enter your M-Pesa PIN to complete the payment.</p>
            <div className="mt-8 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-3 h-3 bg-green-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="text-center py-16">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-green-700 mb-3">Payment Confirmed!</h2>
            <p className="text-gray-600 mb-2">Order <strong>#{orderNumber}</strong> is confirmed.</p>
            <p className="text-gray-500 mb-8">You'll receive an SMS with updates. Thank you!</p>
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
