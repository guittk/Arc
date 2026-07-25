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

- `index.html` — the public marketing site (hero, catálogo unificado, como funciona, depoimentos,
  CTA). Loads default content immediately, then overlays it with whatever is in Firebase (see below).
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

Realtime Database has a `siteConfig` node with four children, plus a top-level `orcamentos` node:

- `siteConfig/galeria/{pushId}` — `{ categoria, label, foto }`, extra photos of finished work, shown
  in the filterable "Trabalhos já entregues" grid inside `#catalogo` (see below) alongside `produtos`
  photos of the same category.
- `siteConfig/produtos/{pushId}` — `{ nome, texto, foto, categoria }`, the catalog items. The
  "Catálogo" section (`#catalogo`) renders a top row with one card per `categoria` (from
  `siteConfig/categorias`), using that category's first matching `produtos` entry as the card
  image/title/text (falling back to a `galeria` entry of the same category if no product exists
  yet). Each card has a single button, "Ver fotos", which opens `#catalogExpand` — an in-place modal
  showing every real photo of that one category (`produtos` + `galeria` combined, via
  `catalogImages()` in `js/main.js`) in a horizontally-scrollable strip (`.catalog-expand-scroller`,
  flex row + `overflow-x:auto` + scroll-snap, not a grid — meant to hold many photos per category),
  with a "Solicitar Orçamento" button embedded at the bottom that opens the quote modal pre-filled
  for that category. There is no direct "Solicitar Orçamento" button on the card itself anymore —
  browsing real photos always comes first. Clicking any photo in the strip opens the shared
  lightbox (see below) with prev/next navigation across that category's photo set. Below the card
  grid, a plain secondary link ("Ver todos os trabalhos já entregues", `#catalogViewAllBtn`) scrolls
  down to `#catalogGallery` — the same filterable-by-category tabs+grid used before. That block is
  hidden by default now (see Section visibility below) since it duplicates the per-category browsing
  the cards already provide.
- `siteConfig/depoimentos/{pushId}` — `{ nome, texto }`, client testimonials.
- `siteConfig/categorias/{pushId}` — `{ label }`, the admin-managed list of catalog categories —
  each one becomes a card in `#catalogo` and a filter tab in the "ver mais" grid. Selectable when
  creating/editing a `produtos` or `galeria` item (both store the label string itself, not the
  categoria's push id — editing/deleting a categoria later doesn't retroactively touch items that
  already reference its old label). Managed in the admin panel through its own modal
  (`#categoriaModalOverlay` / `openCategoriaModal(existing)` in `js/admin.js`), triggered by a
  "+ Nova categoria" button and per-row "Editar" buttons — matching the pattern used for the other
  content types instead of the old inline add/edit form.
- `orcamentos/{pushId}` — `{ nome, telefone, itens: [{ nome, quantidade }], observacoes, status,
  criadoEm }`, quote requests submitted through the public quote modal (`#quoteModal` /
  `openQuoteModal()` in `js/main.js`). `status` is one of `novo` / `andamento` / `concluido` and is
  advanced from the admin panel's "Pedidos de orçamento" block (`js/admin.js`, `STATUS_NEXT`). This
  node lives outside `siteConfig` because it's transactional data written by anonymous visitors, not
  site content — see the rules note below.

There is no "Diferenciais" section/collection anymore — it was removed from both the public site and
the admin panel. The hero's "+500 peças entregues" badge was also removed.

Expected Realtime Database rules (not stored in the repo — configure in the Firebase console).
`orcamentos` needs public write (visitors submit without logging in) but admin-only read (quote
requests contain customer phone numbers/names and shouldn't be publicly listable):

```json
{
  "rules": {
    "siteConfig": {
      ".read": true,
      ".write": "auth != null"
    },
    "orcamentos": {
      ".read": "auth != null",
      ".write": true
    }
  }
}
```

Admin login is Firebase email/password auth (`arcAuth.signInWithEmailAndPassword`), managed under
Authentication → Users in the Firebase console — there's no self-service signup anywhere.

## Content loading pattern

`js/main.js` ships hardcoded default arrays (`categorias`, `galeria`, `produtos`, `depoimentos`) so
the site renders immediately and still works if Firebase is unreachable/empty. The default
`categorias` covers the full 14-type catalog (Gravação a Laser, Mouse Pad, Mochila Saco Infantil,
Bodies e Toalhinhas, Camisetas, Kit Festa na Mesa, Canecas Personalizadas, Garrafas Personalizadas,
Lembrancinhas, Mini Calendários, Cartões de Visita, Panfletos, Placas Pix, Tags) with at least one
matching `produtos` entry each. It then does a one-time `arcDb.ref('siteConfig').once('value')`
fetch and, for each child node that exists,
replaces the corresponding array and re-renders just that section. There is no realtime listener on
the public site — admin changes need a page reload on `index.html` to show up. The quote modal
writes directly to `orcamentos` with `arcDb.ref('orcamentos').push().set(...)` and does not read it
back.

`js/admin.js` is the CRUD side: realtime listeners (`on('value')`) on the four `siteConfig` children
plus `orcamentos`, with one-time seeds (`SEED_GALERIA`, `SEED_PRODUTOS`, `SEED_DEPOIMENTOS`,
`SEED_CATEGORIAS`) written only if those `siteConfig` nodes don't exist yet — matching the same
default content baked into `js/main.js` (`orcamentos` is never seeded — it only ever contains real
visitor submissions). Create/edit for the three `siteConfig` content types (`galeria`, `produto`,
`depoimento`) always happens in one shared modal (`#formModalOverlay` / `openFormModal(context,
existing)`), which shows/hides its categoria select, foto upload, and texto fields based on
`context` — `galeria` and `produto` both show the categoria select, since both feed the unified
catálogo. Delete always goes through the confirmation modal (`#confirmModalOverlay` /
`openConfirmModal(message, onConfirm, opts)`) instead of `window.confirm`. `opts.title` /
`opts.confirmLabel` let a caller customize the modal's heading and confirm-button text (defaults are
"Confirmar exclusão" / "Excluir") — used by the "Zona de perigo" reset button below, which needs a
non-delete-flavored prompt on the same shared modal. Photo uploads (`galeria`, `produtos`) are
resized client-side to compressed JPEG data URLs via `resizeImage()` (canvas-based) before being
written to the database — there is no Firebase Storage usage anywhere, images are stored inline as
base64 strings.

The bottom of the admin panel has a "Zona de perigo" block (`#resetCatalogoBtn` in `js/admin.js`)
that overwrites `siteConfig/categorias`, `siteConfig/produtos`, and `siteConfig/galeria` with
`SEED_CATEGORIAS` / `SEED_PRODUTOS` / `SEED_GALERIA` via `.set()` (not `seedIfEmpty`, so it
overwrites existing data unconditionally) — this is how an already-populated production database
gets the full 14-category catalog without manual re-entry. It does not touch `depoimentos` or
`orcamentos`. Gated behind the shared confirm modal with an explicit warning, since it discards any
manually added/edited categories, products, or gallery photos.

Note: production Firebase data written before this catálogo redesign only has a handful of the 14
categorias above and `produtos` without a `categoria` field — `seedIfEmpty` does not touch nodes
that already exist, so the full category/product list above only applies to a fresh database. Add
the missing ones through the admin panel (Categorias → "+ Nova categoria", Produtos → "+ Novo
produto") to bring an existing site up to date.

## Section visibility (Configurações)

`siteConfig/settings` is a single object (not a list) — `{ catalogo, portfolio, comoFunciona,
depoimentos, ctaFinal }`, all booleans (`SETTINGS_DEFAULTS` in `js/admin.js`). Four of the five
default to `true` when absent (opt-out: `s[key] === false` hides in `applySettings()` in
`js/main.js`) — `portfolio` is the one exception and defaults to `false`/hidden (opt-in:
`s.portfolio === true` is required to show it), since the `#catalogGallery` "ver todos" block
duplicates the per-category photo browsing the cards already provide and was turned off by request.
`index.html` also hardcodes `style="display:none"` on `#catalogGallery` and `#catalogViewAllWrap` so
they stay hidden even before the Firebase fetch resolves — `applySettings()` only flips them visible
if `siteConfig/settings/portfolio` is explicitly `true`. The admin panel's "Configurações" block
(first block in `admin.html`, above Categorias) has one checkbox per key — the portfolio one starts
unchecked to match — and each `change` event writes straight to `siteConfig/settings/{key}` with no
separate save step. `portfolio` only matters when `catalogo` itself is visible (the sub-block lives
inside that section). `applySettings()` runs once after the `siteConfig` fetch resolves (inside the
same `.then()` as the content-array overrides) and toggles `element.style.display` on `#catalogo`,
`.how`, `.testimonials`, `.final-cta`, `#catalogGallery`, and `#catalogViewAllWrap` — the header,
hero, and footer are not toggleable.

Each `.config-toggle` checkbox is still a real `<input type="checkbox">` (so screen readers, keyboard
`Tab`/`Space`, and the existing `el.checked` reads in `js/admin.js` all keep working unchanged) but
`css/admin.css` restyles it into an iOS-style pill switch via `appearance:none` + a `::after` thumb
that translates on `:checked` — no separate JS toggle-state or extra markup needed. The label text is
wrapped in a `<span>` (`admin.html`) so flexbox can put it on the left and the switch on the right
(`justify-content:space-between`) instead of the old inline-checkbox-then-text layout. File inputs
(`itemFoto` in the shared item modal, `heroPhoto1`..`heroPhoto4`) are restyled the same way — the
input itself is transparent/borderless and only its `::file-selector-button` (+ `-webkit-` fallback)
is styled as a pill button matching the rest of the UI, replacing the OS-default "Choose file"
button. Both are pure-CSS, no HTML structure changes beyond the toggle's `<span>` wrap.

## Hero images and placeholder photo volume

`siteConfig/settings` also holds `hero1`..`hero4` (base64 data URLs, same `resizeImage()` pipeline
as `produtos`/`galeria` photos) — the 4 images in the hero's `.hero-grid` (`#heroImg1`..`#heroImg4`
in `index.html`). Admin manages them via `.hero-photo-row` rows (`admin.html`, one per photo, stacked
vertically — `.hero-photo-list{ flex-direction:column }`), each with a thumbnail, a file input, and a
"Remover" button. Uploading (`change` on `heroPhoto{n}`) resizes and writes straight to
`siteConfig/settings/hero{n}`, no separate save step. "Remover" (`heroPhoto{n}Remove` in
`js/admin.js`) goes through the shared confirm modal, then `arcDb.ref('siteConfig/settings/hero{n}').remove()`
— after that, `applySettings()` in `js/main.js` has nothing to override for that slot, so the `<img>`
just keeps whatever `src` is already hardcoded in `index.html` (the default picsum placeholder).
`applySettings()` only ever *sets* a hero `<img src>` when the corresponding `hero{n}` key is
present in the fetched settings — it never explicitly resets one, so "no key" and "default photo"
are the same state by construction. `renderSettings()` shows a "Padrão" placeholder thumbnail
(`.form-thumb-empty`) and hides the "Remover" button whenever a slot has no uploaded photo.

Both `js/main.js` and `js/admin.js` build their placeholder `galeria` data (12 photos per category,
`PLACEHOLDER_PHOTOS_PER_CATEGORY`) from a shared-in-spirit (duplicated per file, since they don't
share a module system) `CATEGORY_SLUGS` map + a small generator function (`buildPlaceholderGaleria()`
/ `buildSeedGaleria()`) rather than 168 hand-written literal objects — if you add/rename a category,
update `CATEGORY_SLUGS` in *both* files (they must stay in sync) rather than editing generated data
directly. These are pure filler picsum photos for demoing the "Ver fotos" grid and the tab-filtered
portfolio grid; real sites should replace them with actual product photos via the admin panel.

## Lightbox navigation and the quote item picker

The lightbox (`#lightbox` in `index.html`) now takes an image list + index instead of a single
image: `openLightbox(images, index)` in `js/main.js` stores both in module state (`lightboxImages`,
`lightboxIndex`) and `lightboxPrev()` / `lightboxNext()` wrap-around through that list, wired to
`#lightboxPrev` / `#lightboxNext` buttons plus `ArrowLeft` / `ArrowRight` / `Escape` keydown
handlers. Both photo sources feed it correctly-scoped lists: `openCatalogExpand(cat)` passes only
that category's photos (so "the ones beside it" are the same category, not the whole catalog), and
`attachLightboxHandlers(allImgs)` in the `#catalogGallery` grid filters `allImgs` down to whatever
is currently visible under the active tab before indexing, so prev/next never lands on a
tab-filtered-out (hidden) photo. `.lightbox` is `z-index:240`, above `.catalog-expand` (`210`) and
`.quote-modal` (`220`) — it previously sat *below* `.catalog-expand` at `z-index:200`, which was the
"photo opens behind the modal" bug; always keep the lightbox's z-index higher than anything that can
open it.

`#catalogExpandGrid` (the photos inside "Ver fotos") is a responsive CSS grid
(`repeat(auto-fill, minmax(120px, 1fr))`), not a horizontal scroller — it used to be a flex row with
`overflow-x:auto`, but that read as an ugly slider and hid most of a category's photos off-screen.
The grid wraps as many photos as fit per row and lets `.catalog-expand-panel` (which already had
`overflow-y:auto`) handle any overflow with a normal vertical scroll, so many photos are visible at
once without deliberately scrolling sideways.

The quote modal's item selector (`#quoteItemPicker`) replaced a `<select>` + qty input + "Adicionar"
button + separate added-items list with a single scrollable list of every product (thumbnail + name
+ a `− N +` stepper each), state-driven by one `quoteQuantities` object (`{ [productName]: qty }`)
in `js/main.js`. Clicking `+`/`−` mutates that object directly and calls `renderQuoteItemPicker()` to
redraw the whole list — there's no separate "add" step or removable-chip list; a product is "in the
order" simply by having qty > 0, and its row gets a `.selected` highlight. On submit,
`Object.entries(quoteQuantities)` becomes the `itens` array. `openQuoteModal(cat)` pre-sets
`quoteQuantities[repName] = 1` when opened from a category context.

The quote modal also has a secondary "Ir direto para o WhatsApp" link (`#quoteWhatsappBtn`) beside
the submit button, for visitors who'd rather not wait for a callback. It builds a `wa.me` message
from the current `quoteQuantities` + the observações textarea and opens it in a new tab
(`window.open`, not a same-tab navigation) — it does not submit the form or write to `orcamentos`,
it's purely an alternate contact path.

`.quote-modal` no longer scrolls the overlay itself (`overflow:hidden`, `align-items:center`) —
only `.quote-modal-panel` scrolls (`max-height: calc(100vh - 48px)`, full-bleed `100vh` on mobile
via a `max-width:600px` media query), so there is exactly one scroll container for the whole modal
instead of the overlay and the panel both being scrollable at once (which read as a broken/janky
double scroll). `#quoteItemPicker` still has its own bounded `max-height:240px` internal scroll for
the product list specifically — that's intentional (keeps name/phone/observações/buttons always
in view without the list pushing them off-screen), not a second competing scroll region, since it
doesn't grow past that height and the panel scrolls around it as one unit.

## Custom scrollbar styling

`.scroll-thin` (in `css/style.css`, near the top with the other global utilities) is a small
cross-browser thin-scrollbar utility (`scrollbar-width:thin` + `::-webkit-scrollbar` rules) using
`var(--line)` normally and `var(--accent)` on hover, so it themes with light/dark mode. Apply it to
any element that gets `overflow-y:auto`/`overflow-x:auto` on the public site — it's already on
`.catalog-expand-panel`, `.quote-modal-panel`, and `#quoteItemPicker`. Default browser scrollbars
look out of place against this design, so don't add a new scrollable container without it.

## Anchor scroll offset

`#inicio`, `#catalogo`, and `#contato` all have `scroll-margin-top: 90px` in `css/style.css`. Without
it, clicking a nav link (`.site-header` is `position:sticky`) lands the target's top edge exactly at
viewport y=0, so the ~70px-tall sticky header ends up covering the first bit of the section — most
noticeably `#inicio`, where the header would sit on top of the hero eyebrow/title. `scroll-margin-top`
tells the browser to stop short of that, leaving the header (plus a little breathing room) clear of
the content. Any new section used as a scroll/nav target should get the same treatment.

## Theming

Light/dark theme, all colors are CSS custom properties in `css/style.css` `:root` and
`:root[data-theme="dark"]` (`--accent` is the ARC gold). `css/admin.css` reuses those same
variables so the admin panel matches the public site's palette — every previously hardcoded `#fff`
background (login card, admin header, inputs, `.config-item`, `.modal`) was switched to `var(--surface)`
/ `var(--header-bg)` so `admin.html` respects dark mode instead of showing white-on-white.
