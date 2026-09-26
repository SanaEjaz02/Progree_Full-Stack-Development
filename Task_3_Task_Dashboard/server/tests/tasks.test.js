import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/database.js';

async function withServer(run) {
  const db = createDatabase(':memory:');
  const server = createApp({ db }).listen(0);
  const port = server.address().port;
  try { await run(`http://127.0.0.1:${port}`); } finally { server.close(); db.close(); }
}

async function api(base, path, options = {}) {
  const response = await fetch(`${base}${path}`, { headers: { 'content-type': 'application/json' }, ...options });
  const body = response.status === 204 ? null : await response.json();
  return { response, body };
}

test('GET starts empty and POST creates a persistent task in the database', async () => {
  await withServer(async (base) => {
    const empty = await api(base, '/api/tasks');
    assert.deepEqual(empty.body.tasks, []);
    const created = await api(base, '/api/tasks', { method: 'POST', body: JSON.stringify({ title: 'Ship dashboard', description: 'Finish CRUD flow', priority: 'high', dueDate: '2026-10-01', tag: 'Work', accent: 'cyan', emoji: '✦', pinned: true }) });
    assert.equal(created.response.status, 201);
    assert.equal(created.body.task.status, 'pending');
    assert.equal(created.body.task.priority, 'high');
    assert.equal(created.body.task.dueDate, '2026-10-01');
    assert.equal(created.body.task.tag, 'Work');
    assert.equal(created.body.task.accent, 'cyan');
    assert.equal(created.body.task.emoji, '✦');
    assert.equal(created.body.task.pinned, 1);
    const listed = await api(base, '/api/tasks');
    assert.equal(listed.body.tasks[0].title, 'Ship dashboard');
  });
});

test('PUT /api/tasks/order persists a complete manual order', async () => {
  await withServer(async (base) => {
    const first = await api(base, '/api/tasks', { method: 'POST', body: JSON.stringify({ title: 'First task' }) });
    const second = await api(base, '/api/tasks', { method: 'POST', body: JSON.stringify({ title: 'Second task' }) });
    const reordered = await api(base, '/api/tasks/order', { method: 'PUT', body: JSON.stringify({ ids: [second.body.task.id, first.body.task.id] }) });
    assert.deepEqual(reordered.body.tasks.map((task) => task.id), [second.body.task.id, first.body.task.id]);
    const invalid = await api(base, '/api/tasks/order', { method: 'PUT', body: JSON.stringify({ ids: [first.body.task.id] }) });
    assert.equal(invalid.response.status, 400);
  });
});

test('PATCH updates status and DELETE removes a task', async () => {
  await withServer(async (base) => {
    const created = await api(base, '/api/tasks', { method: 'POST', body: JSON.stringify({ title: 'Test lifecycle' }) });
    const id = created.body.task.id;
    const updated = await api(base, `/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'complete', title: 'Completed lifecycle', priority: 'low', dueDate: '2026-11-01', tag: 'Done' }) });
    assert.equal(updated.body.task.status, 'complete');
    assert.equal(updated.body.task.title, 'Completed lifecycle');
    assert.equal(updated.body.task.priority, 'low');
    assert.equal(updated.body.task.tag, 'Done');
    const removed = await api(base, `/api/tasks/${id}`, { method: 'DELETE' });
    assert.equal(removed.response.status, 200);
    const remaining = await api(base, '/api/tasks');
    assert.equal(remaining.body.tasks.length, 0);
  });
});

test('API rejects invalid task data', async () => {
  await withServer(async (base) => {
    const result = await api(base, '/api/tasks', { method: 'POST', body: JSON.stringify({ title: '' }) });
    assert.equal(result.response.status, 400);
    assert.match(result.body.error, /title is required/i);
  });
});

test('file-backed database keeps tasks after reconnecting', () => {
  const filename = path.join(os.tmpdir(), `daymark-${Date.now()}.db`);
  const first = createDatabase(filename);
  first.prepare('INSERT INTO tasks (title, description, status, created_at) VALUES (?, ?, ?, ?)').run('Persisted task', '', 'pending', new Date().toISOString());
  first.close();
  const second = createDatabase(filename);
  const task = second.prepare('SELECT title FROM tasks').get();
  second.close();
  fs.rmSync(filename, { force: true });
  assert.equal(task.title, 'Persisted task');
});
