import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productName: { type: String, required: true },
  size: { type: String, enum: ['S', 'M', 'L', 'XL', 'XXL'], required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

export default mongoose.models.OrderItem || mongoose.model('OrderItem', OrderItemSchema);
