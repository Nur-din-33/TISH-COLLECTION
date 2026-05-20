'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import { productsApi } from '../../../lib/api';
import { useCartStore } from '../../../lib/store';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug }              = useParams();
  const router                = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');
  const addItem               = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!slug) return;
    productsApi.getOne(slug)
      .then((res) => {
        setProduct(res.data.product);
        setMainImage(res.data.product.imageUrl || '');
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, quantity);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-5xl">😕</p>
          <h2 className="text-xl font-bold text-gray-700">Product not found</h2>
          <button onClick={() => router.push('/products')} className="btn-primary">Browse Products</button>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages  = [product.imageUrl, ...(product.images || [])].filter(Boolean);
  const avgRating  = product.reviews?.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  // ── Product schema with required 'offers' field ──────────────────────────
  // This fixes Google's "missing offers" error and enables rich results
  const productSchema = {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:        product.name,
    description: product.description || product.name,
    image:       product.imageUrl ? [product.imageUrl] : [],
    sku:         product.id,
    brand: {
      '@type': 'Brand',
      name:    'Tish Collection',
    },
    offers: {
      '@type':           'Offer',
      url:              `https://tishcollection.store/products/${product.slug}`,
      priceCurrency:    'KES',
      price:             product.price,
      priceValidUntil:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability:      product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name:    'Tish Collection',
      },
      hasMerchantReturnPolicy: {
        '@type':                  'MerchantReturnPolicy',
        returnPolicyCategory:    'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays:       7,
        returnMethod:            'https://schema.org/ReturnByMail',
        returnFees:              'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type':          'OfferShippingDetails',
        shippingRate: {
          '@type':        'MonetaryAmount',
          currency:       'KES',
          value:           0,
        },
        deliveryTime: {
          '@type':            'ShippingDeliveryTime',
          handlingTime: {
            '@type':          'QuantitativeValue',
            minValue:          1,
            maxValue:          2,
            unitCode:         'DAY',
          },
          transitTime: {
            '@type':          'QuantitativeValue',
            minValue:          1,
            maxValue:          5,
            unitCode:         'DAY',
          },
        },
      },
    },
    ...(avgRating && product.reviews?.length ? {
      aggregateRating: {
        '@type':       'AggregateRating',
        ratingValue:    avgRating.toFixed(1),
        reviewCount:    product.reviews.length,
        bestRating:    '5',
        worstRating:   '1',
      },
    } : {}),
    ...(product.reviews?.length ? {
      review: product.reviews.slice(0, 5).map((r) => ({
        '@type':  'Review',
        author: {
          '@type': 'Person',
          name:    r.user?.name || 'Customer',
        },
        reviewRating: {
          '@type':       'Rating',
          ratingValue:    r.rating,
          bestRating:    '5',
          worstRating:   '1',
        },
        reviewBody: r.comment || '',
      })),
    } : {}),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Inject product schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <button onClick={() => router.push('/')} className="hover:text-red-600">Home</button>
          <span>/</span>
          <button onClick={() => router.push('/products')} className="hover:text-red-600">Products</button>
          <span>/</span>
          <button onClick={() => router.push(`/products?category=${product.category?.slug}`)} className="hover:text-red-600">
            {product.category?.name}
          </button>
          <span>/</span>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Images ── */}
          <div className="space-y-3">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              {mainImage ? (
                <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-8xl">👗</div>
              )}
              {product.featured && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">🔥 HOT</span>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-gray-800 font-bold px-6 py-2 rounded-full">Out of Stock</span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      mainImage === img ? 'border-red-600' : 'border-gray-200 hover:border-red-300'
                    }`}>
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="space-y-5">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              {product.category?.name}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {avgRating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map((i) => (
                    <span key={i} className={`text-lg ${i <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.reviews.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-red-700">{formatPrice(product.price)}</span>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-700 font-medium">
                    {product.stock <= 10 ? `Only ${product.stock} left!` : 'In Stock'}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 text-lg font-bold">−</button>
                  <span className="px-5 py-2.5 font-bold text-gray-800 min-w-[50px] text-center border-x border-gray-300">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 text-lg font-bold">+</button>
                </div>
              </div>
            )}

            {quantity > 1 && (
              <p className="text-sm text-gray-500">
                Total: <span className="font-bold text-gray-800">{formatPrice(product.price * quantity)}</span>
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white font-bold py-4 px-6 rounded-xl transition-colors text-base flex items-center justify-center gap-2">
                ⚡ Buy Now
              </button>
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className="flex-1 bg-white hover:bg-gray-50 disabled:opacity-40 text-gray-800 font-bold py-4 px-6 rounded-xl border-2 border-gray-300 hover:border-red-300 transition-colors text-base flex items-center justify-center gap-2">
                🛒 Add to Cart
              </button>
            </div>

            {/* Delivery info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-lg">🚚</span>
                <span>Free delivery across Kenya</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-lg">📱</span>
                <span>Pay with M-Pesa — fast & secure</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-lg">↩️</span>
                <span>7-day easy returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Customer Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-800">{review.user?.name || 'Customer'}</p>
                    <div className="flex">
                      {[1,2,3,4,5].map((i) => (
                        <span key={i} className={`text-sm ${i <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
