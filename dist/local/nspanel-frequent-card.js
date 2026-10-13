/* Local browser preview for the native panel's usage recommendations. */
(() => {
  const defaults = {type: 'custom:nspanel-frequent-card', title: 'Häufig genutzt', count: 3, entity_domains: []};
  const domains = ['light', 'switch', 'input_boolean', 'fan', 'cover', 'climate', 'media_player'];
  const labels = {light: 'Licht', switch: 'Schalter', input_boolean: 'Boolescher Schalter',
    fan: 'Lüfter', cover: 'Rollläden', climate: 'Klima', media_player: 'Medien'};
  const count = (value) => Number.isInteger(value) ? Math.min(6, Math.max(1, value)) : 3;
  class FrequentCard extends HTMLElement {
    constructor() { super(); this.attachShadow({mode: 'open'}); }
    static getConfigElement() { return document.createElement('nspanel-frequent-card-editor'); }
    static getStubConfig() { return {...defaults}; }
    setConfig(config) { this.config = {...defaults, ...config}; this.render(); }
    set hass(value) { this._hass = value; }
    getCardSize() { return 3; }
    render() {
      this.shadowRoot.replaceChildren();
      const style = document.createElement('style');
      style.textContent = ':host{display:block}ha-card{height:126px;box-sizing:border-box;padding:12px;background:#16191f;color:#f2f4f7;border-radius:22px;box-shadow:none;font:600 16px sans-serif}.note{margin-top:12px;color:#98a1b0;font:14px sans-serif}';
      const card = document.createElement('ha-card');
      const title = document.createElement('div'); title.textContent = this.config.title || defaults.title;
      const note = document.createElement('div'); note.className = 'note';
      note.textContent = 'Empfehlungen und Nutzungsdaten nur auf dem Panel';
      card.append(title, note); this.shadowRoot.append(style, card);
    }
  }
  class FrequentEditor extends HTMLElement {
    constructor() { super(); this.attachShadow({mode: 'open'}); }
    setConfig(config) { this.config = {...defaults, ...config}; this.render(); }
    set hass(value) { this._hass = value; if (this.form) this.form.hass = value; }
    render() {
      const form = document.createElement('ha-form');
      form.hass = this._hass;
      form.data = {...this.config, count: count(this.config.count)};
      form.schema = [
        {name: 'title', selector: {text: {}}},
        {name: 'count', selector: {number: {min: 1, max: 6, step: 1, mode: 'box'}}},
        {name: 'entity_domains', selector: {select: {multiple: true,
          options: domains.map(value => ({value, label: labels[value]}))}}},
      ];
      form.computeLabel = ({name}) => ({title: 'Titel', count: 'Anzahl', entity_domains: 'Entity-Arten'})[name];
      form.addEventListener('value-changed', event => {
        event.stopPropagation();
        const value = event.detail?.value ?? {};
        const next = {...this.config};
        if (Object.hasOwn(value, 'title')) next.title = value.title;
        if (Object.hasOwn(value, 'count')) next.count = count(value.count);
        if (Object.hasOwn(value, 'entity_domains')) next.entity_domains =
          Array.isArray(value.entity_domains) ? value.entity_domains.filter(x => domains.includes(x)) : [];
        next.type = defaults.type; this.config = next;
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
