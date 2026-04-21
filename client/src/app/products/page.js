'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ProductCard from '../../components/shop/ProductCard';
import { productsApi } from '../../lib/api';

const categories = [
  { name: 'All',            slug: '' },
  { name: 'Electronics',   slug: 'electronics' },
  { name: 'Fashion',       slug: 'fashion' },
  { name: 'Home & Garden', slug: 'home-garden' },
  { name: 'Beauty',        slug: 'beauty' },
  { name: 'Sports',        slug: 'sports' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [pagination, setPagination]   = useState({});
  const [page, setPage]               = useState(1);

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';
  const featured = searchParams.get('featured') || '';

  useEffect(() => {
    setLoading(true);
    productsApi.getAll({ category, search, featured, page, limit: 12 })
      .then((res) => {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search, featured, page]);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {search ? `Results for "${search}"` : featured ? '🔥 Featured Deals' : category ? categories.find((c) => c.slug === category)?.name : 'All Products'}
        </h1>
        {!loading && <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} products found</p>}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map((cat) => (
          <a key={cat.slug} href={cat.slug ? `/products?category=${cat.slug}` : '/products'}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat.slug
                ? 'bg-red-700 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-700'
            }`}>
            {cat.name}
          </a>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-72 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500 text-lg">No products found</p>
          <a href="/products" className="btn-primary mt-4 inline-block">Browse All</a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1 ? 'bg-red-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-72 animate-pulse" />
            ))}
          </div>
        </div>
      }>
        <ProductsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
