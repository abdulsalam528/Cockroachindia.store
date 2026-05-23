import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  images: { type: [String], default: [] },
  videoUrls: { type: [String], default: [] },
  variants: [
    {
      color: { type: String, required: true },
      size: { type: String, enum: ['S', 'M', 'L', 'XL'], required: true },
      stock: { type: Number, default: 0 }
    }
  ],
  stock: {
    sizeS: { type: Number, default: 50 },
    sizeM: { type: Number, default: 100 },
    sizeL: { type: Number, default: 100 },
    sizeXL: { type: Number, default: 50 }
  }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
