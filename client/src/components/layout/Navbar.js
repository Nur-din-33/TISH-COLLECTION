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
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Navbar({ transparent = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = useCartStore((s) => s.getCount());
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return (
    <>
      <div className="h-8" />
      <div className="h-16 md:h-20" />
    </>
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/');
  };

  const isTransparent = transparent && !scrolled && !mobileOpen;

  return (
    <>
      {/* Announcement bar */}
      <div className={`text-center text-xs font-semibold py-2 px-4 tracking-wider uppercase transition-all duration-300 relative z-40 ${
        isTransparent
          ? 'bg-white/10 text-white/80 backdrop-blur-sm'
          : 'bg-surface-900 text-white'
      }`}>
        Free delivery on orders over KES 5,000 &mdash; <Link href="/products" className="underline underline-offset-2 hover:text-brand-400 transition-colors">Shop Now</Link>
      </div>

      <nav className={`z-50 transition-all duration-500 ${
        isTransparent
          ? 'absolute top-8 w-full bg-transparent'
          : 'sticky top-0 bg-white shadow-soft border-b border-surface-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 group">
              <span className={`text-xl md:text-2xl font-black tracking-tight transition-colors ${isTransparent ? 'text-white' : 'text-surface-900'}`}>TISH</span>
              <span className={`text-xl md:text-2xl font-black tracking-tight transition-colors ${isTransparent ? 'text-brand-400' : 'text-brand-500'}`}>COLLECTION</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/products" className={`text-sm uppercase tracking-wider font-semibold transition-colors hover:text-brand-500 ${
                isTransparent ? 'text-white/90' : 'text-surface-700'
              } ${pathname === '/products' ? (isTransparent ? 'text-white border-b-2 border-white pb-0.5' : 'text-surface-900 border-b-2 border-surface-900 pb-0.5') : ''}`}>
                Shop
              </Link>
              <Link href="/products?category=electronics" className={`text-sm uppercase tracking-wider font-semibold transition-colors hover:text-brand-500 ${
                isTransparent ? 'text-white/90' : 'text-surface-700'
              }`}>
                Electronics
              </Link>
              <Link href="/products?category=fashion" className={`text-sm uppercase tracking-wider font-semibold transition-colors hover:text-brand-500 ${
                isTransparent ? 'text-white/90' : 'text-surface-700'
              }`}>
                Fashion
              </Link>
              <Link href="/products?category=home-garden" className={`text-sm uppercase tracking-wider font-semibold transition-colors hover:text-brand-500 ${
                isTransparent ? 'text-white/90' : 'text-surface-700'
              }`}>
                Home
              </Link>
            </div>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className={`w-40 focus:w-56 transition-all duration-300 border-0 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                    isTransparent
                      ? 'bg-white/15 text-white placeholder:text-white/50 focus:bg-white focus:text-surface-900 focus:placeholder:text-surface-400'
                      : 'bg-surface-100 text-surface-900 placeholder:text-surface-400 focus:bg-white'
                  }`}
                />
                <button type="submit" className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isTransparent ? 'text-white/60' : 'text-surface-400'}`}>
                  <MagnifyingGlassIcon className="w-4 h-4" />
                </button>
              </form>

              {/* Cart */}
              <Link href="/cart" className={`relative p-2 rounded-full transition-all ${
                isTransparent ? 'text-white hover:bg-white/10' : 'text-surface-700 hover:bg-surface-100'
              }`}>
                <ShoppingCartIcon className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {user ? (
                <div className="flex items-center gap-2">
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-xs uppercase tracking-wider font-bold bg-brand-500 text-white px-4 py-2 rounded-full hover:bg-brand-600 transition-all">
                      Admin
                    </Link>
                  )}
                  <Link href="/orders" className={`text-sm font-semibold transition-colors ${isTransparent ? 'text-white/90 hover:text-white' : 'text-surface-600 hover:text-surface-900'}`}>
                    Orders
                  </Link>
                  <button onClick={handleLogout} className={`text-sm font-semibold transition-colors ${isTransparent ? 'text-white/60 hover:text-white' : 'text-surface-400 hover:text-surface-600'}`}>
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className={`text-xs uppercase tracking-wider font-bold px-5 py-2.5 rounded-full transition-all ${
                  isTransparent
                    ? 'bg-white text-surface-900 hover:bg-surface-100'
                    : 'bg-surface-900 text-white hover:bg-surface-800'
                }`}>
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg transition-all ${
                isTransparent ? 'text-white hover:bg-white/10' : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden py-6 border-t border-surface-100 space-y-1 animate-fade-in bg-white">
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-surface-100 border-0 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white transition-all"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </form>

              {[
                { href: '/products', label: 'Shop All' },
                { href: '/products?category=electronics', label: 'Electronics' },
                { href: '/products?category=fashion', label: 'Fashion' },
                { href: '/products?category=home-garden', label: 'Home & Garden' },
                { href: '/products?category=beauty', label: 'Beauty' },
                { href: '/products?category=sports', label: 'Sports' },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="block text-base font-semibold text-surface-800 py-3 px-2 border-b border-surface-50 hover:text-brand-500 transition-colors uppercase tracking-wider"
                  onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}

              <Link href="/cart" className="block text-base font-semibold text-surface-800 py-3 px-2 border-b border-surface-50 hover:text-brand-500 transition-colors uppercase tracking-wider" onClick={() => setMobileOpen(false)}>
                Cart ({cartCount})
              </Link>

              {user ? (
                <>
                  <Link href="/orders" className="block text-base font-semibold text-surface-800 py-3 px-2 border-b border-surface-50 hover:text-brand-500 transition-colors uppercase tracking-wider" onClick={() => setMobileOpen(false)}>
                    My Orders
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="block text-base font-semibold text-surface-800 py-3 px-2 border-b border-surface-50 hover:text-brand-500 transition-colors uppercase tracking-wider" onClick={() => setMobileOpen(false)}>
                      Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block text-base font-semibold text-surface-400 py-3 px-2 uppercase tracking-wider hover:text-surface-600 transition-colors w-full text-left">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="block text-center bg-surface-900 text-white font-bold py-3.5 rounded-full uppercase tracking-wider text-sm mt-4" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
