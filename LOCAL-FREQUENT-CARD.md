# Local frequent card preview

Load `dist/local/nspanel-frequent-card.js` as an additional Home Assistant
module resource beside the main NSPanel card bundle. The browser shows a
placeholder; the native develop app owns the private usage history and ranking.

```yaml
type: custom:nspanel-frequent-card
title: Häufig genutzt
height: 126 # compact: up to 3; 162: up to 6
count: 3
entity_domains: [] # empty means all supported device domains
```

`count` is clamped to 1–3 at 126px or 1–6 at 162px. The card uses a fixed
three-column grid without internal scrolling. The hosting page must have room
for the selected height. Available domains: `light`, `switch`,
`input_boolean`, `fan`, `cover`, `climate`, `media_player`. Remove the card to
hide recommendations; collection by the native app continues.

Validation: `node --check dist/local/nspanel-frequent-card.js` and
`node dev/frequent-tests.mjs`.
