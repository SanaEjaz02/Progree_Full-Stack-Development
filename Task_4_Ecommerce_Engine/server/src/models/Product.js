import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  priceCents: { type: Number, required: true, min: 0, validate: Number.isInteger },
  stock: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String, required: true, trim: true },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

productSchema.index({ category: 1, featured: -1 });

export const Product = mongoose.model('Product', productSchema);