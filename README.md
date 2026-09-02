# MyCases — Legal Suite (Adv. Indrajit Vasant Chavan)

Single-file office app for case tracking, cause lists, fees/bills, Nakal (प्रमाणित नकल)
applications and limitation calculators. Everything lives in `index.html`; data is kept in
`localStorage` and mirrored to Firebase Realtime Database.

## Running it

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Deployed through GitHub Pages (`.nojekyll` is present), so relative asset paths are used
throughout — the app works at the site root **and** under `/MyCases/`.

## Layout / responsive behaviour

The UI keeps its Windows-2000 "desktop window" look on a monitor and reflows into a
phone-shaped app on small screens. All size rules live in one block at the end of the
`<style>` sheet, marked `RESPONSIVE LAYER`, and every breakpoint query is `screen`-scoped
so printing an application or statement is never affected by the phone layout
(A4 at 96 dpi is ~794 px wide and used to trigger it).

| Condition | What happens |
| --- | --- |
| `≥ 1400px` | larger type, roomier table cells and cards, wider home grid |
| `≥ 1900px` | window is capped at 1840 px and centred, so lines stay readable |
| `≤ 900px` (or a short landscape phone) | title bar + search row stick, menu bar folds into the bottom navigation, toolbars wrap, forms go to one column, dialogs become bottom sheets |
| `≤ 620px` | every grid collapses to a single column |
| `≤ 420px` | denser home grid, smaller header/bottom-nav, no card descriptions |
| `pointer: coarse` at `≥ 901px` | tablets keep the desktop layout but get 34–38 px controls |

Phone-specific details:

* 44 px minimum touch targets; inputs render at 16 px so iOS/Safari does not
  zoom-jump on focus.
* `env(safe-area-inset-*)` padding plus `viewport-fit=cover` for notch and home bar.
* Long tables scroll sideways inside their own box and keep their header row pinned.
* The 7–11 px inline font sizes the legacy theme carries on labels and notes are
  lifted to a readable size on phones (matched via `[style*=…]` because an inline
  declaration cannot be beaten by a class rule).
* The global toolbar's secondary actions (Records, Backup, Messages, Bulk Import,
  Shortcuts, Print) fold into the **☰ Tools** sheet on phones so the sticky header
  stays one row tall.

### Deep links

`index.html#causelist`, `#allcases`, `#nakal`, `#billing` … open that screen directly, and
the current screen is kept in the address bar. This is what the launcher shortcuts in
`manifest.webmanifest` point at.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | the whole application |
| `manifest.webmanifest` | installable web app: name, icons, theme, shortcuts |
| `icon.svg` | favicon + maskable app icon |
| `icon-192.png`, `icon-512.png` | launcher / home-screen icons |
