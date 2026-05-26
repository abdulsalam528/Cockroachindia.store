import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Cockroach India Store',
  description: 'Read the terms of service, procurement covenant of laying about, and atomic stock reservation conditions for Cockroach India Store.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsOfService() {
  return (
    <div className="vintage-grain min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col gap-8">
      <header className="border-4 border-black bg-black text-[#EAE5D9] p-5 text-center">
        <h1 className="font-display text-2xl sm:text-4xl uppercase font-black tracking-wide leading-none text-[#C2410C]">
          TERMS OF SERVICE
        </h1>
        <p className="text-[9px] uppercase font-bold text-gray-300 mt-1 font-mono">
          Procurement Agreement
        </p>
      </header>

      <article className="border-4 border-black bg-[#EAE5D9] p-6 sm:p-8 flex flex-col gap-6 text-xs text-black font-semibold leading-relaxed">
        <p className="border-b border-black pb-2 text-[10px] uppercase font-bold text-[#C2410C]">
          Revised: May 22, 2026
        </p>

        {/* Refunds & Returns Policy Box */}
        <div className="border-4 border-[#C2410C] bg-white p-4 sm:p-5 flex flex-col gap-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display text-base uppercase font-black text-[#C2410C] tracking-wide">Refunds & Returns</h3>
          <p className="leading-relaxed">
            As of now, Cockroach India Store does not offer refunds or returns. 
            All sales are final. Please check the size chart carefully before placing your order.
          </p>
          <p className="leading-relaxed">
            If your order arrives damaged or you receive the wrong item, contact us 
            at <a href="mailto:cockroachindiastore@gmail.com" className="underline font-bold hover:text-[#C2410C]">cockroachindiastore@gmail.com</a> or WhatsApp <a href="https://wa.me/917409656353" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-[#C2410C]">+91 74096 56353</a> within 
            48 hours of delivery with a photo and we will make it right.
          </p>
        </div>

        <h3 className="font-display text-base uppercase font-black mt-2">1. The Covenant of Laying About</h3>
        <p>
          By purchasing our Cotton Armour, Mug, or Cap, you explicitly covenant that you will not engage in toxic productivity. You agree to take at least two afternoon naps per week and to avoid answering work emails with urgency.
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
