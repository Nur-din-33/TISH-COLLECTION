'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import { productsApi } from '../../../lib/api';
import { useCartStore } from '../../../lib/store';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    productsApi
      .getOne(slug)
      .then((res) => {
        setProduct(res.data.product);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load product');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return;
    addItem(product);
    router.push('/checkout');
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-surface-200 border-t-surface-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-surface-400 text-xl">!</span>
            </div>
            <p className="text-surface-600 font-medium">{error || 'Product not found'}</p>
            <a href="/products" className="btn-primary inline-block mt-4 text-sm">Browse Products</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="grid md:grid-cols-2 gap-12">

          {/* IMAGE */}
          <div className="bg-surface-50 rounded-2xl overflow-hidden border border-surface-100">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-surface-200">
                <span className="text-8xl font-light">+</span>
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex flex-col justify-center">
            <p className="text-xs text-surface-400 uppercase tracking-widest font-medium mb-3">
              {product.category?.name || 'Product'}
            </p>

            <h1 className="text-3xl font-bold text-surface-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="text-surface-500 mt-4 leading-relaxed">
              {product.description}
            </p>

            <p className="text-3xl font-bold text-surface-900 mt-8">
              {formatPrice(product.price)}
            </p>

            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-surface-400 w-20">Stock</span>
                <span className={`font-medium ${product.stock > 0 ? 'text-surface-700' : 'text-surface-400'}`}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </div>
              {product.supplier?.name && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-surface-400 w-20">Supplier</span>
                  <span className="font-medium text-surface-700">{product.supplier.name}</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-elegant"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-surface-900 hover:bg-surface-800 disabled:opacity-40 text-white px-8 py-3.5 rounded-xl font-medium transition-all duration-300 hover:shadow-elegant"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
