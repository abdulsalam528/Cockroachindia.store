import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t-4 border-black bg-black text-[#EAE5D9] mt-auto font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Satire Slogan */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🪳</span>
              <span className="font-display font-black text-lg tracking-wide uppercase">COCKROACH INDIA STORE</span>
            </div>
            <p className="text-[11px] text-gray-400 max-w-sm leading-relaxed">
              We crawl so you can rest. Representing the silent majority of chronically online, caffeine-bribed, and work-avoidant citizens across India.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold uppercase tracking-widest text-[#C2410C] mb-3">CONSTITUTIONAL DOCUMENTS</h4>
            <ul className="space-y-2 font-semibold">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Manifesto
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy (No Data Squash)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Layabout & Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Statutory and Payment Warning */}
          <div>
            <h4 className="font-bold uppercase tracking-widest text-[#C2410C] mb-3">ACCOUNT COMPLIANCE NOTICE</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed mb-2">
              Payment processing services are securely integrated and managed under parent trading compliance label: <strong className="text-white">abdulsalamproductions</strong>. Statements will show charges accordingly.
            </p>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Cockroach India Store is an unofficial satirical parody shop. Cockroach Janta Party is a satirical campaign. No actual legislative seats are held, but our cotton apparel is 100% genuine and durable.
            </p>
          </div>
        </div>

        {/* Bottom copyright details */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-400">
          <p>© {new Date().getFullYear()} Cockroach India Store. All rights reserved. Built to survive an atomic war.</p>
          <div className="flex gap-4">
            <span className="text-[#C2410C] font-bold">● SURVIVE ANY SQUASH</span>
            <span>● MADE IN INDIA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
