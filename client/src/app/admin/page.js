'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import { adminApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { useAdminSocket, useSocket } from '../../hooks/useSocket';
import { subscribeToOrders, subscribeToProducts, unsubscribe } from '../../lib/supabase';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  CONFIRMED:  'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED:    'bg-indigo-100 text-indigo-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
};
const ALL_STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];

export default function AdminDashboard() {
  const router                              = useRouter();
  const { user }                            = useAuthStore();
  const [mounted, setMounted]               = useState(false);
  const [analytics, setAnalytics]           = useState(null);
  const [orders, setOrders]                 = useState([]);
  const [activeTab, setActiveTab]           = useState('dashboard');
  const [loading, setLoading]               = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');

  // Wait for Zustand to hydrate from localStorage before checking auth
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only redirect after mounted — avoids false logout during hydration
  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      toast.error('Admin access required');
      router.push('/');
      return;
    }
    fetchAnalytics();
    fetchOrders();
  }, [mounted, user]);

  // Socket.io real-time
  useAdminSocket();

  useSocket('order:new', (data) => {
    toast.success(`🛒 New order #${data.orderNumber} from ${data.customerName}`, { duration: 7000 });
    fetchOrders();
    fetchAnalytics();
  });

  useSocket('user:loggedIn', (data) => {
    toast(`👤 ${data.name} just logged in`, { icon: '🔔', duration: 6000 });
  });

  useSocket('user:registered', (data) => {
    toast.success(`🆕 New signup: ${data.name}`, { duration: 6000 });
    fetchAnalytics();
  });

  useSocket('order:statusUpdated', ({ orderId, status }) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  });

  // Supabase real-time
  useEffect(() => {
    if (!mounted || !user || user.role !== 'ADMIN') return;

    const orderChannel = subscribeToOrders((payload) => {
      setRealtimeStatus('live');
      if (payload.eventType === 'INSERT') {
        fetchOrders();
        fetchAnalytics();
      }
      if (payload.eventType === 'UPDATE') {
        setOrders((prev) =>
          prev.map((o) => o.id === payload.new.id ? { ...o, status: payload.new.status } : o)
        );
      }
    });

    const productChannel = subscribeToProducts((payload) => {
      if (payload.new.stock <= 5) {
        toast(`⚠️ Low stock: ${payload.new.name} — only ${payload.new.stock} left`, { icon: '📦', duration: 8000 });
      }
    });

    if (orderChannel || productChannel) setRealtimeStatus('live');
    else setRealtimeStatus('socket-only');

    return () => {
      unsubscribe(orderChannel);
      unsubscribe(productChannel);
    };
  }, [mounted, user]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const r = await adminApi.getAnalytics();
      setAnalytics(r.data.analytics);
    } catch (e) { console.error(e); }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const r = await adminApi.getOrders({ limit: 50 });
      setOrders(r.data.orders);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n || 0);

  // Show loading spinner while Zustand is hydrating
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not admin — redirect is happening
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${realtimeStatus === 'live' ? 'bg-green-500 animate-pulse' : 'bg-yellow-400'}`} />
              <span className="text-xs text-gray-500">
                {realtimeStatus === 'live' ? 'Real-time connected' : 'Connecting...'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/admin/products')}
              className='px-4 py-2 rounded-lg text-sm font-medium bg-green-700 text-white hover:bg-green-800 transition-colors'>
              🛍️ Manage Products
            </button>
            {['dashboard', 'orders'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  activeTab === tab ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard tab */}
        {activeTab === 'dashboard' && analytics && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Orders',  value: analytics.totalOrders,         icon: '📦', color: 'text-blue-600'   },
                { label: 'Revenue',       value: fmt(analytics.totalRevenue),    icon: '💰', color: 'text-green-600'  },
                { label: 'Products',      value: analytics.totalProducts,        icon: '🛍️', color: 'text-purple-600' },
                { label: 'Customers',     value: analytics.totalUsers,           icon: '👥', color: 'text-orange-600' },
              ].map((s) => (
                <div key={s.label} className="card">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card">
                <h2 className="text-base font-bold text-gray-900 mb-4">Orders by Status</h2>
                <div className="space-y-2">
                  {analytics.ordersByStatus.map((s) => (
                    <div key={s.status} className="flex items-center justify-between text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                      <span className="font-bold text-gray-800">{s._count.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 className="text-base font-bold text-gray-900 mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {analytics.recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-mono text-xs text-gray-500">{o.orderNumber}</span>
                        <p className="font-medium text-gray-800">{o.user?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-700">{fmt(o.totalAmount)}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">All Orders ({orders.length})</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No orders yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      {['Order #', 'Customer', 'Phone', 'Amount', 'Payment', 'Status', 'Update'].map((h) => (
                        <th key={h} className="py-2 pr-4 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 pr-4 font-mono text-xs text-gray-600 whitespace-nowrap">{order.orderNumber}</td>
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-800">{order.user?.name}</div>
                          <div className="text-xs text-gray-400">{order.user?.email}</div>
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-600">{order.user?.phone || '—'}</td>
                        <td className="py-3 pr-4 font-bold text-red-700 whitespace-nowrap">{fmt(order.totalAmount)}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${
                            order.payment?.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.payment?.status || 'NONE'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500">
                            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
