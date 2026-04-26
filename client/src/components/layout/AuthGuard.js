'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store';

export default function AuthGuard({ children, requireAdmin = false }) {
  const router          = useRouter();
  const { user }        = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
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

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-surface-200 border-t-surface-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (requireAdmin && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-surface-200 border-t-surface-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-500 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return children;
}
