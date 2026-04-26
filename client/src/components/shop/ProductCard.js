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
      className="group bg-white rounded-2xl border border-surface-100 shadow-soft hover:shadow-elegant transition-all duration-300 overflow-hidden flex flex-col hover:border-surface-200"
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-surface-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-300 text-4xl bg-surface-50">
            <span className="text-surface-200 text-6xl font-light">+</span>
          </div>
        )}

        {product.featured && (
          <span className="absolute top-3 left-3 bg-surface-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Featured
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-surface-900 text-white text-xs font-medium px-4 py-1.5 rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] text-surface-400 uppercase tracking-wider mb-1.5 font-medium">
          {product.category?.name}
        </p>

        <h3 className="text-sm font-semibold text-surface-800 line-clamp-2 flex-1 leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-2.5">
            {[1, 2, 3, 4, 5].map((i) =>
              i <= Math.round(rating) ? (
                <StarSolid key={i} className="w-3.5 h-3.5 text-brand-400" />
              ) : (
                <StarIcon key={i} className="w-3.5 h-3.5 text-surface-200" />
              )
            )}
            <span className="text-xs text-surface-400 ml-1">
              ({product.reviewCount})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
          <span className="text-base font-bold text-surface-900">
            {formatPrice(product.price)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-surface-900 hover:bg-surface-800 disabled:opacity-30 text-white text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200"
          >
            <ShoppingCartIcon className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-[11px] text-brand-600 mt-2 font-medium">
            Only {product.stock} left
          </p>
        )}
      </div>
    </Link>
  );
}
