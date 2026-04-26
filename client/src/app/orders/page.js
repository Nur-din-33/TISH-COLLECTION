'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { ordersApi } from '../../lib/api';
import AuthGuard from '../../components/layout/AuthGuard';
import { useSocket } from '../../hooks/useSocket';

const statusColors = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border border-blue-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border border-purple-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
};

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    ordersApi.getAll()
      .then((res) => setOrders(res.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  useSocket('order:statusUpdated', ({ orderId, status }) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  });

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-2xl font-bold text-surface-900 mb-8 tracking-tight">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-28 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-surface-300 text-xl">0</span>
            </div>
            <h2 className="text-lg font-bold text-surface-700">No orders yet</h2>
            <p className="text-surface-500 mt-2 text-sm">Your orders will appear here once you shop.</p>
            <Link href="/products" className="btn-primary mt-5 inline-block">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card hover:shadow-elegant transition-all duration-300">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-surface-900">Order #{order.orderNumber}</p>
                    <p className="text-xs text-surface-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-surface-900">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span key={item.id} className="text-xs bg-surface-50 text-surface-600 px-3 py-1.5 rounded-lg border border-surface-100">
                      {item.product.name} x {item.quantity}
                    </span>
                  ))}
                </div>

                {order.payment && (
                  <div className="mt-3 pt-3 border-t border-surface-100 flex items-center gap-2 text-xs text-surface-500">
                    <span className={`font-medium px-2 py-0.5 rounded-lg ${order.payment.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {order.payment.method}: {order.payment.status}
                    </span>
                    {order.payment.mpesaReceiptNumber && (
                      <span>Receipt: {order.payment.mpesaReceiptNumber}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  );
}
