/* Local browser preview for the native panel's usage recommendations. */
(() => {
  const defaults = {type: 'custom:nspanel-frequent-card', title: 'Häufig genutzt', height: 126, count: 3, entity_domains: []};
  const domains = ['light', 'switch', 'input_boolean', 'fan', 'cover', 'climate', 'media_player'];
  const labels = {light: 'Licht', switch: 'Schalter', input_boolean: 'Boolescher Schalter',
    fan: 'Lüfter', cover: 'Rollläden', climate: 'Klima', media_player: 'Medien'};
  const enLabels = {light: 'Lights', switch: 'Switches', input_boolean: 'Boolean switches',
    fan: 'Fans', cover: 'Covers', climate: 'Climate', media_player: 'Media'};
  const german = hass => String(hass?.locale?.language || hass?.language ||
    (typeof navigator !== 'undefined' ? navigator.language : 'en')).startsWith('de');
  const height = (value) => Number(value) >= 162 ? 162 : 126;
  const capacity = (value) => height(value) === 162 ? 6 : 3;
  const count = (value, size) => Number.isInteger(value) ? Math.min(capacity(size), Math.max(1, value)) : 3;
  class FrequentCard extends HTMLElement {
    constructor() { super(); this.attachShadow({mode: 'open'}); }
    static getConfigElement() { return document.createElement('nspanel-frequent-card-editor'); }
    static getStubConfig() { return {...defaults}; }
    setConfig(config) { this._explicitTitle = Object.hasOwn(config, 'title') && config.title !== defaults.title; this.config = {...defaults, ...config}; this.config.height = height(this.config.height); this.config.count = count(this.config.count, this.config.height); this.render(); }
    set hass(value) { this._hass = value; if (this.config) this.render(); }
    getCardSize() { return this.config.height === 162 ? 4 : 3; }
    render() {
      this.shadowRoot.replaceChildren();
      const style = document.createElement('style');
      style.textContent = `:host{display:block}ha-card{height:${this.config.height}px;box-sizing:border-box;padding:4px 12px;background:#16191f;color:#f2f4f7;border-radius:22px;box-shadow:none;font:600 16px sans-serif}.title{margin-left:8px;color:#98a1b0;font:500 12px sans-serif}.note{margin-top:4px;color:#98a1b0;font:14px sans-serif}`;
      const card = document.createElement('ha-card');
      const title = document.createElement('div'); title.className = 'title'; title.textContent = this._explicitTitle
        ? this.config.title : (german(this._hass) ? defaults.title : 'Frequently used');
      const note = document.createElement('div'); note.className = 'note';
      note.textContent = german(this._hass)
        ? `Bis zu ${capacity(this.config.height)} Empfehlungen · Daten nur auf dem Panel`
        : `Up to ${capacity(this.config.height)} suggestions · data only on the panel`;
      card.append(title, note); this.shadowRoot.append(style, card);
    }
  }
  class FrequentEditor extends HTMLElement {
    constructor() { super(); this.attachShadow({mode: 'open'}); }
    setConfig(config) { this.config = {...defaults, ...config}; this.config.height = height(this.config.height); this.config.count = count(this.config.count, this.config.height); this.render(); }
    set hass(value) { this._hass = value; if (this.config) this.render(); }
    render() {
      const form = document.createElement('ha-form');
      form.hass = this._hass;
      form.data = {...this.config, height: String(this.config.height)};
      form.schema = [
        {name: 'title', selector: {text: {}}},
        {name: 'height', selector: {select: {options: [
          {value: '126', label: german(this._hass) ? 'Kompakt · bis 3' : 'Compact · up to 3'},
          {value: '162', label: german(this._hass) ? 'Groß · bis 6' : 'Large · up to 6'},
        ]}}},
        {name: 'count', selector: {number: {min: 1, max: capacity(this.config.height), step: 1, mode: 'box'}}},
        {name: 'entity_domains', selector: {select: {multiple: true,
          options: domains.map(value => ({value, label: (german(this._hass) ? labels : enLabels)[value]}))}}},
      ];
      form.computeLabel = ({name}) => (german(this._hass)
        ? {title: 'Titel', height: 'Größe', count: 'Anzahl', entity_domains: 'Entitätsarten'}
        : {title: 'Title', height: 'Size', count: 'Count', entity_domains: 'Entity types'})[name];
      form.addEventListener('value-changed', event => {
        event.stopPropagation();
        const value = event.detail?.value ?? {};
        const next = {...this.config};
        if (Object.hasOwn(value, 'title')) next.title = value.title;
        if (Object.hasOwn(value, 'height')) next.height = height(value.height);
        if (Object.hasOwn(value, 'count')) next.count = value.count;
        next.count = count(next.count, next.height);
        if (Object.hasOwn(value, 'entity_domains')) next.entity_domains =
          Array.isArray(value.entity_domains) ? value.entity_domains.filter(x => domains.includes(x)) : [];
        next.type = defaults.type; this.config = next; this.render();
        this.dispatchEvent(new CustomEvent('config-changed', {detail: {config: next}, bubbles: true, composed: true}));
      });
      this.form = form; this.shadowRoot.replaceChildren(form);
    }
  }
  if (!customElements.get('nspanel-frequent-card')) customElements.define('nspanel-frequent-card', FrequentCard);
  if (!customElements.get('nspanel-frequent-card-editor')) customElements.define('nspanel-frequent-card-editor', FrequentEditor);
  window.customCards = window.customCards || [];
  if (!window.customCards.some(c => c.type === 'nspanel-frequent-card')) window.customCards.push({
    type: 'nspanel-frequent-card', name: 'NSPanel häufig genutzt', preview: true,
    description: 'Browser-Platzhalter für lokale Empfehlungen auf dem Panel.',
  });
})();
