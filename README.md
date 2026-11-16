# Solace | solacesociety.in

**A Club for the Well-Lived** · Travel · Wellness · Culture · Access

Curated luxury travel experiences, crafted for the discerning traveller.
Static multi-page website, no build step required. Deploy by serving this
repository's contents from any static web root (Hostinger `public_html`).

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home, hero, pillars, experiences, interactive 3D globe + waitlist, process, stats, FAQ |
| `experiences.html` | Signature journeys (anchored cards) |
| `about.html` | The Society, philosophy & convictions |
| `membership.html` | Membership privileges + FAQ |
| `contact.html` | Contact panels (call / WhatsApp / email) + journey enquiry form |
| `404.html` | Branded not-found page |
| `sitemap.xml` | XML sitemap with image entries |
| `robots.txt` | Crawl rules + sitemap reference |

## Structure

- `assets/css/style.css`, full design system (tokens, layout, motion)
- `assets/js/main.js`, nav, scroll reveals, FAQ accordion, counters, form validation
- `assets/js/globe.js`, Three.js dotted-earth globe (drag/swipe to rotate, tap to pin → waitlist modal; submissions hand off to WhatsApp concierge)
- `assets/js/land-data.js`, sampled landmass point cloud for the globe
- `assets/img/`, AI-generated imagery, SVG logo system, rasterised icons

## Conventions

- Canonical host: `https://solacesociety.in/`, every page carries unique title,
  meta description, Open Graph/Twitter cards, canonical URL and JSON-LD
  (Organization, WebSite, FAQPage, BreadcrumbList, Service, ContactPage).
- Concierge line: **+91 96504 70279** (`tel:+919650470279`, `wa.me/919650470279`).
- Fonts: Cormorant Garamond + Jost (Google Fonts). Three.js r160, vendored.

## Deploy notes (Hostinger)

Upload the repo contents to `public_html`. Add `sitemap.xml` to Google
Search Console after go-live. Custom 404 is picked up automatically as `404.html`.
