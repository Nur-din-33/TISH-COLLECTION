'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import toast from 'react-hot-toast';

function LoginForm() {
  const [form, setForm]           = useState({ email: '', password: '' });
  const [loading, setLoading]     = useState(false);
  const { setAuth }               = useAuthStore();
  const router                    = useRouter();
  const searchParams              = useSearchParams();
  const redirect                  = searchParams.get('redirect') || '/';

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true;
    document.head.appendChild(script);
    script.onload = () => {
      if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-btn'),
          { theme: 'outline', size: 'large', width: 400, text: 'signin_with' }
        );
      }
    };
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await authApi.googleLogin(response.credential);
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome, ${res.data.user.name}!`);
      router.push(redirect);
    } catch { toast.error('Google sign-in failed. Try email login.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push(redirect);
    } catch (err) {
      const data = err.response?.data;
      if (data?.needsVerification) {
        toast.error('Please verify your email first.');
        router.push(`/register?verify=${data.userId}`);
      } else {
        toast.error(data?.message || 'Login failed');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-4xl font-extrabold text-red-700">TISH</span>
            <span className="text-4xl font-extrabold text-green-700">COLLECTION</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Sign in to your account</h1>
        </div>

        <div className="card space-y-4">
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <div id="google-btn" className="w-full flex justify-center" />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="you@email.com" required />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-red-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <input type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          Don't have an account?{' '}
          <Link href="/register" className="text-red-700 font-semibold hover:underline">Register here</Link>
        </p>
        
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
