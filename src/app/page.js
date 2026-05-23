'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Sparkles, Check, AlertTriangle, X, ShoppingBag, Terminal } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // Catalog State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Interaction State for Cart/Checkout
  const [selectedSizes, setSelectedSizes] = useState({});
  const [quantities, setQuantities] = useState({});
  const [selectedAddresses, setSelectedAddresses] = useState({});
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  // Simulated Payment Modal State
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState(null);
  const [mockPaying, setMockPaying] = useState(false);

  // Notification State
  const [notification, setNotification] = useState(null);

  const handleAddressChange = (productId, addressId) => {
    setSelectedAddresses(prev => ({ ...prev, [productId]: addressId }));
  };

  // Sync selected addresses
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0 && products.length > 0) {
      const defAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      const addrs = {};
      products.forEach(p => {
        addrs[p.id] = defAddr._id;
      });
      setSelectedAddresses(prev => ({ ...addrs, ...prev }));
    }
  }, [user, products]);

  // Load Products from database
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          
          // Set default sizes and quantities
          const sizes = {};
          const qtys = {};
          data.products.forEach(p => {
            sizes[p.id] = 'M';
            qtys[p.id] = 1;
          });
          setSelectedSizes(sizes);
          setQuantities(qtys);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const handleSizeChange = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleQtyChange = (productId, amount) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + amount);
      return { ...prev, [productId]: next };
    });
  };

  // Checkout Execution
  const handleBuyNow = async (product) => {
    if (!user) {
      setNotification({ type: 'error', message: 'Comrade! You must enlist (login/register) before procurement of gear.' });
      setTimeout(() => setNotification(null), 5000);
      router.push('/login?callbackUrl=/');
      return;
    }

    const size = selectedSizes[product.id] || 'M';
    const quantity = quantities[product.id] || 1;
    const addressId = selectedAddresses[product.id] || (user.addresses?.find(a => a.isDefault)?._id || user.addresses?.[0]?._id);

    setCheckoutLoading(product.id);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, size, quantity, addressId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout initialization failed.');
      }

      // If mock payment (local development fallback)
      if (data.isMock) {
        setMockPaymentData(data);
        setShowMockModal(true);
      } else {
        // Trigger real Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: 'INR',
          name: 'abdulsalamproductions',
          description: 'Cockroach India Store - Secure Checkout',
          order_id: data.razorpayOrderId,
          handler: async function (response) {
            // Keep the loading state while we verify on the backend
            setCheckoutLoading(product.id);
            try {
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                setNotification({ type: 'success', message: 'Payment verified! Preparing your dispatch.' });
              } else {
                setNotification({ type: 'success', message: 'Payment captured! Preparing your dispatch.' });
              }
            } catch (verifyErr) {
              console.error('Verify payment failed:', verifyErr);
              setNotification({ type: 'success', message: 'Payment captured! Preparing your dispatch.' });
            }
            setTimeout(() => {
              setNotification(null);
              if (response.razorpay_payment_id) {
                router.push('/dashboard');
              }
            }, 3000);
          },
          prefill: {
            name: data.user.fullName,
            email: data.user.email,
          },
          theme: {
            color: '#C2410C',
          },
          modal: {
            ondismiss: function () {
              setCheckoutLoading(null); // Re-enable button when modal closes
              setNotification({ type: 'warning', message: 'Payment cancelled by user. Inventory reserved momentarily.' });
              setTimeout(() => setNotification(null), 5000);
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setNotification({ type: 'error', message: response.error.description });
          setCheckoutLoading(null);
        });
        rzp.open();

      }
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: err.message });
      setTimeout(() => setNotification(null), 6000);
      setCheckoutLoading(null);
    }
    // Removed finally block so the button doesn't immediately become clickable again while Razorpay is open
  };

  // Complete simulated payment
  const handleConfirmMockPayment = async () => {
    if (!mockPaymentData) return;
    setMockPaying(true);

    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mockOrderId: mockPaymentData.razorpayOrderId,
          mockPaymentId: `pay_mock_${Math.floor(1000000 + Math.random() * 9000000)}`
        })
      });

      if (res.ok) {
        setShowMockModal(false);
        setNotification({ type: 'success', message: 'Simulated Order Paid! Welcome to verified status.' });
        setTimeout(() => {
          setNotification(null);
          router.push('/dashboard');
        }, 2000);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to simulate payment capture.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setMockPaying(false);
    }
  };

  return (
    <div className="vintage-grain min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-16">
      
      {/* Alert Notifications */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 border-4 border-black max-w-md shadow-2xl flex items-start gap-3 bg-[#EAE5D9] transition-all`}>
          {notification.type === 'error' ? (
            <AlertTriangle className="w-6 h-6 text-[#C2410C] flex-shrink-0" />
          ) : (
            <Check className="w-6 h-6 text-green-700 flex-shrink-0" />
          )}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider">
              {notification.type === 'error' ? 'SYSTEM INTERFERENCE' : 'PARTY TRANSACTION'}
            </h4>
            <p className="text-xs mt-1 leading-snug font-semibold">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="ml-auto text-gray-500 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: Vintage Propaganda Hero */}
      <section className="border-4 border-black bg-[#EAE5D9] p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <span className="bg-black text-[#EAE5D9] self-start text-[10px] px-3 py-1 font-bold tracking-widest uppercase">
            DECLARATION OF SLACKING
          </span>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-none uppercase font-black tracking-wide">
            Voice of <br />
            the <span className="text-[#C2410C] underline decoration-4 decoration-black">Lazy</span> & <br />
            Unemployed.
          </h1>
          <p className="text-sm font-semibold max-w-xl text-gray-900 leading-relaxed">
            Our cotton armor is built from the finest heavy threads, designed to protect you from structural squash attempts, overbearing aunts, and toxic productivity traps. Put on the cotton manifesto and lay back.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <a
              href="#storefront"
              className="bg-[#C2410C] text-white border-2 border-black font-bold text-xs tracking-wider uppercase px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Browse Propaganda Gear
            </a>
            <Link
              href="/about"
              className="bg-black text-[#EAE5D9] border-2 border-black font-bold text-xs tracking-wider uppercase px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Read Our Constitution
            </Link>
          </div>
        </div>

        {/* Vintage Poster Illustration */}
        <div className="border-4 border-black p-4 bg-black flex flex-col gap-3 text-[#EAE5D9] shadow-2xl">
          <div className="relative aspect-[3/4] w-full border-2 border-[#EAE5D9] overflow-hidden">
            <Image
              src="/homepage.webp"
              alt="Satirical Propaganda Print"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Placeholder Banner */}
      <section className="border-4 border-black bg-black text-[#EAE5D9] p-2 sm:p-4">
        <div className="relative aspect-video w-full border-2 border-[#EAE5D9] overflow-hidden">
          <Image
            src="/banner.webp"
            alt="Promotional Banner"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* SECTION 3: Large CJP Logo Banner */}
      <section className="text-center py-6 border-y-4 border-black my-4">
        <h2 className="font-display text-5xl sm:text-7xl font-black uppercase text-center tracking-wide leading-none">
          COCKROACH JANTA PARTY
        </h2>
        <div className="text-xs font-black uppercase tracking-widest text-[#C2410C] mt-2">
          🇮🇳 UNITY • RESILIENCE • LAYABOUT 🇮🇳
        </div>
      </section>

      {/* SECTION 4: High-Density 20-Product Grid */}
      <section id="storefront" className="flex flex-col gap-8">
        <div className="border-b-4 border-black pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h3 className="font-display text-3xl uppercase font-black tracking-wide">
              PROPAGANDA COTTON & WAREHOUSE INVENTORY
            </h3>
            <p className="text-xs text-gray-700 font-bold uppercase mt-1">
              Select Size & Quantity. Atomic stock checks run instantly.
            </p>
          </div>
          <div className="bg-black text-[#EAE5D9] px-3 py-1 text-xs font-bold uppercase border border-black flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#C2410C]" />
            Live Database Stock Synchronization
          </div>
        </div>

        {loadingProducts ? (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-black border-t-[#C2410C] rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest">Querying MongoDB Stock Ledgers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => {
              const activeSize = selectedSizes[product.id] || 'M';
              const sizeField = `size${activeSize}`;
              const availableStock = product.stock?.[sizeField] ?? 0;
              const isOutOfStock = availableStock <= 0;

              return (
                <div key={product.id} className="border-4 border-black bg-[#EAE5D9] flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                  
                  {/* Image Display */}
                  <div className="relative aspect-square w-full border-b-2 border-black overflow-hidden bg-white">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-all duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2 bg-black text-[#EAE5D9] text-[9px] font-bold px-2 py-0.5 border border-black tracking-wider uppercase">
                      INR {product.price}
                    </div>

                    {isOutOfStock ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-display text-sm uppercase tracking-widest font-black">
                        DEPLETED!
                      </div>
                    ) : availableStock <= 5 ? (
                      <div className="absolute top-2 right-2 bg-[#C2410C] text-white text-[8px] font-bold px-2 py-0.5 border border-black tracking-wider uppercase animate-pulse">
                        Only {availableStock} Left!
                      </div>
                    ) : null}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-grow flex flex-col justify-between gap-4">
                    <div>
                      <Link href={`/product/${product.id}`} className="font-display text-sm uppercase font-black hover:text-[#C2410C] leading-tight block">
                        {product.name}
                      </Link>
                      <p className="text-[11px] text-gray-800 font-semibold leading-relaxed mt-2 line-clamp-3">
                        {product.description}
                      </p>
                    </div>

                    {/* Interactive controls */}
                    <div className="flex flex-col gap-2.5 mt-auto pt-2 border-t border-black/20">
                      {user ? (
                        <>
                          {/* Size Selection — logged in users only */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-700 uppercase">Size:</span>
                            <select
                              value={activeSize}
                              onChange={(e) => handleSizeChange(product.id, e.target.value)}
                              className="border border-black bg-white px-2 py-0.5 font-bold outline-none text-xs"
                            >
                              <option value="S">Small [S]</option>
                              <option value="M">Medium [M]</option>
                              <option value="L">Large [L]</option>
                              <option value="XL">Extra Large [XL]</option>
                            </select>
                          </div>

                          {/* Shipping Address Selection */}
                          {user.addresses && user.addresses.length > 0 && (
                            <div className="flex flex-col gap-1 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-700 uppercase">Ship To:</span>
                                <select
                                  value={selectedAddresses[product.id] || ''}
                                  onChange={(e) => handleAddressChange(product.id, e.target.value)}
                                  className="border border-black bg-white px-2 py-0.5 font-bold outline-none text-xs max-w-[150px] truncate"
                                >
                                  {user.addresses.map((addr) => (
                                    <option key={addr._id} value={addr._id}>
                                      {addr.addressLine1}, {addr.city}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                          {(!user.addresses || user.addresses.length === 0) && (
                            <div className="text-[10px] text-[#C2410C] font-bold uppercase leading-none">
                              ⚠️ No address. <Link href="/dashboard" className="underline font-black">Configure book</Link>
                            </div>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-700 uppercase">Quantity:</span>
                            <div className="flex items-center border border-black bg-white">
                              <button
                                onClick={() => handleQtyChange(product.id, -1)}
                                className="px-2 py-0.5 hover:bg-gray-100 font-bold border-r border-black"
                              >
                                -
                              </button>
                              <span className="px-3 py-0.5 font-bold">{quantities[product.id] || 1}</span>
                              <button
                                onClick={() => handleQtyChange(product.id, 1)}
                                className="px-2 py-0.5 hover:bg-gray-100 font-bold border-l border-black"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        // Guest: just show a View Details link
                        <Link
                          href={`/product/${product.id}`}
                          className="text-[10px] font-bold text-gray-600 uppercase tracking-wider hover:text-[#C2410C] text-center"
                        >
                          View Details →
                        </Link>
                      )}

                      {/* Stock safety warning */}
                      {!isOutOfStock && availableStock <= 5 && (
                        <p className="text-[9px] text-[#C2410C] font-bold uppercase text-right leading-none">
                          ⚡ ONLY {availableStock} left in Size {activeSize}!
                        </p>
                      )}


                      {/* Buy Action Button */}
                      {!user ? (
                        // Guest: show Login to Buy link
                        <Link
                          href={`/login?callbackUrl=${encodeURIComponent(`/product/${product.id}`)}`}
                          className="w-full text-center border-2 border-black py-2 text-xs font-bold uppercase tracking-wider transition-colors bg-black text-[#EAE5D9] hover:bg-[#C2410C] hover:text-white block"
                        >
                          🔒 Login to Buy
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleBuyNow(product)}
                          disabled={isOutOfStock || checkoutLoading === product.id}
                          className={`w-full text-center border-2 border-black py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            isOutOfStock
                              ? 'bg-gray-400 text-gray-800 border-gray-600 cursor-not-allowed'
                              : checkoutLoading === product.id
                              ? 'bg-black text-[#EAE5D9] cursor-wait'
                              : 'bg-[#C2410C] text-white hover:bg-black hover:text-[#EAE5D9]'
                          }`}
                        >
                          {isOutOfStock
                            ? 'DEPLETED'
                            : checkoutLoading === product.id
                            ? 'SECURING SLOT...'
                            : 'BUY NOW / CHECKOUT'}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 5: Satellite Satirical Member Join Callout */}
      {!user && (
        <section className="border-4 border-[#C2410C] bg-[#EAE5D9] p-8 text-center flex flex-col gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-[#C2410C] flex items-center justify-center border-2 border-black text-white text-xl animate-bounce">
            🪳
          </div>
          <h3 className="font-display text-2xl uppercase font-black">
            STILL NOT A VERIFIED PARTY MEMBER?
          </h3>
          <p className="text-xs font-semibold max-w-lg leading-relaxed">
            Get your official CJP credentials, declare your complete laziness, and keep a digital record of all logistics and delivery dispatches. Enlist tonight.
          </p>
          <Link
            href="/register"
            className="bg-black text-[#EAE5D9] border-2 border-black font-bold text-xs uppercase px-8 py-3 tracking-widest hover:bg-[#C2410C] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(194,65,12,1)]"
          >
            Enlist For Free Now
          </Link>
        </section>
      )}

      {/* MOCK UPI PAYMENT GATEWAY MODAL (FOR TESTING CHECKOUTS LOCALLY) */}
      {showMockModal && mockPaymentData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#EAE5D9] border-4 border-black max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 text-black">
            <div className="border-b-2 border-black pb-3 flex justify-between items-center">
              <h3 className="font-display text-lg uppercase font-black flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#C2410C]" />
                Razorpay UPI Simulator
              </h3>
              <button
                onClick={async () => {
                  // Revert stock!
                  const size = selectedSizes[mockPaymentData.productId] || 'M';
                  const qty = quantities[mockPaymentData.productId] || 1;
                  await fetch('/api/admin/products', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: mockPaymentData.productId,
                      stock: {
                        [`size${size}`]: 50 // simplistic dummy revert for local cancel
                      }
                    })
                  });
                  setShowMockModal(false);
                }}
                className="text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs leading-relaxed font-semibold bg-white p-4 border border-black flex flex-col gap-2">
              <div>
                <span className="text-gray-500 font-bold uppercase">Beneficiary:</span>
                <p className="font-black text-black">Cockroach India Store (via abdulsalamproductions)</p>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase">Item:</span>
                <p className="font-black text-black">{mockPaymentData.productName}</p>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="font-bold uppercase text-gray-500">Total Amount:</span>
                <span className="font-black text-black text-sm">INR {mockPaymentData.totalAmount}.00</span>
              </div>
              <div className="text-[10px] text-[#C2410C] mt-2">
                ⚠️ Local environment detected. We have bypassed live Razorpay signature validation so you can finalize and test orders easily.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMockModal(false);
                  setNotification({ type: 'warning', message: 'Simulated payment aborted.' });
                  setTimeout(() => setNotification(null), 5000);
                }}
                className="w-1/2 border-2 border-black py-2.5 text-xs font-bold uppercase bg-white hover:bg-gray-100 cursor-pointer"
              >
                Cancel Setup
              </button>
              <button
                onClick={handleConfirmMockPayment}
                disabled={mockPaying}
                className="w-1/2 border-2 border-black bg-[#C2410C] text-white py-2.5 text-xs font-bold uppercase hover:bg-black hover:text-[#EAE5D9] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {mockPaying ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    VERIFYING...
                  </>
                ) : (
                  'CONFIRM MOCK UPI'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
