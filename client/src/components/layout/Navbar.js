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
  const [scrolled, setScrolled] = useState(false);

  const cartCount = useCartStore((s) => s.getCount());
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-soft border-b border-surface-100'
        : 'bg-white border-b border-surface-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 group">
            <span className="text-xl font-bold tracking-tight text-surface-900">TISH</span>
            <span className="text-xl font-bold tracking-tight text-brand-500">COLLECTION</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-surface-100 border-0 rounded-xl px-5 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition-all duration-200 placeholder:text-surface-400"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-brand-600 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/products" className="text-sm text-surface-600 hover:text-surface-900 font-medium px-3 py-2 rounded-lg hover:bg-surface-100 transition-all">
              Products
            </Link>
            <Link href="/products?category=electronics" className="text-sm text-surface-600 hover:text-surface-900 font-medium px-3 py-2 rounded-lg hover:bg-surface-100 transition-all">
              Electronics
            </Link>
            <Link href="/products?category=fashion" className="text-sm text-surface-600 hover:text-surface-900 font-medium px-3 py-2 rounded-lg hover:bg-surface-100 transition-all">
              Fashion
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2.5 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-100 transition-all ml-1">
              <ShoppingCartIcon className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold min-w-[18px] min-h-[18px]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="flex items-center gap-1 ml-1">
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-sm bg-surface-900 text-white px-3.5 py-2 rounded-xl font-medium hover:bg-surface-800 transition-all"
                  >
                    Admin
                  </Link>
                )}
                <Link href="/orders" className="text-sm text-surface-600 hover:text-surface-900 font-medium px-3 py-2 rounded-lg hover:bg-surface-100 transition-all">
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-surface-600 hover:text-surface-900 font-medium px-3 py-2 rounded-lg hover:bg-surface-100 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2 px-5 ml-2">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-100 transition-all"
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
          <div className="md:hidden py-4 border-t border-surface-100 space-y-2 animate-fade-in">
            <form onSubmit={handleSearch} className="relative mb-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-surface-100 border-0 rounded-xl px-5 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </form>

            <Link href="/products" className="block text-sm text-surface-700 py-2.5 px-3 rounded-lg hover:bg-surface-100 transition-all" onClick={() => setMobileOpen(false)}>
              Products
            </Link>

            <Link href="/cart" className="block text-sm text-surface-700 py-2.5 px-3 rounded-lg hover:bg-surface-100 transition-all" onClick={() => setMobileOpen(false)}>
              Cart ({cartCount})
            </Link>

            {user ? (
              <>
                <Link href="/orders" className="block text-sm text-surface-700 py-2.5 px-3 rounded-lg hover:bg-surface-100 transition-all" onClick={() => setMobileOpen(false)}>
                  My Orders
                </Link>

                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="block text-sm text-surface-700 py-2.5 px-3 rounded-lg hover:bg-surface-100 transition-all" onClick={() => setMobileOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block text-sm text-surface-500 py-2.5 px-3 text-left w-full rounded-lg hover:bg-surface-100 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block btn-primary text-center text-sm mt-2"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
