import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="vintage-grain min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col gap-8">
      <header className="border-4 border-black bg-black text-[#EAE5D9] p-5 text-center">
        <h2 className="font-display text-2xl sm:text-4xl uppercase font-black tracking-wide leading-none text-[#C2410C]">
          PRIVACY POLICY (NO DATA SQUASH)
        </h2>
        <p className="text-[9px] uppercase font-bold text-gray-300 mt-1 font-mono">
          Form CJP-PRIVACY-2026: Constitutional Protection of Digital Slackers
        </p>
      </header>

      <article className="border-4 border-black bg-[#EAE5D9] p-6 sm:p-8 flex flex-col gap-6 text-xs text-black font-semibold leading-relaxed">
        <p className="border-b border-black pb-2 text-[10px] uppercase font-bold text-[#C2410C]">
          Effective Date: May 22, 2026
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">1. The Anti-Squash Covenant</h3>
        <p>
          We promise never to squash your digital footprints. Unlike major tech cartels that auction your dreams to the highest bidder, the Cockroach Janta Party only collects minimal logs needed to verify your membership credentials and complete logistics dispatch coordinates.
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">2. Processing Operations & Deoband Food Compliance</h3>
        <p>
          Your payment coordinates are processed through industry-standard encryption. Financial logs and transaction receipts are managed under the regulatory compliance label: <strong className="text-[#C2410C]">Deoband Food</strong>. Your banking statement will show charges marked under this name. This transparency prevents billing abandonment.
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">3. Cookies & Session Storage</h3>
        <p>
          We set a single, secure, `httpOnly`, `SameSite=Strict` token cookie on your browser. This cookie contains your encrypted session credentials and prevents malicious third-party scripts from intercepting your verified party status. We do not use tracking cookies because we are too lazy to analyze the data.
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">4. Erasure of Archives</h3>
        <p>
          If you decide to resign from the movement and request database erasure, we will delete your record from our MongoDB Atlas cluster immediately. Any physical paperwork will be tossed into our unorganized filing cabinet, where it will slowly decompose over centuries.
        </p>

        <Link
          href="/"
          className="border-2 border-black bg-black text-[#EAE5D9] text-center py-2.5 font-bold uppercase hover:bg-[#C2410C] hover:text-white transition-colors mt-4 text-[10px]"
        >
          Return to Swag Hub
        </Link>
      </article>
    </div>
  );
}
