import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import request from 'supertest';

process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
const { app } = await import('../src/app.js');

let server;
before(() => { server = app.listen(0); });
after(() => { server.close(); });

test('health endpoint reports the API as available', async () => {
  const response = await request(server).get('/api/health');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok', service: 'se-commerce-engine-api' });
});

test('unknown routes return a safe JSON error', async () => {
  const response = await request(server).get('/api/missing');

  assert.equal(response.status, 404);
  assert.equal(response.body.message, 'This route could not be found.');
});