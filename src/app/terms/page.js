import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="vintage-grain min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col gap-8">
      <header className="border-4 border-black bg-black text-[#EAE5D9] p-5 text-center">
        <h2 className="font-display text-2xl sm:text-4xl uppercase font-black tracking-wide leading-none text-[#C2410C]">
          TERMS OF SERVICE
        </h2>
        <p className="text-[9px] uppercase font-bold text-gray-300 mt-1 font-mono">
          Official Procurement Agreement
        </p>
      </header>

      <article className="border-4 border-black bg-[#EAE5D9] p-6 sm:p-8 flex flex-col gap-6 text-xs text-black font-semibold leading-relaxed">
        <p className="border-b border-black pb-2 text-[10px] uppercase font-bold text-[#C2410C]">
          Revised: May 22, 2026
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">1. The Covenant of Laying About</h3>
        <p>
          By purchasing our official Cotton Armour, Mug, or Cap, you explicitly covenant that you will not engage in toxic productivity. You agree to take at least two afternoon naps per week and to avoid answering work emails with urgency.
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">2. Payment Account Compliance</h3>
        <p>
          You acknowledge and agree that checkout transactions are processed by our secure compliance agent, <strong className="text-[#C2410C]">abdulsalamproductions</strong>. You agree not to file double-payment disputes due to branding discrepancies on your banking statements.
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">3. Atomic Stock Reservation</h3>
        <p>
          Our inventory system operates on strict atomic Stock Decrement routines inside MongoDB. Initiating a checkout temporarily reserves your selected size variant. If you abort the checkout, the system reserves the right to release the slot to other lazy comrades immediately.
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">4. Disclaimers of Satire</h3>
        <p>
          Cockroach India Store is a satirical conceptual design store. We do not participate in any political campaigns or elections. We do not guarantee corporate immunity from layoffs, but we do guarantee you will look extremely stylish and resilient while lounging in our heavyweight tees.
        </p>

        <Link
          href="/"
          className="border-2 border-black bg-black text-[#EAE5D9] text-center py-2.5 font-bold uppercase hover:bg-[#C2410C] hover:text-white transition-colors mt-4 text-[10px]"
        >
          I Agree, Return to Swag Hub
        </Link>
      </article>
    </div>
  );
}
