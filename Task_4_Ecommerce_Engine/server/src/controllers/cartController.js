import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { HttpError } from '../utils/httpError.js';

const quantityFrom = (value) => Number.isInteger(value) && value >= 1 && value <= 20;

async function loadCart(userId) {
  return Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('items.product');
}

export function presentCart(cart) {
  const items = cart.items
    .filter((item) => item.product)
    .map((item) => ({ product: item.product, quantity: item.quantity }));
  const subtotalCents = items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
  return { items, subtotalCents, itemCount: items.reduce((sum, item) => sum + item.quantity, 0) };
}

export const getCart = async (request, response, next) => {
  try {
    response.json({ cart: presentCart(await loadCart(request.user._id)) });
  } catch (error) {
    next(error);
  }
};

export const addCartItem = async (request, response, next) => {
  try {
    const quantity = request.body.quantity ?? 1;
    if (!quantityFrom(quantity)) throw new HttpError(400, 'Choose a quantity between 1 and 20.');

    const product = await Product.findById(request.params.productId);
    if (!product) throw new HttpError(404, 'That piece could not be found.');
    const cart = await loadCart(request.user._id);
    const item = cart.items.find((entry) => entry.product?._id.equals(product._id));
    const nextQuantity = (item?.quantity ?? 0) + quantity;
    if (product.stock < nextQuantity) throw new HttpError(409, 'There is not enough stock for that quantity.');

    if (item) item.quantity = nextQuantity;
    else cart.items.push({ product: product._id, quantity });
    await cart.save();
    await cart.populate('items.product');
    response.status(200).json({ cart: presentCart(cart) });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (request, response, next) => {
  try {
    const { quantity } = request.body;
    if (!quantityFrom(quantity)) throw new HttpError(400, 'Choose a quantity between 1 and 20.');

    const cart = await loadCart(request.user._id);
    const item = cart.items.find((entry) => entry.product?._id.equals(request.params.productId));
    if (!item) throw new HttpError(404, 'That piece is not in your bag.');
    if (item.product.stock < quantity) throw new HttpError(409, 'There is not enough stock for that quantity.');

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    response.json({ cart: presentCart(cart) });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (request, response, next) => {
  try {
    const cart = await loadCart(request.user._id);
    cart.items = cart.items.filter((item) => !item.product?._id.equals(request.params.productId));
    await cart.save();
    await cart.populate('items.product');
    response.json({ cart: presentCart(cart) });
  } catch (error) {
    next(error);
  }
};