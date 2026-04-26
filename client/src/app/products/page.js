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

  const pageTitle = search
    ? `Results for "${search}"`
    : featured
      ? 'Featured Deals'
      : category
        ? categories.find((c) => c.slug === category)?.name
        : 'All Products';

  return (
    <>
      {/* Page Header */}
      <div className="bg-surface-950 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-surface-500 mb-3">Browse Collection</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
            {pageTitle}
          </h1>
          {!loading && (
            <p className="text-surface-400 text-sm mt-3">{pagination.total || 0} products found</p>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-10 scrollbar-hide">
          {categories.map((cat) => (
            <a key={cat.slug} href={cat.slug ? `/products?category=${cat.slug}` : '/products'}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                category === cat.slug
                  ? 'bg-surface-900 text-white'
                  : 'bg-white text-surface-600 border-2 border-surface-200 hover:border-surface-900 hover:text-surface-900'
              }`}>
              {cat.name}
            </a>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-surface-100 h-96 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-surface-300 text-3xl font-bold">?</span>
            </div>
            <p className="text-surface-900 text-xl font-bold uppercase tracking-tight mb-2">No products found</p>
            <p className="text-surface-400 text-sm mb-8">Try adjusting your search or browse all products</p>
            <a href="/products" className="btn-hero bg-surface-900 text-white hover:bg-surface-800">Browse All</a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-16">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-11 h-11 rounded-full text-sm font-bold transition-all duration-200 ${
                  page === i + 1 ? 'bg-surface-900 text-white' : 'bg-white border-2 border-surface-200 text-surface-600 hover:border-surface-900 hover:text-surface-900'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-surface-100 h-96 animate-pulse" />
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
