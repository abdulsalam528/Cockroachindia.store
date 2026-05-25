import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import OrderItem from '@/models/OrderItem';
import Product from '@/models/Product';

export async function DELETE(request) {
  await dbConnect();

  try {
    const { razorpayOrderId, productId, size, color, quantity } = await request.json();

    if (!razorpayOrderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    // Find the pending order
    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow cancelling if it's still Pending
    if (order.status !== 'Pending') {
      return NextResponse.json({ error: 'Order is already processed or shipped.' }, { status: 400 });
    }

    // Revert stock
    if (productId && size && quantity && color) {
      const sizeField = `size${size}`;
      const stockKey = `stock.${sizeField}`;

      // Increment both traditional stock and variant stock
      await Product.updateOne(
        { id: productId },
        {
          $inc: {
            [stockKey]: quantity,
            "variants.$[elem].stock": quantity
          }
        },
        {
          arrayFilters: [{ "elem.color": color, "elem.size": size }],
          strict: false
        }
      );
    }

    // Delete the OrderItem
    await OrderItem.deleteMany({ orderId: order._id });

    // Delete the Order
    await Order.findByIdAndDelete(order._id);

    return NextResponse.json({ success: true, message: 'Order cancelled and stock restored.' });
  } catch (error) {
    console.error('Checkout Cancel Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
