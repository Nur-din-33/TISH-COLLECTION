'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import { productsApi } from '../../../lib/api';

export default function ProductDetailsPage() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    productsApi
      .getOne(slug) // ✅ FIXED HERE
      .then((res) => {
        setProduct(res.data.product);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load product');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  // ❌ Error or not found
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || 'Product not found'}
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <div className="grid md:grid-cols-2 gap-10">

          {/* IMAGE */}
          <div className="bg-gray-100 rounded-xl overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-gray-300 text-5xl">
                📦
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>

            <p className="text-gray-600 mt-4">
              {product.description}
            </p>

            <p className="text-2xl font-bold text-red-700 mt-6">
              KES {product.price}
            </p>

            <div className="mt-4 text-sm text-gray-500 space-y-1">
              <p>
                Category:{' '}
                <span className="font-medium">
                  {product.category?.name || 'N/A'}
                </span>
              </p>
              <p>
                Stock:{' '}
                <span className="font-medium">
                  {product.stock}
                </span>
              </p>
              <p>
                Supplier:{' '}
                <span className="font-medium">
                  {product.supplier?.name || 'N/A'}
                </span>
              </p>
            </div>

            <button
              disabled={product.stock === 0}
              className="mt-6 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}