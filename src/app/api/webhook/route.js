import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import User from '@/models/User';

export async function POST(request) {
  await dbConnect();
  
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  let orderId = '';
  let paymentId = '';

  // Local testing simulation: if no signature header and in development mode, allow mock payloads
  if (!signature && process.env.NODE_ENV !== 'production') {
    try {
      const mockData = JSON.parse(rawBody);
      if (mockData.mockOrderId && mockData.mockPaymentId) {
        orderId = mockData.mockOrderId;
        paymentId = mockData.mockPaymentId;
        
        const order = await Order.findOne({ razorpayOrderId: orderId });
        if (!order) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        if (order.status !== 'Pending') {
          return NextResponse.json({ success: true, message: 'Simulated payment already processed' });
        }
        
        order.status = 'Paid';
        order.razorpayPaymentId = paymentId;
        await order.save();

        const user = await User.findById(order.userId);
        if (user) {
          user.isVerifiedMember = true;
          await user.save();
        }

        return NextResponse.json({ success: true, message: 'Simulated checkout webhook processed' });
      }
    } catch (e) {
      // Continue to signature checks
    }
  }

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Signature verification credentials missing' }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Signature validation failed' }, { status: 400 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Razorpay webhook triggers on captured payments
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload.payment.entity;
      orderId = paymentEntity.order_id;
      paymentId = paymentEntity.id;

      const order = await Order.findOne({ razorpayOrderId: orderId });
      if (!order) {
        return NextResponse.json({ error: 'Order reference not found' }, { status: 404 });
      }

      // Idempotency check: Ignore duplicate webhook triggers
      if (order.status !== 'Pending') {
        return NextResponse.json({ success: true, message: 'Duplicate transaction skipped' });
      }

      order.status = 'Paid';
      order.razorpayPaymentId = paymentId;
      await order.save();

      // Upgrade customer verification
      const user = await User.findById(order.userId);
      if (user) {
        user.isVerifiedMember = true;
        await user.save();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook Verification Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
