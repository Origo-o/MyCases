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

`index.html#causelist`, `#allcases`, `#nip`, `#disposed`, `#nakal`, `#billing` … open that
screen directly, and the current screen is kept in the address bar. This is what the launcher
shortcuts in `manifest.webmanifest` point at.

## Disposed (शब्दांकन रद्द / shredded) cases

A case can be flagged **Disposed** when its physical file has been destroyed. The flag is
deliberate, not a status dropdown: marking a case writes a permanent entry into a disposal
register and hides the file from the working screens.

* Marking: **All Cases** row → 🗑️, the case window, the edit form, the Disposed screen
  (single or **🧺 Bulk** — paste CNR numbers, or take every case decided on/before a date),
  or from a No Instruction Pursis (🗑️).
* Each entry records disposal date, mode (Shredded / Returned to Client / Burnt / Court Record
  Room / e-Filing deleted / Other), file + page count, reason, authorisation and remarks.
  Tick *clear the next hearing date* to drop a stale listing at the same time.
* Effect: `getStatus()` returns `disposed`, the row gets a red badge and strikethrough, and the
  case leaves the cause list, court-card counts, home stats and the pending-fee filter. It stays
  in All Cases, search and the case record.
* Printing: **🖨️ Print List** is an A4 register (landscape or portrait, From/To date filter,
  one row per case, totals, certification block and signature line); **🖨️ One-page Summary**
  groups the same entries by year and mode as a certificate of records destroyed; 🖨️ on a single
  row prints a disposal memo for the file.
* **♻️ Restore** reverses a disposal on a live case (the register entry is removed, and the
  removal is written to the audit trail). Deleting a case never deletes its register entry, so
  the proof of destruction survives.

Keys: `cases_v2` (flag + `disposal` object) and `disposedRecV1` (the register).

## No Instruction Pursis (NIP)

For clients who stop attending and stop giving instructions: a numbered notice, sent from the
app, with a record of every one issued.

* Pick a matter by CNR / party / case number (or paste the reference on any other screen and
  press `Enter` or use **📪 Pursis**) — the client (मराठी नावासह), court, case line, parties,
  last and next date, pendency days, notes, fee position and pending documents are pulled from
  MyCases and shown side by side.
* Built-in templates: मराठी अंतिम सूचना, English final notice and a Court Pursis (a पेशीस
  slip to file); the Marathi one warns that the file is due for shredding after the reply date.
  Reference numbers auto-increment as `NIP/ICH/YYYY/NNN` (prefix editable in ⚙️).
* **🖨️ Print/PDF** (A4, own window), **💬 WhatsApp** to the client's number with the notice text,
  📋 copy, ⬇️ .html, and a history list with 🖨️ per notice. **🗑️** hands the matter to the
  disposal dialog with the reason pre-filled.
* **Your own HTML**: *Import my HTML* takes a pasted file, upload or local path and stores it as a
  template — styles kept. `{{token}}` placeholders are filled from the selected case, and 🔍
  reports which fields your page uses before you save.
  Tokens include every raw case column plus `{{caseTitle}} {{client}} {{clientMr}} {{respondentMr}}
  {{courtMr}} {{advocate}} {{days}} {{fromDate}} {{replyBy}} {{noticeNo}} {{docsBlock}}
  {{remarkBlock}} {{note1}} {{note2}}` … with filters `|raw |date |longdate |upper |bold |dotted`.
  To drive the screen from a page kept outside the app, use `window.NIP` (`cases()`, `search()`,
  `find()`, `tokens()`, `select()`, `preview()`, `print()`, `whatsapp()`, `save()`, `disposed()`,
  `dispose()`, `merge()`) or post `{nip:'cases'|'select'|'print'|'save'|'whatsapp'|'preview'}`
  messages; ⚙️ → *Use my own NIP page* embeds that page in the tab and feeds it the case data.
* Records, templates and settings sync like everything else: `nipRecV1`, `nipTplV1`, `nipSetV1`,
  included in the cloud snapshot, in 🔧 Backup / Restore and re-rendered on a remote change.
* Printing the register: **🗂️ Print Register** on the NIP screen lists notices sent with dates,
  channel used and the reply deadline.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | the whole application |
| `manifest.webmanifest` | installable web app: name, icons, theme, shortcuts |
| `icon.svg` | favicon + maskable app icon |
| `icon-192.png`, `icon-512.png` | launcher / home-screen icons |
