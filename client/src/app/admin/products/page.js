'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import AuthGuard from '../../../components/layout/AuthGuard';
import { adminApi, productsApi, uploadApi } from '../../../lib/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', slug: '', description: '', price: '', costPrice: '',
  stock: '', imageUrl: '', categoryId: '', supplierId: '', featured: false, active: true,
};

function AdminProductsContent() {
  const router                              = useRouter();
  const [products, setProducts]             = useState([]);
  const [categories, setCategories]         = useState([]);
  const [suppliers, setSuppliers]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [uploading, setUploading]           = useState(false);
  const [showForm, setShowForm]             = useState(false);
  const [editingId, setEditingId]           = useState(null);
  const [form, setForm]                     = useState(EMPTY_FORM);
  const [search, setSearch]                 = useState('');
  const [imagePreview, setImagePreview]     = useState('');
  const [dragOver, setDragOver]             = useState(false);
  const fileInputRef                        = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
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

  // ── Image upload handlers ──────────────────────────────────────────────────

  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // Try to upload to Cloudinary
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: res.data.url }));
      setImagePreview(res.data.url);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      // Cloudinary not configured — use base64 as fallback
      if (err.response?.status === 500) {
        const reader2 = new FileReader();
        reader2.onload = (e) => {
          setForm((f) => ({ ...f, imageUrl: e.target.result }));
          toast.success('Image ready! (Note: Set up Cloudinary for better performance)');
        };
        reader2.readAsDataURL(file);
      } else {
        toast.error('Upload failed. Check your Cloudinary settings in .env');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const clearImage = () => {
    setImagePreview('');
    setForm((f) => ({ ...f, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Form submit ────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error('Please select a category'); return; }
    if (!form.supplierId && suppliers.length > 0) {
      setForm((f) => ({ ...f, supplierId: suppliers[0].id }));
    }
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
      setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setImagePreview('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setSaving(false); }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name, slug: product.slug,
      description: product.description || '',
      price: product.price, costPrice: product.costPrice, stock: product.stock,
      imageUrl: product.imageUrl || '', categoryId: product.categoryId,
      supplierId: product.supplierId, featured: product.featured, active: product.active,
    });
    setImagePreview(product.imageUrl || '');
    setEditingId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hide "${name}" from the shop?`)) return;
    try { await adminApi.deleteProduct(id); toast.success('Product hidden'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const handleCancel = () => {
    setShowForm(false); setEditingId(null);
    setForm(EMPTY_FORM); setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Products</h1>
            <p className="text-sm text-surface-500 mt-0.5">{products.length} total products</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push('/admin')} className="btn-secondary text-sm py-2 px-4">← Dashboard</button>
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setImagePreview(''); }}
              className="btn-primary text-sm py-2 px-4">+ Add Product</button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card mb-8 border-2 border-brand-100">
            <h2 className="text-lg font-bold text-surface-900 mb-5">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Product Name *</label>
                  <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)}
                    className="input-field" placeholder="e.g. Wireless Earbuds Pro" required />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Slug (URL) *</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="input-field" placeholder="auto-generated" required />
                  <p className="text-xs text-surface-400 mt-1">Auto-generated from name</p>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Selling Price (KES) *</label>
                  <input type="number" value={form.price} min="0" step="1"
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-field" placeholder="e.g. 2499" required />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Cost Price (KES) *</label>
                  <input type="number" value={form.costPrice} min="0" step="1"
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    className="input-field" placeholder="e.g. 800" required />
                  {form.price && form.costPrice && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      Profit: {fmt(parseFloat(form.price) - parseFloat(form.costPrice))} per unit
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Stock Quantity *</label>
                  <input type="number" value={form.stock} min="0"
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="input-field" placeholder="e.g. 50" required />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="input-field" required>
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Supplier */}
                {suppliers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Supplier</label>
                    <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                      className="input-field">
                      <option value="">Select supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ── IMAGE UPLOAD SECTION ── */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Product Image</label>

                {/* Show current image or upload area */}
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Product preview"
                      className="w-40 h-40 object-cover rounded-xl border-2 border-surface-200" />
                    <button type="button" onClick={clearImage}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-surface-900 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-surface-700 shadow-md">
                      ×
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="mt-2 block text-xs text-brand-600 hover:underline">
                      Change image
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      dragOver ? 'border-brand-400 bg-brand-50' : 'border-surface-300 hover:border-brand-400 hover:bg-brand-50'
                    }`}>
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-surface-500">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-surface-300 text-xl">+</span></div>
                        <p className="text-sm font-medium text-surface-700">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-surface-400 mt-1">JPG, PNG, WebP — max 5MB</p>
                        <div className="mt-3 inline-block bg-surface-900 text-white text-xs font-semibold px-4 py-2 rounded-xl">
                          Choose from Computer
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden" />

                {/* OR paste URL */}
                <div className="mt-3">
                  <p className="text-xs text-surface-400 mb-1">Or paste an image URL instead:</p>
                  <input type="url" value={form.imageUrl}
                    onChange={(e) => {
                      setForm({ ...form, imageUrl: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="input-field text-sm"
                    placeholder="https://images.unsplash.com/..." />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                <textarea rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  placeholder="Describe the product — features, materials, size..." />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-brand-500" />
                  <span className="text-sm font-medium text-surface-700">Featured (shows on homepage)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-4 h-4 accent-green-600" />
                  <span className="text-sm font-medium text-surface-700">Active (visible in shop)</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || uploading} className="btn-primary py-2.5 px-6">
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
            className="input-field max-w-sm" placeholder="Search products..." />
        </div>

        {/* Products table */}
        <div className="card">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-surface-100 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-surface-300 text-xl">0</span></div>
              <p className="text-surface-500 mb-4">No products yet</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add Your First Product</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-100 text-left">
                    {['Product','Category','Price','Cost','Profit','Stock','Status','Actions'].map((h) => (
                      <th key={h} className="py-3 pr-4 text-surface-400 font-medium whitespace-nowrap text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} className="border-b border-surface-50 hover:bg-surface-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-100 flex-shrink-0 border border-surface-200">
                            {product.imageUrl
                              ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-surface-300 text-sm">+</div>
                            }
                          </div>
                          <div>
                            <p className="font-medium text-surface-800 max-w-[150px] truncate">{product.name}</p>
                            {product.featured && <span className="text-xs text-brand-600 font-medium">Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-surface-600 whitespace-nowrap">{product.category?.name}</td>
                      <td className="py-3 pr-4 font-semibold text-surface-800 whitespace-nowrap">{fmt(product.price)}</td>
                      <td className="py-3 pr-4 text-surface-500 whitespace-nowrap">{fmt(product.costPrice)}</td>
                      <td className="py-3 pr-4 font-semibold text-green-600 whitespace-nowrap">{fmt(product.price - product.costPrice)}</td>
                      <td className="py-3 pr-4">
                        <span className={`font-semibold ${product.stock <= 5 ? 'text-red-600' : product.stock <= 20 ? 'text-amber-500' : 'text-surface-800'}`}>
                          {product.stock}{product.stock <= 5 && <span className="text-xs ml-1">Low</span>}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg whitespace-nowrap ${
                          product.active ? 'bg-green-50 text-green-700' : 'bg-surface-100 text-surface-500'
                        }`}>{product.active ? 'Active' : 'Hidden'}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(product)}
                            className="text-xs bg-surface-100 text-surface-700 hover:bg-surface-200 font-medium px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                          <button onClick={() => handleDelete(product.id, product.name)}
                            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-medium px-3 py-1.5 rounded-lg transition-colors">
                            {product.active ? 'Hide' : 'Hidden'}</button>
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

export default function AdminProductsPage() {
  return (
    <AuthGuard requireAdmin={true}>
      <AdminProductsContent />
    </AuthGuard>
  );
}
