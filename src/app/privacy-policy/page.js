import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Cockroach India Store',
  description: 'DPDP Act-compliant data protection guidelines and privacy policy outlines for Cockroach India Store.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="vintage-grain min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col gap-8">
      <header className="border-4 border-black bg-black text-[#EAE5D9] p-5 text-center">
        <h1 className="font-display text-2xl sm:text-4xl uppercase font-black tracking-wide leading-none text-[#C2410C]">
          PRIVACY POLICY
        </h1>
        <p className="text-[9px] uppercase font-bold text-gray-300 mt-1 font-mono">
          DPDP-Compliant Data Protection Guidelines
        </p>
      </header>

      <article className="border-4 border-black bg-[#EAE5D9] p-6 sm:p-8 flex flex-col gap-6 text-xs text-black font-semibold leading-relaxed">
        <p className="border-b border-black pb-2 text-[10px] uppercase font-bold text-[#C2410C]">
          Effective Date: May 22, 2026
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">1. Data Collection & Usage</h3>
        <p>
          We respect your privacy. Under the Digital Personal Data Protection (DPDP) Act, we collect only the minimal information required to process your orders and manage your account. This includes your name, email, phone number, and shipping address. We do not sell or rent your data to third-party data brokers.
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">2. Processing Operations & Compliance</h3>
        <p>
          Your payment coordinates are processed securely through our payment gateway partners. Financial logs and transaction receipts are managed under the regulatory compliance label: <strong className="text-[#C2410C]">abdulsalamproductions</strong>. Your banking statement will show charges marked under this name.
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">3. Cookies & Session Management</h3>
        <p>
          We use secure, standard `httpOnly` cookies to maintain your login session. These are necessary for the website to function correctly and allow you to view your order history and checkout securely. We do not use intrusive cross-site tracking cookies.
        </p>

        <h3 className="font-display text-base uppercase font-black mt-2">4. Your Data Rights & Erasure</h3>
        <p>
          Under the DPDP Act, you have the right to request access to or deletion of your personal data. If you wish to delete your account, please contact our Grievance Officer at cockroachindiastore@gmail.com. Upon request, your record will be securely erased from our active databases.
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
