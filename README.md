# NinjaMark Landing Page

Static landing page for `NinjaMark` / `NinjaMark Premium`.

## Files

- `index.html`: Japanese landing page
- `index-en.html`: English landing page
- `styles.css`: visual system, layout, and component styling
- `script.js`: config hooks, motion, hero demo, and section interactions
- `assets/logo-mark.svg`: brand mark
- `assets/vendor/anime.esm.min.js`: vendored anime.js `4.3.6`
- `netlify.toml`: Netlify publish config

## Before Deploy

Edit `script.js` and set these values when ready:

- `checkoutUrl`
- `chromeStoreUrl`
- `supportEmail`
- `premiumPriceLabel`
- `billingLabel`

## Local Preview

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Netlify

```bash
netlify deploy --prod --dir .
```
