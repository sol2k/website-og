# SEO Strategy — solacesociety.in

> Non-branded keyword targeting, on-page rules, and schema inventory.
> Re-verify search volumes quarterly; treat this as the living map.

## Target personas & intent

1. **The celebration traveller** — honeymoon / anniversary / milestone. Intent: "luxury honeymoon destinations", "private anniversary trip".
2. **The wellness seeker** — burnout recovery, retreats. Intent: "luxury wellness retreats", "wellness travel India".
3. **The culture traveller** — food, art, access. Intent: "private cultural tours", "curated travel experiences".
4. **The status-conscious explorer** — wants what others can't access. Intent: "exclusive travel club", "private members travel club India".

## Keyword map (non-branded primary targets)

| Page | Primary keyword | Supporting keywords |
|---|---|---|
| `/` | curated luxury travel experiences | bespoke travel club, private travel club India, luxury travel concierge |
| `/experiences.html` | bespoke luxury travel destinations | private guided tours, luxury honeymoon destinations, luxury expedition travel |
| `/about.html` | private travel club philosophy | luxury travel club India, curated journeys |
| `/membership.html` | private travel club membership | travel club membership India, luxury concierge membership |
| `/contact.html` | luxury travel concierge contact | plan a private journey, bespoke travel planner |

**Long-tail capture (future Journal posts):**
- "best time to visit kyoto for autumn colours"
- "maldives overwater villa vs beach villa"
- "patagonia luxury expedition itinerary"
- "how much does a bespoke luxury trip cost"
- "private guided tours vs group tours"

## On-page rules

1. **One H1 per page**, containing the primary keyword or a close variant. Display headlines may be poetic; the H1 itself must carry keyword intent (current pages do this).
2. **Title tag:** primary keyword first, brand last, ≤ 60 chars where possible.
3. **Meta description:** 150–160 chars, one concrete detail + one invitation, no keyword stuffing.
4. **Canonical** on every page; absolute URLs; https only.
5. **Images:** descriptive alt text (write for a blind traveller, not a crawler), `loading="lazy"` below the fold, `fetchpriority="high"` on the hero only.
6. **Internal links:** every page links to Contact and at least one sibling content page with descriptive anchor text (no "click here").
7. **Anchor IDs** (`#kyoto`, `#globe`, `#faq`) are part of the sitemap of the UX — keep them stable; they are linked from other pages.

## Schema inventory (deployed)

| Page | JSON-LD types |
|---|---|
| `/` | Organization, WebSite, FAQPage |
| `/experiences.html` | Service, BreadcrumbList |
| `/about.html` | AboutPage + Organization, BreadcrumbList |
| `/membership.html` | Product (membership), FAQPage, BreadcrumbList |
| `/contact.html` | ContactPage + Organization contactPoint, BreadcrumbList |

**When adding a page,** copy the BreadcrumbList pattern and pick the matching type from schema.org. Validate every change at validator.schema.org before commit.

## Technical checklist

- `sitemap.xml` — update `<lastmod>` on every content change; resubmit in Search Console.
- `robots.txt` — keep `Allow: /` and the sitemap line; add Disallow only for real admin/staging paths.
- `.htaccess` — asset versioning via `?v=` hashes (see `scripts/version-assets.py`); HTML served `must-revalidate`, hashed assets `immutable`.
- **Page weight budget:** hero ≤ 250 KB, card images ≤ 400 KB, total first load ≤ 2.5 MB, LCP < 2.5 s on 4G.
- 404 monitoring in Search Console after launch; custom `404.html` already in place.

## Post-launch routine

1. Submit sitemap → Search Console + Bing Webmaster.
2. Request indexing for `/` and `/experiences.html` manually.
3. Set up WhatsApp Business click tracking (UTM: `?utm_source=site&utm_medium=wa_button` style) — track which sections generate concierge leads.
4. Monthly: check Coverage, Core Web Vitals, and queries gaining impressions; expand Journal content on rising queries.
