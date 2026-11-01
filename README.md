# Java Ray’s

A responsive, four-page coffee shop website built with HTML, CSS, and vanilla JavaScript. It includes a drinks menu, photos, reviews, an About Us page, and local hours and directions.

## Preview

Open `index.html` directly, or use Node.js:

```sh
npm run dev
```

Visit http://127.0.0.1:4173. No package installation is needed.

For VS Code Live Server, run `npm run build` first. The workspace settings serve `dist/` on localhost; restart an already-running Live Server after changing these settings.

## Files

- `index.html`: homepage, photos, reviews, menu overview, location.
- `menu.html`: filterable drinks menu and original menu photos.
- `about.html`: Ray, the local stand, and customer accounts, with supplied photographs.
- `visit.html`: map, local opening status, hours, phone, directions, FAQs.
- `styles.css`: shared responsive styles and reduced-motion support.
- `script.js`: navigation, category filters, photo dialogs, Nampa opening hours.
- `animations.js`: Motion entrances, scroll reveals, filter updates, and dialog transitions. Supports reduced motion, interrupted interactions, and missing-library fallbacks.
- `assets/vendor/motion.js`: the locally bundled Motion Mini, inView, and stagger utilities (about 11 KB). It works when HTML files are opened directly.
- `assets/`: descriptive copies of the selected original photos.

## Build

```sh
npm run check
npm test
npm run build
```

Deploy only the contents of `dist/` to a static host. The build uses an explicit list of public website files in `scripts/site-files.mjs`.

## Private source material

Original business documents, reviews, references, original photos, and internal notes are kept locally under `private/`, excluded from Git and the build. Its directories use owner-only permissions (`700`) and files use `600`. The project preview server serves only website files and blocks private files, repository metadata, and symlinks to nonpublic files.

These file permissions do not encrypt the folder. Do not upload the project root to a public host. A public GitHub repository cannot have private subfolders. Photos, review excerpts, and business details displayed on the website are public content.

The animation bundle is already included. To regenerate it after changing `scripts/motion-entry.js`, run `npm ci` followed by `npm run vendor:motion`. Node dependencies are only needed to regenerate that bundle; previewing and packaging the included files require no installation.

Phone layouts use a compact header, paired homepage actions, safe-area spacing, and a single-row drink filter. Scrolling stays native. Anchor offsets account for the sticky header and menu filters; the navigation dropdown can scroll independently on short screens. On narrow screens and touch devices, scroll reveals use a brief fade from a readable opacity, without movement or staggered delays. Reduced-motion preferences still disable animations and smooth anchor scrolling.

## Business content

Address: 5520 E Franklin Rd, Nampa, ID 83687. Phone: (208) 713-2248. Hours: Monday–Friday, 6 AM–noon; Saturday and Sunday closed. Opening status uses `America/Boise` and accounts for daylight saving time.

The supplied overview lists 4.7/5 from 37 Google reviews. Original menu photos are low resolution; the website provides them for reference and directs customers to the stand for current prices and options. Update these details when the business changes them.

Google Fonts and Google Maps need an internet connection. The site remains readable with system font fallbacks; direct map and phone links are also provided. There is no backend, checkout, or contact form.

## About copy and research

The About page uses the supplied business details, photographs, and customer reviews. Public customer accounts at [Real Coffee Club](https://realcoffeeclub.com/place/idaho/nampa/java-ray-s) corroborate that Ray is the local owner. No founding date, detailed biography, award, or sourcing claim has been invented. Brand introduction and values are newly written editorial copy.

Motion’s [official JavaScript quick start](https://motion.dev/docs/quick-start) and [animate documentation](https://motion.dev/docs/animate) informed the framework-free integration.

The Google Maps listing and Facebook profile are the exact destinations supplied by the user. Map links use the business CID `13236034458409734493`; directions use its supplied coordinates `43.6055319,-116.5037227`. The Facebook SVG comes from the [Simple Icons repository](https://github.com/simple-icons/simple-icons/blob/develop/icons/facebook.svg).

## Basic SEO

Each page has a unique local search title, description, US English language tag, and Open Graph/Twitter sharing text. The homepage and Visit Us page include `CafeOrCoffeeShop` JSON-LD with the supplied address, phone, coordinates, weekly hours, Google Maps listing, and Facebook profile. Customer ratings are not marked up as the business’s own review rich results.

`robots.txt` permits crawling and is included in `dist/`. No website domain, canonical URL, or sitemap URL has been invented. Once a public domain is chosen, add absolute canonical and social image URLs and create a sitemap using that domain. Localhost pages cannot appear in public search results.

Structured data follows [Google’s LocalBusiness guidance](https://developers.google.com/search/docs/appearance/structured-data/local-business).
