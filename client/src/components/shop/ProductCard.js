'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useCartStore } from '../../lib/store';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);

  const rating = product.averageRating || 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-2xl border border-surface-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-elegant hover:border-surface-200 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/5] bg-surface-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-100 to-surface-50">
            <span className="text-surface-200 text-6xl font-light">+</span>
          </div>
        )}

        {product.featured && (
          <span className="absolute top-3 left-3 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Featured
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-white text-surface-900 text-xs font-bold px-5 py-2 rounded-full uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2 bg-surface-900 hover:bg-surface-800 disabled:opacity-30 text-white text-xs font-bold py-3 rounded-xl transition-all duration-200 uppercase tracking-wider"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] text-surface-400 uppercase tracking-[0.15em] mb-1.5 font-bold">
          {product.category?.name}
        </p>

        <h3 className="text-sm font-bold text-surface-900 line-clamp-2 flex-1 leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-2.5">
            {[1, 2, 3, 4, 5].map((i) =>
              i <= Math.round(rating) ? (
                <StarSolid key={i} className="w-3.5 h-3.5 text-brand-500" />
              ) : (
                <StarIcon key={i} className="w-3.5 h-3.5 text-surface-200" />
              )
            )}
            <span className="text-[11px] text-surface-400 ml-1">
              ({product.reviewCount})
            </span>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-surface-100">
          <span className="text-base font-black text-surface-900">
            {formatPrice(product.price)}
          </span>
          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-[10px] text-brand-600 mt-1 font-bold uppercase tracking-wider">
              Only {product.stock} left
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
