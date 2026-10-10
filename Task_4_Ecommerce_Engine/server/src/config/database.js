import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { env } from './env.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { products } from '../data/products.js';

let memoryServer = null;

export async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    return { mode: 'atlas' };
  } catch (error) {
    if (env.NODE_ENV === 'production') {
      throw error;
    }

    if (!memoryServer) {
      memoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    }

    await mongoose.connect(memoryServer.getUri());
    console.warn('WARNING: MongoDB Atlas is unreachable. Using an in-memory database; accounts, orders, and inventory changes will not persist after the API stops.');
    return { mode: 'memory' };
  }
}

export async function seedCatalog() {
  await Product.bulkWrite(products.map((product) => ({
    updateOne: { filter: { slug: product.slug }, update: { $set: product }, upsert: true }
  })));
  await Product.deleteMany({ slug: { $nin: products.map((product) => product.slug) } });
  console.log(`Catalog ready: ${products.length} products.`);
}

export async function seedDemoUser() {
  const email = 'demo@serein.maison';
  const passwordHash = await bcrypt.hash('SereinDemo!2026', 12);
  await User.updateOne({ email }, {
    $setOnInsert: { name: 'Serein Demo', email, passwordHash }
  }, { upsert: true });
  console.log('Demo account ready: demo@serein.maison');
}