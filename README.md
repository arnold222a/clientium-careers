# Clientium: careers page (Social Media Manager & Content Creator)

Static recruiting landing page for Clientium, hosted on GitHub Pages.
Structure modeled on the role pages of consulting.com/careers (see `REFERENCE-STRUCTURE.md`),
with original copy in Italian plus a short English summary.

Live: https://arnold222a.github.io/clientium-careers/

## Files
```
index.html               single page, all sections
css/styles.css           styles (mobile-first, no framework)
js/main.js               form -> mailto, success state, FAQ accordion, sticky mobile CTA, scroll reveal
assets/                  og-image.png, favicon.svg (see assets/README.md)
REFERENCE-STRUCTURE.md   notes on the reference page structure
```

No build step. Open `index.html` locally or run `python3 -m http.server` in this folder.

## Application form
There is no backend. On submit the form is validated in the browser, then a `mailto:` link opens
the candidate's email client with everything prefilled, addressed to `arnold@clientium.it`,
and the page shows a success state with a "Copia il testo" fallback.

To change the recipient, edit `TO` at the top of `js/main.js` (and the visible email addresses in `index.html`).

### Wiring a real form service later
mailto depends on the candidate having a mail client configured, so a form service is more reliable.

**Formspree**
1. Create a form at https://formspree.io and copy its endpoint (`https://formspree.io/f/xxxxxxx`).
2. In `index.html` add `action="https://formspree.io/f/xxxxxxx" method="POST"` to `<form id="apply-form">`.
3. In `js/main.js`, inside the submit handler, replace the `mailto` lines with:
   ```js
   fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
     .then(function (r) { if (!r.ok) throw new Error(); showSuccess(); })
     .catch(function () { errorBox.textContent = 'Invio non riuscito, riprova o scrivi ad arnold@clientium.it'; errorBox.hidden = false; });
   ```
   (move the three lines that hide the form and show `#form-success` into a `showSuccess()` function,
   and update the success copy since no mail client opens anymore).

**Tally**
1. Build the same fields in https://tally.so and publish.
2. Replace the `<form>` block with Tally's embed snippet (iframe + `https://tally.so/widgets/embed.js`),
   or simply point the "Candidati" buttons to the Tally URL.

No API keys or secrets are needed for either option. The Formspree endpoint is public by design.

## Deploy
GitHub Pages, branch `main`, folder `/` (root). Every push to `main` redeploys.
