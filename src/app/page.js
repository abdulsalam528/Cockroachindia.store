// Vercel Cache Buster
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Sparkles, Check, AlertTriangle, X, ShoppingBag, Terminal, Truck, RefreshCw, Ruler, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // Scroll ref for horizontal slider
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Roughly the width of one card + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Catalog State
  const [products, setProducts] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
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
        const res = await fetch(`/api/admin/products?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setFeaturedCategories(data.featuredCategories || []);
          
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
  const handleBuyNow = (product) => {
    const size = selectedSizes[product.id] || 'M';
    const quantity = quantities[product.id] || 1;
    let selectedColor = 'Default';
    if (product.variants && product.variants.length > 0) {
      const matchingVariant = product.variants.find(v => v.size === size && v.stock >= quantity);
      selectedColor = matchingVariant ? matchingVariant.color : (product.variants[0]?.color || 'Default');
    }
    
    sessionStorage.setItem('pendingOrder', JSON.stringify({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      size: size,
      color: selectedColor,
      quantity: quantity,
      price: product.price,
    }));
    
    router.push('/checkout');
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
    <div className="vintage-grain min-h-screen py-6 sm:py-10 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-8 sm:gap-16 w-full overflow-hidden">
      
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

      {/* SECTION 4: Category Filtering (Moved to top with filtered grid) */}
      {featuredCategories.length > 0 && (
        <section className="w-full border-4 border-black bg-[#EAE5D9] py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 relative gap-6">
          <div className="text-center mb-4">
            <h3 className="font-display font-black uppercase text-xl tracking-widest text-[#C2410C]">Shop By Category</h3>
            <p className="text-[10px] uppercase font-bold text-gray-700 mt-1">Select a category · Swipe to explore</p>
          </div>
          
          <div className="flex gap-3 overflow-x-auto w-full px-4 sm:justify-center pb-2 no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex-shrink-0 px-6 py-2 border-2 border-black font-bold uppercase text-xs transition-all duration-300 ease-in-out transform cursor-pointer ${
                selectedCategory === 'All' 
                ? 'bg-[#C2410C] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-105' 
                : 'bg-white text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-[#EAE5D9] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              All
            </button>
            {featuredCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-6 py-2 border-2 border-black font-bold uppercase text-xs transition-all duration-300 ease-in-out transform cursor-pointer ${
                  selectedCategory === cat 
                  ? 'bg-[#C2410C] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-105' 
                  : 'bg-white text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-[#EAE5D9] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Horizontal Scroll Carousel */}
          <div className="relative border-t border-black/10 pt-5 mt-2">
            {/* Scroll hint arrows — desktop only */}
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: -280, behavior: 'smooth' })}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black text-[#EAE5D9] border-2 border-black items-center justify-center hover:bg-[#C2410C] transition-colors shadow-[2px_2px_0px_0px_rgba(194,65,12,1)]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: 280, behavior: 'smooth' })}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black text-[#EAE5D9] border-2 border-black items-center justify-center hover:bg-[#C2410C] transition-colors shadow-[2px_2px_0px_0px_rgba(194,65,12,1)]"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* The scroll row — overflow-x-auto + overflow-y-hidden prevents page-level horizontal stretch */}
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth px-4 pb-3"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {loadingProducts ? (
                [1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="flex-shrink-0 border-4 border-black bg-white flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse"
                    style={{ width: 'clamp(160px, 42vw, 240px)' }}
                  >
                    <div className="aspect-square bg-black/10 border-b-2 border-black w-full" />
                    <div className="p-3 flex flex-col gap-2">
                      <div className="h-3 bg-black/10 w-3/4" />
                      <div className="h-6 bg-black/10 w-full mt-2" />
                    </div>
                  </div>
                ))
              ) : (
                products
                  .filter(p => {
                    if (selectedCategory === 'All') return true;
                    const clean = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                    return clean(p.category) === clean(selectedCategory);
                  })
                  .map(product => (
                    <div
                      key={`top-${product.id}-${selectedCategory}`}
                      className="flex-shrink-0 border-4 border-black bg-white flex flex-col justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all animate-fade-in"
                      style={{ width: 'clamp(160px, 42vw, 240px)' }}
                    >
                      {/* Title */}
                      <Link href={`/product/${product.id}`} className="border-b-2 border-black p-2 bg-white hover:text-[#C2410C] block">
                        <h4 className="font-display text-xs uppercase font-black tracking-wide truncate">
                          {product.name}
                        </h4>
                      </Link>

                      {/* Image */}
                      <Link href={`/product/${product.id}`} className="relative aspect-square w-full overflow-hidden bg-white block">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 18vw"
                        />
                        {/* Price badge */}
                        <div className="absolute top-2 left-2 bg-black text-[#EAE5D9] text-[8px] font-bold px-1.5 py-0.5 border border-black uppercase">
                          ₹{product.price}
                        </div>
                      </Link>

                      {/* Buy button */}
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="w-full text-center border-t-2 border-black py-2 bg-[#C2410C] text-white text-[10px] font-bold uppercase hover:bg-black hover:text-[#EAE5D9] transition-colors cursor-pointer"
                      >
                        Buy Now
                      </button>
                    </div>
                  ))
              )}
            </div>

            {/* Mobile swipe hint */}
            <p className="text-center text-[9px] font-bold uppercase tracking-widest text-gray-500 pb-1 md:hidden">
              ← Swipe to explore →
            </p>
          </div>
        </section>
      )}

      {/* SECTION 1: Vintage Propaganda Hero */}
      <section className="border-4 border-black bg-[#EAE5D9] p-4 sm:p-8 md:p-12 flex flex-col lg:flex-row gap-6 sm:gap-8 items-center w-full">
        <div className="lg:w-2/3 w-full flex flex-col gap-4 sm:gap-6">
          <span className="bg-black text-[#EAE5D9] self-start text-[10px] px-3 py-1 font-bold tracking-widest uppercase">
            DECLARATION OF SLACKING
          </span>
          <h1 className="font-display text-3xl sm:text-6xl lg:text-7xl leading-none uppercase font-black tracking-wide">
            Voice of <br />
            the <span className="text-[#C2410C] underline decoration-4 decoration-black">Lazy</span> & <br />
            Unemployed.
          </h1>
          <p className="text-sm font-semibold max-w-xl text-gray-900 leading-relaxed">
            Graphic tees & mugs for the chronically unbothered. 240 GSM heavy cotton. Delivered across India. Starting from ₹499.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <a
              href="#storefront"
              className="bg-[#C2410C] text-white border-2 border-black font-bold text-xs tracking-wider uppercase px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Shop the Drop
            </a>
            <Link
              href="/about"
              className="bg-black text-[#EAE5D9] border-2 border-black font-bold text-xs tracking-wider uppercase px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Vintage Poster Illustration */}
        <div className="border-4 border-black p-4 bg-black flex flex-col gap-3 text-[#EAE5D9] shadow-2xl lg:w-1/3 w-full max-w-sm lg:max-w-none mx-auto">
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
      <section className="border-4 border-black bg-black text-[#EAE5D9] p-2 sm:p-4 w-full">
        <div className="relative aspect-video w-full border-2 border-[#EAE5D9] overflow-hidden">
          <Image
            src="/banner.webp"
            alt="Promotional Banner"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* SECTION 3: Large Logo Banner */}
      <section className="text-center py-4 sm:py-6 border-y-4 border-black my-2 sm:my-4 w-full">
        <h2 className="font-display text-3xl md:text-5xl lg:text-7xl font-black uppercase text-center tracking-wide leading-none">
          COCKROACH INDIA STORE
        </h2>
        <div className="text-xs font-black uppercase tracking-widest text-[#C2410C] mt-2">
          THE COLLECTION
        </div>
      </section>

      {/* SECTION 5: High-Density 20-Product Grid */}
      <section id="storefront" className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 mb-4 text-[10px] sm:text-xs font-bold uppercase">
          <div className="flex items-center gap-2 bg-[#EAE5D9] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Shield className="w-4 h-4 text-green-700" /> Secured UPI • Razorpay</div>
          <div className="flex items-center gap-2 bg-[#EAE5D9] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Truck className="w-4 h-4 text-[#C2410C]" /> Ships in 3–5 days</div>
          <div className="flex items-center gap-2 bg-[#EAE5D9] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><RefreshCw className="w-4 h-4 text-blue-700" /> Easy returns</div>
          <div className="flex items-center gap-2 bg-[#EAE5D9] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Ruler className="w-4 h-4 text-purple-700" /> Size chart available</div>
        </div>

        <div className="border-b-4 border-black pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h3 className="font-display text-3xl uppercase font-black tracking-wide">
              THE COLLECTION — Pick your armour
            </h3>
            <p className="text-xs text-gray-700 font-bold uppercase mt-1">
              Heavy Cotton Tees & Mugs — Select size & add to cart
            </p>
          </div>
          <div className="bg-black text-[#EAE5D9] px-3 py-1 text-xs font-bold uppercase border border-black flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#C2410C]" />
            Live Database Stock Synchronization
          </div>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="border-4 border-black bg-[#EAE5D9] flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse h-96">
                <div className="aspect-square bg-black/10 border-b-2 border-black w-full"></div>
                <div className="p-4 flex-grow flex flex-col gap-3">
                  <div className="h-4 bg-black/10 w-3/4"></div>
                  <div className="h-3 bg-black/10 w-full mt-2"></div>
                  <div className="h-3 bg-black/10 w-5/6"></div>
                  <div className="h-8 bg-black/10 w-full mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
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
                      {/* Size Selection */}
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

                      {/* Stock safety warning */}
                      {!isOutOfStock && availableStock <= 5 && (
                        <p className="text-[9px] text-[#C2410C] font-bold uppercase text-right leading-none">
                          ⚡ ONLY {availableStock} left in Size {activeSize}!
                        </p>
                      )}

                      {/* Buy Action Button */}
                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={isOutOfStock}
                        className={`w-full text-center border-2 border-black py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          isOutOfStock
                            ? 'bg-gray-400 text-gray-800 border-gray-600 cursor-not-allowed'
                            : 'bg-[#C2410C] text-white hover:bg-black hover:text-[#EAE5D9]'
                        }`}
                      >
                        {isOutOfStock ? 'DEPLETED' : 'BUY NOW / CHECKOUT'}
                      </button>
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
        <section className="border-4 border-[#C2410C] bg-[#EAE5D9] p-4 sm:p-8 text-center flex flex-col gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-[#C2410C] flex items-center justify-center border-2 border-black text-white text-xl animate-bounce">
            🪳
          </div>
          <h3 className="font-display text-2xl uppercase font-black">
            Track your orders & get early drop access
          </h3>
          <p className="text-xs font-semibold max-w-lg leading-relaxed">
            Create an account to manage your delivery details and access members-only limited stock drops.
          </p>
          <Link
            href="/register"
            className="bg-black text-[#EAE5D9] border-2 border-black font-bold text-xs uppercase px-8 py-3 tracking-widest hover:bg-[#C2410C] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(194,65,12,1)]"
          >
            Create free account
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
