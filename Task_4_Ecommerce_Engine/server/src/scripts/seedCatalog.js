import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { Product } from '../models/Product.js';
import { products } from '../data/products.js';

try {
  await connectDatabase();
  await Product.bulkWrite(products.map((product) => ({
    updateOne: {
      filter: { slug: product.slug },
      update: { $set: product },
      upsert: true
    }
  })));
  await Product.deleteMany({ slug: { $nin: products.map((product) => product.slug) } });
  console.log(`Catalog ready: ${products.length} products.`);
} catch (error) {
  console.error('Unable to seed catalog:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}