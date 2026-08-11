# currencies-mepto — Mepto-integrated Currencies

Efficient, drop-in replacement for `jquery.currencies.js` (Shopify, MIT). Migrate legacy Shopify themes off jQuery.

## Why

Legacy `jquery.currencies.js` depends on `jQuery` for `jQuery.cookie`, `jQuery(selector).each`, `.attr`, `.html` — 14 `jQuery` calls. This fork keeps every `Currency` API and swaps that surface for Mepto (`window.mepto || window.jQuery || window.$`) + native APIs, so themes can drop jQuery.

- `Currency.cookie` → native `document.cookie` (no `jQuery.trim`, no `jQuery.cookie` dep) — keeps `jQuery.cookie` alias for compat.
- `Currency.convertAll` → `querySelectorAll` + batch `measure`/`mutate` (`rAF` reads→writes), `Map` format cache, hoisted regex — no per-element layout thrash for 50+ `span.money`.
- `Currency.formatMoney` → deduped, hoisted regex, `Shopify.formatMoney` fallback kept.
- `Currency.convert` assumed from `currencies.js` (Shopify `{{ "/services/javascripts/currencies.js" | script_tag }}`).

## Install

```sh
npm install currencies-mepto meptos
# or via CDN after build: dist/currencies.pkgd.min.js (IIFE) + dist/currencies.min.css (none)
```

## Build

```sh
nvm use # Node 22 LTS
npm ci
npm run build # clean && vite build (ESM+IIFE ~24K/26K) && vite.min (~20K/16K, 4.0K gzip, Babel last 3)
npm run dev  # vite build --watch (esnext→Babel)
```

`babel.config.json` `preset-env` `last 3` `modules:false` `bugfixes:true`, `vite` `esnext + @rollup/plugin-babel` (same as `flickity-mepto`).

## Use

**Shopify theme (IIFE, Mepto first):**

```liquid
{{ 'mepto.js' | asset_url | script_tag }}
{{ 'currencies.js' | asset_url | script_tag }}
{{ 'currencies-mepto.js' | asset_url | script_tag }}
```

```js
Currency.cookie.write('CAD')
Currency.convertAll('USD', 'CAD', 'span.money')
Currency.setMepto(window.mepto) // alias setJQuery retained
```

**ESM:**

```js
import Currency from 'currencies-mepto' // or 'currencies-mepto/dist/currencies.esm.js'
Currency.convertAll('USD', 'EUR')
```

## API — frozen

`Currency.cookie` (`write/read/destroy`), `Currency.moneyFormats`, `Currency.formatMoney`, `Currency.convert`, `Currency.convertAll`, `Currency.currentCurrency`, `Currency.format`, `Currency.setMepto/setJQuery`. HTML `span.money` + `data-currency` attrs unchanged. See [Tutorial](http://wiki.shopify.com/How_to_Show_Multiple_Currencies).

## Performance

Mirrors `flickity-mepto` guide (`PERFORMANCE_GUIDE.md` Part I dominates): batch `convertAll` via `measure`/`mutate` `rAF` (single layout for 50 spans), hoisted `NON_DIGITS_RE`/`PLACEHOLDER_RE`/`THOUSANDS_RE`, `Map` format cache per `convertAll`, `DocumentFragment` not needed (spans already in DOM; batch is read→write). Keeps `jQuery` fallback via `window.mepto || window.jQuery`.

## License

MIT — same as upstream `carolineschnapp/currencies`.

Upstream: https://github.com/carolineschnapp/currencies
Fork: https://github.com/oreoorbitz/currencies (currencies-mepto)
