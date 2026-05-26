'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="border-b-4 border-black bg-[#EAE5D9] sticky top-0 z-50">
      {/* Top Banner Ticker */}
      <div className="bg-black text-[#EAE5D9] text-xs py-1.5 px-4 overflow-hidden border-b-2 border-black">
        <div className="animate-marquee whitespace-nowrap inline-block font-mono uppercase tracking-widest">
          📢 NEW DROPS EVERY WEEK • HEAVY 240 GSM COTTON • SHIPS ACROSS INDIA • COCKROACH INDIA STORE • 
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Satirical Branding Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 border-2 border-black transition-transform group-hover:scale-105">
            <Image src="/logo.webp" alt="Cockroach India Store logo" fill className="object-contain" unoptimized />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-2xl tracking-wide leading-none uppercase font-black">
              COCKROACH INDIA STORE
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-700">
              Merch Drop
            </p>
          </div>
        </Link>

        {/* Links Navigation */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase font-bold tracking-wider">
          <Link href="/" className="hover:text-[#C2410C] hover:underline underline-offset-4 decoration-2">
            Storefront
          </Link>
          <Link href="/about" className="hover:text-[#C2410C] hover:underline underline-offset-4 decoration-2">
            Manifesto
          </Link>

          {loading ? (
            // Skeleton placeholder — never fully invisible
            <span className="w-24 h-5 bg-black/10 animate-pulse rounded" />
          ) : user ? (
            <>
              <Link href="/dashboard" className="hover:text-[#C2410C] hover:underline underline-offset-4 decoration-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-700 border border-black animate-pulse"></span>
                My Orders
              </Link>
              {user.isAdmin && (
                <Link href="/admin" className="hover:text-[#C2410C] hover:underline underline-offset-4 decoration-2 bg-black text-[#EAE5D9] px-2 py-1 border border-black hover:bg-[#C2410C] transition-colors">
                  Admin Ops
                </Link>
              )}
              <button
                onClick={logout}
                className="hover:text-red-700 hover:underline underline-offset-4 decoration-2 font-bold cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-[#C2410C] hover:underline underline-offset-4 decoration-2">
                Login
              </Link>
              <Link
                href="/register"
                className="border-2 border-black bg-[#C2410C] text-white px-3 py-1.5 hover:bg-black hover:text-[#EAE5D9] transition-all font-bold"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
