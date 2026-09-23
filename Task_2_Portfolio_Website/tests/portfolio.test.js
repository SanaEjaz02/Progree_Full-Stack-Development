const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('HTML uses the required semantic structure and sections', () => {
  const html = read('index.html');
  for (const element of ['header', 'nav', 'main', 'section', 'article', 'footer']) {
    assert.match(html, new RegExp(`<${element}\\b`), `missing semantic ${element}`);
  }
  for (const id of ['top', 'about', 'skills', 'projects', 'contact']) {
    assert.match(html, new RegExp(`id="${id}"`), `missing section ${id}`);
  }
});

test('navigation has accessible state controls and keyboard behavior', () => {
  const html = read('index.html');
  const js = read('js/script.js');
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="primary-navigation"/);
  assert.match(js, /event\.key === 'Escape'/);
  assert.match(js, /menuToggle\.focus\(\)/);
});

test('styles include responsive layout and reduced motion support', () => {
  const css = read('css/styles.css');
  assert.match(css, /display: grid/);
  assert.match(css, /display: flex/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /prefers-reduced-motion/);
});
