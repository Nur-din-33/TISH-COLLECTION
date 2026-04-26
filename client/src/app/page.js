'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/shop/ProductCard';
import { productsApi } from '../lib/api';

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: '01' },
  { name: 'Fashion', slug: 'fashion', icon: '02' },
  { name: 'Home & Garden', slug: 'home-garden', icon: '03' },
  { name: 'Beauty', slug: 'beauty', icon: '04' },
  { name: 'Sports', slug: 'sports', icon: '05' },
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
      <section className="relative bg-surface-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-brand-950 opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto text-center px-4 py-24 sm:py-32">
          <p className="text-brand-400 font-medium text-sm tracking-widest uppercase mb-4 animate-fade-in">Premium Shopping Experience</p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight animate-slide-up">
            TISH COLLECTION
          </h1>
          <p className="text-lg md:text-xl text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Curated electronics, fashion, home goods and more. Fast delivery across Kenya with secure M-Pesa payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link href="/products" className="bg-white text-surface-900 font-semibold py-3.5 px-8 rounded-xl hover:bg-surface-100 transition-all duration-300 text-base hover:shadow-elegant">
              Explore Collection
            </Link>
            <Link href="/register" className="border border-surface-600 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/5 hover:border-surface-400 transition-all duration-300 text-base">
              Create Account
            </Link>
          </div>
          <div className="flex justify-center gap-8 mt-14 text-sm text-surface-500">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-400 rounded-full"></span> M-Pesa Payments</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-400 rounded-full"></span> Nationwide Delivery</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-400 rounded-full"></span> Secure Shopping</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Shop by Category</h2>
            <p className="text-surface-500 text-sm mt-1">Browse our curated collections</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative bg-white rounded-2xl border border-surface-100 p-6 hover:shadow-elegant hover:border-surface-200 transition-all duration-300 text-center"
            >
              <span className="text-3xl font-bold text-surface-100 group-hover:text-brand-100 transition-colors duration-300 block mb-3">{cat.icon}</span>
              <span className="text-sm font-semibold text-surface-700 group-hover:text-surface-900 transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Featured Deals</h2>
            <p className="text-surface-500 text-sm mt-1">Handpicked products at the best prices</p>
          </div>
          <Link href="/products?featured=true" className="text-sm text-brand-600 font-medium hover:text-brand-700 transition-colors">
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-surface-100 h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* M-Pesa CTA Banner */}
      <section className="bg-surface-900 text-white">
        <div className="max-w-5xl mx-auto text-center px-4 py-16">
          <p className="text-brand-400 text-sm font-medium tracking-widest uppercase mb-3">Seamless Payments</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Pay Easily with M-Pesa</h2>
          <p className="text-surface-400 mb-8 max-w-lg mx-auto">No credit card needed. Just enter your M-Pesa PIN and you&apos;re done. Fast, secure, and trusted by millions.</p>
          <Link href="/products" className="inline-block bg-brand-500 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-brand-600 transition-all duration-300 hover:shadow-glow">
            Start Shopping
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
