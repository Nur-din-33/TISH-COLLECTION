'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store';

// Wraps any page that needs authentication
// Shows a spinner while Zustand loads from localStorage
// Then checks if user is logged in and has required role

export default function AuthGuard({ children, requireAdmin = false }) {
  const router          = useRouter();
  const { user }        = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small timeout lets Zustand fully hydrate from localStorage
    const timer = setTimeout(() => {
      setReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (requireAdmin && user.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [ready, user, requireAdmin, router]);

  // Show spinner while hydrating
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show spinner while redirecting
  if (!user || (requireAdmin && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return children;
}
