import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  unitPriceCents: { type: Number, required: true, min: 0, validate: Number.isInteger },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  subtotalCents: { type: Number, required: true, min: 0, validate: Number.isInteger },
  shippingAddress: {
    name: { type: String, required: true },
    line1: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  stripePaymentIntentId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['paid', 'processing', 'shipped', 'cancelled'], default: 'paid' }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);