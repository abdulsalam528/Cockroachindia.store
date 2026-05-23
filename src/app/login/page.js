'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck } from 'lucide-react';

function LoginForm() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in both dispatch coordinates.');
      return;
    }

    setSubmitting(true);
    try {
      await login(formData.email, formData.password, callbackUrl);
    } catch (err) {
      setError(err.message || 'Verification failed. Credentials rejected.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vintage-grain min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full border-4 border-black bg-[#EAE5D9] p-8 shadow-2xl flex flex-col gap-6">
        
        {/* Header Branding */}
        <div className="text-center border-b-2 border-black pb-4">
          <div className="text-xl">🪳</div>
          <h2 className="font-display text-2xl uppercase font-black tracking-wide mt-1">
            MEMBER ARCHIVE LOG-IN
          </h2>
          <p className="text-[10px] uppercase font-bold text-gray-700 mt-1">
            Lookup Form CJP-LOG-2026: Access Verified Status
          </p>
          {callbackUrl && callbackUrl !== '/dashboard' && (
            <p className="text-[10px] text-[#C2410C] font-bold mt-2 bg-[#C2410C]/10 px-2 py-1 border border-[#C2410C]/30">
              🔒 Login required to proceed with your purchase
            </p>
          )}
        </div>

        {error && (
          <div className="border-2 border-[#C2410C] bg-[#C2410C]/10 p-3 text-xs font-bold text-[#C2410C] leading-snug">
            ⚠️ ERROR: {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-700">
              1. Enlisted Dispatch Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. laxman@unemployed.org"
              className="border-2 border-black bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#C2410C]"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-700">
              2. Secret Passphrase [Password]
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="border-2 border-black bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#C2410C]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full text-center border-2 border-black bg-black text-[#EAE5D9] py-2.5 text-xs font-display font-black uppercase tracking-wider hover:bg-[#C2410C] hover:text-white transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {submitting ? 'LOOKING UP DATABASE...' : 'REQUEST SYSTEM ACCESS'}
          </button>
        </form>

        <div className="border-t border-black/25 pt-4 text-center text-xs font-bold">
          Not yet enlisted?{' '}
          <Link
            href={`/register${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="text-[#C2410C] hover:underline"
          >
            Register Application [Join Party]
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[9px] uppercase font-bold text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
          Secure Session cookie (httpOnly, Secure, Strict)
        </div>

      </div>
    </div>
  );
}


export default function Login() {
  return (
    <Suspense fallback={
      <div className="vintage-grain min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full border-4 border-black bg-[#EAE5D9] p-8 shadow-2xl flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-black border-t-[#C2410C] rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-center">
            Establishing Secured Connection to Party Archives...
          </p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
