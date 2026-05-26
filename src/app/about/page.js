import Link from 'next/link';

export const metadata = {
  title: 'Cockroach Janta Party (CJP) Merch — T-Shirts & Mugs India',
  description: 'CJP merchandise. Cockroach Janta Party t-shirts, mugs and more. The satirical movement for India\'s chronically unbothered. Shop from ₹499.',
  alternates: {
    canonical: '/about',
  },
};

export default function About() {
  return (
    <div className="vintage-grain min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col gap-10">
      
      <header className="border-4 border-black bg-black text-[#EAE5D9] p-6 text-center">
        <h1 className="font-display text-3xl sm:text-5xl uppercase font-black tracking-wide leading-none text-[#C2410C]">
          Cockroach Janta Party — Merch
        </h1>
        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-300 mt-1 font-mono">
          Independent Satirical Manifesto of Cockroach India Store
        </p>
      </header>

      {/* Main Newspaper Style Column layout */}
      <article className="border-4 border-black bg-[#EAE5D9] p-6 sm:p-8 flex flex-col gap-8 text-black">
        
        {/* Sub-headline */}
        <div className="border-b-2 border-black pb-4 text-center">
          <h3 className="font-display text-xl uppercase font-black italic">
            &ldquo;They Tried to Squash us, We Outlived the Asteroids.&rdquo;
          </h3>
          <p className="text-[10px] text-gray-700 font-bold uppercase mt-1">
            Editorial Note from the Desk of Comrade Cockroach
          </p>
        </div>

        {/* Newspaper columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold leading-relaxed">
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-sm uppercase font-black text-[#C2410C] border-b border-black pb-1">
              I. THE FOUNDATIONAL RESILIENCE
            </h4>
            <p>
              Since the dawn of the Cretaceous period, we have watched species rise and fall. We watched the dinosaurs walk with arrogance, only to be vaporized by a single cosmic rock. We watched the mammoths freeze, and the empires of humans dissolve. Through it all, we remained.
            </p>
            <p>
              Cockroach India Store represents the ultimate biological survival strategy: low metabolic activity, maximum avoidance of unnecessary work, and the absolute refusal to be crushed under the weight of corporate deadlines.
            </p>

            <h4 className="font-display text-sm uppercase font-black text-[#C2410C] border-b border-black pb-1">
              II. CONSTITUTIONAL PROTEST
            </h4>
            <p>
              We believe in the constitutional right to procrastinate. In an era where humans are urged to &ldquo;hustle&rdquo; for 80 hours a week, we advocate for the slow, methodical horizontal lifestyle. We believe that true resilience is sitting in a comfortable armchair, sipping chai, and letting the market correct itself.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-display text-sm uppercase font-black text-[#C2410C] border-b border-black pb-1">
              III. OUR MANIFESTO IN COTTON
            </h4>
            <p>
              Why merchandise? Because a movement needs armor. Our 240 GSM heavy cotton apparel is specifically woven to withstand the wear and tear of a modern laying lifestyle. It serves as a visual warning to toxic managers: &ldquo;This employee is under our protection and cannot be squashed.&rdquo;
            </p>
            <p>
              Every rupee earned from procurement is funneled into sustaining our satirical campaigns, digital servers, and procuring high-quality tea leaves for our members.
            </p>

            <h4 className="font-display text-sm uppercase font-black text-[#C2410C] border-b border-black pb-1">
              IV. LEGISLATIVE GOALS
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Mandatory 3-hour afternoon rest periods nationwide.</li>
              <li>A direct constitutional ban on sending emails after 4:00 PM.</li>
              <li>Heavy legal taxation on alarm clocks exceeding 60 decibels.</li>
              <li>Immediate state subsidies for high-quality instant coffee.</li>
            </ul>
          </div>
        </div>



        {/* Vintage Quote Block */}
        <div className="border-2 border-black bg-black text-[#EAE5D9] p-6 text-center italic mt-4 font-semibold text-xs leading-relaxed">
          &ldquo;The dinosaurs had plans, milestones, and deliverables. Look where they are now. Be like the cockroach. Survive. Rest. Outlast.&rdquo;
        </div>

        <Link
          href="/"
          className="border-2 border-black bg-[#C2410C] text-white text-center py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-[#EAE5D9] transition-colors mt-4"
        >
          Return to Swag Hub & Secure Armor
        </Link>
      </article>

    </div>
  );
}
