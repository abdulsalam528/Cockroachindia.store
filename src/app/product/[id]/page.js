'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Star, ShoppingBag, ShieldCheck, HelpCircle, X, Terminal, Check, AlertTriangle } from 'lucide-react';

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  // Clean up any extraneous query params for cleaner parsing
  const cleanUrl = url.split('?')[0];

  let match = cleanUrl.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  match = url.match(/v=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  match = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  return null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState('Default');
  const [activeImage, setActiveImage] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Mock modal states
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState(null);
  const [mockPaying, setMockPaying] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data = await res.json();
          const found = data.products.find(p => p.id === id);
          setProduct(found || null);
          if (data.products) {
            const filtered = data.products.filter(p => p.id !== id);
            setRelatedProducts(filtered.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
      if (product.variants && product.variants.length > 0) {
        const colors = Array.from(new Set(product.variants.map(v => v.color)));
        setSelectedColor(colors.includes('Black') ? 'Black' : colors[0]);
      } else {
        setSelectedColor('Default');
      }
    }
  }, [product]);

  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defAddr?._id || '');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="vintage-grain min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-black border-t-[#C2410C] rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest">Querying MongoDB Archives...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="vintage-grain min-h-screen py-20 px-4 text-center flex flex-col gap-6 items-center max-w-md mx-auto">
        <h3 className="font-display text-3xl uppercase font-black">PRODUCT DELETED</h3>
        <p className="text-xs font-semibold leading-relaxed">
          The selected propaganda asset has either been seized by authorities or is archived in our lazy filing cabinets.
        </p>
        <Link href="/" className="border-2 border-black bg-black text-[#EAE5D9] px-6 py-2.5 font-bold uppercase text-xs">
          Return To Store
        </Link>
      </div>
    );
  }

  const currentVariant = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize);
  const availableStock = currentVariant ? currentVariant.stock : (product.stock?.[`size${selectedSize}`] ?? 0);
  const isOutOfStock = availableStock <= 0;

  // Storytelling satirical text helper
  const getStoryText = (prodId) => {
    switch (prodId) {
      case 'cjp-cotton-armour':
        return 'Woven in the dark archives of our campaign center, this cotton armour is reinforced to deflect slippers, office complaints, and low-priority emails. Feels like a heavy blanket of secure unemployment.';
      case 'lazy-manifesto-mug':
        return 'Engineered for slow drinking. Its heavy structure is balanced to increase the time it takes you to lift the mug to your mouth, reducing kinetic movement by up to 34%.';
      case 'chronically-online-cap':
        return 'Equipped with anti-real-life shielding. The wide brim is calibrated to block out daylight and family members asking "What are you doing with your life?".';
      default:
        return 'An official satirical procurement item. Designed to provide maximum moral support for a lifestyle of leisure, protest, and caffeine-fuelled resilience.';
    }
  };

  const handleQtyChange = (val) => {
    setQuantity(prev => Math.max(1, prev + val));
  };

  const handleBuyNow = async () => {
    if (!user) {
      setNotification({ type: 'error', message: 'You must log in to procure movement gear.' });
      setTimeout(() => setNotification(null), 5000);
      router.push(`/login?callbackUrl=/product/${id}`);
      return;
    }

    setCheckoutLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          quantity,
          addressId: selectedAddressId || undefined,
          color: selectedColor
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment.');
      }

      if (data.isMock) {
        setMockPaymentData(data);
        setShowMockModal(true);
      } else {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: 'INR',
          name: 'Cockroach India Store',
          description: 'Secure Checkout Powered by abdulsalamproductions',
          order_id: data.razorpayOrderId,
          modal: {
            ondismiss: function () {
              setCheckoutLoading(false); // Only re-enable button when modal closes
              setNotification({ type: 'warning', message: 'Payment cancelled by user. Inventory reserved momentarily.' });
              setTimeout(() => setNotification(null), 5000);
            }
          },
          handler: async function (response) {
            setCheckoutLoading(true); // Keep it loading while verifying
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
                setNotification({ type: 'success', message: 'Payment verified! Order confirmed. Redirecting...' });
              } else {
                setNotification({ type: 'error', message: verifyData.error || 'Payment captured but verification pending.' });
                setCheckoutLoading(false);
              }
            } catch (verifyErr) {
              console.error('Verify payment failed:', verifyErr);
              setNotification({ type: 'success', message: 'Payment captured! Order registered.' });
              setCheckoutLoading(false);
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
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setNotification({ type: 'error', message: response.error.description });
          setCheckoutLoading(false);
        });
        rzp.open();
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
      setTimeout(() => setNotification(null), 5000);
      setCheckoutLoading(false);
    }
  };

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
        setNotification({ type: 'success', message: 'Simulated Payment Successful! Member verified.' });
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
    <div className="vintage-grain min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Alert Notifications */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 p-4 border-4 border-black max-w-md shadow-2xl flex items-start gap-3 bg-[#EAE5D9]">
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

      {/* Back button */}
      <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase hover:text-[#C2410C] self-start border-2 border-black bg-white px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <ArrowLeft className="w-4 h-4" />
        Return to Swag Hub
      </Link>

      {/* Product Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-4 border-black p-6 sm:p-8 bg-[#EAE5D9]">
        {/* Left Side: Product Image */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full border-4 border-black bg-white">
            <Image
              src={activeImage || product.imageUrl}
              alt={product.name}
              fill
              className="object-cover grayscale"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {availableStock <= 5 && availableStock > 0 && (
              <div className="absolute top-4 right-4 bg-[#C2410C] text-white text-xs font-bold px-3 py-1 border-2 border-black uppercase tracking-wider animate-pulse">
                🚨 ONLY {availableStock} LEFT IN SIZE {selectedSize}!
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-white font-display text-2xl uppercase tracking-widest font-black">
                OUT OF STOCK!
              </div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[product.imageUrl, ...product.images].map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImage(imgUrl);
                    if (imgUrl.toLowerCase().includes('black')) {
                      setSelectedColor('Black');
                    } else if (imgUrl.toLowerCase().includes('white')) {
                      setSelectedColor('White');
                    }
                  }}
                  className={`relative w-16 h-16 border-2 border-black bg-white flex-shrink-0 cursor-pointer ${
                    (activeImage || product.imageUrl) === imgUrl ? 'ring-2 ring-[#C2410C]' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Thumbnail ${idx}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Controls */}
        <div className="flex flex-col justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="bg-black text-[#EAE5D9] text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider">
                  CJP Official Supply
                </span>
                <h2 className="font-display text-3xl sm:text-4xl uppercase font-black mt-2 leading-none">
                  {product.name}
                </h2>
              </div>
              <div className="text-xl sm:text-2xl font-black bg-black text-[#EAE5D9] border-2 border-black px-3 py-1">
                ₹{product.price}
              </div>
            </div>

            <p className="text-xs font-semibold leading-relaxed text-gray-800">
              {product.description}
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex gap-2 items-start">
                <span className="text-lg leading-none">✓</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">Free shipping</span>
                  <span className="text-[10px] font-semibold text-gray-500">On orders over ₹800</span>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-lg leading-none">🔒</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">Payment</span>
                  <span className="text-[10px] font-semibold text-gray-500">secure transactions</span>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-lg leading-none">↩️</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">Easy returns</span>
                  <span className="text-[10px] font-semibold text-gray-500">simple return policy</span>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-lg leading-none">⭐</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">Quality guaranteed</span>
                  <span className="text-[10px] font-semibold text-gray-500">Premium materials</span>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-lg leading-none">💬</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">24/7 support</span>
                  <span className="text-[10px] font-semibold text-gray-500">Always here to help</span>
                </div>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-lg leading-none">🌍</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">Pan India shipping</span>
                  <span className="text-[10px] font-semibold text-gray-500">Fast delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive variant configuration */}
          <div className="flex flex-col gap-4 pt-4 border-t border-black/35">
            {/* Color Select */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase text-gray-700">Choose Color:</span>
                <div className="flex gap-2">
                  {Array.from(new Set(product.variants.map(v => v.color))).map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        const allImages = [product.imageUrl, ...product.images];
                        const matchedImg = allImages.find(img => img.toLowerCase().includes(color.toLowerCase()));
                        if (matchedImg) {
                          setActiveImage(matchedImg);
                        }
                      }}
                      className={`px-4 py-1.5 text-xs font-bold border-2 border-black cursor-pointer transition-colors ${
                        selectedColor === color
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Select */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase text-gray-700">Choose Cotton Armor Size:</span>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-1.5 text-xs font-bold border-2 border-black cursor-pointer transition-colors ${
                      selectedSize === size
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Shipping Address Selection */}
            {user && user.addresses && user.addresses.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 text-xs">
                <span className="font-bold text-gray-700 uppercase">Shipping Address:</span>
                <select
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="w-full border-2 border-black bg-white p-2 font-bold outline-none cursor-pointer text-xs"
                >
                  {user.addresses.map((addr) => (
                    <option key={addr._id} value={addr._id}>
                      {addr.isDefault ? '[DEFAULT] ' : ''}{addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {user && (!user.addresses || user.addresses.length === 0) && (
              <div className="text-xs text-[#C2410C] font-bold uppercase pt-2">
                ⚠️ No shipping addresses found! Please <Link href="/dashboard" className="underline font-black">Configure Address Book</Link> before checkout.
              </div>
            )}

            {/* Quantity select — only show for logged-in users */}
            {user && (
              <div className="flex justify-between items-center text-xs pt-2">
                <span className="font-bold text-gray-700 uppercase">Procurement Quantity:</span>
                <div className="flex items-center border-2 border-black bg-white">
                  <button
                    onClick={() => handleQtyChange(-1)}
                    className="px-3 py-1 hover:bg-gray-100 font-bold border-r-2 border-black"
                  >
                    -
                  </button>
                  <span className="px-5 py-1 font-bold text-sm">{quantity}</span>
                  <button
                    onClick={() => handleQtyChange(1)}
                    className="px-3 py-1 hover:bg-gray-100 font-bold border-l-2 border-black"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* ── AUTH GATE ── */}
            {!user ? (
              // Guest: show a prominent Login / Register CTA instead of a button
              <div className="border-4 border-black bg-black text-[#EAE5D9] p-5 flex flex-col gap-4 mt-2 shadow-[4px_4px_0px_0px_rgba(194,65,12,1)]">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <h4 className="font-display text-lg uppercase font-black text-[#C2410C] leading-none">
                      ENLIST TO PROCURE
                    </h4>
                    <p className="text-[11px] font-semibold mt-1 leading-snug text-gray-300">
                      You must be a registered member to purchase official CJP merchandise. It takes under 60 seconds.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(`/product/${id}`)}`}
                    className="flex-1 text-center border-2 border-[#EAE5D9] bg-[#EAE5D9] text-black py-2.5 text-xs font-display font-black uppercase tracking-wider hover:bg-[#C2410C] hover:text-white hover:border-[#C2410C] transition-all shadow-[2px_2px_0px_0px_rgba(194,65,12,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Enlist [Login]
                  </Link>
                  <Link
                    href={`/register?callbackUrl=${encodeURIComponent(`/product/${id}`)}`}
                    className="flex-1 text-center border-2 border-[#C2410C] bg-[#C2410C] text-white py-2.5 text-xs font-display font-black uppercase tracking-wider hover:bg-[#EAE5D9] hover:text-black hover:border-black transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Join Party
                  </Link>
                </div>
                <p className="text-[9px] text-gray-500 font-mono text-center uppercase tracking-wider">
                  Free to join · No credit card for registration
                </p>
              </div>
            ) : (
              // Logged in: show the actual Buy Now button
              <>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || checkoutLoading}
                  className={`w-full text-center border-4 border-black py-3 text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'bg-gray-400 text-gray-800 border-gray-600 cursor-not-allowed shadow-none translate-x-1 translate-y-1'
                      : checkoutLoading
                      ? 'bg-black text-white cursor-wait'
                      : 'bg-[#C2410C] text-white hover:bg-black hover:text-[#EAE5D9]'
                  }`}
                >
                  {isOutOfStock
                    ? 'COMPLETELY INVENTORY DEPLETED'
                    : checkoutLoading
                    ? 'ESTABLISHING HANDSHAKE...'
                    : `BUY NOW — ₹${product.price * quantity}`}
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-gray-500 mt-2">
                  <ShieldCheck className="w-4 h-4 text-green-700" />
                  100% Secure Checkout Powered by abdulsalamproductions Compliance
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* Comrades Also Procured (Related Products) */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="flex flex-col gap-6 border-4 border-black p-6 bg-[#EAE5D9] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display text-2xl uppercase font-black border-b-2 border-black pb-2 text-black">
            Comrades Also Procured (Recommended Gear)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link
                href={`/product/${p.id}`}
                key={p.id}
                className="border-4 border-black bg-white flex flex-col justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group"
              >
                <div className="relative aspect-square w-full border-b-2 border-black overflow-hidden bg-[#EAE5D9]">
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-2 left-2 bg-black text-[#EAE5D9] text-[9px] font-bold px-2 py-0.5 border border-black tracking-wider uppercase">
                    INR {p.price}
                  </div>
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow gap-2 text-black">
                  <div>
                    <h4 className="font-display text-xs uppercase font-black group-hover:text-[#C2410C] leading-tight line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-gray-700 font-semibold line-clamp-2 leading-relaxed mt-1">
                      {p.description}
                    </p>
                  </div>
                  <div className="border-2 border-black bg-white group-hover:bg-black group-hover:text-[#EAE5D9] text-center py-1 text-[10px] font-bold uppercase tracking-wider transition-all mt-2">
                    Inspect Swag
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Comrade Shorts Video Section */}
      {product.videoUrls && product.videoUrls.length > 0 && (
        <section className="flex flex-col gap-6 border-4 border-black p-6 bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display text-2xl uppercase font-black text-[#C2410C] border-b border-gray-800 pb-2">
            Comrade Shorts: Product in Action
          </h3>
          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            {product.videoUrls.map((videoUrl, idx) => {
              const embedUrl = getYouTubeEmbedUrl(videoUrl);
              if (!embedUrl) return null;
              
              return (
                <div key={idx} className="border-4 border-white p-2 bg-zinc-950 w-full max-w-[280px] mx-auto sm:mx-0 flex flex-col gap-2">
                  <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
                    <iframe
                      src={embedUrl}
                      title={`Product Video ${idx + 1}`}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <a 
                    href={videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] text-center text-gray-400 hover:text-white uppercase tracking-widest font-bold block"
                  >
                    Not playing? Watch on YouTube ↗
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Satirical Reviews Feed */}
      <section className="flex flex-col gap-6">
        <h3 className="font-display text-2xl uppercase font-black border-b-2 border-black pb-2">
          Verified Satirical Member Feedback
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 
            ===========================================================
            USER FEEDBACK CONFIGURATION
            To edit, add, or remove feedback, just modify the list below! 
            Make sure to keep the same format { author: '', stars: 5, title: '', body: '' }
            =========================================================== 
          */}
          {[
            {
              author: 'Comrade Rajesh (Unemployed Level 4)',
              stars: 5,
              title: 'Perfect for protests and sleeping',
              body: 'I wore the Cotton Armour for a 12-hour sit-in sleeping protest. Didn\'t get single crease on the fabric. Truly resilient apparel.'
            },
            {
              author: 'Member Swati (Chronically Online)',
              stars: 5,
              title: 'Helps me evade chores',
              body: 'My parents asked me to run errands. I pointed at the CJP emblem on my cap and explained I was busy protecting national slacker rights. They left me alone. 10/10.'
            },
            {
              author: 'Lazy Laxman (Member #19942)',
              stars: 4,
              title: 'Mug requires too much lifting effort',
              body: 'The three-handle bureaucracy mug is a structural masterpiece, but holding it with two hands requires a written request and approvals. Excellent satire, too much physical work.'
            }
          ].map((review, i) => (
            <div key={i} className="border-2 border-black p-4 bg-[#EAE5D9] flex flex-col gap-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">
                  {review.author}
                </span>
                <div className="flex text-yellow-600">
                  {Array.from({ length: review.stars }).map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <h4 className="font-bold text-xs uppercase underline underline-offset-2">
                &ldquo;{review.title}&rdquo;
              </h4>
              <p className="text-[11px] leading-relaxed text-gray-800 italic">
                {review.body}
              </p>
            </div>
          ))}
        </div>
      </section>

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
                  // Revert stock
                  await fetch('/api/admin/products', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: mockPaymentData.productId,
                      stock: {
                        [`size${selectedSize}`]: 50
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
                ⚠️ Bypassing signature verification to allow local checkout testing.
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
