import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
const { createAuthController } = await import('../src/controllers/authController.js');

function responseDouble() {
  return { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } };
}

test('registration stores a bcrypt hash and returns a session token', async () => {
  let created;
  const User = {
    findOne: async () => null,
    create: async (payload) => { created = { ...payload, id: 'user-1' }; return created; }
  };
  const response = responseDouble();
  await createAuthController({ User }).register({ body: { name: 'Sana Awan', email: 'SANA@example.com', password: 'StrongPass!9' } }, response, assert.fail);

  assert.equal(response.statusCode, 201);
  assert.equal(created.email, 'sana@example.com');
  assert.notEqual(created.passwordHash, 'StrongPass!9');
  assert.match(created.passwordHash, /^\$2[aby]\$/);
  assert.equal(response.body.user.email, 'sana@example.com');
  assert.ok(response.body.token);
});

test('registration rejects weak passwords before persistence', async () => {
  let called = false;
  const User = { findOne: async () => null, create: async () => { called = true; } };
  const response = responseDouble();
  let error;
  await createAuthController({ User }).register({ body: { name: 'Sana Awan', email: 'sana@example.com', password: 'short' } }, response, (value) => { error = value; });

  assert.equal(error.status, 400);
  assert.equal(called, false);
});