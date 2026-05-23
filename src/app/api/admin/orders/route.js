import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import OrderItem from '@/models/OrderItem';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'cjp-satirical-jwt-secret-key-2026';

// Helper to authenticate admin
async function verifyAdmin(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email === 'admin@cjp.org' || decoded.email === 'admin@cockroachindia.shop') {
      return decoded;
    }
    // Also check database just to be sure
    const user = await User.findById(decoded.id);
    if (user && (user.email === 'admin@cjp.org' || user.email === 'admin@cockroachindia.shop')) {
      return decoded;
    }
    return false;
  } catch (err) {
    return false;
  }
}

export async function GET(request) {
  await dbConnect();

  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    // Get all orders sorted by date
    const orders = await Order.find({})
      .populate('userId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 })
      .lean();

    // Attach items to each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id }).lean();
        return {
          ...order,
          items
        };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Admin GET Orders Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  await dbConnect();

  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { orderId, status, courierPartner, trackingId, courierUrl } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (status) {
      const allowedStatus = ['Pending', 'Paid', 'Shipped', 'Out For Delivery', 'Delivered'];
      if (!allowedStatus.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      order.status = status;
    }

    if (courierPartner !== undefined) {
      order.courierPartner = courierPartner;
    }

    if (trackingId !== undefined) {
      order.trackingId = trackingId;
    }
    
    if (courierUrl !== undefined) {
      order.courierUrl = courierUrl;
    }

    await order.save();

    // Fetch updated order with populated user and items
    const updatedOrder = await Order.findById(orderId)
      .populate('userId', 'fullName email phoneNumber')
      .lean();
      
    const items = await OrderItem.find({ orderId: updatedOrder._id }).lean();

    return NextResponse.json({
      message: 'Order updated successfully',
      order: {
        ...updatedOrder,
        items
      }
    });
  } catch (error) {
    console.error('Admin PATCH Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
