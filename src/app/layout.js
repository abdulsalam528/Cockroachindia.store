import { Alfa_Slab_One, Space_Mono } from 'next/font/google';
import Script from 'next/script';
import { AuthProvider } from '@/context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import './globals.css';

const alfaSlab = Alfa_Slab_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-alfa-slab',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://cockroachindia.store'),
  title: 'Cockroach Janta Party (CJP) - Satirical Propaganda & Swag Hub',
  description: 'Voice of the Lazy & Unemployed. Buy premium cotton armour and campaign gear to survive the modern corporate landscape. Verified UPI checkouts.',
  openGraph: {
    title: 'Cockroach Janta Party (CJP)',
    description: 'Voice of the Lazy & Unemployed. Buy premium cotton armour and campaign gear to survive the modern corporate landscape.',
    url: 'https://cockroachindia.store',
    siteName: 'Cockroach India Store',
    images: [
      {
        url: '/homepage.webp', // Must be an absolute URL in production but Next.js automatically resolves this if metadataBase is set
        width: 1200,
        height: 630,
        alt: 'Cockroach Janta Party Propaganda',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cockroach Janta Party (CJP)',
    description: 'Voice of the Lazy & Unemployed. Official Swag Hub.',
    images: ['/homepage.webp'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${alfaSlab.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full bg-[#EAE5D9] text-[#000000] font-mono flex flex-col antialiased selection:bg-[#C2410C] selection:text-white">
        <AuthProvider>
          <Header />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        {/* Razorpay Web Checkout Integration */}
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
