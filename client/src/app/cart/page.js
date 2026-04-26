'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useCartStore, useAuthStore } from '../../lib/store';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const total = getTotal();

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mb-2">
            <span className="text-surface-300 text-3xl">0</span>
          </div>
          <h2 className="text-xl font-bold text-surface-800">Your cart is empty</h2>
          <p className="text-surface-500 text-sm">Add some products and they&apos;ll appear here.</p>
          <Link href="/products" className="btn-primary mt-2">Start Shopping</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-2xl font-bold text-surface-900 mb-8 tracking-tight">Shopping Cart <span className="text-surface-400 font-normal text-lg">({items.length})</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="card flex items-start gap-4">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-surface-100">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-300 text-lg">+</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-surface-800 line-clamp-2">{item.name}</h3>
                  <p className="text-surface-900 font-bold mt-1">{formatPrice(item.price)}</p>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-surface-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 hover:bg-surface-100 transition-colors"
                      >
                        <MinusIcon className="w-3.5 h-3.5 text-surface-600" />
                      </button>
                      <span className="px-4 text-sm font-semibold text-surface-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-2 hover:bg-surface-100 transition-colors"
                      >
                        <PlusIcon className="w-3.5 h-3.5 text-surface-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-surface-400 hover:text-red-500 p-1.5 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm font-bold text-surface-900 whitespace-nowrap">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}

            <button onClick={clearCart} className="text-sm text-surface-400 hover:text-red-500 font-medium flex items-center gap-1.5 transition-colors">
              <TrashIcon className="w-4 h-4" /> Clear cart
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-lg font-bold text-surface-900 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-surface-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-surface-900">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-surface-600">
                  <span>Shipping</span>
                  <span className="text-surface-500 text-xs">At checkout</span>
                </div>
              </div>
              <div className="border-t border-surface-100 mt-4 pt-4 flex justify-between font-bold text-surface-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button onClick={handleCheckout} className="btn-primary w-full mt-5 py-3">
                Proceed to Checkout
              </button>
              <Link href="/products" className="block text-center text-sm text-surface-500 hover:text-surface-700 mt-3 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
