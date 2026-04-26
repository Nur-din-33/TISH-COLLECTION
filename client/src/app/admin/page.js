'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import AuthGuard from '../../components/layout/AuthGuard';
import { adminApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { useAdminSocket, useSocket } from '../../hooks/useSocket';
import { subscribeToOrders, subscribeToProducts, unsubscribe } from '../../lib/supabase';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  PENDING:    'bg-amber-50 text-amber-700 border border-amber-200',
  CONFIRMED:  'bg-blue-50 text-blue-700 border border-blue-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border border-purple-200',
  SHIPPED:    'bg-indigo-50 text-indigo-700 border border-indigo-200',
  DELIVERED:  'bg-green-50 text-green-700 border border-green-200',
  CANCELLED:  'bg-red-50 text-red-700 border border-red-200',
};
const ALL_STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];

function AdminDashboardContent() {
  const router                              = useRouter();
  const [analytics, setAnalytics]           = useState(null);
  const [orders, setOrders]                 = useState([]);
  const [activeTab, setActiveTab]           = useState('dashboard');
  const [loading, setLoading]               = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const { user }                            = useAuthStore();

  useAdminSocket();

  useSocket('order:new', (data) => {
    toast.success(`New order #${data.orderNumber} from ${data.customerName}`, { duration: 7000 });
    fetchOrders();
    fetchAnalytics();
  });

  useSocket('user:loggedIn', (data) => {
    toast(`${data.name} just logged in`, { duration: 6000 });
  });

  useSocket('user:registered', (data) => {
    toast.success(`New signup: ${data.name}`, { duration: 6000 });
    fetchAnalytics();
  });

  useSocket('order:statusUpdated', ({ orderId, status }) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  });

  useEffect(() => {
    const orderChannel = subscribeToOrders((payload) => {
      setRealtimeStatus('live');
      if (payload.eventType === 'INSERT') { fetchOrders(); fetchAnalytics(); }
      if (payload.eventType === 'UPDATE') {
        setOrders((prev) => prev.map((o) => o.id === payload.new.id ? { ...o, status: payload.new.status } : o));
      }
    });
    const productChannel = subscribeToProducts((payload) => {
      if (payload.new?.stock <= 5) {
        toast(`Low stock: ${payload.new.name}`, { duration: 8000 });
      }
    });
    if (orderChannel || productChannel) setRealtimeStatus('live');
    else setRealtimeStatus('socket-only');
    return () => { unsubscribe(orderChannel); unsubscribe(productChannel); };
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchOrders();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try { const r = await adminApi.getAnalytics(); setAnalytics(r.data.analytics); }
    catch (e) { console.error('Analytics error:', e); }
  }, []);

  const fetchOrders = useCallback(async () => {
    try { const r = await adminApi.getOrders({ limit: 50 }); setOrders(r.data.orders); }
    catch (e) { console.error('Orders error:', e); }
    finally { setLoading(false); }
  }, []);

  const updateStatus = async (orderId, status) => {
    try { await adminApi.updateOrderStatus(orderId, status); toast.success('Status updated'); }
    catch { toast.error('Update failed'); }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Admin Dashboard</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`w-2 h-2 rounded-full ${realtimeStatus === 'live' ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs text-surface-500">
                {realtimeStatus === 'live' ? 'Real-time connected' : 'Connecting...'}
              </span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => router.push('/admin/products')}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition-all duration-300 hover:shadow-glow">
              Manage Products
            </button>
            {['dashboard', 'orders'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                  activeTab === tab ? 'bg-surface-900 text-white' : 'bg-white text-surface-600 border border-surface-200 hover:border-surface-300'
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
                { label: 'Total Orders', value: analytics.totalOrders,          color: 'text-blue-600'   },
                { label: 'Revenue',      value: fmt(analytics.totalRevenue),     color: 'text-green-600'  },
                { label: 'Products',     value: analytics.totalProducts,         color: 'text-purple-600' },
                { label: 'Customers',    value: analytics.totalUsers,            color: 'text-brand-600' },
              ].map((s) => (
                <div key={s.label} className="card">
                  <div className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-2">{s.label}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card">
                <h2 className="text-base font-bold text-surface-900 mb-4">Orders by Status</h2>
                <div className="space-y-2.5">
                  {analytics.ordersByStatus.map((s) => (
                    <div key={s.status} className="flex items-center justify-between text-sm">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                      <span className="font-bold text-surface-800">{s._count.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h2 className="text-base font-bold text-surface-900 mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {analytics.recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-mono text-xs text-surface-400">{o.orderNumber}</span>
                        <p className="font-medium text-surface-800">{o.user?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-surface-900">{fmt(o.totalAmount)}</p>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Dashboard loading state */}
        {activeTab === 'dashboard' && !analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-surface-100" />)}
          </div>
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className="card">
            <h2 className="text-lg font-bold text-surface-900 mb-5">All Orders ({orders.length})</h2>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-surface-100 rounded-xl animate-pulse" />)}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 text-surface-400">No orders yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-100 text-left">
                      {['Order #','Customer','Phone','Amount','Payment','Status','Update'].map((h) => (
                        <th key={h} className="py-3 pr-4 text-surface-400 font-medium whitespace-nowrap text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-surface-50 hover:bg-surface-50 transition-colors">
                        <td className="py-3.5 pr-4 font-mono text-xs text-surface-500 whitespace-nowrap">{order.orderNumber}</td>
                        <td className="py-3.5 pr-4">
                          <div className="font-medium text-surface-800">{order.user?.name}</div>
                          <div className="text-xs text-surface-400">{order.user?.email}</div>
                        </td>
                        <td className="py-3.5 pr-4 text-xs text-surface-500">{order.user?.phone || '\u2014'}</td>
                        <td className="py-3.5 pr-4 font-bold text-surface-900 whitespace-nowrap">{fmt(order.totalAmount)}</td>
                        <td className="py-3.5 pr-4">
                          <span className={`text-[11px] px-2 py-0.5 rounded-lg font-medium whitespace-nowrap ${
                            order.payment?.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                          }`}>{order.payment?.status || 'NONE'}</span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg whitespace-nowrap ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                        </td>
                        <td className="py-3.5">
                          <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                            className="text-xs border border-surface-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white transition-all">
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

export default function AdminDashboard() {
  return (
    <AuthGuard requireAdmin={true}>
      <AdminDashboardContent />
    </AuthGuard>
  );
}
