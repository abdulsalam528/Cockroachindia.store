'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Package } from 'lucide-react';

export default function OrderConfirmedPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const confirmedData = sessionStorage.getItem('orderConfirmed');
    if (!confirmedData) {
      router.push('/');
      return;
    }
    setOrderDetails(JSON.parse(confirmedData));
  }, [router]);

  if (!orderDetails) {
    return (
      <div className="vintage-grain min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { orderId, amount, product, user, isGuest } = orderDetails;

  return (
    <div className="vintage-grain min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      <div className="w-full max-w-2xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 text-black">
        
        <div className="flex flex-col items-center text-center border-b-4 border-black pb-8">
          <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
          <h1 className="font-display text-4xl uppercase font-black tracking-wide">Payment Successful</h1>
          <p className="text-sm font-bold uppercase tracking-widest mt-2 text-gray-600">Your order is confirmed.</p>
          <div className="bg-gray-100 border-2 border-black px-4 py-2 mt-4 font-mono font-bold text-xs uppercase">
            Order ID: #{orderId}
          </div>
        </div>

        <div className="py-8 border-b-2 border-gray-200">
          <div className="flex gap-6 items-center">
            <div className="relative w-24 h-24 border-2 border-black flex-shrink-0 bg-gray-50">
              <Image src={product.productImage} alt={product.productName} fill className="object-cover" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-display text-xl uppercase font-black leading-tight">{product.productName}</h3>
              <div className="text-xs font-semibold text-gray-600 mt-2 space-y-1">
                <p>Size: {product.size} | Color: {product.color}</p>
                <p>Quantity: {product.quantity}</p>
              </div>
              <div className="font-black mt-3 text-lg">₹{amount / 100}</div>
            </div>
          </div>
        </div>

        <div className="py-8">
          <h2 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-3">
            <Package className="w-4 h-4" /> Delivering To:
          </h2>
          <div className="text-xs font-semibold leading-relaxed p-4 bg-gray-50 border-2 border-black">
            <p className="font-black text-sm uppercase">{user?.fullName}</p>
            <p className="mt-1 text-gray-700">{user?.email}</p>
            <p className="mt-2 italic">We will ship within 2-3 business days. Keep an eye out for dispatch alerts.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link 
            href="/"
            className="flex-1 text-center border-4 border-black bg-white py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Continue Shopping
          </Link>
          
          {isGuest ? (
            <Link 
              href={`/register?name=${encodeURIComponent(user?.fullName || '')}&email=${encodeURIComponent(user?.email || '')}`}
              className="flex-1 text-center border-4 border-black bg-black text-white py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Create Account to Track Order
            </Link>
          ) : (
            <Link 
              href="/dashboard"
              className="flex-1 text-center border-4 border-black bg-[#C2410C] text-white py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-[#EAE5D9] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              View Dashboard
            </Link>
          )}
        </div>

      </div>

    </div>
  );
}
