import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve('src/App.jsx'), 'utf8');
const styles = fs.readFileSync(path.resolve('src/styles.css'), 'utf8');

test('dashboard renders CRUD states and controls', () => {
  for (const phrase of ['Loading your workspace', 'Nothing here yet', 'Add a task', 'Save changes', 'Delete task', 'Complete']) assert.match(source, new RegExp(phrase));
  assert.match(source, /fetch\(path/);
  assert.match(source, /method: 'POST'/);
  assert.match(source, /method: 'PATCH'/);
  assert.match(source, /method: 'DELETE'/);
});

test('dashboard has responsive layout and reduced-motion support', () => {
  assert.match(styles, /grid-template-columns:minmax\(280px/);
  assert.match(styles, /@media\(max-width:800px\)/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /@keyframes task-in/);
});
