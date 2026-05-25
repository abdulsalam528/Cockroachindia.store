'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Check, AlertTriangle } from 'lucide-react';

// Shipping calculator — Origin: Deoband 247554, Saharanpur UP
function getShippingCharge(customerPin) {
  const pin = parseInt(customerPin);
  if (!pin || pin < 100000 || pin > 999999) return 79; // fallback

  // Zone A — Saharanpur district (same city/district)
  if (pin >= 247000 && pin <= 247999) return 45;

  // Zone B — Western UP, Delhi NCR, Haryana, Uttarakhand (~500km radius)
  if (pin >= 201000 && pin <= 250999) return 55; // UP belt
  if (pin >= 110000 && pin <= 131999) return 55; // Delhi + Haryana
  if (pin >= 132000 && pin <= 136999) return 55; // Haryana remainder

  // Zone E — HP, Jammu, North East (special zones, charged higher)
  if (pin >= 170000 && pin <= 177999) return 89; // Himachal Pradesh
  if (pin >= 180000 && pin <= 185999) return 89; // Jammu
  if (pin >= 786000 && pin <= 799999) return 89; // Assam + NE states

  // Zone F — Kashmir, Ladakh, Manipur, Andaman (most expensive)
  if (pin >= 190000 && pin <= 195999) return 109; // Kashmir / Ladakh
  if (pin >= 795000 && pin <= 795999) return 109; // Manipur
  if (pin >= 744200 && pin <= 744299) return 109; // Andaman & Nicobar

  // Zone C — Major metros far from Deoband
  // Mumbai/Pune (400xxx), Bangalore (560xxx), Chennai (600xxx),
  // Hyderabad (500xxx), Kolkata (700xxx)
  const prefix3 = Math.floor(pin / 1000);
  const metroZones = [
    400, 401, 402, 403, 404, 410, 411, 412, 560, 561, 562, 563,
    600, 601, 602, 603, 700, 701, 702, 711, 712, 500, 501, 502
  ];
  if (metroZones.includes(prefix3)) return 69;

  // Zone D — Everything else (default Rest of India)
  return 79;
}

export default function CheckoutPage() {
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // View mode: 'select' (choose guest/login), 'guest-form', 'logged-in'
  const [viewMode, setViewMode] = useState('select');
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Guest details form state
  const [guestForm, setGuestForm] = useState({
    name: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });

  // Logged-in address selection
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    // 1. Check for pending order
    const pendingOrderStr = sessionStorage.getItem('pendingOrder');
    if (!pendingOrderStr) {
      router.push('/');
      return;
    }
    const parsedOrder = JSON.parse(pendingOrderStr);
    setOrder(parsedOrder);

    // 2. Check auth
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setViewMode('logged-in');
          
          if (data.user?.addresses?.length > 0) {
            const defAddr = data.user.addresses.find(a => a.isDefault) || data.user.addresses[0];
            setSelectedAddressId(defAddr._id);
          } else {
            setShowAddressForm(true);
          }
        } else {
          setViewMode('select');
        }
      } catch (err) {
        setViewMode('select');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  const handleGuestChange = (e) => {
    setGuestForm({ ...guestForm, [e.target.name]: e.target.value });
  };

  const validateGuestForm = () => {
    const { name, phone, email, addressLine1, city, state, postalCode } = guestForm;
    if (!name || !phone || !email || !addressLine1 || !city || !state || !postalCode) {
      setNotification({ type: 'error', message: 'Please fill in all required fields.' });
      setTimeout(() => setNotification(null), 4000);
      return false;
    }
    if (phone.length < 10) {
      setNotification({ type: 'error', message: 'Please enter a valid 10-digit phone number.' });
      setTimeout(() => setNotification(null), 4000);
      return false;
    }
    if (postalCode.length !== 6) {
      setNotification({ type: 'error', message: 'Please enter a valid 6-digit PIN code.' });
      setTimeout(() => setNotification(null), 4000);
      return false;
    }
    return true;
  };

  const handleProceedToPayment = async () => {
    if (viewMode === 'guest-form' && !validateGuestForm()) return;
    
    if (viewMode === 'logged-in' && !selectedAddressId && !showAddressForm) {
      setNotification({ type: 'error', message: 'Please select a delivery address.' });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    if (viewMode === 'logged-in' && showAddressForm) {
       if (!guestForm.addressLine1 || !guestForm.city || !guestForm.state || !guestForm.postalCode || !guestForm.phone) {
         setNotification({ type: 'error', message: 'Please fill all address fields.' });
         setTimeout(() => setNotification(null), 4000);
         return;
       }
    }

    setCheckoutLoading(true);

    try {
      const payload = {
        productId: order.productId,
        size: order.size,
        color: order.color,
        quantity: order.quantity
      };

      if (viewMode === 'guest-form') {
        payload.guestDetails = {
          name: guestForm.name,
          phone: guestForm.phone,
          email: guestForm.email,
          address: {
            addressLine1: guestForm.addressLine1,
            addressLine2: guestForm.addressLine2,
            city: guestForm.city,
            state: guestForm.state,
            postalCode: guestForm.postalCode,
            country: 'India'
          }
        };
      } else {
        if (showAddressForm) {
          payload.address = {
            addressLine1: guestForm.addressLine1,
            addressLine2: guestForm.addressLine2,
            city: guestForm.city,
            state: guestForm.state,
            postalCode: guestForm.postalCode,
            country: 'India'
          };
          payload.guestDetails = {
             name: user.fullName,
             phone: guestForm.phone,
             email: user.email
          }; // for phone pass
        } else {
          payload.addressId = selectedAddressId;
        }
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment.');
      }

      if (data.isMock) {
        // Fallback for missing Razorpay keys
        setNotification({ type: 'error', message: 'Mock payments are no longer supported directly. Please setup Razorpay.' });
        setCheckoutLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        name: 'Cockroach India Store',
        description: `Order for ${order.productName}`,
        order_id: data.razorpayOrderId,
        modal: {
          ondismiss: async function () {
            setCheckoutLoading(false);
            setNotification({ type: 'warning', message: 'Payment cancelled. Restoring inventory...' });
            
            // Cancel order and restore stock immediately
            await fetch('/api/checkout/cancel', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: data.razorpayOrderId,
                productId: order.productId,
                size: order.size,
                color: order.color,
                quantity: order.quantity
              })
            });
            setTimeout(() => setNotification(null), 3000);
          }
        },
        handler: async function (response) {
          setCheckoutLoading(true);
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
              // Store confirmation data
              sessionStorage.setItem('orderConfirmed', JSON.stringify({
                orderId: data.razorpayOrderId,
                amount: data.totalAmount,
                product: order,
                user: data.user,
                isGuest: viewMode === 'guest-form'
              }));
              
              // Clear pending order
              sessionStorage.removeItem('pendingOrder');
              router.push('/order-confirmed');
            } else {
              throw new Error(verifyData.error || 'Payment verification failed.');
            }
          } catch (verifyErr) {
            setNotification({ type: 'error', message: verifyErr.message });
            setCheckoutLoading(false);
          }
        },
        prefill: {
          name: data.user.fullName,
          email: data.user.email,
          contact: viewMode === 'guest-form' ? guestForm.phone : ''
        },
        theme: {
          color: '#000000',
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setNotification({ type: 'error', message: response.error.description });
        setCheckoutLoading(false);
      });
      rzp.open();

    } catch (err) {
      setNotification({ type: 'error', message: err.message });
      setTimeout(() => setNotification(null), 5000);
      setCheckoutLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="vintage-grain min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const subtotal = order.price * order.quantity;
  
  // Calculate dynamic shipping cost
  let customerPin = '';
  if (viewMode === 'logged-in' && !showAddressForm && selectedAddressId && user) {
    const selAddr = user.addresses.find(a => a._id === selectedAddressId);
    if (selAddr) customerPin = selAddr.postalCode;
  } else {
    customerPin = guestForm.postalCode;
  }
  
  let shipping = 0;
  if (subtotal < 899) {
    if (customerPin && customerPin.length === 6) {
      shipping = getShippingCharge(customerPin);
    } else {
      shipping = 79; // default fallback if incomplete PIN
    }
  }
  
  const total = subtotal + shipping;

  return (
    <div className="vintage-grain min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col gap-6 text-black">
      
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 p-4 border-2 border-black shadow-xl flex items-start gap-3 bg-white w-[90%] max-w-sm">
          {notification.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          ) : (
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
          <p className="text-xs font-bold mt-0.5">{notification.message}</p>
        </div>
      )}

      <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold uppercase hover:underline self-start w-max">
        <ArrowLeft className="w-4 h-4" />
        Back to product
      </button>

      <h1 className="font-display text-3xl font-black uppercase">Secure Checkout</h1>

      {viewMode === 'select' && (
        <div className="border-4 border-black bg-[#EAE5D9] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="font-display text-xl uppercase font-black mb-6">How would you like to proceed?</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setViewMode('guest-form')}
              className="flex-1 text-center border-4 border-black bg-white py-4 px-4 hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <h3 className="font-display text-lg uppercase font-black">Continue as Guest</h3>
              <p className="text-xs font-semibold text-gray-600 mt-1">No account needed. Enter your details and pay.</p>
            </button>
            <Link 
              href="/login?callbackUrl=/checkout"
              className="flex-1 text-center border-4 border-black bg-black text-white py-4 px-4 hover:bg-zinc-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <h3 className="font-display text-lg uppercase font-black text-[#EAE5D9]">Log in to my account</h3>
              <p className="text-xs font-semibold text-gray-300 mt-1">Use saved addresses and track your orders easily.</p>
            </Link>
          </div>
        </div>
      )}

      {viewMode !== 'select' && (
        <>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* LEFT COLUMN: Details */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">
              
              {/* Order Summary Block */}
              <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-bold text-sm uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Order Summary</h2>
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 border-2 border-black bg-gray-100 flex-shrink-0">
                    <Image src={order.productImage} alt={order.productName} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-black uppercase text-sm leading-tight">{order.productName}</h3>
                    <div className="text-xs font-semibold text-gray-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Color: {order.color}</span>
                      <span>Size: {order.size}</span>
                      <span>Qty: {order.quantity}</span>
                    </div>
                    <div className="font-black mt-2">₹{order.price * order.quantity}</div>
                  </div>
                </div>
              </section>

              {/* Delivery Address Block */}
              <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
                  <h2 className="font-bold text-sm uppercase tracking-widest">Delivery Details</h2>
                  {viewMode === 'logged-in' && !showAddressForm && (
                    <button onClick={() => setShowAddressForm(true)} className="text-[10px] font-bold uppercase underline">Change</button>
                  )}
                  {viewMode === 'logged-in' && showAddressForm && user?.addresses?.length > 0 && (
                    <button onClick={() => setShowAddressForm(false)} className="text-[10px] font-bold uppercase underline">Cancel</button>
                  )}
                </div>

                {viewMode === 'logged-in' && !showAddressForm && (
                  <div className="text-xs font-semibold">
                    <p className="font-black uppercase mb-1">{user.fullName}</p>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full border-2 border-gray-300 p-2 font-semibold outline-none cursor-pointer mt-2 text-xs"
                    >
                      {user.addresses.map((addr) => (
                        <option key={addr._id} value={addr._id}>
                          {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(viewMode === 'guest-form' || showAddressForm) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold uppercase">
                    {viewMode === 'guest-form' && (
                      <>
                        <div className="sm:col-span-2">
                          <label className="block mb-1">Full Name *</label>
                          <input type="text" name="name" value={guestForm.name} onChange={handleGuestChange} className="w-full border-2 border-black p-2 bg-gray-50 outline-none" required />
                        </div>
                        <div>
                          <label className="block mb-1">Email *</label>
                          <input type="email" name="email" value={guestForm.email} onChange={handleGuestChange} className="w-full border-2 border-black p-2 bg-gray-50 outline-none" required />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block mb-1">Phone Number *</label>
                      <input type="tel" name="phone" value={guestForm.phone} onChange={handleGuestChange} className="w-full border-2 border-black p-2 bg-gray-50 outline-none" required maxLength="10" />
                    </div>
                    <div className="sm:col-span-2 mt-2">
                      <label className="block mb-1">Address Line 1 *</label>
                      <input type="text" name="addressLine1" value={guestForm.addressLine1} onChange={handleGuestChange} className="w-full border-2 border-black p-2 bg-gray-50 outline-none" placeholder="House/Flat No., Street Name" required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block mb-1">Address Line 2 (Optional)</label>
                      <input type="text" name="addressLine2" value={guestForm.addressLine2} onChange={handleGuestChange} className="w-full border-2 border-black p-2 bg-gray-50 outline-none" placeholder="Apartment, suite, unit, etc." />
                    </div>
                    <div>
                      <label className="block mb-1">City *</label>
                      <input type="text" name="city" value={guestForm.city} onChange={handleGuestChange} className="w-full border-2 border-black p-2 bg-gray-50 outline-none" required />
                    </div>
                    <div>
                      <label className="block mb-1">State *</label>
                      <select name="state" value={guestForm.state} onChange={handleGuestChange} className="w-full border-2 border-black p-2 bg-gray-50 outline-none" required>
                        <option value="">Select State</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">PIN Code *</label>
                      <input type="text" name="postalCode" value={guestForm.postalCode} onChange={handleGuestChange} className="w-full border-2 border-black p-2 bg-gray-50 outline-none" required maxLength="6" />
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* RIGHT COLUMN: Total & Pay */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              <section className="border-4 border-black bg-[#EAE5D9] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sticky top-6">
                <h2 className="font-bold text-sm uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Price Breakdown</h2>
                
                <div className="flex flex-col gap-2 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-green-700 font-bold uppercase">Free</span>
                    ) : (
                      <span>₹{shipping}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between font-black uppercase border-t-2 border-black mt-4 pt-3 text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={checkoutLoading}
                  className="w-full border-4 border-black bg-black text-white py-3.5 text-sm font-bold uppercase tracking-widest mt-6 hover:bg-zinc-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  {checkoutLoading ? 'Processing...' : `Pay ₹${total}`}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[9px] uppercase font-bold text-gray-600 mt-4 text-center leading-tight">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Secured by Razorpay • UPI Accepted
                </div>
              </section>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
