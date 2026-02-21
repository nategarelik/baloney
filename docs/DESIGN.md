# Baloney — Design System

> This document is the single source of truth for all visual and UX decisions on the Baloney website. Every design choice made here has a reason. Read it before touching the frontend.

---

## Brand Ethos

Baloney is an anti-AI company. Its product detects synthetic, machine-made content — so its own presence must feel unmistakably human. The design should feel like something a person made: textured, lived-in, slightly imperfect, warm. Not curated. Not algorithmic. Not corporate.

The aesthetic draws from the era just before phones took over — handwritten notes, worn paperback covers, Sunday newspaper, kitchen table conversations. There is nostalgia here, but not kitsch. The goal is to feel *real* in a world that increasingly isn't.

This still is a tech product. The design lives in the tension between that warmth and a clean, functional tool. It should never tip into scrapbooking or chaos. Think: a thoughtful independent bookshop that also happens to have great wifi.

---

## Tagline Options

Primary (current): **"Tell What's Baloney"**
Sub-headline (current): *"Your all-purpose truth verifier."*

Alternatives worth considering:
- *"The internet, fact-checked."*
- *"Built for people who still trust their gut."*
- *"Spot the fake. Keep the real."*
- *"Your feed, filtered for reality."*

---

## Color Palette

All colors are fixed. Do not introduce new colors without updating this document.

| Name          | Hex       | Usage |
|---------------|-----------|-------|
| **Base**      | `#f0e6ca` | Page background. Warm off-white, like aged paper. Primary surface for all content. |
| **Base Dark** | `#e6d9b8` | Subtle surface variation. Cards, code blocks, section dividers. |
| **Primary**   | `#d4456b` | Pink-red. Main action color. Buttons, active states, key highlights. |
| **Secondary** | `#4a3728` | Deep warm brown. All body text, headings, borders, and icons. Never pure black. |
| **Accent**    | `#e8c97a` | Warm gold. Used *sparingly*. Highlight words, picture frames, decorative lines. Never fills or backgrounds. |

**Opacity usage:**
- `secondary/60` — muted text, inactive nav links, captions
- `secondary/10` — subtle section borders, card edges
- `primary/90` — button hover state
- `primary/15` — tinted backgrounds when needed

**Legacy colors** (`navy`, `navy-light`, `navy-lighter`) remain in the codebase for the existing dashboard and feed pages, which have not been rebranded yet. Do not use them on new pages.

**Scrollbar:** thumb `#c4b694`, track `#f0e6ca`.

---

## Typography

### Fonts in Use

| Role        | Font        | Source       | CSS Variable                      |
|-------------|-------------|--------------|-----------------------------------|
| **Display** | Young Serif | Google Fonts | `--font-display` / `font-display` |
| **Body**    | DM Sans     | Google Fonts | `--font-body` / `font-body`       |

**Why Young Serif:**
Young Serif is a contemporary serif with visible ink traps and a slightly hand-pressed quality to its strokes. It references letterpress printing — something made by a person with physical tools — without being illegible or theatrical. It's in the spirit of Campana Script, Skia, and Trattatello but is commercially usable and highly legible at display sizes. It works naturally against the warm Base background. Use it for all headlines, the logo wordmark, and page section titles.

**Why DM Sans:**
DM Sans is a geometric sans-serif designed for digital readability. It's neutral enough not to compete with Young Serif, but has just enough warmth in its letterforms to avoid feeling cold or corporate. It is the workhorse: all body copy, UI labels, captions, button text, nav links.

### Type Scale

| Element              | Font        | Size                    | Weight  | Notes                          |
|----------------------|-------------|-------------------------|---------|--------------------------------|
| Hero headline        | Young Serif | `text-5xl` / `text-6xl` | 400     | `leading-[1.1]`                |
| Section heading      | Young Serif | `text-3xl`              | 400     |                                |
| Sub-heading          | Young Serif | `text-xl`               | 400     |                                |
| Logo wordmark        | Young Serif | `text-xl`               | 400     | In navbar                      |
| Body copy            | DM Sans     | `text-base` / `text-lg` | 400     | `leading-relaxed`              |
| UI labels / nav      | DM Sans     | `text-sm`               | 500–600 |                                |
| Captions / footnotes | DM Sans     | `text-xs` / `text-sm`  | 400     | `secondary/60`                 |
| Buttons              | DM Sans     | `text-sm` / `text-base` | 600     |                                |

**Rules:**
- Young Serif is display only. Never use it for body copy, labels, or anything below `text-xl`.
- Do not bold Young Serif. It is designed at weight 400 and looks best there.
- Line length for body text: max ~65 characters. Use `max-w-xl` or `max-w-2xl` containers.
- Minimum body size: `text-base` (16px). Never smaller for readable prose.

### Natural / Handwritten Accents

These are the "human texture" layer. Use them sparingly — one or two per page maximum. They are details, not features.

| Technique                     | Implementation                                            | When to Use                          |
|-------------------------------|-----------------------------------------------------------|--------------------------------------|
| **Hand-drawn underline**      | `<HandDrawnUnderline>` SVG with `animate-draw-on` (0.4s) | Active nav link only                 |
| **Accent word highlight**     | `<span style={{ color: '#e8c97a' }}>`                     | 1–2 key words in hero/section titles |
| **Picture frame**             | Organic SVG or styled border in accent gold               | Hero section image only              |
| **Rough underline on headlines** | SVG path underneath a word in a section heading        | Sparingly, one per page              |
| **Ink/texture overlay**       | `mixBlendMode: "multiply"` on logo images                 | Navbar and footer logo only          |

Do not use handwriting/script fonts for any UI text. The handmade feeling comes from SVG accents and the texture of Young Serif, not from fake-cursive typefaces.

---

## Assets

| File                           | Path                                                  | Usage                                     |
|--------------------------------|-------------------------------------------------------|-------------------------------------------|
| Pig logo                       | `frontend/public/baloney.png`                         | Navbar, footer                            |
| Pig logo (favicon)             | `frontend/src/app/icon.png`                           | Browser tab (Next.js auto-detects)        |
| Mona Lisa hero                 | `frontend/public/mona_lisa_pig.png`                   | Landing page hero background              |
| Hand-drawn underline component | `frontend/src/components/HandDrawnUnderline.tsx`      | Active nav link indicator                 |

**Logo description:** Pig face. Off-white body. Pink nose and ears. Black outline. Brown monocle. The monocle is the key detail — smart, slightly pompous about truth, a little funny. This is the brand's personality in one image.

**Logo rendering:** Always use `mixBlendMode: "multiply"` when placing the logo on the Base background. This makes the off-white of the pig transparent, showing only the outline and details. Without it, the logo renders with a white bounding box artifact.

---

## Component Patterns

### Navbar

**Behavior:** Fixed. Floating pill shape. Centered horizontally. 16px (`top-4`) from the top of the viewport. Does not touch viewport edges (`px-6` outer wrapper).

**Visual:** Frosted glass. `background: rgba(240, 230, 202, 0.65)`. `backdropFilter: blur(16px)`. Bevel effect via layered inset box-shadows — light highlight on top-left edge, dark shadow on bottom-right edge. `border-radius: 1rem`. Border: `1px solid rgba(74,55,40,0.1)`.

**Contents left → right:**
1. Pig logo (`h-9 w-9`, multiply blend) + "Baloney" in Young Serif `text-xl text-secondary`
2. Nav links: "Product", "AI Tracker" — DM Sans `text-sm font-medium`. Active = full `text-secondary` + `HandDrawnUnderline` below. Inactive = `text-secondary/60`.
3. CTA button: "Get Baloney for Free" — pink pill with 3D bevel. Links to `CHROME_STORE_URL` constant.

**Page body offset:** Add `.page-top-offset` (`padding-top: 6rem`) to all page `<main>` elements to prevent content from hiding behind the fixed nav.

---

### Primary Button (Pink CTA)

**Shape:** Fully rounded pill (`rounded-full`). Never square corners on primary CTAs.

**Color:** `bg-primary text-white`. Hover: `bg-primary/90`.

**3D Effect (`.btn-primary-3d`):**
- Inset top highlight: light edge simulating light hitting the top face
- Inset bottom shadow: dark edge simulating the underside
- Outer glow in primary pink
- Active (pressed): `translateY(1px)`, reversed insets to simulate physical depression

**When to use:** Primary CTA actions only — "Try Free Now", "Get Baloney for Free", "Install Extension". Not for secondary actions or data interactions.

---

### Secondary / Ghost Button

**Shape:** Rounded pill. `border-2 border-secondary/20`. No fill. `text-secondary`.

**Hover:** `hover:bg-secondary/5`.

**When to use:** Secondary actions — "Learn More", "See How It Works".

---

### Cards / Surfaces

New pages use Base-toned surfaces. Card treatment: `bg-base-dark` or `bg-secondary/5`, with `border border-secondary/10`. No heavy drop shadows — subtle, like paper resting on paper. Never apply navy-toned card styles to rebranded pages.

---

## Page Layouts

### Landing Page (`/`)

**Section 1 — Hero:**
Full viewport height. `mona_lisa_pig.png` as full-bleed background (`object-cover`, `object-center`). Left-to-right gradient overlay (Base at 88% opacity fading to transparent at 70%) keeps the left readable while the image shows on the right. Content left-aligned in `max-w-lg`:
- Young Serif headline: "Tell What's Baloney"
- DM Sans sub-headline at `text-secondary/75`
- Pink 3D pill CTA → Chrome Web Store

The Mona Lisa image has an organic, hand-drawn-style frame in accent gold at 5:3 aspect ratio. The pig face replacing the Mona Lisa's head is the brand's central visual joke — examining art for authenticity.

**Section 2 — Social Proof / Screenshots:**
Full-width pink section (`#d4456b`). Cream text on pink. Accent-gold highlighted words in headings.
- Young Serif heading: "Know What's Real on Social Media"
- 2× placeholder screenshot cards (16:9 `aspect-video`) for extension-in-use on X and LinkedIn
- Swap placeholders with real screenshots when available

**Section 3 — How It Works:**
Returns to Base background. Centered. Young Serif heading. Brief DM Sans copy. Ghost button → `/product`.

**Footer:**
Centered. Pig logo (`h-12 w-12`, multiply blend). "Built at MadData26 · UW–Madison Data Science Hackathon · Feb 2026" in `text-secondary/40`.

---

### AI Tracker Page (`/tracker`)

**Purpose:** Public dashboard showing AI content detection rate over time, by platform and content type. Data sourced from Supabase, aggregated across all Baloney Chrome extension users. No login required.

**Platform Tabs:** X (default), LinkedIn, Substack. Plain text links. Active tab: full opacity + `HandDrawnUnderline`. Inactive: `text-secondary/40`. No background fills — only opacity and the underline distinguish state.

To add a new platform: add an entry to `TRACKER_PLATFORMS` in `constants.ts` and ensure `/api/analytics/tracker` handles the new `platform` value.

**Per-platform — 3 collapsible sections:**
- Text Detection
- Image Detection
- Video Detection

Each section expands to a Recharts `AreaChart`. X-axis: date. Y-axis: AI detection rate (0–100%). Themed with `TRACKER_CHART_COLORS` (pink line on warm grid, cream tooltip). Below each chart: a placeholder footnote for editorial context — fill in manually.

**Data endpoint:** `GET /api/analytics/tracker?platform={x|linkedin|substack}&content_type={text|image|video}&days=30` → `TrackerResponse`. Aggregates from `daily_snapshots` table in Supabase.

---

### Product Page (`/product`)

Full feature explanation and extension walkthrough. Not yet built. All Chrome Store links use the `CHROME_STORE_URL` constant (currently pointing to the Chrome Web Store root) until the extension is published.

---

## Do / Don't

| Do                                               | Don't                                             |
|--------------------------------------------------|---------------------------------------------------|
| Use Young Serif for all headlines                | Bold Young Serif or use it for body copy          |
| Use `mixBlendMode: "multiply"` on the pig logo   | Render logo without it (white box artifact)       |
| Use hand-drawn SVG underlines sparingly          | Use cursive/script fonts for any UI text          |
| Keep accent gold to 1–2 uses per page            | Use accent as a background fill or main color     |
| Use `text-secondary` (brown) for all text        | Use pure black or pure white for text             |
| Pill CTAs (`rounded-full`)                       | Square or sharp-cornered primary buttons          |
| Subtle paper-like card surfaces                  | Heavy drop shadows or floating card stacks        |
| One primary CTA per section                      | Multiple competing pink buttons on the same screen|
| Link all installs to `CHROME_STORE_URL` constant | Hardcode Chrome Store URLs in multiple files      |
| New pages use Base palette                       | New pages use navy/dark palette                   |

---

## Source Files

| File | Purpose |
|------|---------|
| `frontend/tailwind.config.js` | Brand color tokens and font family definitions |
| `frontend/src/app/globals.css` | CSS variables, `.btn-primary-3d`, `.animate-draw-on`, scrollbar |
| `frontend/src/app/layout.tsx` | Font loading (Young Serif + DM Sans), page metadata |
| `frontend/src/components/Navbar.tsx` | Floating glass navbar |
| `frontend/src/components/HandDrawnUnderline.tsx` | SVG squiggle underline component |
| `frontend/src/lib/constants.ts` | `BALONEY_COLORS`, `TRACKER_CHART_COLORS`, `TRACKER_PLATFORMS`, `CHROME_STORE_URL` |
| `frontend/src/app/page.tsx` | Landing page |
| `frontend/src/app/tracker/page.tsx` | AI Tracker dashboard |
| `frontend/src/app/tracker/TrackerChart.tsx` | Recharts area chart for tracker |
| `frontend/src/app/product/page.tsx` | Product page |
| `frontend/public/baloney.png` | Pig logo asset |
| `frontend/public/mona_lisa_pig.png` | Hero background image |
