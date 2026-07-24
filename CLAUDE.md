# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ARC Personalizados — a static marketing site + admin panel for a laser-engraving/personalized-gifts
business (canecas, garrafas, camisetas, papelaria, brindes), deployed via GitHub Pages (see `CNAME`)
at `arc.guilherme-oliveira.com`. There is no build step, no bundler, no package manager and no test
suite — plain HTML/CSS/JS served as-is, backed by Firebase (Realtime Database + Authentication) for
content persistence.

## Commands

There is no `package.json` / build tooling. Serve the folder statically and open it in a browser
(opening via `file://` breaks the Firebase-dependent parts of the public site, though the layout
still renders with default content):

```bash
python -m http.server 8000
```

Then browse to `http://localhost:8000/index.html` or `/admin.html`. No linter, no automated tests —
verify changes by loading the pages and checking the console.

## Pages

- `index.html` — the public marketing site (hero, serviços, galeria, produtos, como funciona,
  diferenciais, depoimentos, CTA). Loads default content immediately, then overlays it with
  whatever is in Firebase (see below).
- `admin.html` — password-gated internal panel (Firebase Auth email/password) to manage every
  piece of content shown on `index.html`. Not linked from search engines
  (`robots: noindex,nofollow`) but has no server-side protection — access control is entirely
  Firebase Auth + Realtime Database rules.

Each page loads `css/style.css` (shared/base) plus `css/admin.css` on `admin.html`. JS entry points:
`js/main.js` (public site) and `js/admin.js` (panel), both preceded by the shared `js/firebase-init.js`.

## Firebase architecture

Config lives in `js/firebase-init.js` (project `arcpersonalizados-99515`), exposing two globals:
`arcDb` (Realtime Database, used everywhere) and `arcAuth` (Auth, only loaded on `admin.html` via
the `firebase-auth-compat.js` script tag — `index.html` only needs the database).

Realtime Database has one top-level node, `siteConfig`, with six children:

- `siteConfig/servicos/{pushId}` — `{ icon, titulo, texto }`, the "O que fazemos" marketing cards.
- `siteConfig/diferenciais/{pushId}` — `{ icon, titulo, texto }`, the "Diferenciais" cards (dark section).
- `siteConfig/galeria/{pushId}` — `{ categoria, label, foto }`, the portfolio grid with lightbox.
  `categoria` drives the dynamic filter tabs (derived from whatever distinct values exist).
- `siteConfig/produtos/{pushId}` — `{ nome, texto, foto }`, the "Produtos em destaque" catalog —
  each card links out to WhatsApp with a pre-filled message naming the product.
- `siteConfig/depoimentos/{pushId}` — `{ nome, texto }`, client testimonials.
- `siteConfig/categorias/{pushId}` — `{ label }`, the admin-managed source of category options
  offered when creating/editing a `galeria` item (the galeria entry stores the label string itself,
  not the categoria's push id — editing/deleting a categoria later doesn't retroactively touch
  galeria items that already reference its old label).

Icon fields (`servicos.icon`, `diferenciais.icon`) are keys into fixed SVG path maps
(`serviceIconPaths`, `diffIconPaths` in `js/main.js`; duplicated as label maps `SERVICE_ICONS`,
`DIFF_ICONS` in `js/admin.js` for the admin `<select>`s) — not raw markup, so both admin and public
site can render consistent icons from a short key.

Expected Realtime Database rules (not stored in the repo — configure in the Firebase console):

```json
{
  "rules": {
    "siteConfig": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

Admin login is Firebase email/password auth (`arcAuth.signInWithEmailAndPassword`), managed under
Authentication → Users in the Firebase console — there's no self-service signup anywhere.

## Content loading pattern

`js/main.js` ships hardcoded default arrays (`services`, `galeria`, `produtos`, `diferenciais`,
`depoimentos`) so the site renders immediately and still works if Firebase is unreachable/empty.
It then does a one-time `arcDb.ref('siteConfig').once('value')` fetch and, for each child node that
exists, replaces the corresponding array and re-renders just that section. There is no realtime
listener on the public site — admin changes need a page reload on `index.html` to show up.

`js/admin.js` is the CRUD side: realtime listeners (`on('value')`) on all six `siteConfig` children,
with one-time seeds (`SEED_SERVICOS`, `SEED_DIFERENCIAIS`, `SEED_GALERIA`, `SEED_PRODUTOS`,
`SEED_DEPOIMENTOS`, `SEED_CATEGORIAS`) written only if those nodes don't exist yet — matching the
same default content baked into `js/main.js`. Create/edit for the five content types (`servico`,
`diferencial`, `galeria`, `produto`, `depoimento`) always happens in one shared modal
(`#formModalOverlay` / `openFormModal(context, existing)`), which shows/hides its icon select,
categoria select, foto upload, and texto fields based on `context`; delete always goes through the
confirmation modal (`#confirmModalOverlay` / `openConfirmModal(message, onConfirm)`) instead of
`window.confirm`. Photo uploads (`galeria`, `produtos`) are resized client-side to compressed JPEG
data URLs via `resizeImage()` (canvas-based) before being written to the database — there is no
Firebase Storage usage anywhere, images are stored inline as base64 strings.

## Theming

Single light theme only (no dark mode) — all colors are CSS custom properties in `css/style.css`
`:root` (`--accent` is the ARC orange). `css/admin.css` reuses those same variables so the admin
panel matches the public site's palette.
