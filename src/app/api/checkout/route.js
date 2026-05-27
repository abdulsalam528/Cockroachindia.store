import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import OrderItem from '@/models/OrderItem';
import { products } from '@/config/products';

const JWT_SECRET = process.env.JWT_SECRET || 'cjp-satirical-jwt-secret-key-2026';

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

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Helper to seed products if database is empty
const legacyProductIds = [
  'cjp-cotton-armour', 'lazy-manifesto-mug', 'chronically-online-cap', 'cockroach-office-jug',
  'voice-unemployed-tee', 'parliamentary-procrastinator-jug', 'resilience-shield-cap',
  'propaganda-tote-bag', 'crawling-success-mascot', 'lazyboy-cushion-cover', 'bribed-by-caffeine-mug',
  'stronger-together-tee', 'filibuster-flask', 'unsquashable-socks', 'lazy-manifesto-notepad',
  'vip-lazy-member-badge', 'bureaucracy-mug', 'survivalist-hoodie', 'sticker-pack',
  'propaganda-wall-poster'
];

async function seedProductsIfNeeded() {
  try {
    await Product.deleteMany({ id: { $in: legacyProductIds } });
  } catch (err) {
    console.error('Failed to cleanup legacy products in checkout API:', err);
  }

  for (const p of products) {
    try {
      await Product.updateOne(
        { id: p.id },
        {
          $setOnInsert: {
            id: p.id,
            name: p.name,
            category: p.category || 'Uncategorized',
            price: p.price,
            description: p.description,
            imageUrl: p.imageUrl,
            images: p.images || [],
            videoUrls: p.videoUrls || [],
            variants: p.variants || [],
            stock: {
              sizeS: p.stock.S || 0,
              sizeM: p.stock.M,
              sizeL: p.stock.L,
              sizeXL: p.stock.XL,
              sizeXXL: p.stock.XXL || 50,
            },
          }
        },
        { upsert: true }
      );
    } catch (err) {
      if (err.code === 11000 || err.message?.includes('11000')) {
        console.log(`[Info] Concurrent seeding for ${p.id} handled.`);
      } else {
        throw err;
      }
    }
  }
}

export async function POST(request) {
  await dbConnect();
  await seedProductsIfNeeded();

  try {
    const { productId, size, quantity, addressId, color, address, guestDetails } = await request.json();

    // Authentication check
    const token = request.cookies.get('token')?.value;
    let decoded = null;
    if (token) {
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return NextResponse.json({ error: 'Invalid or expired session. Please log in again.' }, { status: 401 });
      }
    } else if (!guestDetails) {
      return NextResponse.json({ error: 'Authentication or guest details required to checkout.' }, { status: 401 });
    }

    if (!productId || !size || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid checkout parameters.' }, { status: 400 });
    }

    if (!['S', 'M', 'L', 'XL', 'XXL'].includes(size)) {
      return NextResponse.json({ error: 'Invalid size selected.' }, { status: 400 });
    }

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    // Determine the color to use
    let selectedColor = color;
    if (!selectedColor) {
      const matchingVariant = product.variants.find(v => v.size === size && v.stock >= quantity);
      selectedColor = matchingVariant ? matchingVariant.color : (product.variants[0]?.color || 'Default');
    }

    // Map size S, M, L, XL to sizeS, sizeM, sizeL, sizeXL
    const sizeField = `size${size}`;
    const stockKey = `stock.${sizeField}`;

    // Overselling Mitigation / Atomic Stock Decrements
    let updated = false;
    
    // First try updating variant stock + traditional stock
    if (product.variants && product.variants.length > 0) {
      const result = await Product.updateOne(
        {
          id: productId,
          [stockKey]: { $gte: quantity },
          variants: {
            $elemMatch: { color: selectedColor, size, stock: { $gte: quantity } }
          }
        },
        {
          $inc: {
            [stockKey]: -quantity,
            "variants.$[elem].stock": -quantity
          }
        },
        {
          arrayFilters: [{ "elem.color": selectedColor, "elem.size": size }]
        }
      );
      updated = result.modifiedCount > 0;
    }

    // Fallback if variants query failed or no variants were found
    if (!updated) {
      const fallbackResult = await Product.updateOne(
        { id: productId, [stockKey]: { $gte: quantity } },
        { $inc: { [stockKey]: -quantity } }
      );
      updated = fallbackResult.modifiedCount > 0;
    }

    if (!updated) {
      return NextResponse.json({ error: `Target size ${size} / color ${selectedColor} inventory depleted!` }, { status: 400 });
    }

    let shippingAddress;
    let userInfo = {};

    if (decoded) {
      // Fetch user address
      const user = await User.findById(decoded.id);
      if (!user) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }
      userInfo = { fullName: user.fullName, email: user.email };

      let shippingAddressObj;
      if (addressId) {
        shippingAddressObj = user.addresses.id(addressId);
      }
      if (!shippingAddressObj && user.addresses) {
        shippingAddressObj = user.addresses.find(a => a.isDefault) || user.addresses[0];
      }
      if (!shippingAddressObj && address) {
         shippingAddressObj = address;
      }
      if (!shippingAddressObj) {
        // Revert stock decrement
        await Product.updateOne({ id: productId }, { $inc: { [stockKey]: quantity } });
        return NextResponse.json({ error: 'Please configure a shipping address in your profile.' }, { status: 400 });
      }

      shippingAddress = {
        addressLine1: shippingAddressObj.addressLine1,
        addressLine2: shippingAddressObj.addressLine2 || '',
        city: shippingAddressObj.city,
        state: shippingAddressObj.state,
        postalCode: shippingAddressObj.postalCode,
        country: shippingAddressObj.country || 'India'
      };
    } else {
      userInfo = { fullName: guestDetails.name, email: guestDetails.email };
      shippingAddress = {
        addressLine1: guestDetails.address.addressLine1,
        addressLine2: guestDetails.address.addressLine2 || '',
        city: guestDetails.address.city,
        state: guestDetails.address.state,
        postalCode: guestDetails.address.postalCode,
        country: guestDetails.address.country || 'India'
      };
    }

    const subtotal = product.price * quantity;
    let shippingCost = 0;
    if (subtotal < 899) {
      if (shippingAddress && shippingAddress.postalCode && shippingAddress.postalCode.length === 6) {
        shippingCost = getShippingCharge(shippingAddress.postalCode);
      } else {
        shippingCost = 79; // fallback
      }
    }
    
    const totalAmount = subtotal + shippingCost; // Stored in INR
    const amountInPaise = totalAmount * 100;

    const hasRazorpay = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
    let razorpayOrderId = '';
    let isMock = false;

    if (hasRazorpay && !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.includes('dummy')) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        console.error('Razorpay order creation failed:', err);
        // Revert stock decrement
        await Product.updateOne(
          { id: productId },
          {
            $inc: {
              [stockKey]: quantity,
              "variants.$[elem].stock": quantity
            }
          },
          {
            arrayFilters: [{ "elem.color": selectedColor, "elem.size": size }],
            strict: false
          }
        );
        return NextResponse.json({ error: 'Payment gateway integration error. Try again.' }, { status: 500 });
      }
    } else {
      isMock = true;
      razorpayOrderId = `order_mock_${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // Create Order in DB (status Pending)
    const dbOrder = await Order.create({
      userId: decoded ? decoded.id : null,
      guestDetails: !decoded ? guestDetails : undefined,
      razorpayOrderId,
      totalAmount,
      status: 'Pending',
      shippingAddress
    });

    // Create OrderItem in DB
    await OrderItem.create({
      orderId: dbOrder._id,
      productName: product.name,
      size,
      color: selectedColor,
      price: product.price,
      quantity
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId,
      amount: amountInPaise,
      totalAmount,
      productName: product.name,
      user: userInfo,
      isMock
    });

  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
