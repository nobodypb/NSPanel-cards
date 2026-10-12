# Private HA companion card

Load `dist/local/nspanel-ha-app-card.js` as an additional HA module resource beside
the normal NSPanel cards bundle. It is independently maintained and does not
modify or import the upstream bundle. Deployment should use a versioned URL.

```yaml
type: custom:nspanel-ha-app-card
title: Home Assistant
icon: mdi:home-assistant
height: 76
```

This is a normal card and can be included in a vertical stack/swipe page. The
native downstream app implements the action. Browser presentation is deliberately
non-interactive and says that the action is only available on the panel. No HA
service, external URL or Android intent is issued by this JavaScript resource.
The visual editor preserves unknown properties. No secrets or native package
selection belong in dashboard configuration.

Validation: `node --check dist/local/nspanel-ha-app-card.js`, then
`python3 dev/check-ha-app-tests.py --browser /path/to/chromium`.
Removing the card and its resource restores the prior dashboard; the core bundle
needs no rollback for this extension.
