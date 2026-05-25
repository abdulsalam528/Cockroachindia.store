'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import Loader from '../components/Loader';

function RegisterForm() {
  const { loading, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
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

    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await register(formData, callbackUrl);
    } catch (err) {
      setError(err.message || 'Failed to create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vintage-grain min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full border-4 border-black bg-[#EAE5D9] p-8 shadow-2xl flex flex-col gap-6">
        
        <div className="text-center border-b-2 border-black pb-4">
          <div className="text-xl">🛍️</div>
          <h2 className="font-display text-2xl uppercase font-black tracking-wide mt-1">
            CREATE FREE ACCOUNT
          </h2>
          <p className="text-[10px] uppercase font-bold text-gray-700 mt-1">
            Track your orders & get early drop access
          </p>
        </div>

        {error && (
          <div className="border-2 border-[#C2410C] bg-[#C2410C]/10 p-3 text-xs font-bold text-[#C2410C] leading-snug">
            ⚠️ ERROR: {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-700">
              1. Full Name
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Rahul Kumar"
              className="border-2 border-black bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#C2410C]"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-700">
              2. Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. rahul@example.com"
              className="border-2 border-black bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#C2410C]"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-700">
              3. Mobile Number [10-Digits]
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              pattern="[0-9]{10}"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              className="border-2 border-black bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#C2410C]"
            />
          </div>

          {/* Default Shipping Address */}
          <div className="border-t border-black/10 pt-4 flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase text-[#C2410C]">
              4. Default Shipping Address
            </h4>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-600">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                required
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Flat/House No., Building, Street"
                className="border-2 border-black bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#C2410C]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-gray-600">Address Line 2 (Optional)</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Landmark, Locality"
                className="border-2 border-black bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#C2410C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-600">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New Delhi"
                  className="border-2 border-black bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#C2410C]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-600">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Delhi"
                  className="border-2 border-black bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#C2410C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-600">PIN Code</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  pattern="[0-9]{6}"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="110001"
                  className="border-2 border-black bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#C2410C]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-gray-600">Country</label>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="India"
                  className="border-2 border-black bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#C2410C]"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-700">
              5. Password
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

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full text-center border-2 border-black bg-[#C2410C] text-white py-2.5 text-xs font-display font-black uppercase tracking-wider hover:bg-black hover:text-[#EAE5D9] transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {submitting ? 'PROCESSING...' : 'CREATE FREE ACCOUNT'}
          </button>
        </form>

        <div className="border-t border-black/25 pt-4 text-center text-xs font-bold">
          Already registered?{' '}
          <Link
            href={`/login${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="text-[#C2410C] hover:underline"
          >
            Login here
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[9px] uppercase font-bold text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
          Secure Account Creation
        </div>

      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<Loader text="Initializing registration..." subtext="Readying database write..." />}>
      <RegisterForm />
    </Suspense>
  );
}
