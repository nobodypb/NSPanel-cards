/* Private downstream companion card. Independent of the core NSPanel bundle. */
(() => {
  const defaults = {type: 'custom:nspanel-ha-app-card', title: 'Home Assistant', icon: 'mdi:home-assistant', height: 76};
  class CompanionCard extends HTMLElement {
    constructor() { super(); this.attachShadow({mode: 'open'}); }
    static getConfigElement() { return document.createElement('nspanel-ha-app-card-editor'); }
    static getStubConfig() { return {...defaults}; }
    setConfig(config) { this.config = {...defaults, ...config}; this.render(); }
    set hass(value) { this._hass = value; }
    getCardSize() { return Math.ceil((Number(this.config?.height) || 76) / 50); }
    render() {
      const c = this.config;
      const root = this.shadowRoot;
      root.replaceChildren();
      const style = document.createElement('style');
      style.textContent = ':host{display:block}ha-card{background:#16191f;color:#f2f4f7;border-radius:18px;box-shadow:none;padding:0 12px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:12px}ha-icon{--mdc-icon-size:28px;color:#98a1b0}.title{font:600 18px sans-serif}.note{font:14px sans-serif;color:#98a1b0;text-align:center;margin-top:8px}';
      const card = document.createElement('ha-card');
      card.style.height = `${Math.max(76, Math.min(900, Number(c.height) || 76))}px`;
      card.setAttribute('aria-disabled', 'true');
      const icon = document.createElement('ha-icon'); icon.setAttribute('icon', c.icon);
      const title = document.createElement('span'); title.className = 'title'; title.textContent = c.title;
      card.append(icon, title);
      const note = document.createElement('div'); note.className = 'note'; note.textContent = 'Nur auf dem Panel verfügbar';
      root.append(style, card, note);
    }
  }
  class CompanionEditor extends HTMLElement {
    constructor() { super(); this.attachShadow({mode: 'open'}); }
    setConfig(config) { this.config = {...config}; this.render(); }
    set hass(value) { this._hass = value; if (this.form) this.form.hass = value; }
    render() {
      const form = document.createElement('ha-form');
      form.hass = this._hass;
      form.data = {...defaults, ...this.config};
      form.schema = [
        {name: 'title', selector: {text: {}}},
        {name: 'icon', selector: {icon: {}}},
        {name: 'height', selector: {number: {min: 76, max: 900, mode: 'box'}}},
      ];
      form.computeLabel = ({name}) => ({title: 'Titel', icon: 'Icon', height: 'Höhe'})[name];
      form.addEventListener('value-changed', (event) => {
        event.stopPropagation();
        const value = event.detail?.value ?? {};
        const next = {...this.config};
        for (const key of ['title', 'icon', 'height']) if (Object.hasOwn(value, key)) next[key] = value[key];
        next.type = defaults.type;
        this.config = next;
        this.dispatchEvent(new CustomEvent('config-changed', {detail: {config: next}, bubbles: true, composed: true}));
      });
      this.form = form; this.shadowRoot.replaceChildren(form);
    }
  }
  if (!customElements.get('nspanel-ha-app-card')) customElements.define('nspanel-ha-app-card', CompanionCard);
  if (!customElements.get('nspanel-ha-app-card-editor')) customElements.define('nspanel-ha-app-card-editor', CompanionEditor);
  window.customCards = window.customCards || [];
  if (!window.customCards.some(c => c.type === 'nspanel-ha-app-card')) window.customCards.push({
    type: 'nspanel-ha-app-card', name: 'NSPanel Home Assistant', preview: true,
    description: 'Öffnet die Companion-App auf einem eingerichteten nativen Panel.',
  });
})();
