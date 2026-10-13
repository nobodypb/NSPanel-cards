import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const elements = new Map();
class Element {
  constructor() { this.children = []; this.listeners = new Map(); }
  attachShadow() { this.shadowRoot = new Element(); return this.shadowRoot; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(name, fn) { this.listeners.set(name, fn); }
  dispatchEvent(event) { this.event = event; }
}
const document = {createElement: (name) => Object.assign(new Element(), {tagName: name})};
const customElements = {get: name => elements.get(name), define: (name, klass) => elements.set(name, klass)};
class CustomEvent {
  constructor(type, init) { this.type = type; Object.assign(this, init); }
}
const window = {customCards: []};
vm.runInNewContext(fs.readFileSync(new URL('../dist/local/nspanel-frequent-card.js', import.meta.url), 'utf8'),
  {HTMLElement: Element, document, customElements, CustomEvent, window});

const Card = elements.get('nspanel-frequent-card');
const Editor = elements.get('nspanel-frequent-card-editor');
assert.equal(Card.getStubConfig().count, 3);
assert.equal(Card.getStubConfig().height, 126);
const card = new Card();
card.hass = {locale: {language: 'de'}};
card.setConfig({title: 'Used', count: 4});
assert.equal(card.shadowRoot.children[1].children[0].textContent, 'Used');
assert.match(card.shadowRoot.children[1].children[1].textContent, /nur auf dem Panel/);
card.hass = {locale: {language: 'en'}};
assert.match(card.shadowRoot.children[1].children[1].textContent, /only on the panel/);
assert.equal(card.shadowRoot.children[1].children[0].textContent, 'Used');
assert.match(card.shadowRoot.children[0].textContent, /height:126px/);
card.setConfig({height: 162, count: 6});
assert.match(card.shadowRoot.children[0].textContent, /height:162px/);
const editor = new Editor();
editor.hass = {locale: {language: 'de'}};
editor.setConfig({count: 3});
assert.equal(editor.form.computeLabel({name: 'count'}), 'Anzahl');
editor.hass = {locale: {language: 'en'}};
assert.equal(editor.form.computeLabel({name: 'count'}), 'Count');
assert.deepEqual(JSON.parse(JSON.stringify(editor.form.schema.find(x => x.name === 'count').selector.number)),
  {min: 1, max: 3, step: 1, mode: 'box'});
const changed = editor.form.listeners.get('value-changed');
changed({stopPropagation() {}, detail: {value: {count: 99, entity_domains: ['light', 'bogus', 'cover']}}});
assert.equal(editor.event.detail.config.count, 3);
assert.deepEqual([...editor.event.detail.config.entity_domains], ['light', 'cover']);
editor.form.listeners.get('value-changed')({stopPropagation() {}, detail: {value: {height: '162', count: 99}}});
assert.equal(editor.event.detail.config.height, 162);
assert.equal(editor.event.detail.config.count, 6);
assert.equal(editor.form.schema.find(x => x.name === 'count').selector.number.max, 6);
editor.form.listeners.get('value-changed')({stopPropagation() {}, detail: {value: {height: '126'}}});
assert.equal(editor.event.detail.config.count, 3);
editor.form.listeners.get('value-changed')({stopPropagation() {}, detail: {value: {count: -2}}});
assert.equal(editor.event.detail.config.count, 1);
console.log('frequent card preview and editor passed');
