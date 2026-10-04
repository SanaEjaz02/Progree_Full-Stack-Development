import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { env } from './env.js';
import { Product } from '../models/Product.js';
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
    console.warn('MongoDB Atlas is unavailable from this environment; using a local in-memory MongoDB database for development.');
    return { mode: 'memory' };
  }
}

export async function seedCatalogIfEmpty() {
  const count = await Product.countDocuments();
  if (count > 0) return;

  await Product.insertMany(products);
  console.log(`Catalog ready: ${products.length} products.`);
}