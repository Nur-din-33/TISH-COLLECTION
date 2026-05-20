'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/shop/ProductCard';
import { productsApi } from '../lib/api';

// ✏️ Update these slugs to match your actual categories in Supabase
const categories = [
  { name: "Ladies Fashion", slug: 'ladies-fashion',  icon: '👗' },
  { name: "Men's Fashion",  slug: 'mens-fashion',    icon: '👔' },
  { name: 'Shoes',          slug: 'shoes',            icon: '👟' },
  { name: 'Accessories',    slug: 'accessories',      icon: '👜' },
  { name: 'Kids Fashion',   slug: 'kids-fashion',     icon: '🧒' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);

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
      <section className="bg-gradient-to-br from-red-700 via-red-800 to-pink-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-200 text-sm font-semibold uppercase tracking-widest mb-3">
            Kenya's Fashion Destination
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Tish Collection 🇰🇪
          </h1>
          <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Shop the latest clothes, shoes and accessories. Trendy styles for men, women and kids.
            Fast delivery across Kenya. Pay with M-Pesa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products"
              className="bg-white text-red-700 font-bold py-3 px-8 rounded-full hover:bg-red-50 transition-colors text-lg">
              Shop New Arrivals
            </Link>
            <Link href="/products?featured=true"
              className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors text-lg">
              View Hot Deals 🔥
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-red-200">
            <span>✅ M-Pesa Payments</span>
            <span>🚚 Nationwide Delivery</span>
            <span>🔒 Secure Shopping</span>
            <span>↩️ Easy Returns</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop by Category</h2>
        <p className="text-gray-500 text-sm mb-6">Find exactly what you're looking for</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-red-200 transition-all group">
              <span className="text-3xl mb-2">{cat.icon}</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center group-hover:text-red-700">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔥 Featured Styles</h2>
            <p className="text-gray-500 text-sm mt-1">Hand-picked trending pieces</p>
          </div>
          <Link href="/products?featured=true" className="text-sm text-red-700 font-medium hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-72 animate-pulse" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">👗</p>
            <p>No featured products yet. Add some from the admin panel!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Why Shop With Us */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Why Shop at Tish Collection Kenya?
          </h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            The best online fashion store in Kenya
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '📱', title: 'M-Pesa Payment',    desc: 'Pay easily with Safaricom M-Pesa STK Push' },
              { icon: '🚚', title: 'Fast Delivery',      desc: 'Delivery to Nairobi and across Kenya' },
              { icon: '✨', title: 'Latest Trends',      desc: 'New arrivals every week' },
              { icon: '↩️', title: 'Easy Returns',       desc: '7-day hassle-free returns' },
            ].map((item) => (
              <div key={item.title} className="text-center p-4">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO text block — helps Google understand your site */}
      <section className="bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            Buy Clothes & Shoes Online in Kenya
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto">
            Tish Collection is Kenya's top online fashion store. We offer the latest clothes,
            shoes and accessories for men, women and kids. Shop from Nairobi, Mombasa, Kisumu,
            Nakuru and anywhere in Kenya. Pay with M-Pesa and get fast delivery to your door.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Ladies Clothes', 'Mens Fashion', 'Sneakers', 'Heels', 'Handbags', 'Kids Clothes', 'Dresses', 'Jeans'].map((tag) => (
              <Link key={tag} href={`/products?search=${tag.toLowerCase()}`}
                className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-red-300 hover:text-red-700 transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* M-Pesa CTA */}
      <section className="bg-green-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Pay with M-Pesa — Instant & Secure 📱
          </h2>
          <p className="text-green-100 mb-6">
            No bank card needed. Shop fashion online in Kenya and pay with your phone.
          </p>
          <Link href="/products"
            className="bg-white text-green-700 font-bold py-3 px-8 rounded-full hover:bg-green-50 transition-colors inline-block">
            Start Shopping Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
