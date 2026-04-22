'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import { adminApi, productsApi } from '../../../lib/api';
import { useAuthStore } from '../../../lib/store';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', slug: '', description: '', price: '', costPrice: '',
  stock: '', imageUrl: '', categoryId: '', supplierId: '', featured: false, active: true,
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [mounted, setMounted]       = useState(false);
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [search, setSearch]         = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }
    fetchAll();
  }, [mounted, user]);

  const fetchAll = async () => {
    // Make sure token exists before calling protected API
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('Session expired. Please log in again.');
      router.push('/login');
      return;
    }
    try {
      const [prodRes, catRes, suppRes] = await Promise.all([
        adminApi.getProducts(),
        productsApi.getCategories(),
        adminApi.getSuppliers(),
      ]);
      setProducts(prodRes.data.products);
      setCategories(catRes.data.categories);
      setSuppliers(suppRes.data.suppliers || []);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  const handleNameChange = (value) => {
    setForm((f) => ({
      ...f,
      name: value,
      slug: editingId ? f.slug : value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error('Please select a category'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        price:      parseFloat(form.price),
        costPrice:  parseFloat(form.costPrice),
        stock:      parseInt(form.stock),
        supplierId: form.supplierId || suppliers[0]?.id || '',
      };
      if (editingId) {
        await productsApi.update(editingId, data);
        toast.success('Product updated!');
      } else {
        await productsApi.create(data);
        toast.success('Product added!');
      }
      setShowForm(false); setEditingId(null); setForm(EMPTY_FORM);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setSaving(false); }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name, slug: product.slug, description: product.description || '',
      price: product.price, costPrice: product.costPrice, stock: product.stock,
      imageUrl: product.imageUrl || '', categoryId: product.categoryId,
      supplierId: product.supplierId, featured: product.featured, active: product.active,
    });
    setEditingId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hide "${name}" from the shop?`)) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success('Product hidden');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); };

  const fmt = (n) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">{products.length} total products</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push('/admin')} className="btn-secondary text-sm py-2 px-4">← Dashboard</button>
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
              className="btn-primary text-sm py-2 px-4">+ Add Product</button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card mb-8 border-2 border-red-100">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)}
                    className="input-field" placeholder="e.g. Wireless Earbuds Pro" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="input-field" placeholder="auto-generated" required />
                  <p className="text-xs text-gray-400 mt-1">Auto-generated from name</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (KES) *</label>
                  <input type="number" value={form.price} min="0" step="1"
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-field" placeholder="e.g. 2499" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (KES) *</label>
                  <input type="number" value={form.costPrice} min="0" step="1"
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    className="input-field" placeholder="e.g. 800" required />
                  {form.price && form.costPrice && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      Profit: {fmt(parseFloat(form.price) - parseFloat(form.costPrice))} per unit
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input type="number" value={form.stock} min="0"
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="input-field" placeholder="e.g. 50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="input-field" required>
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                    className="input-field" required>
                    <option value="">Select a supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="input-field" placeholder="https://images.unsplash.com/..." />
                <p className="text-xs text-gray-400 mt-1">
                  Paste any image URL. Free images at{' '}
                  <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">unsplash.com</a>
                  {' '}or{' '}
                  <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">pexels.com</a>
                </p>
                {form.imageUrl && (
                  <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  placeholder="Describe the product — features, materials, size..." />
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-red-600" />
                  <span className="text-sm font-medium text-gray-700">🔥 Featured product (shows on homepage)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 accent-green-600" />
                  <span className="text-sm font-medium text-gray-700">✅ Active (visible in shop)</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6">
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" onClick={handleCancel} className="btn-secondary py-2.5 px-6">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-sm" placeholder="🔍 Search products..." />
        </div>

        {/* Products table */}
        <div className="card">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-500 mb-4">No products yet</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add Your First Product</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    {['Product','Category','Price','Cost','Profit','Stock','Status','Actions'].map((h) => (
                      <th key={h} className="py-3 pr-4 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {product.imageUrl
                              ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 max-w-[160px] truncate">{product.name}</p>
                            {product.featured && <span className="text-xs text-orange-500">🔥 Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{product.category?.name}</td>
                      <td className="py-3 pr-4 font-semibold text-gray-800 whitespace-nowrap">{fmt(product.price)}</td>
                      <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{fmt(product.costPrice)}</td>
                      <td className="py-3 pr-4 font-semibold text-green-600 whitespace-nowrap">{fmt(product.price - product.costPrice)}</td>
                      <td className="py-3 pr-4">
                        <span className={`font-semibold ${product.stock <= 5 ? 'text-red-600' : product.stock <= 20 ? 'text-orange-500' : 'text-gray-800'}`}>
                          {product.stock}{product.stock <= 5 && <span className="text-xs ml-1">⚠️</span>}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {product.active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(product)}
                            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(product.id, product.name)}
                            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                            {product.active ? 'Hide' : 'Hidden'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
