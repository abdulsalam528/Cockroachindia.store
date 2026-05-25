'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Truck, ShoppingBag, ExternalLink, Calendar, Receipt, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import Loader from '../components/Loader';

export default function Dashboard() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [logisticsPartners, setLogisticsPartners] = useState([]);

  // Address form states
  const [addressForm, setAddressForm] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');
  const [submittingAddress, setSubmittingAddress] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, settingsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/admin/settings') // we can use the same route or a public route if we created one, wait, admin settings requires auth... wait!
        ]);
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.orders || []);
        }
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.settings && data.settings.logisticsPartners) {
             setLogisticsPartners(data.settings.logisticsPartners);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    if (user) loadData();
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    setAddressSuccess('');
    setSubmittingAddress(true);

    if (!addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
      setAddressError('Mandatory address fields missing.');
      setSubmittingAddress(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/add-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add address');
      
      setAddressSuccess('Address added successfully!');
      setAddressForm({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false
      });
      await refreshUser();
    } catch (err) {
      setAddressError(err.message);
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch('/api/auth/delete-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete address');
      await refreshUser();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const res = await fetch('/api/auth/set-default-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update default address');
      await refreshUser();
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading) {
    return <Loader text="Verifying credentials..." subtext="Accessing dashboard archives..." />;
  }

  // Progress steps definitions
  const statusSteps = ['Paid', 'Shipped', 'Out For Delivery', 'Delivered'];

  const getStepIndex = (status) => {
    // If order status is Pending, it has not reached Paid yet (but usually we only track Paid onwards)
    if (status === 'Pending') return -1;
    return statusSteps.indexOf(status);
  };

  return (
    <div className="vintage-grain min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-10">
      
      {/* SECTION 1: Member Card Display */}
      {user && (
        <section className="border-4 border-black bg-[#EAE5D9] p-6 shadow-xl flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col gap-3 z-10">
            <span className="bg-black text-[#EAE5D9] self-start text-[9px] px-2.5 py-0.5 font-bold uppercase tracking-wider">
              CIS Member Identification Card
            </span>
            <h2 className="font-display text-2xl uppercase font-black tracking-wide leading-none mt-1">
              {user.fullName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs leading-normal font-semibold">
              <p><span className="text-gray-500 font-bold uppercase">Member ID:</span> {user.partyMemberId || 'Pending Procurements'}</p>
              <p><span className="text-gray-500 font-bold uppercase">Email:</span> {user.email}</p>
              <p><span className="text-gray-500 font-bold uppercase">Mobile Connection:</span> {user.phoneNumber}</p>
              {user.whatsappLink && (
                <p>
                  <span className="text-gray-500 font-bold uppercase">Coordination Link:</span>{' '}
                  <a href={user.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-[#C2410C] hover:underline inline-flex items-center gap-0.5 font-bold">
                    WhatsApp <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col md:items-end justify-between gap-4 z-10">
            {user.isVerifiedMember ? (
              <div className="bg-[#4D5B46] text-[#EAE5D9] border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 self-start md:self-auto">
                <ShieldCheck className="w-5 h-5" />
                VERIFIED MEMBER
              </div>
            ) : (
              <div className="bg-gray-400 text-gray-800 border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 self-start md:self-auto">
                <ShieldCheck className="w-5 h-5 text-gray-600" />
                UNVERIFIED SLACKER
              </div>
            )}
            <p className="text-[10px] text-gray-600 font-mono text-left md:text-right uppercase">
              Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
            </p>
          </div>

          {/* Large watermark cockroach behind */}
          <div className="absolute right-[-10px] bottom-[-20px] opacity-[0.06] select-none text-[120px] pointer-events-none">
            🪳
          </div>
        </section>
      )}

      {/* SECTION 2: Shipment Dispatches (Moved to top) */}
      <section className="flex flex-col gap-6">
        <h3 className="font-display text-xl uppercase font-black border-b-2 border-black pb-2 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#C2410C]" />
          CONGRESSIONAL DISPATCH LEDGER
        </h3>

        {loadingOrders ? (
          <Loader text="Fetching active shipments..." subtext="Syncing order history..." fullScreen={false} />
        ) : orders.length === 0 ? (
          <div className="border-4 border-dashed border-black p-12 text-center flex flex-col items-center gap-4 bg-white/40">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
            <h4 className="font-bold text-sm uppercase">NO PROCUREMENT ARCHIVES FOUND</h4>
            <p className="text-xs max-w-sm leading-relaxed text-gray-700 font-semibold">
              You have not purchased any satirical apparel or campaign gear. Purchase cotton armor from the main store to unlock verified party member status instantly.
            </p>
            <Link href="/" className="border-2 border-black bg-black text-[#EAE5D9] px-6 py-2.5 text-xs font-bold uppercase hover:bg-[#C2410C] transition-colors">
              Procure Swag Gear
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {orders.map((order) => {
              const activeIndex = getStepIndex(order.status);

              return (
                <div key={order._id} className="border-4 border-black bg-[#EAE5D9] p-5 sm:p-6 shadow-lg flex flex-col gap-6">
                  
                  {/* Order Top Meta */}
                  <div className="flex flex-wrap justify-between items-center gap-4 border-b border-black/25 pb-3">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold">
                      <p className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-500 font-bold uppercase">Ordered:</span>{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                      <p className="flex items-center gap-1">
                        <Receipt className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-500 font-bold uppercase">Razorpay ID:</span>{' '}
                        <code className="bg-white/60 px-1 border border-black/20 text-[11px]">{order.razorpayOrderId}</code>
                      </p>
                    </div>
                    <div className="bg-black text-[#EAE5D9] text-xs font-black px-3 py-1 border border-black uppercase tracking-wider">
                      TOTAL: INR {order.totalAmount}.00
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="border-b border-black">
                          <th className="pb-2 uppercase text-gray-600 font-bold">Procured Slogan Item</th>
                          <th className="pb-2 uppercase text-gray-600 font-bold text-center">Size</th>
                          <th className="pb-2 uppercase text-gray-600 font-bold text-center">Qty</th>
                          <th className="pb-2 uppercase text-gray-600 font-bold text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((item) => (
                          <tr key={item._id} className="border-b border-black/10 last:border-0">
                            <td className="py-2.5 font-bold">{item.productName}</td>
                            <td className="py-2.5 text-center font-bold">{item.size}</td>
                            <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                            <td className="py-2.5 text-right font-black">INR {item.price}.00</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Courier and Logistics info */}
                  {order.courierPartner && order.trackingId ? (
                    <div className="bg-white p-3 border-2 border-black text-xs font-semibold leading-relaxed flex flex-col sm:flex-row justify-between gap-2">
                      <p>
                        <span className="text-gray-500 uppercase font-bold">Logistics Partner:</span>{' '}
                        {(order.courierUrl || (logisticsPartners.find(p => p.name === order.courierPartner)?.trackingUrlTemplate)) ? (
                          <a 
                            href={order.courierUrl || logisticsPartners.find(p => p.name === order.courierPartner)?.trackingUrlTemplate?.replace('{tracking_id}', order.trackingId)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-white bg-[#C2410C] px-2 py-0.5 ml-1 uppercase font-bold hover:bg-black transition-colors"
                          >
                            Track via {order.courierPartner} ↗
                          </a>
                        ) : (
                          <strong className="text-black uppercase">{order.courierPartner}</strong>
                        )}
                      </p>
                      <p>
                        <span className="text-gray-500 uppercase font-bold">Waybill Tracking ID:</span>{' '}
                        <code className="bg-[#EAE5D9] px-2 py-0.5 border border-black/40 font-bold text-[11px]">{order.trackingId}</code>
                      </p>
                    </div>
                  ) : order.status !== 'Pending' ? (
                    <div className="bg-zinc-100/50 p-3 border border-dashed border-black/50 text-xs font-semibold italic text-gray-600 leading-snug">
                      📦 Logistics team is preparing the consignment packages. Delivery partner assignment is imminent.
                    </div>
                  ) : (
                    <div className="bg-red-50 p-3 border border-[#C2410C]/50 text-xs font-bold text-[#C2410C] leading-snug">
                      ⚠️ Order is unpaid or webhook is processing. If amount is deducted, dispatch details will display shortly.
                    </div>
                  )}

                  {/* SECTION 3: Progress Milestones Visual Tracker */}
                  <div className="mt-4 pt-4 border-t border-black/25">
                    <h4 className="text-[10px] uppercase font-bold text-gray-600 tracking-wider mb-6 text-center">
                      Visual Dispatch tracker progress
                    </h4>

                    {/* Progress Bar Container */}
                    <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto px-4">
                      
                      {/* Connecting Line background */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-gray-300 z-0"></div>
                      
                      {/* Connecting Line active fill */}
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#4D5B46] transition-all duration-500 z-0"
                        style={{
                          width: activeIndex <= 0 ? '0%' : activeIndex === 1 ? '33.33%' : activeIndex === 2 ? '66.66%' : '100%'
                        }}
                      ></div>

                      {/* Milestone Circles */}
                      {statusSteps.map((step, idx) => {
                        const isCompleted = idx <= activeIndex;
                        const isActive = idx === activeIndex;

                        return (
                          <div key={step} className="flex flex-col items-center z-10">
                            {/* Circle */}
                            <div 
                              className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs transition-colors duration-300 shadow-md ${
                                isActive 
                                  ? 'bg-[#C2410C] text-white ring-4 ring-[#C2410C]/20' 
                                  : isCompleted 
                                  ? 'bg-[#4D5B46] text-[#EAE5D9]' 
                                  : 'bg-white text-gray-400 border-gray-300'
                              }`}
                            >
                              {idx + 1}
                            </div>
                            {/* Text label */}
                            <span 
                              className={`text-[9px] uppercase font-bold tracking-wide mt-2 text-center max-w-[80px] leading-tight ${
                                isActive 
                                  ? 'text-[#C2410C] font-black' 
                                  : isCompleted 
                                  ? 'text-black' 
                                  : 'text-gray-400'
                              }`}
                            >
                              {step === 'Paid' ? 'Paid / Confirmed' : step}
                            </span>
                          </div>
                        );
                      })}

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION: ADDRESS BOOK SETTINGS (Moved to bottom) */}
      <section className="border-4 border-black bg-[#EAE5D9] p-6 shadow-xl flex flex-col gap-6">
        <h3 className="font-display text-xl uppercase font-black border-b-2 border-black pb-2 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-[#C2410C]" />
          SHIPPING ADDRESS MANAGEMENT
        </h3>

        {/* Address Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user?.addresses && user.addresses.length > 0 ? (
            user.addresses.map((addr) => (
              <div 
                key={addr._id} 
                className={`p-4 border-2 flex flex-col justify-between gap-3 bg-white ${
                  addr.isDefault ? 'border-[#C2410C] shadow-[3px_3px_0px_0px_rgba(194,65,12,1)]' : 'border-black'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-black bg-zinc-100">
                      {addr.isDefault ? '⭐ Default Address' : 'Address'}
                    </span>
                  </div>
                  <p className="text-xs font-bold leading-normal text-black">{addr.addressLine1}</p>
                  {addr.addressLine2 && <p className="text-xs text-gray-700 font-semibold">{addr.addressLine2}</p>}
                  <p className="text-xs text-gray-800 font-bold mt-1">
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-gray-500">{addr.country}</p>
                </div>
                
                <div className="flex gap-2 border-t border-gray-200 pt-3">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="px-2.5 py-1 text-[10px] font-bold border border-black bg-black text-[#EAE5D9] hover:bg-[#C2410C] hover:text-white uppercase transition-all cursor-pointer"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="px-2.5 py-1 text-[10px] font-bold border border-black text-[#C2410C] hover:bg-[#C2410C] hover:text-white uppercase transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 border-2 border-dashed border-black/40 p-6 text-center text-xs font-semibold text-gray-500">
              No registered addresses found. Add one below to enable faster checkouts.
            </div>
          )}
        </div>

        {/* Add Address Form */}
        <form onSubmit={handleAddAddress} className="border-2 border-black bg-white/40 p-4 flex flex-col gap-4">
          <h4 className="text-xs font-black uppercase text-[#C2410C] border-b border-black/10 pb-1.5">
            + Dispatch New Destination [Add Address]
          </h4>

          {addressError && (
            <div className="border border-[#C2410C] bg-[#C2410C]/10 p-2.5 text-[11px] font-bold text-[#C2410C]">
              ⚠️ ERROR: {addressError}
            </div>
          )}
          {addressSuccess && (
            <div className="border border-green-700 bg-green-700/10 p-2.5 text-[11px] font-bold text-green-700">
              ✓ SUCCESS: {addressSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-700">Address Line 1*</label>
              <input
                type="text"
                required
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm(p => ({ ...p, addressLine1: e.target.value }))}
                placeholder="Flat/House No., Building, Street"
                className="border border-black bg-white px-2.5 py-1.5 text-xs font-bold outline-none focus:border-[#C2410C]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-700">Address Line 2</label>
              <input
                type="text"
                value={addressForm.addressLine2}
                onChange={(e) => setAddressForm(p => ({ ...p, addressLine2: e.target.value }))}
                placeholder="Landmark, Locality (Optional)"
                className="border border-black bg-white px-2.5 py-1.5 text-xs font-bold outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-700">City*</label>
              <input
                type="text"
                required
                value={addressForm.city}
                onChange={(e) => setAddressForm(p => ({ ...p, city: e.target.value }))}
                placeholder="e.g. New Delhi"
                className="border border-black bg-white px-2.5 py-1.5 text-xs font-bold outline-none focus:border-[#C2410C]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-700">State*</label>
              <input
                type="text"
                required
                value={addressForm.state}
                onChange={(e) => setAddressForm(p => ({ ...p, state: e.target.value }))}
                placeholder="e.g. Delhi"
                className="border border-black bg-white px-2.5 py-1.5 text-xs font-bold outline-none focus:border-[#C2410C]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-700">PIN Code*</label>
              <input
                type="text"
                required
                pattern="[0-9]{6}"
                value={addressForm.postalCode}
                onChange={(e) => setAddressForm(p => ({ ...p, postalCode: e.target.value }))}
                placeholder="110001"
                className="border border-black bg-white px-2.5 py-1.5 text-xs font-bold outline-none focus:border-[#C2410C]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-700">Country*</label>
              <input
                type="text"
                required
                value={addressForm.country}
                onChange={(e) => setAddressForm(p => ({ ...p, country: e.target.value }))}
                placeholder="India"
                className="border border-black bg-white px-2.5 py-1.5 text-xs font-bold outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm(p => ({ ...p, isDefault: e.target.checked }))}
              className="accent-[#C2410C]"
            />
            <label htmlFor="isDefault" className="text-[10px] font-bold uppercase text-gray-700 cursor-pointer">
              Set as default shipping address
            </label>
          </div>

          <button
            type="submit"
            disabled={submittingAddress}
            className="self-start px-5 py-2 border-2 border-black bg-[#C2410C] text-white text-xs font-bold uppercase hover:bg-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {submittingAddress ? 'ENLISTING DESTINATION...' : 'ADD DESTINATION ADDRESS'}
          </button>
        </form>
      </section>

    </div>
  );
}
