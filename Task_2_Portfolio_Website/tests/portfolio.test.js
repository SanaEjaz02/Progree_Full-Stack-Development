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

test('portfolio contains Sana\'s real profile and project links', () => {
  const html = read('index.html');
  for (const text of ['Institute of Space Technology', 'hafizasanaawan@gmail.com', 'CARDIVA', 'Multi-Class Sentiment Classifier', 'Heuristic Graph Pathfinding Agent', 'Real-Time Computer Vision Pipeline']) {
    assert.match(html, new RegExp(text.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')));
  }
  assert.equal((html.match(/class="project-card/g) || []).length, 4);
  assert.match(html, /href="mailto:hafizasanaawan@gmail\.com"/);
  assert.match(html, /<a class="button button-light" href="mailto:hafizasanaawan@gmail\.com">hafizasanaawan@gmail\.com/);
  assert.match(html, /<a class="brand" href="#top" aria-label="Sana Ejaz home">Sana Ejaz<\/a>/);
  assert.doesNotMatch(html, /mailto:hafizasanaawan@gmail\.com"[^>]*target=/);
  assert.equal((html.match(/class="project-animation/g) || []).length, 4);
  assert.doesNotMatch(html, /placeholder|lorem ipsum|example\.com|Project Atlas|Frame Studio|Loop Notes/i);
});

test('navigation has accessible state controls and keyboard behavior', () => {
  const html = read('index.html');
  const js = read('js/script.js');
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="primary-navigation"/);
  assert.match(js, /event\.key === 'Escape'/);
  assert.match(js, /menuToggle\.focus\(\)/);
  assert.doesNotMatch(js, /preventDefault|onclick/);
});

test('styles include responsive layout and reduced motion support', () => {
  const css = read('css/styles.css');
  assert.match(css, /display: grid/);
  assert.match(css, /display: flex/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.match(css, /stroke-dashoffset/);
  assert.match(css, /@keyframes route-travel[\s\S]*translate\(52px, -78px\)/);
  assert.match(css, /@keyframes (ecg-draw|chat-float|route-travel|scanner-line)/);
});
