'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5">
            <span className="text-3xl font-bold text-surface-900">TISH</span>
            <span className="text-3xl font-bold text-brand-500">COLLECTION</span>
          </Link>
          <h1 className="text-xl font-bold text-surface-900 mt-5">Forgot Password</h1>
          <p className="text-surface-500 text-sm mt-1">Enter your email and we&apos;ll send a reset link.</p>
        </div>

        {sent ? (
          <div className="card text-center">
            <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-brand-500 text-xl font-bold">@</span>
            </div>
            <h2 className="text-lg font-bold text-surface-900 mb-2">Check your email</h2>
            <p className="text-surface-500 text-sm mb-4">
              If <strong>{email}</strong> is registered, you&apos;ll receive a password reset link shortly.
            </p>
            <p className="text-xs text-surface-400 mb-5">Check your spam folder if you don&apos;t see it within a few minutes.</p>
            <Link href="/login" className="btn-primary inline-block">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@email.com"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-surface-500">
              Remember your password?{' '}
              <Link href="/login" className="text-surface-900 font-semibold hover:text-brand-600 transition-colors">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
