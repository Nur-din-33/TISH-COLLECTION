'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useCartStore, useAuthStore } from '../../lib/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  const cartCount = useCartStore((s) => s.getCount());
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // ✅ Fix hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  // ⛔ Prevent mismatch between server and client
  if (!mounted) return <div className="h-16" />;

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-700">TISH</span>
            <span className="text-2xl font-bold text-green-700">COLLECTION</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-full px-5 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm text-gray-600 hover:text-red-700 font-medium">
              Products
            </Link>
            <Link href="/products?category=electronics" className="text-sm text-gray-600 hover:text-red-700 font-medium">
              Electronics
            </Link>
            <Link href="/products?category=fashion" className="text-sm text-gray-600 hover:text-red-700 font-medium">
              Fashion
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-red-700">
              <ShoppingCartIcon className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-gray-700"
                  >
                    Admin
                  </Link>
                )}
                <Link href="/orders" className="text-sm text-gray-600 hover:text-red-700 font-medium">
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2 px-4">
                Login
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {mobileOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-full px-5 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </form>

            <Link href="/products" className="block text-sm text-gray-700 py-1.5" onClick={() => setMobileOpen(false)}>
              Products
            </Link>

            <Link href="/cart" className="block text-sm text-gray-700 py-1.5" onClick={() => setMobileOpen(false)}>
              Cart ({cartCount})
            </Link>

            {user ? (
              <>
                <Link href="/orders" className="block text-sm text-gray-700 py-1.5" onClick={() => setMobileOpen(false)}>
                  My Orders
                </Link>

                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="block text-sm text-gray-700 py-1.5" onClick={() => setMobileOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block text-sm text-red-600 py-1.5 text-left w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block btn-primary text-center text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}