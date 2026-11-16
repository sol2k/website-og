# Design System | Solace Society

> Visual and motion tokens. Any new page or component must use these.

## Palette

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#12100d` | Page background |
| `--ink-2` | `#1a1712` | Raised surfaces, footer, modals |
| `--ink-3` | `#242019` | Hover surfaces |
| `--paper` | `#f4efe6` | Primary text |
| `--paper-dim` | `#cfc7b8` | Lede paragraphs |
| `--muted` | `#a89f8d` | Captions, meta, footer body |
| `--gold` | `#af915f` | Hairlines, accents, decorative |
| `--gold-mid` | `#d9bc85` | Eyebrows, links, highlights |
| `--gold-hi` | `#f7e7c3` | Gradients, buttons, stat numerals |
| `--line` | `rgba(175,145,95,.22)` | Borders |
| `--line-soft` | `rgba(244,239,230,.1)` | Subtle dividers |

Rules: warm near-black, never pure `#000`; gold is ≤10% of any screen; no other hues except imagery.

## Typography

- **Display:** Cormorant Garamond 500, H1 `clamp(2.6rem,6.4vw,5.4rem)`, H2 `clamp(2rem,4.4vw,3.4rem)`, tight leading (1.12).
- **UI/body:** Jost 300, 17px/1.7 body; letterspaced (0.3em+) uppercase for eyebrows, buttons, nav, meta (12–19px, weight 400).
- No other typefaces. No italics except pull-quotes.

## Signature components

- **Eyebrow:** gold small-caps + 44px gold rule on the left.
- **Buttons:** 1px gold outline, letterspaced uppercase, gold sweep fill on hover; one primary CTA per screen.
- **Experience cards:** 3:4 imagery, bottom-anchored serif title, thin gold `frame` that expands 14→20px on hover.
- **Quote bands:** italic Cormorant pull-quote, centered, `cite` in eyebrow style.
- **FAQ:** gold plus-ring rotating to × when open; one open at a time.
- **Globe section:** radial gold glow on `--ink`, dotted earth, `globe-hint` caption below.

## Motion

- Entrance: `opacity + translateY(28px) scale(.985)`, 900ms, `cubic-bezier(.22,1,.36,1)`, staggered via `--d` custom property.
- Hero lines rise from `translateY(110%)` with 140ms stagger.
- Infinite marquee 46s linear; pauses on hover.
- UI hover/press ≤300ms, transform/opacity only. Everything degrades under `prefers-reduced-motion`.

## Layout

- Containers: `.wrap` 1200px, `.wrap-wide` 1440px, `100% - 48px` gutters.
- Section rhythm: `clamp(84px, 11vw, 150px)` vertical padding.
- Grid: 12-column intent via 3/4-col card grids; 1px-gap hairline grids for pillars/contact tiles.
- Breakpoints: 960/860/720/580px collapses as coded in `style.css`. Mobile-first source order.

## Logo usage

- `logo-full.svg`, footer, about pages, dark backgrounds only.
- `logo-mark.svg`, favicon, touch icon, header (34px inline), OG image.
- Never recolor, outline, or set the wordmark on light backgrounds (a light variant may be added to `assets/img/` if ever needed).
- Clear space: crown height on all sides. Minimum wordmark width 180px.

## Imagery

AI-generated cinematic editorial photography; warm golden-hour palette; filter `saturate(.92)` on cards. Alt text mandatory (SEO + a11y). Hero images ≤ 250 KB, cards ≤ 400 KB, progressive JPEG.
