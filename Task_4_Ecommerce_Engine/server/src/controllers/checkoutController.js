import Stripe from 'stripe';
import { z } from 'zod';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { HttpError } from '../utils/httpError.js';

const addressSchema = z.object({
  name: z.string().trim().min(2).max(80),
  line1: z.string().trim().min(3).max(120),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(60)
});

function getStripe() {
  if (!env.STRIPE_SECRET_KEY) throw new HttpError(503, 'Payments are not configured yet. Add the Stripe test key to the server environment.');
  return new Stripe(env.STRIPE_SECRET_KEY);
}

async function getCartSnapshot(userId, CartModel = Cart) {
  const cart = await CartModel.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new HttpError(400, 'Your bag is empty.');

  const items = cart.items.filter((item) => item.product).map((item) => ({
    product: item.product,
    quantity: item.quantity,
    unitPriceCents: item.product.priceCents
  }));
  if (items.some((item) => item.quantity > item.product.stock)) throw new HttpError(409, 'One of your pieces no longer has enough stock.');
  const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  return { cart, items, subtotalCents };
}

export function createCheckoutController({ stripeFactory = getStripe, CartModel = Cart, ProductModel = Product, OrderModel = Order, mongooseLibrary = mongoose } = {}) {
  return {
    getConfig: (_request, response) => response.json({ publishableKey: env.STRIPE_PUBLISHABLE_KEY ?? null }),
    createPaymentIntent: async (request, response, next) => {
      try {
        const { subtotalCents } = await getCartSnapshot(request.user._id, CartModel);
        const stripe = stripeFactory();
        const intent = await stripe.paymentIntents.create({
          amount: subtotalCents,
          currency: 'usd',
          automatic_payment_methods: { enabled: true },
          metadata: { userId: request.user.id }
        });
        response.json({ clientSecret: intent.client_secret, amount: subtotalCents });
      } catch (error) {
        next(error);
      }
    },

    confirmOrder: async (request, response, next) => {
      try {
        const parsed = z.object({ paymentIntentId: z.string().min(8), shippingAddress: addressSchema }).safeParse(request.body);
        if (!parsed.success) throw new HttpError(400, 'Please complete every delivery field.');

        const stripe = stripeFactory();
        const intent = await stripe.paymentIntents.retrieve(parsed.data.paymentIntentId);
        if (intent.status !== 'succeeded') throw new HttpError(402, 'The payment was not completed. No order was placed.');
        if (intent.metadata?.userId !== String(request.user._id)) throw new HttpError(403, 'This payment does not belong to your account.');

        const existing = await OrderModel.findOne({ stripePaymentIntentId: intent.id }).populate('items.product');
        if (existing) return response.status(200).json({ order: existing });

        const session = await mongooseLibrary.startSession();
        let order;
        try {
          await session.withTransaction(async () => {
            const { items, subtotalCents } = await getCartSnapshot(request.user._id, CartModel);
            if (intent.amount !== subtotalCents) throw new HttpError(409, 'Your bag changed. Please restart checkout.');

            for (const item of items) {
              const updated = await ProductModel.findOneAndUpdate(
                { _id: item.product._id, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true, session }
              );
              if (!updated) throw new HttpError(409, `${item.product.name} is no longer available in that quantity.`);
            }

            [order] = await OrderModel.create([{
              user: request.user._id,
              items: items.map((item) => ({ product: item.product._id, name: item.product.name, image: item.product.image, unitPriceCents: item.unitPriceCents, quantity: item.quantity })),
              subtotalCents,
              shippingAddress: parsed.data.shippingAddress,
              stripePaymentIntentId: intent.id,
              status: 'paid'
            }], { session });
            await CartModel.updateOne({ user: request.user._id }, { $set: { items: [] } }, { session });
          });
        } finally {
          await session.endSession();
        }

        response.status(201).json({ order });
      } catch (error) {
        next(error);
      }
    },

    listOrders: async (request, response, next) => {
      try {
        const orders = await OrderModel.find({ user: request.user._id }).sort({ createdAt: -1 }).lean();
        response.json({ orders });
      } catch (error) {
        next(error);
      }
    }
  };
}