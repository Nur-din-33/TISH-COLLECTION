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
    <div className="min-h-screen flex">
      {/* Left side — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-950 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent" />
        <div className="relative text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <span className="text-4xl font-black text-white tracking-tight">TISH</span>
            <span className="text-4xl font-black text-brand-400 tracking-tight">COLLECTION</span>
          </Link>
          <p className="text-surface-400 text-lg max-w-sm mx-auto leading-relaxed">
            Premium shopping experience with fast delivery across Kenya.
          </p>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-1.5">
              <span className="text-3xl font-black text-surface-900">TISH</span>
              <span className="text-3xl font-black text-brand-500">COLLECTION</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-surface-900 uppercase tracking-tight">Welcome back</h1>
            <p className="text-surface-500 text-sm mt-2">Sign in to your account to continue shopping</p>
          </div>

          <div className="space-y-6">
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <>
                <div id="google-btn" className="w-full flex justify-center" />
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-surface-200" />
                  <span className="text-xs text-surface-400 font-bold uppercase tracking-wider">Or</span>
                  <div className="flex-1 h-px bg-surface-200" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-surface-700 mb-2 uppercase tracking-wider">Email</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field" placeholder="you@email.com" required />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-surface-700 uppercase tracking-wider">Password</label>
                  <Link href="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field" placeholder="Enter your password" required />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-surface-900 text-white font-bold py-3.5 rounded-full uppercase tracking-wider text-sm hover:bg-surface-800 transition-all disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-surface-500 mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-surface-900 font-bold hover:text-brand-600 transition-colors">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-surface-200 border-t-surface-900 rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
