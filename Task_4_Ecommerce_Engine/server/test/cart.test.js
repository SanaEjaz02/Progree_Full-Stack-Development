import assert from 'node:assert/strict';
import { test } from 'node:test';
import { presentCart } from '../src/controllers/cartController.js';

test('cart response totals use current product prices and quantities', () => {
  const cart = {
    items: [
      { product: { _id: 'wallet', name: 'Fold Wallet', priceCents: 14500 }, quantity: 2 },
      { product: { _id: 'belt', name: 'The Belt', priceCents: 17500 }, quantity: 1 }
    ]
  };

  assert.deepEqual(presentCart(cart), {
    items: cart.items,
    subtotalCents: 46500,
    itemCount: 3
  });
});
