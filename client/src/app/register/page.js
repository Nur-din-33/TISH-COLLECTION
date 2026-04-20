'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [step, setStep]   = useState('form');   // 'form' | 'verify'
  const [userId, setUserId] = useState(null);
  const [code, setCode]   = useState('');
  const [resending, setResending] = useState(false);
  const [form, setForm]   = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  // Load Google script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true;
    document.head.appendChild(script);
    script.onload = () => {
      if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({ client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, callback: handleGoogleResponse });
        window.google.accounts.id.renderButton(document.getElementById('google-btn-reg'), { theme: 'outline', size: 'large', width: 400, text: 'signup_with' });
      }
    };
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await authApi.googleLogin(response.credential);
      setAuth(res.data.user, res.data.token);
      toast.success('Account created with Google! Welcome 🎉');
      router.push('/');
    } catch { toast.error('Google sign-up failed. Try manual registration.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await authApi.register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      setUserId(res.data.userId);
      setStep('verify');
      toast.success('Check your email for the 6-digit code!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error('Enter the 6-digit code from your email'); return; }
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ userId, code });
      setAuth(res.data.user, res.data.token);
      toast.success('Email verified! Welcome to DropKE 🎉');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendCode(userId);
      toast.success('New code sent to your email!');
    } catch { toast.error('Could not resend code'); }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-4xl font-extrabold text-red-700">Drop</span>
            <span className="text-4xl font-extrabold text-green-700">KE</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {step === 'form' ? 'Create your account' : 'Verify your email'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {step === 'form' ? 'Join thousands of Kenyans shopping smarter.' : `Enter the 6-digit code sent to ${form.email}`}
          </p>
        </div>

        {/* ── STEP 1: Registration form ── */}
        {step === 'form' && (
          <div className="card space-y-4">
            {/* Google Sign-Up */}
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
              <>
                <div id="google-btn-reg" className="w-full flex justify-center" />
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">OR REGISTER WITH EMAIL</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field" placeholder="John Kamau" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field" placeholder="john@email.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (M-Pesa)</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field" placeholder="0712345678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field pr-12" placeholder="Min. 6 characters" required minLength={6} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium">
                    {showPass ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    className={`input-field pr-12 ${form.confirm && form.password !== form.confirm ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder="Repeat your password" required minLength={6} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium">
                    {showConfirm ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {form.confirm && form.password === form.confirm && form.confirm.length >= 6 && (
                  <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                )}
              </div>
              <button type="submit" disabled={loading || (form.confirm && form.password !== form.confirm)}
                className="btn-primary w-full py-3 disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Email verification ── */}
        {step === 'verify' && (
          <div className="card space-y-5">
            <div className="text-center">
              <div className="text-5xl mb-3">📧</div>
              <p className="text-sm text-gray-500">We sent a 6-digit code to <strong>{form.email}</strong></p>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter 6-digit code</label>
                <input
                  type="text" inputMode="numeric" maxLength={6} value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center text-3xl font-bold tracking-[0.5em] py-4"
                  placeholder="000000" required />
              </div>
              <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full py-3">
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">Didn't receive the code?</p>
              <button onClick={handleResend} disabled={resending}
                className="text-sm text-red-700 font-semibold hover:underline disabled:opacity-50">
                {resending ? 'Sending...' : 'Resend code'}
              </button>
              <p className="text-xs text-gray-400">Check your spam/junk folder too</p>
            </div>
            <button onClick={() => setStep('form')} className="w-full text-xs text-gray-400 hover:text-gray-600">
              ← Back to registration
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-red-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
