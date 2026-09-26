import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve('src/App.jsx'), 'utf8');
const styles = fs.readFileSync(path.resolve('src/styles.css'), 'utf8');

test('dashboard retains CRUD and adds journal interaction controls', () => {
  for (const phrase of ['Gathering your thoughts', 'A fresh page', 'priority', 'dueDate', 'tag', 'Search tasks', 'Undo', 'onDragStart', 'handlePin', 'expandedId', 'celebrate', 'emojiOptions', 'accentOptions']) assert.match(source, new RegExp(phrase));
  assert.match(source, /fetch\(path/);
  assert.match(source, /method: 'POST'/);
  assert.match(source, /method: 'PATCH'/);
  assert.match(source, /method: 'DELETE'/);
  assert.match(source, /method: 'PUT'/);
  assert.match(source, /editScrollPosition/);
  assert.doesNotMatch(source, /autoFocus/);
  assert.match(source, /setTimeout\(\(\) =>/);
  assert.match(source, /localStorage\.setItem\('daymark-theme'/);
  assert.match(source, /deleteTimers\.current\.set/);
  assert.match(source, /setSort\('manual'\)/);
  assert.match(source, /pinned: !task\.pinned/);
  assert.match(source, /aria-expanded=\{expanded\}/);
});

test('dashboard has responsive layout and reduced-motion support', () => {
  assert.match(styles, /--bg:#101116/);
  assert.match(styles, /html\[data-theme="light"\]/);
  assert.match(styles, /@media\(max-width:650px\)/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /@keyframes card-in/);
  assert.match(styles, /@keyframes tick-in/);
  assert.match(styles, /@keyframes celebrate-in/);
  assert.match(styles, /@keyframes card-out/);
  assert.match(styles, /backdrop-filter:blur/);
});
