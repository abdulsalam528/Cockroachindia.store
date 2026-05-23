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

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Helper to seed products if database is empty
async function seedProductsIfNeeded() {
  const count = await Product.countDocuments();
  if (count === 0) {
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      imageUrl: p.imageUrl,
      images: p.images || [],
      videoUrls: p.videoUrls || [],
      variants: p.variants || [],
      stock: {
        sizeS: p.stock.S,
        sizeM: p.stock.M,
        sizeL: p.stock.L,
        sizeXL: p.stock.XL,
      },
    }));
    await Product.insertMany(formatted);
  }
}

export async function POST(request) {
  await dbConnect();
  await seedProductsIfNeeded();

  // Authentication check
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'You must be logged in to checkout.' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired session. Please log in again.' }, { status: 401 });
  }

  try {
    const { productId, size, quantity, addressId, color } = await request.json();

    if (!productId || !size || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid checkout parameters.' }, { status: 400 });
    }

    if (!['S', 'M', 'L', 'XL'].includes(size)) {
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

    // Fetch user address
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    let shippingAddressObj;
    if (addressId) {
      shippingAddressObj = user.addresses.id(addressId);
    }
    if (!shippingAddressObj) {
      shippingAddressObj = user.addresses.find(a => a.isDefault) || user.addresses[0];
    }
    if (!shippingAddressObj) {
      // Revert stock decrement
      await Product.updateOne({ id: productId }, { $inc: { [stockKey]: quantity } });
      return NextResponse.json({ error: 'Please configure a shipping address in your profile.' }, { status: 400 });
    }

    const shippingAddress = {
      addressLine1: shippingAddressObj.addressLine1,
      addressLine2: shippingAddressObj.addressLine2 || '',
      city: shippingAddressObj.city,
      state: shippingAddressObj.state,
      postalCode: shippingAddressObj.postalCode,
      country: shippingAddressObj.country || 'India'
    };

    const totalAmount = product.price * quantity; // Stored in INR
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
      userId: decoded.id,
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
      user: {
        fullName: decoded.fullName,
        email: decoded.email
      },
      isMock
    });

  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
