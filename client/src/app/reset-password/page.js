'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '../../lib/api';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const searchParams            = useSearchParams();
  const router                  = useRouter();
  const token                   = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (!token) { toast.error('Invalid reset link'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally { setLoading(false); }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
        <div className="card text-center max-w-md w-full">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <h2 className="text-lg font-bold text-surface-900 mb-2">Invalid Reset Link</h2>
          <p className="text-surface-500 text-sm mb-5">Please request a new one.</p>
          <Link href="/forgot-password" className="btn-primary inline-block">Request New Link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5">
            <span className="text-3xl font-bold text-surface-900">TISH</span>
            <span className="text-3xl font-bold text-brand-500">COLLECTION</span>
          </Link>
          <h1 className="text-xl font-bold text-surface-900 mt-5">Set New Password</h1>
        </div>
        {done ? (
          <div className="card text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl font-bold">&#10003;</span>
            </div>
            <h2 className="text-lg font-bold text-surface-900 mb-2">Password Reset</h2>
            <p className="text-surface-500 text-sm mb-5">Your password has been updated.</p>
            <Link href="/login" className="btn-primary inline-block">Go to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="Min. 6 characters" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="input-field" placeholder="Repeat your password" required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-surface-200 border-t-surface-900 rounded-full animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
