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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-4xl font-extrabold text-red-700">Drop</span>
            <span className="text-4xl font-extrabold text-green-700">KE</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send a reset link.</p>
        </div>

        {sent ? (
          <div className="card text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Check your email!</h2>
            <p className="text-gray-500 text-sm mb-4">
              If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
            </p>
            <p className="text-xs text-gray-400 mb-4">Check your spam folder if you don't see it within a few minutes.</p>
            <Link href="/login" className="btn-primary inline-block">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
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
            <p className="text-center text-sm text-gray-500">
              Remember your password?{' '}
              <Link href="/login" className="text-red-700 font-semibold hover:underline">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
