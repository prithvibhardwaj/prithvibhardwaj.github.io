# Prithvi Bhardwaj — personal site

A single-page portfolio with a standalone contact page. Plain HTML, CSS and JavaScript; no build step.

## Structure

```
prithvi-portfolio/
├── index.html                  # Home: hero, about, experience, projects, education, skills, contact
├── contact/index.html          # Standalone contact page (same styles and script)
├── README.md
└── assets/
    ├── css/styles.css          # All styling, light and dark themes via CSS variables
    ├── js/main.js              # Animations, cursor, smooth scroll, form, clock
    ├── img/prithvi.jpg         # Portrait
    ├── Prithvi_Bhardwaj_Resume.pdf
    └── vendor/                 # GSAP 3.12.5, ScrollTrigger, Lenis 1.1.18, vanilla-tilt 1.8.1 (local copies)
```

## Preview locally

Double-clicking `index.html` works, but a local server is better (fonts and the contact page's relative links behave exactly as they will online):

```bash
cd prithvi-portfolio
npx serve .            # then open the URL it prints
# or
python -m http.server 8080
```

## Deploy

Any static host works. Three easy options:

- **GitHub Pages** — push this folder to a repo named `prithvibhardwaj.github.io` (or any repo and enable Pages on the `main` branch, root folder).
- **Vercel** — `npx vercel` from this folder, or import the repo in the Vercel dashboard. No framework preset needed.
- **Netlify** — drag the folder onto app.netlify.com/drop.

## Editing content

Everything lives in `index.html`. Sections are labelled with `<!-- ===== NAME ===== -->` comments.

- **Experience** — each role is an `<article class="xp">` with a date, title, body and tags.
- **Projects** — each card is an `<article class="proj">`. Add `wide` (4 of 6 columns) or `half` (3 of 6) to change its width. Screenshots live in `assets/img/projects/` (1280px wide JPEGs) inside a `.shot` browser frame; GoldLabel uses a `.phone` mock built from the real pictogram PNGs in `assets/img/pictograms/`, and OptiFleet uses a CSS/SVG map mock. To replace a screenshot, drop a new JPEG at the same path.
- **Hero rotating words** — edit the `<span>`s inside `.rotator`.
- **Ticker** — the tech list appears twice on purpose (the second copy makes the loop seamless).
- **Résumé** — replace `assets/Prithvi_Bhardwaj_Resume.pdf`.

## Contact form

By default the form opens the visitor's email client with the message pre-filled (no backend, nothing stored). To send messages to an inbox instead, add a Formspree (or similar) endpoint to the form tag:

```html
<form class="form" data-endpoint="https://formspree.io/f/your-form-id" novalidate>
```

The script then POSTs JSON to that URL and shows a success or failure message inline.

## Theme

Dark by default. The moon/sun button toggles light mode and remembers the choice in `localStorage`. Colours are CSS variables at the top of `styles.css`; change `--accent` to recolour the whole site.

## Accessibility and performance notes

- Respects `prefers-reduced-motion`: animations, the custom cursor, smooth scrolling and the particle canvas are all disabled.
- Works without JavaScript: the `no-js` class on `<html>` makes every reveal-on-scroll element visible.
- The hero canvas pauses when it scrolls out of view or the tab is hidden.
- All interactive elements are keyboard reachable with a visible focus ring.
