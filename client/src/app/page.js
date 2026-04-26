'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/shop/ProductCard';
import { productsApi } from '../lib/api';
import {
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    tagline: 'Latest gadgets & devices',
    gradient: 'from-blue-900 to-surface-950',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    tagline: 'Trending styles for everyone',
    gradient: 'from-rose-900 to-surface-950',
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    tagline: 'Transform your living space',
    gradient: 'from-emerald-900 to-surface-950',
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    tagline: 'Premium skincare & cosmetics',
    gradient: 'from-pink-900 to-surface-950',
  },
  {
    name: 'Sports',
    slug: 'sports',
    tagline: 'Gear up for greatness',
    gradient: 'from-amber-900 to-surface-950',
  },
];

const trustFeatures = [
  { icon: TruckIcon, title: 'Fast Delivery', desc: 'Nationwide shipping across Kenya' },
  { icon: CreditCardIcon, title: 'M-Pesa Payments', desc: 'Pay securely with your phone' },
  { icon: ShieldCheckIcon, title: 'Buyer Protection', desc: '100% secure transactions' },
  { icon: ArrowPathIcon, title: 'Easy Returns', desc: 'Hassle-free return policy' },
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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar transparent />

      {/* ===== HERO — Full viewport, bold imagery ===== */}
      <section className="relative min-h-screen flex items-center justify-center bg-surface-950 text-white overflow-hidden -mt-28 pt-28">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-surface-900 to-surface-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-surface-950 to-transparent" />

        {/* Decorative lines */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-white" />
          <div className="absolute top-2/4 left-0 right-0 h-px bg-white" />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-white" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center px-4 pt-32 pb-20">
          <p className="text-brand-400 font-bold text-sm tracking-[0.3em] uppercase mb-8 animate-fade-in">
            Premium Shopping Experience
          </p>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.9] mb-8 animate-slide-up">
            Find Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-300 to-brand-500">
              Next Favorite
            </span>
          </h1>

          <p className="text-lg md:text-xl text-surface-400 max-w-xl mx-auto leading-relaxed mb-12 animate-slide-up-delay">
            Curated electronics, fashion, home goods and more. Fast delivery across Kenya with secure M-Pesa payments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay-2">
            <Link href="/products" className="btn-hero bg-white text-surface-900 hover:bg-surface-100 hover:shadow-hero">
              Shop Now <ArrowRightIcon className="w-5 h-5 inline ml-2" />
            </Link>
            <Link href="/products?featured=true" className="btn-hero border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/60">
              Featured Deals
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* ===== CATEGORY COLLECTIONS — Large immersive cards ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-subheading">Collections</p>
            <h2 className="section-heading">Shop by Category</h2>
          </div>

          {/* Top row: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {categories.slice(0, 3).map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className={`group relative overflow-hidden rounded-2xl h-72 md:h-80 flex items-end p-8 transition-all duration-500 hover:scale-[1.02] ${i === 1 ? 'md:col-span-1' : ''}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500" />
                <div className="relative z-10">
                  <p className="text-white/60 text-xs uppercase tracking-[0.2em] font-semibold mb-2">{cat.tagline}</p>
                  <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tight">{cat.name}</h3>
                  <div className="mt-4 flex items-center gap-2 text-white/80 text-sm font-semibold group-hover:text-white group-hover:gap-3 transition-all">
                    Shop Now <ChevronRightIcon className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom row: 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.slice(3).map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl h-72 md:h-64 flex items-end p-8 transition-all duration-500 hover:scale-[1.02]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500" />
                <div className="relative z-10">
                  <p className="text-white/60 text-xs uppercase tracking-[0.2em] font-semibold mb-2">{cat.tagline}</p>
                  <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tight">{cat.name}</h3>
                  <div className="mt-4 flex items-center gap-2 text-white/80 text-sm font-semibold group-hover:text-white group-hover:gap-3 transition-all">
                    Shop Now <ChevronRightIcon className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-subheading">Trending Now</p>
              <h2 className="section-heading">Featured Deals</h2>
            </div>
            <Link href="/products?featured=true" className="hidden sm:flex items-center gap-2 text-sm uppercase tracking-wider font-bold text-surface-900 hover:text-brand-500 transition-colors">
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-surface-100 h-80 animate-pulse" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
              <p className="text-surface-400 text-lg mb-4">No featured products yet</p>
              <Link href="/products" className="btn-primary">Browse All Products</Link>
            </div>
          )}

          <div className="sm:hidden text-center mt-8">
            <Link href="/products?featured=true" className="btn-primary inline-flex items-center gap-2">
              View All Products <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TRUST / WHY SHOP WITH US ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-subheading">Why Choose Us</p>
            <h2 className="section-heading">The TISH Difference</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-5 bg-surface-950 rounded-2xl flex items-center justify-center group-hover:bg-brand-500 transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-surface-900 mb-2 uppercase tracking-wide text-sm">{feature.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== M-PESA CTA — Bold full-width banner ===== */}
      <section className="relative bg-surface-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-brand-500/15 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto text-center px-4 py-24">
          <p className="text-brand-400 text-xs font-bold tracking-[0.3em] uppercase mb-6">Seamless Payments</p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-tight">
            Pay Easily<br />with M-Pesa
          </h2>
          <p className="text-surface-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            No credit card needed. Just enter your M-Pesa PIN and you&apos;re done. Fast, secure, and trusted by millions.
          </p>
          <Link href="/products" className="btn-hero bg-brand-500 text-white hover:bg-brand-600 hover:shadow-glow">
            Start Shopping <ArrowRightIcon className="w-5 h-5 inline ml-2" />
          </Link>
        </div>
      </section>

      {/* ===== NEWSLETTER SIGNUP ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="section-subheading">Stay Updated</p>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-surface-900 mb-4">
            Get the Latest Deals
          </h2>
          <p className="text-surface-500 mb-8">
            Be the first to know about new arrivals, exclusive offers, and special discounts.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 border-2 border-surface-200 rounded-full px-6 py-3.5 text-sm focus:outline-none focus:border-surface-900 transition-colors"
            />
            <button type="submit" className="bg-surface-900 text-white font-bold py-3.5 px-8 rounded-full uppercase tracking-wider text-sm hover:bg-surface-800 transition-all">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
