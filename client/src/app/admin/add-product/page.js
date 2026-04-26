'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import { productsApi, adminApi } from '../../../lib/api';
import { useAuthStore } from '../../../lib/store';
import toast from 'react-hot-toast';

export default function AddProductPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    costPrice: '',
    stock: '',
    imageUrl: '',
    categoryId: '',
    supplierId: '',
    featured: false,
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
    // Load categories
    productsApi.getCategories()
      .then((res) => setCategories(res.data.categories))
      .catch(console.error);
  }, [user]);

  // Auto-generate slug from product name
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setForm({ ...form, name, slug });
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setForm({ ...form, imageUrl: url });
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.stock || !form.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await productsApi.create({
        ...form,
        price: parseFloat(form.price),
        costPrice: parseFloat(form.costPrice) || 0,
        stock: parseInt(form.stock),
        // Use a placeholder supplier ID — in production fetch from DB
        supplierId: form.supplierId || null,
      });
      toast.success('Product added successfully!');
      router.push('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const profit = form.price && form.costPrice
    ? (parseFloat(form.price) - parseFloat(form.costPrice)).toFixed(0)
    : null;
  const margin = form.price && form.costPrice && parseFloat(form.price) > 0
    ? (((parseFloat(form.price) - parseFloat(form.costPrice)) / parseFloat(form.price)) * 100).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push('/admin')} className="text-surface-500 hover:text-surface-700 transition-colors">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Add New Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — main info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info */}
            <div className="card">
              <h2 className="text-base font-semibold text-surface-800 mb-4">Product Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Wireless Bluetooth Earbuds"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="wireless-bluetooth-earbuds"
                    className="input-field font-mono"
                    required
                  />
                  <p className="text-xs text-surface-400 mt-1">Auto-generated from name. Must be unique.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the product — features, benefits, why Kenyans will love it..."
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card">
              <h2 className="text-base font-semibold text-surface-800 mb-4">Pricing (KES)</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Selling Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">KES</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="2499"
                      className="input-field pl-12"
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Cost Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">KES</span>
                    <input
                      type="number"
                      value={form.costPrice}
                      onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                      placeholder="800"
                      className="input-field pl-12"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Profit indicator */}
              {profit && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-medium">Estimated Profit per Sale</p>
                    <p className="text-lg font-bold text-green-700">KES {parseInt(profit).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600 font-medium">Margin</p>
                    <p className="text-lg font-bold text-green-700">{margin}%</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stock & Category */}
            <div className="card">
              <h2 className="text-base font-semibold text-surface-800 mb-4">Stock & Category</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="50"
                    className="input-field"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — image & settings */}
          <div className="space-y-5">

            {/* Image */}
            <div className="card">
              <h2 className="text-base font-semibold text-surface-800 mb-4">Product Image</h2>

              {/* Preview */}
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-100 mb-4 flex items-center justify-center border border-surface-200">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-surface-300">
                    <div className="w-12 h-12 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-surface-400">+</span></div>
                    <p className="text-xs">Image preview</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://images.unsplash.com/..."
                  className="input-field"
                />
                <p className="text-xs text-surface-400 mt-1">
                  Paste any image URL. Use{' '}
                  <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                    Unsplash.com
                  </a>{' '}
                  for free photos.
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="card">
              <h2 className="text-base font-semibold text-surface-800 mb-4">Settings</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${form.featured ? 'bg-brand-500' : 'bg-surface-200'}`} />
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-700">Featured Product</p>
                  <p className="text-xs text-surface-400">Show on homepage deals section</p>
                </div>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="btn-secondary w-full py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
