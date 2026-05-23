import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String },
  totalAmount: { type: Number, required: true }, // Stored in INR (Rupees)
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Shipped', 'Out For Delivery', 'Delivered'], 
    default: 'Pending' 
  },
  shippingAddress: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  courierPartner: { type: String, default: '' }, // e.g., Delhivery, BlueDart, Shiprocket
  trackingId: { type: String, default: '' },
  courierUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
