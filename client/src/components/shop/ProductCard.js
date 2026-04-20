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
      className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            📦
          </div>
        )}

        {product.featured && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            HOT
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          {product.category?.name}
        </p>

        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">
          {product.name}
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) =>
              i <= Math.round(rating) ? (
                <StarSolid key={i} className="w-3.5 h-3.5 text-yellow-400" />
              ) : (
                <StarIcon key={i} className="w-3.5 h-3.5 text-gray-300" />
              )
            )}
            <span className="text-xs text-gray-400 ml-1">
              ({product.reviewCount})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-red-700">
            {formatPrice(product.price)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 disabled:opacity-40 text-white text-xs font-semibold px-3 py-2 rounded-lg"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            Add
          </button>
        </div>

        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-orange-500 mt-1.5 font-medium">
            Only {product.stock} left!
          </p>
        )}
      </div>
    </Link>
  );
}
