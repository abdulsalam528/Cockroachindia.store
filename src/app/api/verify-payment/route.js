import { NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'cjp-satirical-jwt-secret-key-2026';

export async function POST(request) {
  await dbConnect();

  // Auth check
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 });
    }

    // Verify signature if we have the secret key (production or test mode)
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret && razorpaySignature) {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
      }
    }

    // Find the order
    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Ensure this order belongs to the authenticated user
    if (order.userId.toString() !== decoded.id.toString()) {
      return NextResponse.json({ error: 'Unauthorized order access.' }, { status: 403 });
    }

    // Idempotency: skip if already processed
    if (order.status !== 'Pending') {
      return NextResponse.json({ success: true, message: 'Order already processed.' });
    }

    // Mark as Paid
    order.status = 'Paid';
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    // Upgrade customer verification status
    const user = await User.findById(decoded.id);
    if (user) {
      user.isVerifiedMember = true;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed!'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
