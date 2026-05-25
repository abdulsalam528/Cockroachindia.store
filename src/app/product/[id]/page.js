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

  const [notification, setNotification] = useState(null);

  // Custom Image Zoom State
  const [zoomStyle, setZoomStyle] = useState({ transform: 'scale(1)', transformOrigin: 'center center' });

  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024) return; // Only zoom on desktop
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center center' });
  };

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/admin/products?t=${Date.now()}`);
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

  const handleBuyNow = () => {
    if (!selectedSize) {
      setNotification({ type: 'error', message: 'Please select a size before proceeding.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (!selectedColor) {
      setNotification({ type: 'error', message: 'Please select a color before proceeding.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    sessionStorage.setItem('pendingOrder', JSON.stringify({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      price: product.price,
    }));
    
    router.push('/checkout');
  };

  return (
    <div className="vintage-grain min-h-screen py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 border-4 border-black p-4 sm:p-8 bg-[#EAE5D9]">
        {/* Left Side: Product Image */}
        <div className="flex flex-col gap-4 max-w-md lg:max-w-none mx-auto w-full">
          <div 
            className="relative aspect-square w-full border-4 border-black bg-white overflow-hidden cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Image
              src={activeImage || product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-200 ease-out"
              style={zoomStyle}
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
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
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
                  CIS Official Supply
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

            {/* ── AUTH GATE ── */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`w-full text-center border-4 border-black py-3 text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-gray-400 text-gray-800 border-gray-600 cursor-not-allowed shadow-none translate-x-1 translate-y-1'
                  : 'bg-[#C2410C] text-white hover:bg-black hover:text-[#EAE5D9]'
              }`}
            >
              {isOutOfStock
                ? 'COMPLETELY INVENTORY DEPLETED'
                : `BUY NOW — ₹${product.price * quantity}`}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-gray-500 mt-2">
              <ShieldCheck className="w-4 h-4 text-green-700" />
              100% Secure Checkout Powered by abdulsalamproductions Compliance
            </div>

          </div>
        </div>
      </div>

      {/* Comrades Also Procured (Related Products) */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="flex flex-col gap-4 sm:gap-6 border-4 border-black p-4 sm:p-6 bg-[#EAE5D9] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display text-2xl uppercase font-black border-b-2 border-black pb-2 text-black">
            Comrades Also Procured (Recommended Gear)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <Link
                href={`/product/${p.id}`}
                key={p.id}
                className="border-4 border-black bg-white flex flex-col justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group"
              >
                <div className="relative aspect-square w-full border-b-2 border-black overflow-hidden bg-[#EAE5D9]">
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover transition-all duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-black text-[#EAE5D9] text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-2 border border-black tracking-wider uppercase">
                    INR {p.price}
                  </div>
                </div>
                <div className="p-2 sm:p-4 flex flex-col justify-between flex-grow gap-2 text-black">
                  <div>
                    <h4 className="font-display text-[10px] sm:text-xs uppercase font-black group-hover:text-[#C2410C] leading-tight line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-gray-700 font-semibold line-clamp-2 leading-relaxed mt-1 hidden sm:block">
                      {p.description}
                    </p>
                  </div>
                  <div className="border-2 border-black bg-white group-hover:bg-black group-hover:text-[#EAE5D9] text-center py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all mt-2">
                    Buy Now
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
      <section className="flex flex-col gap-4 sm:gap-6">
        <h3 className="font-display text-2xl uppercase font-black border-b-2 border-black pb-2">
          Verified Satirical Member Feedback
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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
              body: 'My parents asked me to run errands. I pointed at the CIS emblem on my cap and explained I was busy protecting national slacker rights. They left me alone. 10/10.'
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


    </div>
  );
}
