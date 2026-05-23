'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Truck, LayoutGrid, PackagePlus, Save, Check, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('orders'); // orders | inventory

  // Data States
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [logisticsPartners, setLogisticsPartners] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Logistics modification states (mapped by orderId)
  const [orderEdits, setOrderEdits] = useState({});
  const [saveLoading, setSaveLoading] = useState({});

  // Product modification states (mapped by productId)
  const [productEdits, setProductEdits] = useState({});
  const [productSaveLoading, setProductSaveLoading] = useState({});

  // New Product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    imagesRaw: '',
    videoUrlsRaw: '',
    colorsRaw: 'Default',
    stockS: 50,
    stockM: 100,
    stockL: 100,
    stockXL: 50
  });
  const [newProductLoading, setNewProductLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  // Toast / Status notify
  const [statusMessage, setStatusMessage] = useState('');

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings && data.settings.logisticsPartners) {
          setLogisticsPartners(data.settings.logisticsPartners);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        
        // Initialize edit states
        const edits = {};
        data.orders.forEach(o => {
          edits[o._id] = {
            status: o.status,
            courierPartner: o.courierPartner || '',
            trackingId: o.trackingId || ''
          };
        });
        setOrderEdits(edits);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        
        // Initialize edit states
        const edits = {};
        data.products.forEach(p => {
          edits[p.id] = {
            name: p.name,
            description: p.description,
            imageUrl: p.imageUrl,
            price: p.price,
            imagesRaw: p.images ? p.images.join(', ') : '',
            videoUrlsRaw: p.videoUrls ? p.videoUrls.join(', ') : '',
            variants: p.variants || [],
            sizeS: p.stock.sizeS,
            sizeM: p.stock.sizeM,
            sizeL: p.stock.sizeL,
            sizeXL: p.stock.sizeXL
          };
        });
        setProductEdits(edits);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const adminEmails = ['admin@cjp.org', 'admin@cockroachindia.shop', 'admin@cockroach.store', 'admin@cockroachindia.store'];
    if (user && adminEmails.includes(user.email)) {
      const timer = setTimeout(() => {
        fetchOrders();
        fetchProducts();
        fetchSettings();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const adminEmails = ['admin@cjp.org', 'admin@cockroachindia.shop', 'admin@cockroach.store', 'admin@cockroachindia.store'];
  if (!user || !adminEmails.includes(user.email)) {
    return (
      <div className="vintage-grain min-h-[80vh] flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md w-full border-4 border-black p-8 bg-[#EAE5D9] shadow-2xl flex flex-col gap-4">
          <span className="text-4xl text-[#C2410C] self-center">⚠️</span>
          <h3 className="font-display text-2xl uppercase font-black">ACCESS DENIED</h3>
          <p className="text-xs font-semibold leading-relaxed">
            This dashboard is restricted to Admin Command. Unauthorized entry attempts are logged.
          </p>
        </div>
      </div>
    );
  }

  // Update order logistics details
  const handleUpdateLogistics = async (orderId) => {
    const edit = orderEdits[orderId];
    if (!edit) return;

    setSaveLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: edit.status,
          courierPartner: edit.courierPartner,
          trackingId: edit.trackingId,
          courierUrl: edit.courierPartner && logisticsPartners.find(p => p.name === edit.courierPartner)?.trackingUrlTemplate?.replace('{tracking_id}', edit.trackingId) || ''
        })
      });

      if (res.ok) {
        setStatusMessage('Logistics data synchronized successfully.');
        setTimeout(() => setStatusMessage(''), 4000);
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaveLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleOrderEditChange = (orderId, field, value) => {
    setOrderEdits(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value
      }
    }));
  };

  // Update Product stocks/prices
  const handleUpdateProduct = async (productId) => {
    const edit = productEdits[productId];
    if (!edit) return;

    setProductSaveLoading(prev => ({ ...prev, [productId]: true }));
    try {
      const images = edit.imagesRaw ? edit.imagesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
      const videoUrls = edit.videoUrlsRaw ? edit.videoUrlsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          name: edit.name,
          description: edit.description,
          imageUrl: edit.imageUrl,
          price: edit.price,
          images,
          videoUrls,
          variants: edit.variants && edit.variants.length > 0 ? edit.variants : undefined,
          stock: {
            sizeS: edit.sizeS,
            sizeM: edit.sizeM,
            sizeL: edit.sizeL,
            sizeXL: edit.sizeXL
          }
        })
      });

      if (res.ok) {
        setStatusMessage('Product inventory ledger adjusted.');
        setTimeout(() => setStatusMessage(''), 4000);
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update product.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProductSaveLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('WARNING: Are you sure you want to completely erase this product from the ledger? This cannot be undone.')) return;
    setProductSaveLoading(prev => ({ ...prev, [productId]: true }));
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMessage('Product eradicated successfully.');
        setTimeout(() => setStatusMessage(''), 4000);
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProductSaveLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleProductEditChange = (productId, field, value) => {
    setProductEdits(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  // Create new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setNewProductLoading(true);
    setFormMessage('');

    try {
      const images = newProduct.imagesRaw ? newProduct.imagesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
      const videoUrls = newProduct.videoUrlsRaw ? newProduct.videoUrlsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
      const colors = newProduct.colorsRaw ? newProduct.colorsRaw.split(',').map(s => s.trim()).filter(Boolean) : ['Default'];

      const sizes = ['S', 'M', 'L', 'XL'];
      const variants = [];
      colors.forEach(color => {
        sizes.forEach(size => {
          const qty = size === 'S' ? newProduct.stockS : size === 'M' ? newProduct.stockM : size === 'L' ? newProduct.stockL : newProduct.stockXL;
          variants.push({ color, size, stock: qty });
        });
      });

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          description: newProduct.description,
          imageUrl: newProduct.imageUrl || undefined,
          images,
          videoUrls,
          variants,
          stock: {
            sizeS: newProduct.stockS,
            sizeM: newProduct.stockM,
            sizeL: newProduct.stockL,
            sizeXL: newProduct.stockXL
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFormMessage('Success: New satirical merchandise item spawned.');
        setNewProduct({
          name: '',
          price: '',
          description: '',
          imageUrl: '',
          imagesRaw: '',
          videoUrlsRaw: '',
          colorsRaw: 'Default',
          stockS: 50,
          stockM: 100,
          stockL: 100,
          stockXL: 50
        });
        fetchProducts();
      } else {
        throw new Error(data.error || 'Failed to spawn product.');
      }
    } catch (err) {
      setFormMessage(`Error: ${err.message}`);
    } finally {
      setNewProductLoading(false);
    }
  };

  return (
    <div className="vintage-grain min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Branding top block */}
      <section className="border-4 border-black bg-black text-[#EAE5D9] p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl uppercase font-black text-[#C2410C] flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-[#C2410C]" />
            CJP Logistics Ops Dashboard
          </h2>
          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-1">
            Official Administrative Command Center for Swag Logistics
          </p>
        </div>
        
        {/* Navigation tabs */}
        <div className="flex border-2 border-black bg-[#EAE5D9]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold uppercase transition-colors border-r-2 border-black cursor-pointer ${
              activeTab === 'orders' ? 'bg-black text-[#EAE5D9]' : 'bg-[#EAE5D9] text-black hover:bg-gray-200'
            }`}
          >
            Order Dispatches ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'inventory' ? 'bg-black text-[#EAE5D9]' : 'bg-[#EAE5D9] text-black hover:bg-gray-200'
            }`}
          >
            Inventory Monitor
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-black text-[#EAE5D9]' : 'bg-[#EAE5D9] text-black hover:bg-gray-200'
            }`}
          >
            System Settings
          </button>
        </div>
      </section>

      {statusMessage && (
        <div className="bg-green-700 text-[#EAE5D9] border-2 border-black p-3 text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
          <Check className="w-5 h-5 text-white" />
          {statusMessage}
        </div>
      )}

      {/* TAB 1: Order dispatches list */}
      {activeTab === 'orders' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <h3 className="font-display text-xl uppercase font-black flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#C2410C]" />
              Order Execution Control
            </h3>
            <button
              onClick={fetchOrders}
              className="border-2 border-black bg-white p-1.5 hover:bg-gray-100 flex items-center gap-1 text-xs font-bold uppercase cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Sync
            </button>
          </div>

          {loadingOrders ? (
            <div className="text-center py-20 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-black border-t-[#C2410C] rounded-full animate-spin"></div>
              <p className="text-xs font-bold uppercase">Decrypting order ledgers...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="border-4 border-dashed border-black p-12 text-center text-xs font-bold uppercase text-gray-700 bg-white/40">
              No orders registered in the system database.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {orders.map((order) => {
                const edit = orderEdits[order._id] || { status: 'Pending', courierPartner: '', trackingId: '' };

                return (
                  <div key={order._id} className="border-4 border-black bg-[#EAE5D9] p-5 shadow-lg flex flex-col gap-4">
                    
                    {/* Order Meta row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-black/20 pb-3 text-xs font-mono font-semibold">
                      <p><span className="text-gray-500 font-bold uppercase">ID:</span> <code className="bg-white/60 px-1 border">{order._id}</code></p>
                      <p><span className="text-gray-500 font-bold uppercase">Customer:</span> {order.userId?.fullName || 'Deleted user'}</p>
                      <p><span className="text-gray-500 font-bold uppercase">Phone:</span> {order.userId?.phoneNumber || 'N/A'}</p>
                      <p><span className="text-gray-500 font-bold uppercase">Total:</span> <strong>INR {order.totalAmount}.00</strong></p>
                    </div>

                    {/* Shipping Address snapshot */}
                    {order.shippingAddress && (
                      <div className="text-xs bg-white/40 p-2.5 border border-black/10">
                        <span className="font-bold text-gray-500 uppercase">Shipping Address:</span>
                        <p className="font-semibold text-gray-900 mt-0.5">
                          {order.shippingAddress.addressLine1}
                          {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                          , {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                          , {order.shippingAddress.country}
                        </p>
                      </div>
                    )}

                    {/* Order items purchased */}
                    <div className="text-xs">
                      <span className="font-bold text-gray-500 uppercase">Items Purchased:</span>
                      <ul className="list-disc list-inside font-semibold mt-1 space-y-1">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="text-gray-900">
                            {item.productName} ({item.size}) x {item.quantity} - INR {item.price} each
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Logistics parameters edits */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2 border-t border-black/10">
                      
                      {/* Courier select */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-600">Logistics Partner</label>
                        <select
                          value={edit.courierPartner}
                          onChange={(e) => handleOrderEditChange(order._id, 'courierPartner', e.target.value)}
                          className="border border-black bg-white px-2 py-1.5 text-xs font-bold outline-none"
                        >
                          <option value="">Unassigned</option>
                          {logisticsPartners.map((lp, idx) => (
                            <option key={idx} value={lp.name}>{lp.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Tracking ID */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-600">Waybill Tracking ID</label>
                        <input
                          type="text"
                          value={edit.trackingId}
                          onChange={(e) => handleOrderEditChange(order._id, 'trackingId', e.target.value)}
                          placeholder="e.g. DELH-94838202"
                          className="border border-black bg-white px-3 py-1.5 text-xs font-bold outline-none"
                        />
                      </div>

                      {/* Status Dropdown */}
                      <div className="flex gap-2 items-center">
                        <div className="flex flex-col gap-1 flex-grow">
                          <label className="text-[10px] font-bold uppercase text-gray-600">Tracking Status</label>
                          <select
                            value={edit.status}
                            onChange={(e) => handleOrderEditChange(order._id, 'status', e.target.value)}
                            className="border border-black bg-white px-2 py-1.5 text-xs font-bold outline-none"
                          >
                            <option value="Pending">Pending / Unpaid</option>
                            <option value="Paid">Paid / Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out For Delivery">Out For Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>

                        {/* Save logistics button */}
                        <button
                          onClick={() => handleUpdateLogistics(order._id)}
                          disabled={saveLoading[order._id]}
                          className="bg-black text-[#EAE5D9] border border-black p-2 hover:bg-[#C2410C] hover:text-white transition-colors cursor-pointer self-end"
                          title="Save Logistics Details"
                        >
                          {saveLoading[order._id] ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Inventory Adjustments and spawn new item */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Spawn New Product Form */}
          <div className="lg:col-span-1 border-4 border-black p-5 bg-[#EAE5D9] h-fit">
            <h3 className="font-display text-lg uppercase font-black border-b border-black pb-2 flex items-center gap-1.5">
              <PackagePlus className="w-5 h-5 text-[#C2410C]" />
              Add Swag Item
            </h3>

            {formMessage && (
              <div className={`mt-3 p-2.5 text-xs font-bold border-2 leading-snug ${
                formMessage.includes('Success') ? 'border-green-700 bg-green-50 text-green-800' : 'border-[#C2410C] bg-red-50 text-[#C2410C]'
              }`}>
                {formMessage}
              </div>
            )}

            <form onSubmit={handleAddProduct} className="flex flex-col gap-3 mt-4 text-xs font-semibold">
              <div className="flex flex-col gap-1">
                <label className="uppercase text-gray-700">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. CJP Survivalist Mug"
                  className="border border-black bg-white px-2 py-1.5 outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="uppercase text-gray-700">Price (INR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. 599"
                  className="border border-black bg-white px-2 py-1.5 outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="uppercase text-gray-700">Display Hero Image URL</label>
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Leave empty for mock placeholder"
                  className="border border-black bg-white px-2 py-1.5 outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="uppercase text-gray-700">Gallery Image URLs (comma separated)</label>
                <input
                  type="text"
                  value={newProduct.imagesRaw}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, imagesRaw: e.target.value }))}
                  placeholder="e.g. url1, url2"
                  className="border border-black bg-white px-2 py-1.5 outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="uppercase text-gray-700">Video URLs (comma separated)</label>
                <input
                  type="text"
                  value={newProduct.videoUrlsRaw}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, videoUrlsRaw: e.target.value }))}
                  placeholder="e.g. url1, url2"
                  className="border border-black bg-white px-2 py-1.5 outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="uppercase text-gray-700">Color Variants (comma separated)</label>
                <input
                  type="text"
                  value={newProduct.colorsRaw}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, colorsRaw: e.target.value }))}
                  placeholder="e.g. Black, White, Grey"
                  className="border border-black bg-white px-2 py-1.5 outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="uppercase text-gray-700">Descriptive Storytelling Notes</label>
                <textarea
                  required
                  rows="2"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Write a hilarious description..."
                  className="border border-black bg-white px-2 py-1.5 outline-none font-bold resize-y"
                />
              </div>

              {/* Spawn Size quantities */}
              <div className="grid grid-cols-2 gap-2 border-t border-black/20 pt-2">
                <div className="flex flex-col gap-1">
                  <label className="uppercase text-gray-600 text-[10px]">Stock [S]</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stockS}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stockS: Number(e.target.value) }))}
                    className="border border-black bg-white px-2 py-1 outline-none font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="uppercase text-gray-600 text-[10px]">Stock [M]</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stockM}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stockM: Number(e.target.value) }))}
                    className="border border-black bg-white px-2 py-1 outline-none font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="uppercase text-gray-600 text-[10px]">Stock [L]</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stockL}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stockL: Number(e.target.value) }))}
                    className="border border-black bg-white px-2 py-1 outline-none font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="uppercase text-gray-600 text-[10px]">Stock [XL]</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stockXL}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stockXL: Number(e.target.value) }))}
                    className="border border-black bg-white px-2 py-1 outline-none font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={newProductLoading}
                className="bg-[#C2410C] text-white border-2 border-black font-display font-black uppercase text-xs tracking-wider py-2.5 mt-2 hover:bg-black hover:text-[#EAE5D9] transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                {newProductLoading ? 'CREATING LEDGER...' : 'SPAWN PRODUCT ITEM'}
              </button>
            </form>
          </div>

          {/* Current Products stock monitor */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b-2 border-black pb-2">
              <h3 className="font-display text-xl uppercase font-black flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#C2410C]" />
                Inventory Monitor
              </h3>
              <button
                onClick={fetchProducts}
                className="border-2 border-black bg-white p-1.5 hover:bg-gray-100 flex items-center gap-1 text-xs font-bold uppercase cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Sync
              </button>
            </div>

            {loadingProducts ? (
              <div className="text-center py-20 flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-black border-t-[#C2410C] rounded-full animate-spin"></div>
                <p className="text-xs font-bold uppercase">Loading products ledger...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {products.map(product => {
                  const edit = productEdits[product.id] || { price: product.price, sizeS: 0, sizeM: 0, sizeL: 0, sizeXL: 0 };

                  return (
                    <div key={product.id} className="border-2 border-black bg-[#EAE5D9] p-4 flex flex-col gap-4 relative shadow-md text-xs font-semibold">
                      
                      {/* Product identity and name edit */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1 md:col-span-2">
                          <label className="uppercase text-gray-600 text-[10px] font-bold">Product Name</label>
                          <input
                            type="text"
                            value={edit.name}
                            onChange={(e) => handleProductEditChange(product.id, 'name', e.target.value)}
                            className="border border-black bg-white px-2 py-1 font-bold outline-none text-xs"
                          />
                          <span className="text-[9px] font-mono text-gray-500">ID: {product.id}</span>
                        </div>
                        {/* Price adjust */}
                        <div className="flex flex-col gap-1">
                          <label className="uppercase text-gray-600 text-[10px] font-bold">Price (₹)</label>
                          <input
                            type="number"
                            value={edit.price}
                            onChange={(e) => handleProductEditChange(product.id, 'price', Number(e.target.value))}
                            className="border border-black bg-white px-2 py-1 font-bold outline-none text-xs"
                          />
                        </div>
                      </div>

                      {/* Descriptive notes edit */}
                      <div className="flex flex-col gap-1">
                        <label className="uppercase text-gray-600 text-[10px] font-bold">Description Notes</label>
                        <textarea
                          rows="2"
                          value={edit.description}
                          onChange={(e) => handleProductEditChange(product.id, 'description', e.target.value)}
                          className="border border-black bg-white px-2 py-1 font-bold outline-none text-xs resize-y"
                        />
                      </div>

                      {/* URLs edits */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="uppercase text-gray-600 text-[10px] font-bold">Hero Image URL</label>
                          <input
                            type="text"
                            value={edit.imageUrl}
                            onChange={(e) => handleProductEditChange(product.id, 'imageUrl', e.target.value)}
                            className="border border-black bg-white px-2 py-1 font-bold outline-none text-xs truncate"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="uppercase text-gray-600 text-[10px] font-bold">Gallery Images (comma separated)</label>
                          <input
                            type="text"
                            value={edit.imagesRaw}
                            onChange={(e) => handleProductEditChange(product.id, 'imagesRaw', e.target.value)}
                            className="border border-black bg-white px-2 py-1 font-bold outline-none text-xs truncate"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="uppercase text-gray-600 text-[10px] font-bold">Video URLs (comma separated)</label>
                          <input
                            type="text"
                            value={edit.videoUrlsRaw}
                            onChange={(e) => handleProductEditChange(product.id, 'videoUrlsRaw', e.target.value)}
                            className="border border-black bg-white px-2 py-1 font-bold outline-none text-xs truncate"
                          />
                        </div>
                      </div>

                                            {/* Dynamic Variants Editor */}
                      <div className="flex flex-col gap-2 border-t border-black/10 pt-3">
                        <span className="uppercase text-gray-500 font-bold text-[10px]">Product Variants (Colors & Sizes)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {edit.variants && edit.variants.map((v, vIdx) => (
                            <div key={vIdx} className="flex flex-col gap-1 border-2 border-black/20 p-2 bg-white relative">
                              <button 
                                onClick={() => {
                                  const newVariants = [...edit.variants];
                                  newVariants.splice(vIdx, 1);
                                  handleProductEditChange(product.id, 'variants', newVariants);
                                }}
                                className="absolute top-1 right-1 text-red-600 font-bold hover:text-red-800"
                                title="Remove Variant"
                              >×</button>
                              
                              <label className="text-[9px] font-bold uppercase text-gray-500">Color</label>
                              <input 
                                type="text" 
                                value={v.color} 
                                onChange={(e) => {
                                  const newVariants = [...edit.variants];
                                  newVariants[vIdx].color = e.target.value;
                                  handleProductEditChange(product.id, 'variants', newVariants);
                                }}
                                className="border border-black bg-white px-1.5 py-0.5 font-bold outline-none text-xs"
                              />

                              <div className="flex gap-2">
                                <div className="flex flex-col flex-grow">
                                  <label className="text-[9px] font-bold uppercase text-gray-500">Size</label>
                                  <select 
                                    value={v.size}
                                    onChange={(e) => {
                                      const newVariants = [...edit.variants];
                                      newVariants[vIdx].size = e.target.value;
                                      handleProductEditChange(product.id, 'variants', newVariants);
                                    }}
                                    className="border border-black bg-white px-1 py-0.5 font-bold outline-none text-xs"
                                  >
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                  </select>
                                </div>
                                <div className="flex flex-col flex-grow">
                                  <label className="text-[9px] font-bold uppercase text-gray-500">Stock</label>
                                  <input 
                                    type="number" 
                                    min="0"
                                    value={v.stock}
                                    onChange={(e) => {
                                      const newVariants = [...edit.variants];
                                      newVariants[vIdx].stock = Number(e.target.value);
                                      handleProductEditChange(product.id, 'variants', newVariants);
                                    }}
                                    className="border border-black bg-white px-1 py-0.5 font-bold outline-none text-xs w-full"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const newVariants = [...(edit.variants || [])];
                            newVariants.push({ color: 'Default', size: 'M', stock: 0 });
                            handleProductEditChange(product.id, 'variants', newVariants);
                          }}
                          className="self-start text-[10px] bg-black text-white px-2 py-1 uppercase font-bold hover:bg-gray-800"
                        >
                          + Add Variant
                        </button>
                      </div>

                      {/* Fallback Legacy Stock Inputs (only if variants array is empty) */}
                      {(!edit.variants || edit.variants.length === 0) && (
                        <div className="flex flex-col gap-1.5 border-t border-black/10 pt-2 mt-2">
                          <span className="uppercase text-gray-500 font-bold text-[10px]">Legacy Bulk Stock:</span>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-[10px]">S</span>
                              <input type="number" min="0" value={edit.sizeS} onChange={(e) => handleProductEditChange(product.id, 'sizeS', Number(e.target.value))} className="border border-black px-1 text-xs" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-[10px]">M</span>
                              <input type="number" min="0" value={edit.sizeM} onChange={(e) => handleProductEditChange(product.id, 'sizeM', Number(e.target.value))} className="border border-black px-1 text-xs" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-[10px]">L</span>
                              <input type="number" min="0" value={edit.sizeL} onChange={(e) => handleProductEditChange(product.id, 'sizeL', Number(e.target.value))} className="border border-black px-1 text-xs" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-[10px]">XL</span>
                              <input type="number" min="0" value={edit.sizeXL} onChange={(e) => handleProductEditChange(product.id, 'sizeXL', Number(e.target.value))} className="border border-black px-1 text-xs" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Save update button */}
                                            <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateProduct(product.id)}
                          disabled={productSaveLoading[product.id]}
                          className="bg-black text-[#EAE5D9] border-2 border-black p-2 flex items-center justify-center gap-2 hover:bg-[#C2410C] hover:text-white transition-colors cursor-pointer w-full text-xs font-bold uppercase tracking-wider mt-2"
                        >
                          {productSaveLoading[product.id] ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <><Save className="w-4 h-4" /> Save Ledger Adjustment</>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={productSaveLoading[product.id]}
                          className="bg-red-600 text-white border-2 border-black px-4 flex items-center justify-center hover:bg-red-800 transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider mt-2"
                          title="Delete Product"
                        >
                          Delete
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}


      {/* TAB 3: System Settings */}
      {activeTab === 'settings' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <h3 className="font-display text-xl uppercase font-black flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C2410C]" />
              Global Settings Configuration
            </h3>
            <button
              onClick={fetchSettings}
              className="border-2 border-black bg-white p-1.5 hover:bg-gray-100 flex items-center gap-1 text-xs font-bold uppercase cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Sync
            </button>
          </div>
          
          <div className="border-4 border-black p-6 bg-[#EAE5D9] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-display font-black uppercase text-lg mb-2">Logistics Partners Configuration</h4>
            <p className="text-xs font-bold text-gray-600 mb-6">Add courier partners and their tracking URL formats. Use <code>{'{tracking_id}'}</code> where the tracking number should go.</p>
            
            <div className="flex flex-col gap-4">
              {logisticsPartners.map((partner, idx) => (
                <div key={idx} className="flex gap-4 items-end border border-black/20 p-3 bg-white">
                  <div className="flex flex-col gap-1 flex-grow">
                    <label className="text-[10px] font-bold uppercase text-gray-600">Partner Name</label>
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) => {
                        const newPartners = [...logisticsPartners];
                        newPartners[idx].name = e.target.value;
                        setLogisticsPartners(newPartners);
                      }}
                      className="border border-black bg-white px-2 py-1 font-bold outline-none text-xs"
                      placeholder="e.g. Delhivery"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-grow-[2]">
                    <label className="text-[10px] font-bold uppercase text-gray-600">Tracking URL Template</label>
                    <input
                      type="text"
                      value={partner.trackingUrlTemplate}
                      onChange={(e) => {
                        const newPartners = [...logisticsPartners];
                        newPartners[idx].trackingUrlTemplate = e.target.value;
                        setLogisticsPartners(newPartners);
                      }}
                      className="border border-black bg-white px-2 py-1 font-bold outline-none text-xs"
                      placeholder="e.g. https://www.delhivery.com/track/package/{tracking_id}"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newPartners = logisticsPartners.filter((_, i) => i !== idx);
                      setLogisticsPartners(newPartners);
                    }}
                    className="bg-red-600 text-white border border-black px-3 py-1 font-bold text-xs uppercase hover:bg-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => setLogisticsPartners([...logisticsPartners, { name: '', trackingUrlTemplate: '' }])}
                className="self-start bg-black text-white px-4 py-2 text-xs font-bold uppercase mt-2 hover:bg-gray-800 border-2 border-transparent"
              >
                + Add Logistics Partner
              </button>
              
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/settings', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ logisticsPartners })
                    });
                    if (res.ok) {
                      setStatusMessage('Settings updated successfully.');
                      setTimeout(() => setStatusMessage(''), 4000);
                    }
                  } catch (e) {
                    alert('Error saving settings');
                  }
                }}
                className="w-full bg-[#C2410C] text-white border-2 border-black font-display font-black uppercase text-xs py-3 mt-4 hover:bg-black transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
