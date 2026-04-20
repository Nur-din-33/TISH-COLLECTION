'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/shop/ProductCard';
import { productsApi } from '../lib/api';

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: '📱' },
  { name: 'Fashion', slug: 'fashion', icon: '👗' },
  { name: 'Home & Garden', slug: 'home-garden', icon: '🏠' },
  { name: 'Beauty', slug: 'beauty', icon: '💄' },
  { name: 'Sports', slug: 'sports', icon: '⚽' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.getAll({ featured: true, limit: 8 })
      .then((res) => setFeatured(res.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-red-700 via-red-800 to-green-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
           TISH COLLECTION — Kenya's Best Online Shop 🇰🇪
          </h1>
          <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Shop electronics, fashion, home goods and more. Fast delivery across Kenya. Pay securely with M-Pesa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="bg-white text-red-700 font-bold py-3 px-8 rounded-full hover:bg-red-50 transition-colors text-lg">
              Shop Now
            </Link>
            <Link href="/register" className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors text-lg">
              Create Account
            </Link>
          </div>
          <div className="flex justify-center gap-8 mt-10 text-sm text-red-200">
            <span>✅ M-Pesa Payments</span>
            <span>🚚 Nationwide Delivery</span>
            <span>🔒 Secure Shopping</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-red-200 transition-all group"
            >
              <span className="text-3xl mb-2">{cat.icon}</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center group-hover:text-red-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🔥 Featured Deals</h2>
          <Link href="/products?featured=true" className="text-sm text-red-700 font-medium hover:underline">View All</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* M-Pesa CTA Banner */}
      <section className="bg-green-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Pay Easily with M-Pesa 📱</h2>
          <p className="text-green-100 mb-6">No credit card needed. Just enter your M-Pesa PIN and you're done.</p>
          <Link href="/products" className="bg-white text-green-700 font-bold py-3 px-8 rounded-full hover:bg-green-50 transition-colors">
            Start Shopping
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
