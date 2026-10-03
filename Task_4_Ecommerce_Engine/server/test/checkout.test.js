import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
const { createCheckoutController } = await import('../src/controllers/checkoutController.js');

function responseDouble() {
  return { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } };
}

test('payment intent amount comes from the database cart, not client input', async () => {
  const product = { _id: 'product-1', name: 'Atelier Tote', priceCents: 62000, stock: 4 };
  const cart = { items: [{ product, quantity: 2 }], populate: async function () { return this; } };
  const CartModel = { findOne: () => ({ populate: async () => cart }) };
  let requestData;
  const stripeFactory = () => ({ paymentIntents: { create: async (data) => { requestData = data; return { client_secret: 'pi_secret', amount: data.amount }; } } });
  const response = responseDouble();
  await createCheckoutController({ CartModel, stripeFactory }).createPaymentIntent({ user: { _id: 'user-1', id: 'user-1' } }, response, assert.fail);

  assert.equal(requestData.amount, 124000);
  assert.equal(response.body.amount, 124000);
  assert.equal(response.body.clientSecret, 'pi_secret');
});

test('order confirmation rejects a succeeded intent owned by another account', async () => {
  const controller = createCheckoutController({
    stripeFactory: () => ({ paymentIntents: { retrieve: async () => ({ id: 'pi_foreign_owner', status: 'succeeded', metadata: { userId: 'someone-else' } }) } })
  });
  let error;
  await controller.confirmOrder({
    user: { _id: 'current-user' },
    body: {
      paymentIntentId: 'pi_foreign_owner',
      shippingAddress: { name: 'Test User', line1: '42 Orchard Street', city: 'New York', postalCode: '10002', country: 'United States' }
    }
  }, { status() { return this; }, json() {} }, (value) => { error = value; });

  assert.equal(error.status, 403);
  assert.equal(error.message, 'This payment does not belong to your account.');
});