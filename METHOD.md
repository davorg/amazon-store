---
title: How amazon-store detects your region
layout: default
permalink: /method/
---

[Home](/amazon-store/) · [Changelog](/amazon-store/changelog/)

# How amazon-store detects your region

`amazon-store` tries several browser signals in order to decide which Amazon
store to send a visitor to. Each step is tried in turn; the first one that
returns a recognisable region wins. This page documents every step so it is
easier to understand (and debug) surprising behaviour.

---

## Detection order

### 1. Explicit override (highest priority)

If you call `detectRegion({ region: "IT" })` — or pass `data-amazon-region="IT"`
on an element, or call `enhanceAll({ region: "IT" })` — that value is used
immediately and is also saved to `localStorage` as a *manual override*. No
further detection is attempted.

### 2. `localStorage` manual override

If a manual override was previously stored in `localStorage` under the key
`amazonStoreRegion` (with `src: "manual"`), that cached value is used. This
persists across page loads until it is cleared or replaced. An override is
only written to storage when a `region` is explicitly passed to the API; it is
never set automatically by the auto-detection steps below.

### 3. `navigator.languages` / `navigator.language`

The library reads `navigator.languages` (an array, e.g.
`["it-IT", "it", "en-US"]`) or, if that is not available, falls back to the
single `navigator.language` string. Each entry is examined for a country-code
suffix (the two-letter tag after a `-` or `_`, e.g. `IT` from `it-IT`). The
first country code that maps to a known store wins.

**Country-code → store mapping used at this step:**

| Country code(s) | Store |
|---|---|
| `GB`, `UK`, `IE` | UK (`amazon.co.uk`) |
| `US` | US (`amazon.com`) |
| `CA` | Canada (`amazon.ca`) |
| `AU` | Australia (`amazon.com.au`) |
| `DE` | Germany (`amazon.de`) |
| `ES` | Spain (`amazon.es`) |
| `FR` | France (`amazon.fr`) |
| `IT` | Italy (`amazon.it`) |
| `NL` | Netherlands (`amazon.nl`) |
| `IN` | India (`amazon.in`) |
| `JP` | Japan (`amazon.co.jp`) |
| `MX` | Mexico (`amazon.com.mx`) |
| `BR` | Brazil (`amazon.com.br`) |

> **Debugging tip — Italy:** If a visitor in Italy is being sent to
> `amazon.com`, check what `navigator.languages` reports in their browser.
> If it returns something like `["en-US", "en"]` (no `IT` country code), this
> step will not match Italy and detection will move on to the next step.

### 4. Browser time zone (`Intl.DateTimeFormat`)

`Intl.DateTimeFormat().resolvedOptions().timeZone` is called. The result
(e.g. `"Europe/Rome"`) is looked up in the following table (case-insensitive):

| Time zone | Store |
|---|---|
| `Europe/London` | UK |
| `Europe/Dublin` | UK |
| `Europe/Berlin` | DE |
| `Europe/Paris` | FR |
| `Europe/Madrid` | ES |
| `Europe/Rome` | IT |
| `Europe/Amsterdam` | NL |
| `Asia/Tokyo` | JP |
| `Asia/Kolkata` | IN |
| `Australia/Sydney` | AU |
| `Australia/Melbourne` | AU |
| `Australia/Perth` | AU |
| `America/New_York` | US |
| `America/Chicago` | US |
| `America/Denver` | US |
| `America/Los_Angeles` | US |
| `America/Toronto` | CA |
| `America/Vancouver` | CA |
| `America/Montreal` | CA |
| `America/Mexico_City` | MX |
| `America/Sao_Paulo` | BR |

Any other time zone (e.g. a VPN endpoint time zone, or an unlisted city zone
such as `Europe/Milan`) returns no match and detection continues.

> **Debugging tip — Italy:** A visitor physically in Italy but whose browser
> reports a VPN time zone, or a zone not in the list above (e.g.
> `Europe/Milan` is **not** listed), will get no match here.

### 5. `<html lang>` attribute

The `lang` attribute of the page's `<html>` element is read (e.g.
`lang="en-GB"`). The country-code suffix is extracted and looked up in the
same country-code → store table as step 3.

This step reflects the *site's* declared language, not the visitor's
preference, so it is less reliable than steps 3 and 4.

### 6. Hostname TLD

The hostname of the current page (`location.hostname`) is examined:

- `.co.uk` or `.uk` → **UK**
- `.de` → **DE**
- `.fr` → **FR**
- `.es` → **ES**
- `.it` → **IT**
- `.nl` → **NL**
- `.ca` → **CA**
- `.au` → **AU** (note: the standard Australian domain is `.com.au`; the TLD check extracts the last segment, so `amazon.com.au` yields `au` and does match)
- `.in` → **IN**
- `.jp` → **JP** (note: the standard Japanese domain is `amazon.co.jp`; the TLD check extracts `jp` from that, so it does match)
- `.mx` → **MX**
- `.br` → **BR**
- `.com` — intentionally *not* mapped (ambiguous; many non-US sites use `.com`)

This step is only useful when the website itself is hosted on a
country-specific domain.

### 7. `defaultRegion` option (caller-supplied fallback)

If none of the above steps yielded a result, the `defaultRegion` value passed
in by the caller is used (e.g. `enhanceAll({ defaultRegion: "US" })`).

### 8. Hard-coded fallback: **UK**

If everything else fails, the library defaults to **UK** (`amazon.co.uk`).
This is the developer's home store and is a reasonable choice for a UK-hosted
site; pass `defaultRegion` if you'd prefer a different fallback.

---

## Supported stores

| Code | Store name | Domain |
|---|---|---|
| `AU` | Australia | amazon.com.au |
| `BR` | Brazil | amazon.com.br |
| `CA` | Canada | amazon.ca |
| `DE` | Germany | amazon.de |
| `ES` | Spain | amazon.es |
| `FR` | France | amazon.fr |
| `IN` | India | amazon.in |
| `IT` | Italy | amazon.it |
| `JP` | Japan | amazon.co.jp |
| `MX` | Mexico | amazon.com.mx |
| `NL` | Netherlands | amazon.nl |
| `UK` | UK | amazon.co.uk |
| `US` | US | amazon.com |

---

## Debugging a mis-detected region

Open the browser's developer console on the affected page and run:

```js
// Step 3 — navigator languages
console.log('navigator.languages:', navigator.languages);
console.log('navigator.language:', navigator.language);

// Step 4 — time zone
console.log('timeZone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

// Step 5 — html lang
console.log('html lang:', document.documentElement.lang);

// Step 6 — hostname
console.log('hostname:', location.hostname);

// Step 2 — stored manual override
console.log('localStorage override:', localStorage.getItem('amazonStoreRegion'));

// Final result (if the library is loaded)
console.log('detected region:', AmazonStore.detectRegion());
```

Work through the steps above in order. The first step that returns a
recognised country code is the one controlling the result, so that is the
step to investigate when the wrong store is chosen.

### Common causes of an Italian visitor being sent to amazon.com

1. **`navigator.languages` contains no `IT` country code.** This is the most
   common cause. The visitor's browser may be set to `en-US` or another
   language with no Italian locale suffix. Check the console output for step 3.

2. **Time zone not in the list.** `Europe/Milan` and other valid Italian IANA
   time zones are **not** currently in the time-zone table. Only `Europe/Rome`
   maps to IT. If the browser reports a different zone (e.g. `Europe/Milan`),
   step 4 will not match.

3. **`<html lang>` set to `en` (no country code).** A `lang="en"` attribute
   has no country suffix, so step 5 produces no result.

4. **Site hosted on `.com`.** A `.com` hostname is intentionally left
   ambiguous, so step 6 returns nothing.

5. **A stale manual override in `localStorage`.** If someone previously
   called `detectRegion({ region: "US" })` in a browser session, that value
   is cached in `localStorage` and will be returned at step 2 for every
   future visit until it is cleared. Check `localStorage.getItem('amazonStoreRegion')`.
