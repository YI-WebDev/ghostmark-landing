# GhostMark Landing Page

Static landing page for GhostMark / GhostMark Premium.

## Files

- `index.html`: landing page markup
- `styles.css`: visual system and responsive layout
- `script.js`: config, anime.js motion, hero parallax
- `assets/logo-mark.svg`: brand mark
- `assets/vendor/anime.esm.min.js`: vendored anime.js `4.3.6`
- `netlify.toml`: Netlify publish config

## Before Deploy

Edit `script.js` and set:

- `checkoutUrl`
- `chromeStoreUrl`
- `supportEmail`
- `premiumPriceLabel`
- `billingLabel`

## Local Preview

Simple option:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Netlify

Recommended:

1. Create a new Netlify site from this directory.
2. Leave build command empty.
3. Set publish directory to `.`.

CLI example:

```bash
netlify deploy --prod --dir .
```
