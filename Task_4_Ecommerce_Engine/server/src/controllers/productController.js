import { Product } from '../models/Product.js';
import { HttpError } from '../utils/httpError.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 80);
}

export const listProducts = async (request, response, next) => {
  try {
    const filter = {};
    if (typeof request.query.category === 'string' && request.query.category.length <= 60) {
      filter.category = request.query.category;
    }
    if (typeof request.query.q === 'string' && request.query.q.trim()) {
      const safeQuery = escapeRegex(request.query.q.trim());
      filter.$or = [
        { name: { $regex: safeQuery, $options: 'i' } },
        { description: { $regex: safeQuery, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 }).lean();
    response.json({ products });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (request, response, next) => {
  try {
    const product = await Product.findOne({ slug: request.params.slug }).lean();
    if (!product) throw new HttpError(404, 'That piece could not be found.');
    response.json({ product });
  } catch (error) {
    next(error);
  }
};