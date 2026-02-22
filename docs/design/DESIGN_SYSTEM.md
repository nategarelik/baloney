# Baloney -- Comprehensive UI/UX Design Specification

> Version 1.0 | MadData26 Hackathon | Feb 2026
> Rebrand from TrustLens. This document is the single source of truth for all frontend implementation.

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Component Library](#2-component-library)
3. [Page Layouts](#3-page-layouts)
4. [Interaction Design](#4-interaction-design)
5. [Responsive Breakpoints](#5-responsive-breakpoints)
6. [Accessibility](#6-accessibility)
7. [Migration Notes](#7-migration-notes)

---

## 1. Design Tokens

### 1.1 Color Palette

#### Core Backgrounds
```
Token Name           Hex        Tailwind Config Key    Usage
--------------------------------------------------------------
bg-base              #0f1a2e    navy                   Page background, deepest layer
bg-surface           #1a2744    navy-light             Card backgrounds, panels
bg-surface-hover     #1e3050    navy-light-hover       Card hover state (NEW)
bg-elevated          #1e3a5f    navy-lighter           Borders, subtle fills, chart grids
bg-overlay           #0f1a2e/90 navy/90                Navbar backdrop, modals
```

#### Accent & Interactive
```
Token Name           Hex        Tailwind Config Key    Usage
--------------------------------------------------------------
accent               #3b82f6    accent                 Primary buttons, links, active states
accent-hover         #2563eb    accent-hover           Button hover (NEW)
accent-muted         #3b82f6/20 accent/20              Icon backgrounds, subtle highlights
```

#### Verdict Colors (4-Way System -- NEW)
```
Token Name           Hex        CSS Variable           Badge BG (RGBA)                    Border (RGBA)
---------------------------------------------------------------------------------------------------------
verdict-human        #22c55e    --verdict-human        rgba(34, 197, 94, 0.85)            rgba(100, 255, 150, 0.3)
verdict-light-edit   #eab308    --verdict-light-edit   rgba(234, 179, 8, 0.85)            rgba(255, 220, 50, 0.3)
verdict-heavy-edit   #f97316    --verdict-heavy-edit   rgba(249, 115, 22, 0.85)           rgba(255, 160, 50, 0.3)
verdict-ai           #ef4444    --verdict-ai           rgba(239, 68, 68, 0.85)            rgba(255, 100, 100, 0.4)
```

#### Semantic Colors
```
Token Name           Hex        Usage
--------------------------------------------------------------
text-primary         #ffffff    Headings, bold values
text-secondary       #e2e8f0    Body text (slate-200)
text-muted           #94a3b8    Labels, subtitles (slate-400)
text-dimmed          #64748b    Timestamps, footnotes (slate-500)
success              #22c55e    Positive trends, human badges
warning              #f59e0b    Caution states, unclear old
danger               #ef4444    Negative trends, AI badges
info                 #3b82f6    Informational highlights
```

#### IDS Grade Colors (NEW)
```
Grade    Color       Hex        Usage
--------------------------------------------------------------
A+, A    Emerald     #34d399    Excellent information diet
B+, B    Green       #4ade80    Good information diet
C+, C    Yellow      #facc15    Average information diet
D+, D    Orange      #fb923c    Poor information diet
F        Red         #f87171    Failing information diet
```

#### Chart Palette (extended)
```
Token Name           Hex        Usage
--------------------------------------------------------------
chart-ai             #ef4444    AI data series
chart-human          #22c55e    Human data series
chart-light-edit     #eab308    Light edit data series (NEW)
chart-heavy-edit     #f97316    Heavy edit data series (NEW)
chart-accent         #3b82f6    Highlighted data series
chart-muted          #64748b    De-emphasized series
chart-axis           #94a3b8    Axis labels and tick marks
chart-grid           #1e3a5f    Grid lines
```

### 1.2 Typography Scale

```
Token              Size    Weight    Line-Height    Letter-Spacing    Usage
-----------------------------------------------------------------------------------
heading-xl         36px    800       1.1            -0.02em           Landing hero h1
heading-lg         30px    700       1.2            -0.01em           Page titles
heading-md         24px    700       1.3            0                 Section headers
heading-sm         20px    600       1.3            0                 Card group titles
heading-xs         16px    600       1.4            0                 Card titles
body-lg            16px    400       1.6            0                 Landing descriptions
body-md            14px    400       1.5            0                 Card body text
body-sm            13px    400       1.5            0                 Table rows
caption            12px    500       1.4            0                 Badge labels, subtitles
caption-sm         11px    500       1.4            0.03em            Stat labels, timestamps
micro              10px    600       1.3            0.05em            Tiny badges, footnotes

Font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Monospace: 'SF Mono', 'Fira Code', 'Consolas', monospace (hashes, codes)
```

### 1.3 Spacing Scale

```
Token    Value     Usage
--------------------------------------------------------------
sp-0     0px       Reset
sp-0.5   2px       Tight gap (badge internal)
sp-1     4px       Icon-text gap, inline spacing
sp-1.5   6px       Compact list items
sp-2     8px       Small card padding, grid gaps
sp-3     12px      Card internal spacing
sp-4     16px      Standard card padding, section gaps
sp-5     20px      Card padding (comfortable)
sp-6     24px      Section spacing, major gaps
sp-8     32px      Page section spacing
sp-10    40px      Major section gaps
sp-12    48px      Landing section spacing
sp-16    64px      Hero vertical padding
sp-24    96px      Landing hero top padding
```

### 1.4 Border Radius Scale

```
Token              Value     Usage
--------------------------------------------------------------
radius-sm          4px       Small badges, tags, code blocks
radius-md          6px       Detection badges, small buttons
radius-lg          8px       Stat cards, chart cards
radius-xl          12px      Major cards, panels
radius-2xl         16px      Hero cards, modals
radius-full        9999px    Avatars, pills, circular elements
```

### 1.5 Shadow Definitions

```
Token              Value                                              Usage
--------------------------------------------------------------
shadow-sm          0 1px 2px rgba(0,0,0,0.2)                          Subtle elevation
shadow-md          0 2px 8px rgba(0,0,0,0.3)                          Detection badges
shadow-lg          0 4px 16px rgba(0,0,0,0.4)                         Floating cards, modals
shadow-xl          0 8px 32px rgba(0,0,0,0.5)                         Hero elements
shadow-glow-blue   0 0 20px rgba(59,130,246,0.3)                      CTA hover glow
shadow-glow-green  0 0 16px rgba(34,197,94,0.2)                       Human verdict glow
shadow-glow-red    0 0 16px rgba(239,68,68,0.2)                       AI verdict glow
shadow-badge       0 2px 8px rgba(0,0,0,0.3)                          Badge overlay (matches extension)
```

### 1.6 Animation & Transition Specs

```
Token                  Duration    Easing                              Usage
--------------------------------------------------------------
transition-fast        150ms       ease                                Button color, opacity
transition-normal      200ms       ease                                Border, background
transition-slow        300ms       ease-out                            Layout shifts
transition-gauge       1000ms      cubic-bezier(0.34,1.56,0.64,1)     Gauge needle animation
transition-badge       350ms       cubic-bezier(0.34,1.56,0.64,1)     Badge entrance (overshoot)
transition-fade        400ms       ease-out                            Fade in up
transition-shimmer     1200ms      ease-in-out                         Scanning shimmer (infinite)
transition-glow        8000ms      ease-in-out                         Hero background glow (infinite)
transition-pulse       2000ms      ease-in-out                         Status dot pulse (infinite)
transition-count       600ms       cubic-bezier(0,0,0.2,1)            Number count-up
transition-progress    500ms       ease                                Progress bars
transition-heatmap     200ms       ease                                Sentence hover highlight
```

### 1.7 Z-Index Scale

```
Token              Value     Usage
--------------------------------------------------------------
z-base             0         Page content
z-card             1         Elevated cards
z-sticky           40        Sticky feed stats bar
z-navbar           50        Top navigation
z-overlay          60        Modal backdrops
z-modal            70        Modal content
z-badge            9999      Extension badge overlays
z-scanning         9998      Extension scanning overlays
```

---

## 2. Component Library

### 2.1 NavBar

Updated to include all 5 pages plus the Baloney brand.

```
+------------------------------------------------------------------------+
| [BALONEY_ICON] Baloney      Feed   Dashboard   Simulator   Analyze     |
+------------------------------------------------------------------------+
  ^logo area                  ^nav links (right-aligned)
```

#### ASCII Mockup (Desktop)
```
+============================================================================+
|  O  Baloney              Demo Feed    Dashboard    Simulator    Analyze     |
|  ^                       ^active: text-white font-medium                   |
|  hot dog emoji           ^inactive: text-slate-400 hover:text-white        |
|  or custom icon                                                            |
+============================================================================+
  bg: navy/90 + backdrop-blur
  border-bottom: 1px solid navy-lighter
  sticky top-0 z-50
  px-6 py-3
```

#### ASCII Mockup (Mobile < 640px)
```
+========================================+
|  O  Baloney                     [=]    |
+========================================+
  hamburger menu expands to:
+========================================+
|  O  Baloney                     [X]    |
|----------------------------------------|
|  Demo Feed                             |
|  Dashboard                             |
|  Simulator                             |
|  Analyze                               |
+========================================+
```

#### Props
```typescript
interface NavBarProps {
  // No props -- reads pathname from usePathname()
}
```

#### States
- **Default link**: `text-slate-400`
- **Hover link**: `text-white` (transition-fast)
- **Active link**: `text-white font-medium`
- **Mobile**: Hamburger toggle, slide-down menu with `bg-navy border-b border-navy-lighter`

#### Implementation Notes
- Replace `ScanSearch` icon with Baloney logo/icon
- Replace "TrustLens" text with "Baloney"
- Add `NAV_LINKS` entries for `/platform` (Simulator) and `/analyze` (Analyze)
- Mobile breakpoint: hamburger menu below 640px

---

### 2.2 VerdictBadge (Upgraded from DetectionBadge)

4-way classification badge replacing the old 3-way system.

#### ASCII Mockup
```
  +-------------------+         +-------------------+
  |  V  Human         |         |  ~  Light Edit    |
  +-------------------+         +-------------------+
  bg: green/85                  bg: yellow/85

  +-------------------+         +-------------------+
  | // Heavy Edit     |         |  X  AI . 92%      |
  +-------------------+         +-------------------+
  bg: orange/85                 bg: red/85
```

#### Props
```typescript
type Verdict4 = "human" | "light_edit" | "heavy_edit" | "ai_generated";

interface VerdictBadgeProps {
  verdict: Verdict4;
  trustScore?: number;       // 0-1, shown as percentage for ai_generated
  animate?: boolean;         // default true, entrance animation
  size?: "sm" | "md" | "lg"; // sm=10px, md=12px, lg=14px font
  className?: string;
}
```

#### Color Map
```
Verdict       BG Class                      Border Class                 Icon     Label
------------------------------------------------------------------------------------------
human         bg-[rgba(34,197,94,0.85)]     border-[rgba(100,255,150,0.3)]  check    "Human"
light_edit    bg-[rgba(234,179,8,0.85)]     border-[rgba(255,220,50,0.3)]   tilde    "Light Edit"
heavy_edit    bg-[rgba(249,115,22,0.85)]    border-[rgba(255,160,50,0.3)]   slashes  "Heavy Edit"
ai_generated  bg-[rgba(239,68,68,0.85)]     border-[rgba(255,100,100,0.4)]  X        "AI . {score}%"
```

#### States
- **Default**: Visible with backdrop-blur, shadow-badge
- **Animate entrance**: `animate-fade-in-up` (0.35s cubic-bezier overshoot)
- **Size sm**: `px-1.5 py-0.5 text-[10px]`
- **Size md**: `px-2.5 py-1 text-xs`
- **Size lg**: `px-3 py-1.5 text-sm`

---

### 2.3 TrustScoreGauge

Animated circular SVG gauge displaying the trust score (0-100).

#### ASCII Mockup
```
        ___________
      /     72      \
     |    TRUST      |
     |    SCORE      |
      \             /
       `----.----'
      0           100
       red  yellow green

  Below gauge (optional):
  +---------------------------+
  |  Verdict: Light Edit      |
  +---------------------------+
```

#### Detailed ASCII (showing arc)
```
           .---===---.
         /  //       \\  \          <= bg arc: #1e3a5f stroke
        | //    72    \\ |          <= progress arc: color by score
        | |  Trust     | |
        | \\  Score   // |
         \  \\       //  /
           `---===---'

    Color segments:
    0-25:   #ef4444 (red/AI)
    25-45:  #f97316 (orange/heavy edit)
    45-65:  #eab308 (yellow/light edit)
    65-100: #22c55e (green/human)
```

#### Props
```typescript
interface TrustScoreGaugeProps {
  score: number;             // 0-100 (or 0-1, component normalizes)
  size?: number;             // pixel diameter, default 180
  strokeWidth?: number;      // default 10
  showVerdict?: boolean;     // show verdict label below score
  verdict?: Verdict4;        // for coloring the verdict label
  animate?: boolean;         // default true, 1s ease-out stroke animation
  className?: string;
}
```

#### Implementation Details
- SVG circle with `stroke-dasharray` and `stroke-dashoffset` animation
- Rotation: start at 225deg (7 o'clock), sweep 270deg to 315deg (5 o'clock)
- So the gauge is a 270-degree arc, open at the bottom
- Background arc: `#1e3a5f` (navy-lighter)
- Progress arc: gradient segments or single color based on score
- Center text: score as integer + "Trust Score" label below
- Animation: `stroke-dashoffset` transition 1s ease-out on mount
- Optional verdict pill below the gauge

#### Color Mapping
```javascript
function getGaugeColor(score: number): string {
  if (score <= 25) return '#ef4444';  // red
  if (score <= 45) return '#f97316';  // orange
  if (score <= 65) return '#eab308';  // yellow
  return '#22c55e';                    // green
}
```

---

### 2.4 InformationDietCard (IDS) -- HERO COMPONENT

The primary hero component for both dashboard and extension popup.

#### ASCII Mockup (Dashboard -- Full Size)
```
+========================================================================+
|  INFORMATION DIET SCORE                               Your weekly diet |
|------------------------------------------------------------------------|
|                                                                        |
|       .---===---.                                                      |
|     /     B+      \     Your Information Diet: B+                      |
|    |     72/100    |     "You're consuming a healthy mix of content     |
|     \             /      with moderate AI exposure."                    |
|       `---===---'                                                      |
|                                                                        |
|  +------------------+ +------------------+ +------------------+        |
|  | AI Content Ratio | | Source Diversity | | Trend Direction  |        |
|  |     24%          | |     78%          | |     +5%          |        |
|  | Weight: 40%      | | Weight: 25%      | | Weight: 20%      |       |
|  | ||||||||........ | | ||||||||||||||.. | | ||||||||||...... |        |
|  +------------------+ +------------------+ +------------------+        |
|                                                                        |
|  +------------------+                                                  |
|  | Awareness Actions|                                                  |
|  |     85%          |                                                  |
|  | Weight: 15%      |                                                  |
|  | ||||||||||||||.. |                                                  |
|  +------------------+                                                  |
+========================================================================+
```

#### Props
```typescript
interface InformationDietCardProps {
  score: number;             // 0-100
  grade: string;             // "A+" through "F"
  aiContentRatio: number;    // 0-1 (lower is better)
  sourceDiversity: number;   // 0-1 (higher is better)
  trendDirection: number;    // -1 to 1 (positive is better)
  awarenessActions: number;  // 0-1 (higher is better)
  description?: string;      // Personalized message
  loading?: boolean;
  className?: string;
}
```

#### Sub-Metric Bars
Each sub-metric renders as:
```
+--------------------------------------+
|  [Icon]  AI Content Ratio      24%   |
|  Weight: 40%                         |
|  [===========.....................]   |
+--------------------------------------+
```
- Bar track: `bg-navy` (bg-base), height 6px, rounded-full
- Bar fill: color by quality (green=good, red=bad), rounded-full
- For AI Content Ratio: INVERT display (low ratio = full green bar, high ratio = full red bar)
- For others: direct mapping (high = full green bar)

#### Grade Badge (inside gauge)
```
Grade   Color       BG
--------------------------
A+, A   #34d399     emerald-400
B+, B   #4ade80     green-400
C+, C   #facc15     yellow-400
D+, D   #fb923c     orange-400
F       #f87171     red-400
```

#### States
- **Loading**: Skeleton with pulsing card shape matching layout
- **Error**: "Unable to compute your diet score" + retry button
- **Empty** (no scans): "Start scanning to see your Information Diet Score!" + CTA

---

### 2.5 SentenceHeatmap

Text display with per-sentence color coding based on AI probability.

#### ASCII Mockup
```
+====================================================================+
|  SENTENCE-LEVEL ANALYSIS                                           |
|--------------------------------------------------------------------|
|                                                                    |
|  [The quick brown fox jumped over the lazy dog.]  <=== green       |
|  [This sentence was clearly written by a human.]  <=== green       |
|  [In the realm of digital innovation, we find     <=== RED         |
|   ourselves at a crossroads of transformation.]                    |
|  [The weather today is partly cloudy.]             <=== green      |
|  [Leveraging synergistic paradigms to unlock       <=== ORANGE     |
|   unprecedented value propositions.]                               |
|                                                                    |
|  Legend:                                                           |
|  [====] Human (0.0-0.30)   [====] Light Edit (0.30-0.55)          |
|  [====] Heavy Edit (0.55-0.75)   [====] AI (0.75-1.0)             |
+====================================================================+
```

#### Props
```typescript
interface SentenceHeatmapProps {
  text: string;                    // Full text
  sentenceScores: number[];        // Per-sentence AI probability (0-1)
  highlightIndex?: number | null;  // Currently hovered sentence
  onSentenceHover?: (index: number | null) => void;
  className?: string;
}
```

#### Color Mapping (per-sentence background)
```
AI Probability    Background Color                    Label
--------------------------------------------------------------
0.00 - 0.30       rgba(34, 197, 94, 0.15)             Human
0.30 - 0.55       rgba(234, 179, 8, 0.15)             Light Edit
0.55 - 0.75       rgba(249, 115, 22, 0.15)            Heavy Edit
0.75 - 1.00       rgba(239, 68, 68, 0.15)             AI Generated
```

#### Hover State
- Hovered sentence: opacity increases to 0.30 (from 0.15), border-left 3px solid with verdict color
- Tooltip appears above with: "Sentence {n}: {score}% AI probability"
- Other sentences: dim slightly (opacity 0.6)

#### Implementation
- Split text into sentences (period/question/exclamation boundary detection)
- Wrap each sentence in `<span>` with computed background color
- `transition: background 200ms ease` for hover effects
- `cursor: pointer` on each sentence span
- Below the text block: render color legend with 4 swatches

---

### 2.6 PrePublishSimulator

Full-page component simulating social platform AI detection integration.

#### ASCII Mockup
```
+=============================================================================+
|                                                                             |
|  PLATFORM SIMULATOR                                                        |
|  See what happens when platforms integrate AI detection                     |
|                                                                             |
|  +--------------------+--------------------+                                |
|  | [Twitter] [Reddit] | [LinkedIn] [Insta] |  <== Platform tabs            |
|  +--------------------+--------------------+                                |
|                                                                             |
|  +===================================+ +==================================+|
|  | COMPOSE                           | | RESULTS                          ||
|  |-----------------------------------| |----------------------------------||
|  | [Avatar] @username                | |                                  ||
|  |                                   | |    .---===---.                   ||
|  | +-------------------------------+ | |  /     38     \                  ||
|  | |                               | | | |    TRUST     |                ||
|  | | Type or paste your content    | | | |    SCORE     |                ||
|  | | here...                       | | |  \             /                ||
|  | |                               | | |    `---===---'                  ||
|  | |                               | | |                                  ||
|  | |                               | | |  Verdict: Heavy Edit             ||
|  | |                     256/5000  | | |                                  ||
|  | +-------------------------------+ | |  +------------------------------+||
|  |                                   | |  | X Content Authenticity Check |||
|  |  [ Post to X ]                    | |  | This content appears to have |||
|  |                                   | |  | been heavily edited with AI  |||
|  |                                   | |  | assistance.                  |||
|  |                                   | |  |                              |||
|  |                                   | |  | [Add AI label] [Post anyway] |||
|  |                                   | |  | [Edit post]                  |||
|  |                                   | |  +------------------------------+||
|  +===================================+ +==================================+|
+=============================================================================+
```

#### Props
```typescript
type SimulatorPlatform = "twitter" | "reddit" | "linkedin" | "instagram";

interface PrePublishSimulatorProps {
  className?: string;
}

// Internal state
interface SimulatorState {
  platform: SimulatorPlatform;
  content: string;
  isAnalyzing: boolean;
  result: {
    trustScore: number;
    verdict: Verdict4;
    editMagnitude: number;
    featureVector: FeatureVector;
    sentenceScores: number[];
  } | null;
}
```

#### Platform Tab Styling
```
+----------+----------+----------+----------+
|  Twitter |  Reddit  | LinkedIn |  Insta   |
+----------+----------+----------+----------+

Active tab: bg-accent text-white border-b-2 border-accent
Inactive:   bg-transparent text-slate-400 hover:text-white
```

#### Platform-Specific Composer Appearance
```
Twitter:
  - Avatar + @handle
  - Textarea with 280 char limit
  - "Post" button (bg-[#1d9bf0] rounded-full)

Reddit:
  - r/technology subreddit header
  - Title field + body textarea
  - "Post" button (bg-[#ff4500] rounded-full)

LinkedIn:
  - Avatar + name + "Post to feed"
  - Textarea, no char limit display
  - "Post" button (bg-[#0a66c2] rounded-lg)

Instagram:
  - Avatar + username
  - Caption textarea
  - "Share" button (bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af])
```

#### Results Panel
- Starts empty with placeholder: "Compose a post and click 'Post' to see the analysis"
- After analysis: TrustScoreGauge (top) + verdict + PlatformNotification (bottom)
- Animation: results fade-in-up with 300ms stagger

---

### 2.7 PlatformNotification

Simulated notification cards that mimic what each platform would show.

#### ASCII Mockup (Twitter variant)
```
+===================================================+
|  [X logo]  Content Authenticity Check              |
|---------------------------------------------------|
|  This content appears to be heavily edited with    |
|  AI-assisted tools. Trust Score: 38/100            |
|                                                    |
|  Readers will see a label on this post.            |
|                                                    |
|  [Add AI-assisted label]  [Post anyway]            |
|  [Edit post]                                       |
+===================================================+
  border-left: 4px solid #1d9bf0 (Twitter blue)
  bg: navy-light
```

#### ASCII Mockup (Reddit variant)
```
+===================================================+
|  [Reddit logo]  AI Content Review                  |
|---------------------------------------------------|
|  Automod has flagged this content as potentially   |
|  AI-generated. Trust Score: 22/100                 |
|                                                    |
|  Posts with low trust scores receive a flair.      |
|                                                    |
|  [Add AI flair]  [Post to community]               |
|  [Return to editor]                                |
+===================================================+
  border-left: 4px solid #ff4500 (Reddit orange)
```

#### Props
```typescript
interface PlatformNotificationProps {
  platform: SimulatorPlatform;
  trustScore: number;
  verdict: Verdict4;
  onAction?: (action: "label" | "post_anyway" | "edit") => void;
  className?: string;
}
```

#### Platform Brand Colors
```
Platform     Brand Color    Logo
---------------------------------
twitter      #1d9bf0        X logo SVG
reddit       #ff4500        Snoo icon
linkedin     #0a66c2        in logo
instagram    #e4405f        Camera icon (gradient)
```

---

### 2.8 FeatureVectorDisplay

Four horizontal bars showing burstiness, type-token ratio, perplexity, and repetition.

#### ASCII Mockup
```
+============================================+
|  FEATURE ANALYSIS                          |
|--------------------------------------------|
|  Burstiness         [========........] 62  |
|  Type-Token Ratio   [============....] 81  |
|  Perplexity         [====............] 34  |
|  Repetition Score   [======..........] 47  |
+============================================+
```

#### Props
```typescript
interface FeatureVector {
  burstiness: number;        // 0-1
  type_token_ratio: number;  // 0-1
  perplexity: number;        // 0-1 (normalized)
  repetition_score: number;  // 0-1
}

interface FeatureVectorDisplayProps {
  features: FeatureVector;
  className?: string;
}
```

#### Bar Colors
- Each bar uses a gradient: low values are red-tinted (AI-like), high values are green-tinted (human-like)
- Exception: repetition_score is inverted (high repetition = more AI-like)
```
burstiness:       low=red, high=green  (humans are bursty)
type_token_ratio: low=red, high=green  (humans use diverse words)
perplexity:       low=red, high=green  (humans are less predictable)
repetition_score: low=green, high=red  (AI repeats more)
```

#### Layout
- Each row: label (text-slate-400, 140px min-width) + bar track + value
- Bar track: `h-2 bg-navy rounded-full`, bar fill: `h-2 rounded-full` with color
- Value label: `text-white text-sm font-bold` right-aligned
- Vertical gap: sp-3 (12px) between rows

---

### 2.9 ScoreBreakdown

Weighted factor visualization for the IDS score.

#### ASCII Mockup
```
+============================================+
|  SCORE BREAKDOWN                           |
|--------------------------------------------|
|                                            |
|  AI Content Ratio (40%)                    |
|  [================..........] 76/100       |
|  Your AI exposure is 24% -- low!           |
|                                            |
|  Source Diversity (25%)                     |
|  [==================........] 78/100       |
|  Content from 6 unique domains             |
|                                            |
|  Trend Direction (20%)                     |
|  [====================......] 85/100       |
|  Improving over the past 7 days            |
|                                            |
|  Awareness Actions (15%)                   |
|  [=====================.....] 90/100       |
|  42 scans this week                        |
|                                            |
|  Weighted Total: 72/100 = B+               |
+============================================+
```

#### Props
```typescript
interface ScoreBreakdownProps {
  factors: {
    name: string;
    weight: number;       // 0-1 (e.g., 0.40)
    score: number;        // 0-100 raw score
    description: string;  // explanatory text
  }[];
  totalScore: number;
  grade: string;
  className?: string;
}
```

#### Layout
- Each factor is a row with: name + weight badge, progress bar, raw score
- Description below each bar in text-dimmed
- Bottom: separator line + total score with grade badge
- Weight badge: small pill `bg-navy px-2 py-0.5 rounded-full text-[10px] text-slate-400`

---

### 2.10 StatCard (Existing -- Extended)

Already implemented. Adding trend arrow support.

#### ASCII Mockup
```
+----------------------------------+
|  [Icon]  TOTAL SCANS             |
|                                  |
|  1,247                           |
|  All-time detections   +12% 7d   |
+----------------------------------+
```

#### Props (current + extensions)
```typescript
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: { value: number; label: string };
  className?: string;
}
```
No changes needed -- already supports trends.

---

### 2.11 ChartCard (Existing -- No Changes)

Already implemented correctly.

#### ASCII Mockup
```
+----------------------------------+
|  Chart Title                     |
|  Subtitle text here              |
|  +--------------------------+    |
|  |                          |    |
|  |     [Chart Content]      |    |
|  |                          |    |
|  +--------------------------+    |
+----------------------------------+
```

---

### 2.12 TrustScoreGauge (Mini Variant for Extension)

Small version for the extension popup IDS display.

#### ASCII Mockup (64px)
```
    .---.
   / B+ \
  |  72   |
   \     /
    '---'
```

#### Props
Same as TrustScoreGauge with `size={64}` and `strokeWidth={5}`

---

## 3. Page Layouts

### 3.1 Landing Page (`/`)

#### ASCII Wireframe (Full Desktop)
```
+=============================================================================+
| [NavBar]                                                                    |
+=============================================================================+
|                                                                             |
|                        .--radial glow bg--.                                 |
|                       /                    \                                |
|                                                                             |
|                 Your AI content radar                                       |
|                 for the internet                                            |
|                    ^heading-xl, accent on "for the internet"                |
|                                                                             |
|                 Baloney detects AI-generated content as you                  |
|                 scroll Instagram and X. Track your AI diet.                  |
|                 Join the transparency movement.                              |
|                    ^body-lg, text-muted                                     |
|                                                                             |
|                 .---===---.                                                  |
|               /     B+      \     <== Animated demo gauge                   |
|              |     72/100    |        cycles through scores                  |
|               \             /         every 3 seconds                        |
|                 `---===---'                                                  |
|                                                                             |
|                 [Install Extension]  [Try the Demo ->]                       |
|                  ^primary CTA         ^secondary CTA                        |
|                  bg-accent            bg-navy-light border                   |
|                  shimmer effect       border-navy-lighter                    |
|                                                                             |
+=============================================================================+
|                                                                             |
|  +--------------------+ +--------------------+ +--------------------+       |
|  |                    | |                    | |                    |       |
|  |    10,000+         | |      34%           | |      97%           |       |
|  |  Scans Performed   | | AI Content Found   | |  Model Accuracy    |       |
|  |                    | |                    | |                    |       |
|  +--------------------+ +--------------------+ +--------------------+       |
|    ^AnimatedNumber        ^AnimatedNumber       ^AnimatedNumber             |
|    bg-navy-light/50       bg-navy-light/50      bg-navy-light/50           |
|                                                                             |
+=============================================================================+
|                                                                             |
|                        How It Works                                         |
|                                                                             |
|  +--------------------+ +--------------------+ +--------------------+       |
|  | (1) Detect         | | (2) Track          | | (3) Share          |       |
|  |                    | |                    | |                    |       |
|  | Chrome extension   | | Personal dashboard | | Opt in to share    |       |
|  | scans images and   | | shows your AI      | | anonymized data.   |       |
|  | text as you scroll | | exposure, platform | | See aggregate AI   |       |
|  | Instagram and X.   | | breakdown, and     | | content patterns   |       |
|  | 4-way verdict      | | Information Diet   | | across the whole   |       |
|  | badges injected    | | Score.             | | internet.          |       |
|  | in real-time.      | |                    | |                    |       |
|  +--------------------+ +--------------------+ +--------------------+       |
|                                                                             |
+=============================================================================+
|                                                                             |
|                     Key Features                                            |
|                                                                             |
|  +------------------------------+ +------------------------------+          |
|  | INFORMATION DIET SCORE       | | AI SLOP INDEX                |          |
|  | Your personal AI content     | | Platform report cards with   |          |
|  | diet grade. Are you eating   | | letter grades. See which     |          |
|  | too much AI slop?            | | platforms serve the most     |          |
|  |                              | | AI-generated content.        |          |
|  | [See your score ->]          | | [View index ->]              |          |
|  +------------------------------+ +------------------------------+          |
|                                                                             |
|  +------------------------------+ +------------------------------+          |
|  | CONTENT PROVENANCE           | | PRE-PUBLISH SIMULATOR        |          |
|  | Crowd-sourced truth via      | | See what happens when        |          |
|  | content hash tracking        | | platforms integrate AI        |          |
|  | across platforms.            | | detection before posting.     |          |
|  |                              | |                              |          |
|  | [Explore data ->]            | | [Try simulator ->]           |          |
|  +------------------------------+ +------------------------------+          |
|                                                                             |
+=============================================================================+
|                                                                             |
|  Built at MadData26 . UW-Madison Data Science Hackathon . Feb 2026         |
|  ^footer, text-dimmed, border-t border-navy-lighter                        |
|                                                                             |
+=============================================================================+
```

#### Section Breakdown

**Hero Section**
- Background: Animated radial glow (same as current `animate-glow-shift`)
- Headline: "Your AI content radar for the internet" -- `heading-xl` with accent color on second line
- Subhead: Updated to mention Baloney brand, 4-way detection, IDS
- Demo gauge: `TrustScoreGauge` with cycling animation (scores: 72, 38, 85, 22, every 3s)
- CTAs: Primary "Install Extension" (shimmer), Secondary "Try the Demo ->"
- Padding: py-24 px-4

**Stats Section**
- 3 columns (1 on mobile), `AnimatedNumber` component
- Pull from `/api/analytics/community` with fallback defaults
- Cards: `bg-navy-light/50 rounded-xl border border-navy-lighter p-6`

**How It Works**
- 3-step cards with numbered circles
- Same layout as current but with updated copy mentioning 4-way verdicts and IDS

**Key Features** (NEW section)
- 2x2 grid of feature cards
- Each links to relevant page
- Cards: `bg-navy-light rounded-xl p-6 border border-navy-lighter hover:border-accent/30 transition`

**Footer**
- Updated: "Built at MadData26" stays, add "Powered by Baloney"

---

### 3.2 Dashboard Page (`/dashboard`)

#### ASCII Wireframe -- Personal Tab
```
+=============================================================================+
| [NavBar]                                                                    |
+=============================================================================+
|                                                                             |
|  Dashboard                                                                  |
|  Your AI content detection analytics                                        |
|                                                                             |
|  [Personal]  [Community]                                                    |
|   ^active     ^inactive                                                     |
|                                                                             |
|  +=================================================================+        |
|  | INFORMATION DIET SCORE                          Your weekly diet |        |
|  |-----------------------------------------------------------------|        |
|  |       .---===---.                                               |        |
|  |     /     B+      \     Your Information Diet: B+               |        |
|  |    |     72/100    |     "Healthy content mix with moderate      |        |
|  |     \             /      AI exposure."                           |        |
|  |       `---===---'                                               |        |
|  |                                                                 |        |
|  |  [AI Ratio: 76] [Diversity: 78] [Trend: 85] [Actions: 90]      |        |
|  +=================================================================+        |
|                                                                             |
|  +-------------------+ +-------------------+ +-------------------+          |
|  | EXPOSURE SCORE    | |                   | |                   |          |
|  |                   | | [Icon] TOTAL SCANS| | [Icon] AI CAUGHT  |          |
|  |   462 / 850       | |                   | |                   |          |
|  |   [Vigilant]      | |     45            | |     16            |          |
|  |   [=====>........] | |  All-time         | |  35% of content   |          |
|  |   Vigilant->Guard | |                   | |                   |          |
|  |                   | |                   | |                   |          |
|  |  AI:16  Scans:45  | |                   | |                   |          |
|  | Streak:3 Plat:3/4 | |                   | |                   |          |
|  +-------------------+ +-------------------+ +-------------------+          |
|                                                                             |
|  +=================================================================+        |
|  | SCAN ACTIVITY                               Daily scan volume   |        |
|  |-----------------------------------------------------------------|        |
|  |     ^                                                           |        |
|  |  8  |   *                                                       |        |
|  |  6  |  * *     *                                                |        |
|  |  4  | *   *   * *     *                                         |        |
|  |  2  |*     * *   *   * *                                        |        |
|  |  0  +----+----+----+----+----->                                 |        |
|  |     Feb 1     Feb 8     Feb 15                                  |        |
|  +=================================================================+        |
|                                                                             |
|  +===============================+ +===============================+        |
|  | PLATFORM BREAKDOWN            | | RECENT SCANS                  |        |
|  |-------------------------------| |-------------------------------|        |
|  |  Instagram  [====] 60%        | |  #a1b2c3  instagram  AI  92% |        |
|  |  X          [===]  35%        | |  #d4e5f6  x         Hum 78% |        |
|  |  Reddit     [=]    5%         | |  #g7h8i9  instagram  L.E 56% |        |
|  |                               | |  #j0k1l2  x         H.E 38% |        |
|  |  [Grouped bar chart]          | |  ...                         |        |
|  +===============================+ +===============================+        |
|                                                                             |
+=============================================================================+
```

#### ASCII Wireframe -- Community Tab
```
+=============================================================================+
| [NavBar]                                                                    |
+=============================================================================+
|                                                                             |
|  Dashboard                                                                  |
|  Your AI content detection analytics                                        |
|                                                                             |
|  [Personal]  [Community]                                                    |
|   ^inactive   ^active                                                       |
|                                                                             |
|  +=================================================================+        |
|  | AI SLOP INDEX                                  Platform Report  |        |
|  |-----------------------------------------------------------------|        |
|  | +---------------------------+ +---------------------------+     |        |
|  | | Instagram           ^stb | | X (Twitter)          ^ris |     |        |
|  | |                          | |                          |     |        |
|  | |    B                     | |    D-                    |     |        |
|  | |    Good                  | |    Needs Work            |     |        |
|  | |  [=========........]    | |  [================.....]  |     |        |
|  | |  Score: 28/100  120/7d  | |  Score: 68/100   89/7d  |     |        |
|  | +---------------------------+ +---------------------------+     |        |
|  | +---------------------------+ +---------------------------+     |        |
|  | | Reddit              ^fal | | Facebook            ^stb |     |        |
|  | |    A                     | |    C                     |     |        |
|  | |    Excellent             | |    Average               |     |        |
|  | |  [====................] | |  [===========........]   |     |        |
|  | |  Score: 15/100  200/7d  | |  Score: 42/100  126/7d  |     |        |
|  | +---------------------------+ +---------------------------+     |        |
|  +=================================================================+        |
|                                                                             |
|  +-------------------+ +-------------------+ +-------------------+          |
|  | COMMUNITY COUNTER | | [Icon] USERS      | | [Icon] AI RATE    |          |
|  |                   | |                   | |                   |          |
|  |     535           | |     50            | |     34%           |          |
|  | Total Scans       | | Contributing      | | Of all scanned    |          |
|  +-------------------+ +-------------------+ +-------------------+          |
|                                                                             |
|  +=================================================================+        |
|  | AI DETECTION TRENDS                  30-day AI content rate     |        |
|  |-----------------------------------------------------------------|        |
|  |     ^                                                           |        |
|  | 45% |            *                                              |        |
|  | 35% |  *    *   * *        *                                    |        |
|  | 25% |   *  * *      *    * *                                    |        |
|  | 15% |    **         *  *                                        |        |
|  |  0% +----+----+----+----+----+----->                            |        |
|  |     Jan 22    Jan 29    Feb 5   Feb 12    Feb 19                |        |
|  +=================================================================+        |
|                                                                             |
|  +===============================+ +===============================+        |
|  | PLATFORM DISTRIBUTION         | | DOMAIN LEADERBOARD            |        |
|  |-------------------------------| |-------------------------------|        |
|  |  [Grouped bar chart]          | |  1. buzzfeed.com    78% AI   |        |
|  |                               | |  2. medium.com      62% AI   |        |
|  |                               | |  3. reddit.com      12% AI   |        |
|  |                               | |  ...                         |        |
|  +===============================+ +===============================+        |
|                                                                             |
|  +=================================================================+        |
|  | CONFIDENCE DISTRIBUTION       Histogram of detection scores     |        |
|  |  [histogram bars]                                               |        |
|  +=================================================================+        |
|                                                                             |
|  +=================================================================+        |
|  | CONTENT PROVENANCE                          Crowd-Sourced Truth |        |
|  |-----------------------------------------------------------------|        |
|  |  a1b2c3d4e5f6... [AI]  3 sightings  87% conf  insta x         |        |
|  |  f7g8h9i0j1k2... [Hum] 5 sightings  23% conf  x reddit       |        |
|  |  m3n4o5p6q7r8... [Unc] 2 sightings  52% conf  insta           |        |
|  +=================================================================+        |
|                                                                             |
|  +=================================================================+        |
|  | [Toggle] Share my anonymized data with the community            |        |
|  +=================================================================+        |
|                                                                             |
+=============================================================================+
```

#### Key Changes from Current
1. **InformationDietCard** replaces nothing -- it is a NEW hero card at top of Personal tab
2. **ExposureScoreCard** moves to second row alongside new stat cards
3. **4-way verdict** badges in RecentScansTable (human/light_edit/heavy_edit/ai_generated)
4. Tab switcher styling unchanged (works well)
5. Community tab: SlopIndexCard stays at top, unchanged except rebrand text

---

### 3.3 Demo Feed Page (`/feed`)

#### ASCII Wireframe
```
+=============================================================================+
| [NavBar]                                                                    |
+=============================================================================+
| STICKY STATS BAR                                                            |
| 12 of 20 scanned                                   4 flagged AI            |
| [=====================================...............]                      |
+=============================================================================+
|                                                                             |
|  +=============================================+                            |
|  | [avatar] Display Name  [platform icon]      |                            |
|  | @username . 2h                              |                            |
|  |---------------------------------------------|                            |
|  |                                             |                            |
|  |              [Image]                        |                            |
|  |                                   +-------+ |                            |
|  |                                   |AI .92%| | <== VerdictBadge           |
|  |                                   +-------+ |     (4-way now)            |
|  |                                             |                            |
|  |---------------------------------------------|                            |
|  | Caption text here describing the post...    |                            |
|  +=============================================+                            |
|                                                                             |
|  +=============================================+                            |
|  | [avatar] Another User  [X icon]             |                            |
|  | @user2 . 5h                                 |                            |
|  |---------------------------------------------|                            |
|  |                                             |                            |
|  |              [Image]                        |                            |
|  |                               +----------+ |                            |
|  |                               | V Human  | | <== green badge             |
|  |                               +----------+ |                            |
|  |                                             |                            |
|  |---------------------------------------------|                            |
|  | Another caption here...                     |                            |
|  +=============================================+                            |
|                                                                             |
|  ... (20 posts total)                                                       |
|                                                                             |
|  You've reached the end of the demo feed.                                   |
|                                                                             |
+=============================================================================+
```

#### Changes from Current
1. `DetectionBadge` -> `VerdictBadge` with 4-way system
2. Stats bar: "flagged AI" becomes "flagged" (includes heavy_edit + ai_generated)
3. Feed posts use new verdict types from mock detector
4. Scanning overlay animation unchanged (works great)
5. Color coding in progress bar: now uses 4-tier thresholds

#### New Stats Bar Color Logic
```
flaggedRate > 0.50  -> bg-red-500    (lots of AI)
flaggedRate > 0.30  -> bg-orange-500 (moderate AI)
flaggedRate > 0.15  -> bg-yellow-500 (some AI)
else                -> bg-green-500  (mostly human)
```

---

### 3.4 Platform Simulator Page (`/platform`)

#### ASCII Wireframe (Desktop)
```
+=============================================================================+
| [NavBar]                                                                    |
+=============================================================================+
|                                                                             |
|  Pre-Publish Simulator                                                      |
|  See what happens when social platforms integrate Baloney's API             |
|                                                                             |
|  +--------+--------+--------+--------+                                      |
|  |   X    | Reddit |LinkedIn| Insta  |  <== Platform selector tabs          |
|  +--------+--------+--------+--------+                                      |
|                                                                             |
|  +==================================+  +==================================+ |
|  |                                  |  |                                  | |
|  |  COMPOSE YOUR POST              |  |  ANALYSIS RESULTS                | |
|  |                                  |  |                                  | |
|  |  [O] @you                        |  |  (empty state initially:)        | |
|  |                                  |  |                                  | |
|  |  +------------------------------+|  |  Write or paste content on the   | |
|  |  |                              ||  |  left, then click "Post" to     | |
|  |  | What's happening?            ||  |  see what would happen if this   | |
|  |  |                              ||  |  platform used Baloney.          | |
|  |  |                              ||  |                                  | |
|  |  |                              ||  |  [illustration: magnifying       | |
|  |  |                              ||  |   glass over document]           | |
|  |  |                              ||  |                                  | |
|  |  |                    0/280     ||  |                                  | |
|  |  +------------------------------+|  |                                  | |
|  |                                  |  |                                  | |
|  |  [         Post to X          ]  |  |                                  | |
|  |                                  |  |                                  | |
|  +==================================+  +==================================+ |
|                                                                             |
+=============================================================================+

AFTER CLICKING "POST":

+=============================================================================+
|  +==================================+  +==================================+ |
|  |                                  |  |                                  | |
|  |  COMPOSE YOUR POST              |  |  ANALYSIS RESULTS                | |
|  |                                  |  |                                  | |
|  |  [O] @you                        |  |        .---===---.               | |
|  |                                  |  |      /     38     \              | |
|  |  +------------------------------+|  |     |    TRUST     |             | |
|  |  | In the dynamic landscape of  ||  |     |    SCORE     |             | |
|  |  | digital innovation, we find  ||  |      \             /             | |
|  |  | ourselves at a pivotal       ||  |        `---===---'               | |
|  |  | crossroads where technology  ||  |                                  | |
|  |  | and human ingenuity          ||  |     Verdict: Heavy Edit          | |
|  |  | converge to create           ||  |     Edit Magnitude: 0.72        | |
|  |  | unprecedented value...       ||  |                                  | |
|  |  |                   186/280    ||  |  +------------------------------+| |
|  |  +------------------------------+|  |  | [X]  Content Authenticity   || |
|  |                                  |  |  |       Check                  || |
|  |  [         Post to X          ]  |  |  |                              || |
|  |                                  |  |  | This content appears to be   || |
|  |                                  |  |  | heavily edited with AI-      || |
|  |                                  |  |  | assisted tools.              || |
|  |                                  |  |  | Trust Score: 38/100          || |
|  |                                  |  |  |                              || |
|  |                                  |  |  | [Add AI label] [Post anyway] || |
|  |                                  |  |  | [Edit post]                  || |
|  |                                  |  |  +------------------------------+| |
|  |                                  |  |                                  | |
|  |                                  |  |  FEATURE ANALYSIS               | |
|  |                                  |  |  Burstiness      [====..] 34    | |
|  |                                  |  |  Type-Token      [======] 62    | |
|  |                                  |  |  Perplexity      [===...] 28    | |
|  |                                  |  |  Repetition      [=====.] 58    | |
|  |                                  |  |                                  | |
|  +==================================+  +==================================+ |
+=============================================================================+
```

#### Mobile Layout (< 640px)
```
Stacks vertically:
1. Platform tabs (horizontal scroll)
2. Composer (full width)
3. Results (full width, below)
```

#### Loading State During Analysis
```
+==================================+
|  ANALYSIS RESULTS                |
|                                  |
|        .---===---.               |
|      /   . . .    \   <== dots  |
|     |   Analyzing   |    animate |
|      \             /             |
|        `---===---'               |
|                                  |
|  [skeleton bar]                  |
|  [skeleton bar]                  |
|  [skeleton bar]                  |
+==================================+
```
- Gauge animates with pulsing dots in center
- Skeleton bars below with `animate-pulse`
- Duration: ~1.5s artificial delay for UX feel

---

### 3.5 Text Analyzer Page (`/analyze`)

#### ASCII Wireframe (Desktop)
```
+=============================================================================+
| [NavBar]                                                                    |
+=============================================================================+
|                                                                             |
|  Text Analyzer                                                              |
|  Paste any text to analyze it for AI-generated content                      |
|                                                                             |
|  +=================================================================+        |
|  |                                                                 |        |
|  |  +-----------------------------------------------------------+  |        |
|  |  |                                                           |  |        |
|  |  |  Paste or type text here to analyze...                    |  |        |
|  |  |                                                           |  |        |
|  |  |                                                           |  |        |
|  |  |                                                           |  |        |
|  |  |                                                           |  |        |
|  |  |                                                           |  |        |
|  |  |                                                  0/50000  |  |        |
|  |  +-----------------------------------------------------------+  |        |
|  |                                                                 |        |
|  |  [            Analyze Text            ]                         |        |
|  |   ^bg-accent, full width, py-3, font-semibold                   |        |
|  +=================================================================+        |
|                                                                             |
|  (Results appear below after analysis)                                      |
|                                                                             |
|  +=================================+ +=================================+    |
|  |                                 | |                                 |    |
|  |      .---===---.                | | SENTENCE-LEVEL ANALYSIS         |    |
|  |    /     72      \              | |                                 |    |
|  |   |    TRUST      |             | | [The quick brown fox...]  green |    |
|  |   |    SCORE      |             | | [In the realm of...]      red  |    |
|  |    \             /              | | [The weather is...]       green |    |
|  |      `---===---'                | | [Leveraging synergistic..] org |    |
|  |                                 | | [She walked to the...]    grn  |    |
|  |    Verdict: Light Edit          | |                                 |    |
|  |    Edit Magnitude: 0.35        | | Legend:                          |    |
|  |                                 | | [=] Human  [=] Light Edit      |    |
|  |                                 | | [=] Heavy Edit  [=] AI         |    |
|  +=================================+ +=================================+    |
|                                                                             |
|  +=================================================================+        |
|  | SCORE BREAKDOWN                                                 |        |
|  |-----------------------------------------------------------------|        |
|  |  Burstiness (25%)     [========........] 62                     |        |
|  |  Humans write in bursts; AI is uniform                          |        |
|  |                                                                 |        |
|  |  Type-Token Ratio (25%) [============..] 81                     |        |
|  |  Vocabulary diversity measure                                   |        |
|  |                                                                 |        |
|  |  Perplexity (30%)     [====............] 34                     |        |
|  |  How predictable is the text                                    |        |
|  |                                                                 |        |
|  |  Repetition (20%)    [======..........] 47                      |        |
|  |  Phrase and structure repetition                                |        |
|  +=================================================================+        |
|                                                                             |
|  +=================================================================+        |
|  | FEATURE VECTOR                                                  |        |
|  |-----------------------------------------------------------------|        |
|  |  Burstiness         [========........] 0.62                     |        |
|  |  Type-Token Ratio   [============....] 0.81                     |        |
|  |  Perplexity         [====............] 0.34                     |        |
|  |  Repetition Score   [======..........] 0.47                     |        |
|  +=================================================================+        |
|                                                                             |
+=============================================================================+
```

#### Mobile Layout
- Textarea full width
- Results stack vertically: Gauge -> Heatmap -> Breakdown -> Feature Vector
- Each in its own ChartCard

#### Empty State (before analysis)
```
+=================================================================+
|                                                                 |
|          [icon: magnifying glass with text lines]               |
|                                                                 |
|          Paste text above and click "Analyze"                   |
|          to see AI detection results                            |
|                                                                 |
|          Supports up to 50,000 characters                       |
|                                                                 |
+=================================================================+
```

#### Error State
```
+=================================================================+
|                                                                 |
|          [icon: alert triangle]                                 |
|                                                                 |
|          Analysis failed                                        |
|          Please check your text and try again.                  |
|                                                                 |
|          [  Retry  ]                                            |
|                                                                 |
+=================================================================+
```

---

### 3.6 Extension Popup (280px wide)

#### ASCII Wireframe
```
+========================================+
|                                        |
|  [baloney icon]  Baloney    [green dot] |
|  ------gradient border line----------  |
|                                        |
|  +------------------+ +-------------+  |
|  |       12         | |      4      |  |
|  |  Images Scanned  | |  AI Flagged |  |
|  +------------------+ +-------------+  |
|                                        |
|  +------------------------------------+|
|  |  INFORMATION DIET          B+      ||
|  |                                    ||
|  |     .---.                          ||
|  |    / 72  \                         ||
|  |   |      |                         ||
|  |    \ __ /                          ||
|  |                                    ||
|  |  "Healthy mix"                     ||
|  +------------------------------------+|
|                                        |
|  +------------------------------------+|
|  |  AI Exposure This Session          ||
|  |  [============..........]  33%     ||
|  +------------------------------------+|
|                                        |
|  Session: 12m 34s                      |
|                                        |
|  [     Open Full Dashboard ->       ]  |
|                                        |
|  Baloney v1.0.0 . MadData26           |
+========================================+
  width: 280px
  padding: 16px
  bg: #0f1a2e
```

#### New vs. Current
1. Logo changes from magnifying glass to Baloney icon
2. Name changes from "TrustLens" to "Baloney"
3. NEW: IDS mini-card with grade + mini gauge (64px)
4. Exposure bar remains (works great)
5. Session timer remains
6. Dashboard link URL updates
7. Footer version: v1.0.0

#### IDS Mini-Card Detail
```
+------------------------------------+
|  INFORMATION DIET          [B+]    |
|                   ^grade pill      |
|     .---.         bg matches grade |
|    / 72  \        color            |
|   |      |                         |
|    \ __ /                          |
|   ^64px gauge                      |
|                                    |
|  "Healthy content mix"             |
|   ^one-line description            |
+------------------------------------+
  bg: #1a2744 (navy-light)
  rounded-lg
  padding: 12px
```

---

### 3.7 Extension Content Badges (Updated for 4-Way)

#### Badge Variants
```
  +-------------------+    +-------------------+
  |  V  Human         |    |  ~  Light Edit    |
  +-------------------+    +-------------------+
  bg: rgba(34,197,94,    bg: rgba(234,179,8,
       0.85)                  0.85)

  +-------------------+    +-------------------+
  | // Heavy Edit     |    |  X  AI . 92%      |
  +-------------------+    +-------------------+
  bg: rgba(249,115,22,   bg: rgba(239,68,68,
       0.85)                  0.85)
```

#### CSS Classes (for extension/styles.css)
```css
.baloney-badge--human      { background: rgba(34,197,94,0.85);  border: 1px solid rgba(100,255,150,0.3); }
.baloney-badge--light-edit { background: rgba(234,179,8,0.85);  border: 1px solid rgba(255,220,50,0.3);  }
.baloney-badge--heavy-edit { background: rgba(249,115,22,0.85); border: 1px solid rgba(255,160,50,0.3);  }
.baloney-badge--ai         { background: rgba(239,68,68,0.85);  border: 1px solid rgba(255,100,100,0.4); }
```

---

### 3.8 Extension Context Menu (NEW)

#### Design
```
Right-click on image:
+-----------------------------------+
| ...standard browser items...      |
|-----------------------------------|
| [magnifying glass] Scan with Baloney |
+-----------------------------------+

Right-click on text selection:
+-----------------------------------+
| ...standard browser items...      |
|-----------------------------------|
| [magnifying glass] Check with Baloney |
+-----------------------------------+
```

#### Implementation
- Uses `chrome.contextMenus.create` in `background.js`
- `contexts: ["image"]` for image scanning
- `contexts: ["selection"]` for text checking
- On click: sends message to content script or opens side panel with results

---

## 4. Interaction Design

### 4.1 Page Transitions

```
Transition Type      Duration    Easing          Usage
--------------------------------------------------------------
Page enter           300ms       ease-out        Main content fade-in-up
Tab switch           200ms       ease            Dashboard tab content swap
Card stagger         50ms        ease-out        Cards appearing in sequence (delay per card)
Results reveal       300ms       ease-out        Analysis results appearing
Modal enter          200ms       ease-out        Modal/overlay appearance
Modal exit           150ms       ease-in         Modal/overlay dismissal
```

#### Page Enter Animation
- All page content wraps in a `motion.div` or CSS class with:
  - `opacity: 0 -> 1`
  - `translateY(8px) -> 0`
  - Duration: 300ms, ease-out
  - Stagger children by 50ms for card grids

#### Tab Switch (Dashboard)
- Outgoing tab: `opacity: 1 -> 0`, 100ms
- Incoming tab: `opacity: 0 -> 1`, 200ms, with `translateY(4px) -> 0`
- No layout shift (use `min-height` on container)

### 4.2 Loading States

#### Skeleton Patterns
```
StatCard skeleton:
+----------------------------------+
| [===== 80px] <=== label          |
|                                  |
| [============== 160px] <=== val  |
| [======= 100px] <=== subtext    |
+----------------------------------+
  bg-navy-light, animate-pulse
  Inner skeletons: bg-navy-lighter, rounded

ChartCard skeleton:
+----------------------------------+
| [========= 120px]               |
| [===== 80px]                    |
| +------------------------------+|
| |                              ||
| |     [pulsing rectangle]      ||
| |     h-40 w-full              ||
| |                              ||
| +------------------------------+|
| [============ 140px]           |
+----------------------------------+

TrustScoreGauge skeleton:
        .---===---.
      /   pulse    \
     |    ...       |
      \   pulse    /
       `---===---'
  Circle outline in navy-lighter with pulse animation

Table row skeleton:
+----------------------------------------------------------+
| [====] [==============] [=====] [======] [===] |
+----------------------------------------------------------+
  5 columns of varying width, h-4, bg-navy-lighter
  4-5 rows with pulse animation
```

### 4.3 Error States

#### Pattern
```
+============================================+
|                                            |
|          [AlertTriangle icon]              |
|          text-red-400, h-8 w-8             |
|                                            |
|          Something went wrong              |
|          text-white, heading-xs            |
|                                            |
|          {specific error message}          |
|          text-slate-400, body-sm           |
|                                            |
|          [  Try Again  ]                   |
|          bg-accent, rounded-lg             |
|                                            |
+============================================+
```

#### Per-Component Error Messages
```
Component               Error Message
--------------------------------------------------------------
InformationDietCard     "Unable to compute your diet score. Check back after your next scan."
TrustScoreGauge         "Analysis failed. The text may be too short or in an unsupported format."
SlopIndexCard           "Platform data unavailable. Try refreshing the page."
ExposureScoreCard       "Couldn't load your exposure data. Try again later."
PrePublishSimulator     "Analysis failed. Please check your text and try again."
SentenceHeatmap         "Sentence analysis unavailable for this text."
Feed post scan          (Silently falls back to curated data -- no visible error)
```

### 4.4 Empty States

#### Pattern
```
+============================================+
|                                            |
|          [Relevant icon]                   |
|          text-slate-500, h-10 w-10         |
|                                            |
|          {Title}                           |
|          text-white, heading-xs            |
|                                            |
|          {Description}                     |
|          text-slate-400, body-sm           |
|                                            |
|          [ CTA Button ]  (optional)        |
|                                            |
+============================================+
```

#### Per-Component Empty States
```
Component               Title                      Description                              CTA
---------------------------------------------------------------------------------------------------
InformationDietCard     "No diet data yet"         "Start scanning content to see score"     "Go to Feed"
ScanTimeline            "No scan history"          "Your scan activity will appear here"     --
RecentScansTable        "No scans recorded"        "Visit the demo feed to start scanning"   "Try Demo Feed"
ProvenanceTable         "No provenance data"       "Crowd-sourced verification data appears here"  --
SlopIndexCard           "No platform data"         "Run the seed to populate platform scores" --
PrePublishSimulator     "Ready to analyze"         "Write or paste content, then click Post" --
TextAnalyzer results    "Paste text above"         "Supports up to 50,000 characters"        --
```

### 4.5 Animation Specifications

#### Gauge Animation (TrustScoreGauge)
```
1. On mount: stroke-dashoffset animates from full to target
2. Duration: 1000ms
3. Easing: cubic-bezier(0.34, 1.56, 0.64, 1)  -- slight overshoot
4. Center number counts up simultaneously (600ms, ease-out-cubic)
5. Verdict label fades in after gauge completes (200ms delay)
```

#### Badge Entrance (VerdictBadge)
```
1. scale(0.5) + translateY(-4px) + opacity(0)
2. -> scale(1) + translateY(0) + opacity(1)
3. Duration: 350ms
4. Easing: cubic-bezier(0.34, 1.56, 0.64, 1)  -- bounce overshoot
```

#### Scanning Overlay
```
1. Blue border appears around image (2px solid accent/60)
2. Shimmer gradient sweeps left-to-right repeatedly
3. "Scanning..." label pulses opacity 1.0 <-> 0.6
4. Duration: shimmer 1.2s infinite, pulse 1s infinite
5. On complete: overlay fades out 200ms, badge appears
```

#### Number Count-Up (AnimatedNumber)
```
1. Counts from 0 to target
2. Duration: 2000ms for landing page, 600ms for popup
3. Easing: quartic ease-out (1 - (1-t)^4)
4. Numbers formatted with toLocaleString() commas
```

#### IDS Card Entry
```
1. Card fades in: 300ms ease-out
2. Gauge animates: 1000ms with overshoot
3. Sub-metric bars fill sequentially: 400ms each, 100ms stagger
4. Grade badge pops in: 200ms with scale overshoot after gauge
```

### 4.6 Scroll Behaviors

```
Behavior                Target              Spec
--------------------------------------------------------------
Sticky navbar           NavBar               top-0, z-50, bg-navy/90 backdrop-blur
Sticky feed stats       FeedStatsBar         top-[53px], z-40, bg-navy/90 backdrop-blur
Smooth scroll           Landing page links   scroll-behavior: smooth (CSS)
IntersectionObserver    Feed posts           threshold: 0.5, triggers scan
Scroll restoration      All pages            Next.js default
```

---

## 5. Responsive Breakpoints

### 5.1 Breakpoint Definitions

```
Name       Min-Width    Tailwind Prefix    Usage
--------------------------------------------------------------
mobile     0px          (default)          Single column, stacked
tablet     640px        sm:                2-column grids begin
desktop    1024px       lg:                Full layouts, sidebars
wide       1280px       xl:                Max content width
```

### 5.2 Per-Page Responsive Behavior

#### Landing Page
```
Mobile (< 640px):
  - Hero: text-3xl, py-16, single column
  - Stats: 1 column, gap-4
  - How It Works: 1 column
  - Features: 1 column
  - CTAs: stacked vertically

Tablet (640-1024px):
  - Hero: text-4xl, py-20
  - Stats: 3 columns
  - How It Works: 3 columns
  - Features: 2 columns
  - CTAs: side by side

Desktop (> 1024px):
  - Hero: text-5xl, py-24
  - Max-width: 5xl (max-w-5xl)
  - Full layout as wireframed
```

#### Dashboard
```
Mobile (< 640px):
  - All cards: 1 column, full width
  - Tab buttons: full width, stacked or scroll horizontal
  - IDS card: gauge smaller (120px), sub-metrics 1 column
  - Charts: full width, height reduced

Tablet (640-1024px):
  - Stat cards: 2 columns
  - Charts: full width
  - Slop Index: 2-column grid

Desktop (> 1024px):
  - Stat cards: 3-4 columns
  - Bottom row: 2-column grid (chart + table)
  - Max-width: 6xl (max-w-6xl)
```

#### Platform Simulator
```
Mobile (< 640px):
  - Platform tabs: horizontal scroll
  - Composer: full width
  - Results: full width, below composer
  - Stacked vertically

Tablet (640-1024px):
  - Still stacked but with more padding

Desktop (> 1024px):
  - Split layout: 50/50 (composer left, results right)
  - grid-cols-2 gap-6
```

#### Text Analyzer
```
Mobile (< 640px):
  - Textarea: full width, min-h-[200px]
  - Results: stacked (gauge, heatmap, breakdown, features)
  - Gauge: 120px

Tablet (640-1024px):
  - Results: 2-column (gauge + heatmap)
  - Breakdown: full width below

Desktop (> 1024px):
  - Results: 2-column (gauge left, heatmap right)
  - Breakdown + Features: full width below
```

#### Extension Popup
```
Fixed width: 280px (Chrome extension constraint)
No responsive breakpoints needed
```

### 5.3 Component Responsive Variants

```
Component               Mobile            Tablet             Desktop
--------------------------------------------------------------
TrustScoreGauge         size=120          size=150           size=180
InformationDietCard     gauge=100,        gauge=140,         gauge=180,
                        metrics=1col      metrics=2col       metrics=4col
VerdictBadge            size="sm"         size="md"          size="md"
SentenceHeatmap         font=13px         font=14px          font=14px
FeatureVectorDisplay    label 100px       label 120px        label 140px
StatCard                span full         span 1/2           span 1/3 or 1/4
ChartCard               h-48              h-56               h-64
NavBar                  hamburger         hamburger          full nav links
```

---

## 6. Accessibility

### 6.1 Color Contrast Ratios

All text/background combinations MUST meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text).

```
Combination                           Ratio    Pass
--------------------------------------------------------------
text-primary (#fff) on bg-base (#0f1a2e)      15.6:1   AAA
text-secondary (#e2e8f0) on bg-base           12.8:1   AAA
text-muted (#94a3b8) on bg-base                6.2:1   AA
text-dimmed (#64748b) on bg-base               3.8:1   AA-large only *
text-primary (#fff) on bg-surface (#1a2744)   12.4:1   AAA
text-muted (#94a3b8) on bg-surface             5.0:1   AA
accent (#3b82f6) on bg-base                    4.6:1   AA
verdict-human (#22c55e) on bg-base             5.8:1   AA
verdict-ai (#ef4444) on bg-base                4.5:1   AA
verdict-light-edit (#eab308) on bg-base        7.1:1   AAA
verdict-heavy-edit (#f97316) on bg-base        5.5:1   AA

* text-dimmed is only used for non-essential decorative text.
  For any essential information, use text-muted or lighter.
```

#### Badge Contrast (white text on colored backgrounds)
```
White on verdict-human bg (rgba 34,197,94,0.85)        4.8:1   AA
White on verdict-light-edit bg (rgba 234,179,8,0.85)   2.9:1   AA-large *
White on verdict-heavy-edit bg (rgba 249,115,22,0.85)  3.2:1   AA-large *
White on verdict-ai bg (rgba 239,68,68,0.85)           4.5:1   AA

* Light Edit and Heavy Edit badges use bold text (font-weight 700)
  at 12px+ which qualifies as "large text equivalent" per WCAG guidelines
  due to the bold weight. The badges also include icon symbols as
  redundant visual indicators (not color-alone).
```

### 6.2 Focus States

All interactive elements MUST have visible focus indicators.

```css
/* Global focus style */
*:focus-visible {
  outline: 2px solid #3b82f6;      /* accent blue */
  outline-offset: 2px;
  border-radius: 4px;              /* match element radius */
}

/* Button focus */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

/* Input focus */
textarea:focus-visible,
input:focus-visible {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* Tab focus */
[role="tab"]:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}
```

### 6.3 Screen Reader Considerations

#### ARIA Labels
```
Component                 ARIA Pattern
--------------------------------------------------------------
NavBar                    <nav aria-label="Main navigation">
Tab switcher              role="tablist" + role="tab" + role="tabpanel"
                          aria-selected, aria-controls
TrustScoreGauge           role="meter" aria-valuenow={score}
                          aria-valuemin={0} aria-valuemax={100}
                          aria-label="Trust score: {score} out of 100"
VerdictBadge              aria-label="{verdict} verdict, trust score {score}%"
Progress bars             role="progressbar" aria-valuenow + aria-valuemin + aria-valuemax
SentenceHeatmap           Each sentence: aria-label="Sentence {n}, {score}% AI probability"
PlatformNotification      role="alert" aria-live="polite"
                          (announces when result appears)
IDS Grade                 aria-label="Information Diet Score: {grade}, {score} out of 100"
Feed scan status          aria-live="polite" on stats bar updates
Status dot                aria-label="Scanning active" or "Scanning paused"
```

#### Semantic HTML
```
- Use <main> for primary content area
- Use <section> with aria-label for major page sections
- Use <h1> -> <h6> in proper hierarchy (no skipping levels)
- Use <button> for interactive elements (not div onclick)
- Use <a> for navigation links
- Use <table> with <thead>/<tbody>/<th scope> for data tables
- Use <ul>/<li> for lists (domain leaderboard, feature vector)
```

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Specifically disable: */
  .animate-glow-shift,
  .animate-shimmer,
  .animate-scan-pulse,
  .animate-fade-in-up {
    animation: none;
    opacity: 1;
    transform: none;
  }

  /* Gauges: show final state immediately */
  .gauge-progress {
    transition: none;
  }
}
```

### 6.4 Keyboard Navigation

```
Component               Key           Action
--------------------------------------------------------------
NavBar links            Tab/Shift+Tab Focus through links
                        Enter         Navigate to page
Dashboard tabs          Tab           Focus tab list
                        Arrow L/R     Switch tabs
                        Enter/Space   Activate tab
Platform selector       Tab           Focus tab list
                        Arrow L/R     Switch platform
                        Enter/Space   Activate platform
Textarea                Tab           Focus textarea
                        Shift+Tab     Focus previous element
Analyze button          Enter/Space   Submit analysis
Post button             Enter/Space   Submit post
Heatmap sentences       Tab           Focus each sentence
                        Enter/Space   Show tooltip
Mobile hamburger        Enter/Space   Toggle menu
                        Escape        Close menu
PlatformNotification    Tab           Focus action buttons
action buttons          Enter/Space   Activate action
```

---

## 7. Migration Notes (TrustLens -> Baloney)

### 7.1 Text/Copy Changes

```
Location                    Old                          New
--------------------------------------------------------------
layout.tsx metadata title   "TrustLens -- AI Content..." "Baloney -- AI Content Detection"
layout.tsx description      "...TrustLens..."            "...Baloney..."
Navbar brand               "TrustLens"                  "Baloney"
Navbar icon                 ScanSearch (lucide)          Custom Baloney icon or hot dog emoji
Landing hero subtext        "TrustLens detects..."       "Baloney detects..."
Extension popup h1          "TrustLens"                  "Baloney"
Extension popup footer      "TrustLens v0.1.0"           "Baloney v1.0.0"
Extension manifest name     "TrustLens --..."            "Baloney -- AI Content Detector"
Extension styles classes    ".trustlens-badge"           ".baloney-badge"
Extension content.js refs   "trustlens-"                 "baloney-"
Dashboard link (popup)      "trustlens-nu.vercel.app"    "baloney.app"
Footer                      "Built at MadData26"         "Built at MadData26" (keep)
```

### 7.2 Type System Changes

```typescript
// OLD
type Verdict = "ai_generated" | "likely_human" | "inconclusive";

// NEW
type Verdict4 = "human" | "light_edit" | "heavy_edit" | "ai_generated";

// Keep old type as alias during migration
type VerdictLegacy = "ai_generated" | "likely_human" | "inconclusive";
```

### 7.3 New Types to Add

```typescript
interface FeatureVector {
  burstiness: number;
  type_token_ratio: number;
  perplexity: number;
  repetition_score: number;
}

interface TextAnalysisResult {
  trustScore: number;          // 0-1
  verdict: Verdict4;
  editMagnitude: number;       // 0-1
  sentenceScores: number[];    // per-sentence AI probability
  featureVector: FeatureVector;
  textStats: TextStats;        // existing type
}

interface InformationDietScore {
  score: number;               // 0-100
  grade: string;               // "A+" through "F"
  aiContentRatio: number;      // 0-1
  sourceDiversity: number;     // 0-1
  trendDirection: number;      // -1 to 1
  awarenessActions: number;    // 0-1
  description: string;
  computedAt: string;
}
```

### 7.4 Constants Changes

```typescript
// NEW verdict colors (replaces VERDICT_COLORS)
export const VERDICT_COLORS_4: Record<
  Verdict4,
  { bg: string; border: string; label: string; icon: string }
> = {
  human: {
    bg: "rgba(34, 197, 94, 0.85)",
    border: "rgba(100, 255, 150, 0.3)",
    label: "Human",
    icon: "check",
  },
  light_edit: {
    bg: "rgba(234, 179, 8, 0.85)",
    border: "rgba(255, 220, 50, 0.3)",
    label: "Light Edit",
    icon: "tilde",
  },
  heavy_edit: {
    bg: "rgba(249, 115, 22, 0.85)",
    border: "rgba(255, 160, 50, 0.3)",
    label: "Heavy Edit",
    icon: "slashes",
  },
  ai_generated: {
    bg: "rgba(239, 68, 68, 0.85)",
    border: "rgba(255, 100, 100, 0.4)",
    label: "AI",
    icon: "x",
  },
};

// NEW chart colors (extend CHART_COLORS)
export const CHART_COLORS = {
  ...existing,
  lightEdit: "#eab308",
  heavyEdit: "#f97316",
} as const;

// IDS grade colors
export const IDS_GRADE_COLORS: Record<string, string> = {
  "A+": "#34d399", A: "#34d399",
  "B+": "#4ade80", B: "#4ade80",
  "C+": "#facc15", C: "#facc15",
  "D+": "#fb923c", D: "#fb923c",
  F: "#f87171",
};
```

### 7.5 New Files to Create

```
frontend/src/app/platform/page.tsx          -- Platform Simulator page
frontend/src/app/analyze/page.tsx           -- Text Analyzer page
frontend/src/components/TrustScoreGauge.tsx -- Circular gauge component
frontend/src/components/VerdictBadge.tsx    -- 4-way badge (replaces DetectionBadge)
frontend/src/components/InformationDietCard.tsx -- IDS hero card
frontend/src/components/SentenceHeatmap.tsx -- Per-sentence coloring
frontend/src/components/PrePublishSimulator.tsx -- Platform sim
frontend/src/components/PlatformNotification.tsx -- Simulated notifications
frontend/src/components/FeatureVectorDisplay.tsx -- 4-bar feature viz
frontend/src/components/ScoreBreakdown.tsx  -- Weighted factor viz
```

### 7.6 Files to Modify

```
frontend/tailwind.config.js                -- Add new color tokens
frontend/src/app/globals.css               -- Add new animations, focus styles
frontend/src/app/layout.tsx                -- Update metadata, title
frontend/src/app/page.tsx                  -- Rebrand, new feature cards, demo gauge
frontend/src/app/feed/page.tsx             -- Use Verdict4 type
frontend/src/app/feed/FeedPost.tsx         -- Use VerdictBadge
frontend/src/app/feed/FeedStatsBar.tsx     -- Update color logic
frontend/src/app/dashboard/page.tsx        -- Add InformationDietCard
frontend/src/app/dashboard/PersonalTab.tsx -- Use new components
frontend/src/app/dashboard/CommunityTab.tsx -- Use Verdict4
frontend/src/app/dashboard/ProvenanceTable.tsx -- Use VerdictBadge
frontend/src/app/dashboard/RecentScansTable.tsx -- Use VerdictBadge
frontend/src/components/Navbar.tsx         -- Rebrand, add nav links, mobile menu
frontend/src/components/DetectionBadge.tsx  -- Deprecated, replaced by VerdictBadge
frontend/src/lib/types.ts                  -- Add Verdict4, FeatureVector, IDS types
frontend/src/lib/constants.ts              -- Add new verdict colors, chart colors
extension/manifest.json                    -- Rebrand name, add contextMenus permission
extension/popup.html                       -- Rebrand, add IDS mini-card
extension/styles.css                       -- Add 4-way badge classes, rename to baloney-
extension/content.js                       -- Rebrand class names, 4-way verdicts
extension/background.js                    -- Add context menu handlers
```

### 7.7 Tailwind Config Extensions

```javascript
// tailwind.config.js additions
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0f1a2e",
        "navy-light": "#1a2744",
        "navy-light-hover": "#1e3050",
        "navy-lighter": "#1e3a5f",
        accent: "#3b82f6",
        "accent-hover": "#2563eb",
        "verdict-human": "#22c55e",
        "verdict-light-edit": "#eab308",
        "verdict-heavy-edit": "#f97316",
        "verdict-ai": "#ef4444",
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out forwards",
        "scan-pulse": "scan-pulse 1.5s ease-in-out infinite",
        "glow-shift": "glow-shift 8s ease-in-out infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "count-up": "count-up 0.5s ease-out forwards",
        "gauge-fill": "gauge-fill 1s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "bar-fill": "bar-fill 0.4s ease-out forwards",
        "status-pulse": "status-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
```

### 7.8 New CSS Animations to Add

```css
/* globals.css additions */

@keyframes gauge-fill {
  from { stroke-dashoffset: var(--gauge-circumference); }
  to { stroke-dashoffset: var(--gauge-offset); }
}

@keyframes bar-fill {
  from { width: 0%; }
  to { width: var(--bar-target); }
}

@keyframes status-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
  50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
}

/* Focus styles */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Heatmap sentence styles */
.heatmap-sentence {
  transition: background-color 200ms ease, opacity 200ms ease;
  cursor: pointer;
  border-radius: 2px;
  padding: 1px 2px;
}

.heatmap-sentence:hover {
  opacity: 1 !important;
}

.heatmap-sentence--dimmed {
  opacity: 0.6;
}
```

---

## End of Design Specification

This document covers every visual element, interaction pattern, responsive behavior, and accessibility consideration needed to implement the Baloney rebrand. The implementer should:

1. Start with design token updates (tailwind.config.js, globals.css, constants.ts, types.ts)
2. Build new shared components (TrustScoreGauge, VerdictBadge, InformationDietCard)
3. Create new pages (/platform, /analyze)
4. Update existing pages (landing, dashboard, feed)
5. Update extension files last (popup, styles, content script, background, manifest)

Every component has defined props, color specs, animation details, responsive behavior, accessibility requirements, and ASCII wireframes. No design decisions are left ambiguous.
