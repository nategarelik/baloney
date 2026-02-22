# Baloney — Manual Test Results

**Date:** 2026-02-21 (Pre-Hackathon Demo)
**Tested by:** Code Review + Live Page Verification + WebFetch
**Legend:** PASS = code matches expectation | FAIL = code does NOT match | MANUAL = requires browser interaction

---

## CRITICAL FIX: Deployment Gap

**Issue:** The 2 most recent commits (`b628b4c` rebrand + `8c48f68` universal scanning) were pushed to GitHub but never deployed to Vercel. The production site was stuck on commit `4405a8e` (URL update). The `/my-diet`, `/extension`, `/analyze`, and `/platform` pages returned 404. The navbar was missing "My Diet" and "Extension" links.

**Root Cause:** GitHub repo was renamed from `trustlens` to `baloney`, which broke the Vercel GitHub integration webhook.

**Fix:** Manual `vercel --prod` deployment from CLI. All pages now live at https://baloney.app.

## Live Page Verification (Post-Deploy)

| Page | URL | Status | Key Content Verified |
|------|-----|--------|---------------------|
| Landing | / | **LIVE** | Hero, stats, how-it-works, CTA |
| Feed | /feed | **LIVE** | 20 demo posts, "0 of 20 scanned" counter |
| Analyze | /analyze | **LIVE** | Text Analyzer heading, "Analyze Text" button |
| My Diet | /my-diet | **LIVE** | "My Information Diet" heading, loading state, navbar with 6 links |
| Platform | /platform | **LIVE** | Platform Simulator, 4 platform buttons |
| Dashboard | /dashboard | **LIVE** | Personal/Community tabs, analytics layout |
| Extension | /extension | **LIVE** | v0.2.0 badge, 6 features, 3 install steps, Open Dashboard CTA |

## Bugs Fixed During Testing

1. **`content.js` — `updateStats()`/`updateTextStats()` only counted `ai_generated` as flagged** → Fixed to also count `heavy_edit` (matches `shouldFilter()` behavior)
2. **`background.js` — Context menu text check had no mock fallback** → Added timeout + `mockTextResult()` fallback (matches image scan pattern)
3. **`popup.html` — Top Pages list used `innerHTML` with hostname** → Replaced with safe DOM createElement/textContent

---

## Test Group 1: Extension All-URL Support

| Test | Expected | Code Review Result | Notes |
|------|----------|-------------------|-------|
| T1.1 — Extension loads on any site | `[Baloney] Content script loaded` in console | **PASS** | `manifest.json` L22: `"matches": ["<all_urls>"]`; `content.js` L468: `console.log("[Baloney] Content script loaded")` |
| T1.2 — Extension loads on news site | Same console log + icon in toolbar | **PASS** | Same all-URL pattern applies |
| T1.3 — Platform detection accuracy | 8 platforms detected correctly | **PASS** | `background.js` L86-96: `detectPlatform()` handles instagram, x/twitter, reddit, facebook, tiktok, linkedin, medium → "other" fallback |

---

## Test Group 2: Image Auto-Scanning

| Test | Expected | Code Review Result | Notes |
|------|----------|-------------------|-------|
| T2.1 — Images get badges on news site | Shimmer → badge on images >200px | **PASS** | `content.js` L5: `MIN_IMAGE_SIZE = 200`; L30-36: `isTargetImage()` checks naturalWidth/Height; L267: `showScanningIndicator()`; L291: `injectBadge()` |
| T2.2 — Image size filter works | Only images >=200x200 scanned | **PASS** | `content.js` L33: `img.naturalWidth < MIN_IMAGE_SIZE || img.naturalHeight < MIN_IMAGE_SIZE` |
| T2.3 — Icon/logo/avatar skip | URLs with /icon, /logo, /avatar, /emoji skipped | **PASS** | `content.js` L35: checks `src.includes("/icon")`, `/logo`, `/avatar`, `/emoji` |
| T2.4 — Dynamic content (infinite scroll) | MutationObserver detects new images | **PASS** | `content.js` L436-461: `domObserver` watches `childList` + `subtree`, observes new `<img>` elements and text blocks |
| T2.5 — Instagram regression | Instagram images still work | **PASS** | All-URL manifest ensures injection; no Instagram-specific code breaks |

---

## Test Group 3: Text Auto-Scanning

| Test | Expected | Code Review Result | Notes |
|------|----------|-------------------|-------|
| T3.1 — Text blocks get colored borders | Paragraphs >100 chars get 4px left border + badge | **PASS** | `content.js` L307-308: `TEXT_SELECTORS` targets `p, article, [role='article'], blockquote` etc; L317: `MIN_TEXT_LENGTH = 100`; L323-358: `injectTextOverlay()` adds border + background + badge |
| T3.2 — Short text skipped | <100 chars ignored | **PASS** | `content.js` L317: `text.length < MIN_TEXT_LENGTH` → return false |
| T3.3 — Nav/header/footer skipped | Skip containers | **PASS** | `content.js` L309: `SKIP_CONTAINERS = ["nav", "header", "footer", "aside", "script", "style", "noscript"]`; L313: `el.closest(SKIP_CONTAINERS.join(","))` |
| T3.4 — Text verdict colors | ai=#ef4444, heavy=#f97316, light=#f59e0b, human=#22c55e | **PASS** | `content.js` L326-331: `colorMap` matches exactly |
| T3.5 — Text truncation to 2000 chars | Long text truncated | **PASS** | `content.js` L371: `text.slice(0, 2000)` |
| T3.6 — Mixed image + text scanning | Both work simultaneously | **PASS** | Separate observers: `viewportObserver` for images (L417), `textObserver` for text (L398); both use shared `RequestQueue` |

---

## Test Group 4: Content Filtering Modes

| Test | Expected | Code Review Result | Notes |
|------|----------|-------------------|-------|
| T4.1 — Label mode (default) | Badges only, no blur/hide | **PASS** | `content.js` L13: `filterMode = "label"`; `applyFilter()` L139-169 only acts on blur/hide modes |
| T4.2 — Blur mode | 20px blur + grayscale + 0.3 opacity + overlay | **PASS** | `styles.css` L119-123: `.baloney-filtered { filter: blur(20px) grayscale(0.5); opacity: 0.3; }`; L130-148: `.baloney-blur-reveal` overlay with "AI Content — Click to Reveal" |
| T4.3 — Click to reveal | Removes blur on click | **PASS** | `content.js` L158-161: click handler adds `baloney-revealed` class; `styles.css` L125-128: `.baloney-revealed { filter: none; opacity: 1; }` |
| T4.4 — Hide mode | AI content containers get `display:none` | **PASS** | `content.js` L166-168: adds `baloney-hidden` to closest article/container; `styles.css` L155-157: `.baloney-hidden { display: none !important; }` |
| T4.5 — Switch back to Label | All filters removed | **PASS** | `content.js` L190-208: `reapplyFilterMode()` calls `removeFilter()` then `applyFilter()` for all scanned elements |
| T4.6 — Filter persists across pages | Mode stored in chrome.storage.local | **PASS** | `content.js` L15-16: reads from storage on load; `popup.html` L465: `chrome.storage.local.set({ filterMode: mode })`; `content.js` L19-24: `onChanged` listener updates and reapplies |
| T4.7 — Filter applies to text too | Text blocks also blur/hide | **PASS** | `content.js` L200-207: `reapplyFilterMode()` processes `[data-baloney-text-scanned]` elements; `analyzeTextBlock()` L387 calls `applyFilter(el, verdict)` |
| T4.8 — Human/light-edit never filtered | Only ai_generated + heavy_edit | **PASS** | `content.js` L135-137: `shouldFilter()` returns true only for `ai_generated` or `heavy_edit` |

---

## Test Group 5: Popup Features

| Test | Expected | Code Review Result | Notes |
|------|----------|-------------------|-------|
| T5.1 — Combined stats | images+text scanned/flagged | **PASS** | `popup.html` L410-411: `totalScanned = stats.scanned + stats.textScanned`; `totalFlagged = stats.flaggedAI + stats.textFlagged` |
| T5.2 — Exposure bar colors | 0-20% green, 21-40% yellow, 41%+ red | **PASS** | `popup.html` L422: `pct > 40 ? "high" : pct > 20 ? "medium" : "low"`; CSS L85-87: `.low = #22c55e`, `.medium = #eab308`, `.high = #ef4444` |
| T5.3 — Filter mode buttons | Label/Blur/Hide with active state | **PASS** | `popup.html` L317-321: 3 buttons with `data-mode`; L453-469: active class toggle + storage persistence |
| T5.4 — IDS card loads | Letter grade + score/100 | **PASS** | `popup.html` L426-449: `loadIDS()` fetches from `/api/information-diet?user_id=...`; sets grade color from `GRADE_COLORS` map; falls back to "—" on error |
| T5.5 — This Page section | Hostname + image/text/flagged counts | **PASS** | `popup.html` L475-492: queries active tab, looks up `pageStats[hostname]`, shows section if data exists |
| T5.6 — Top Pages mini-list | Up to 5 sites sorted by total | **PASS** | `popup.html` L494-521: sorts entries by total descending, slices to 5, renders with color-coded bars |
| T5.7 — Session timer | Elapsed time from extension load | **PASS** | `popup.html` L392-405: reads `sessionStartTime` from storage, updates every 1s; `background.js` L292: sets `sessionStartTime: Date.now()` on init |
| T5.8 — Dashboard link | Opens dashboard in new tab | **PASS** | `popup.html` L359: `<a href="https://baloney.app/dashboard" target="_blank">` |

---

## Test Group 6: Context Menus

| Test | Expected | Code Review Result | Notes |
|------|----------|-------------------|-------|
| T6.1 — Scan image via right-click | "Scan with Baloney" → toast | **PASS** | `background.js` L163-167: creates `scan-image` context menu for `contexts: ["image"]`; L176-188: fetches base64, detects, sends `show-result`; `content.js` L549-556: handles toast |
| T6.2 — Check text via right-click | "Check with Baloney" → toast | **PASS** | `background.js` L168-172: creates `check-text` for `contexts: ["selection"]`; L190-207: posts text to API; `content.js` L558-565: handles `show-text-result` toast with 60-char preview |
| T6.3 — Toast auto-dismiss | 5 second timeout | **PASS** | `content.js` L536: `setTimeout(() => toast?.remove(), 5000)` |

---

## Test Group 7: Frontend — /my-diet Page

| Test | Expected | Code Review Result | Notes |
|------|----------|-------------------|-------|
| T7.1 — Page loads with data | Gauge + 4 cards + tips + table | **PASS** | `my-diet/page.tsx`: fetches `getInformationDietScore()` + `getMyScans()` on mount; renders all sections |
| T7.2 — Score gauge renders | SVG ring with grade + score | **PASS** | `ScoreGauge` component L18-41: SVG circle with `strokeDasharray`/`strokeDashoffset` for progress, `rotate(-90)` for clockwise-from-top |
| T7.3 — Breakdown cards | AI Ratio (red), Source Diversity (blue), Trend (dynamic), Awareness (purple) | **PASS** | L145-175: 4 `BreakdownCard` components with correct icons and colors; Trend: green if >0, red if <0, amber if 0 |
| T7.4 — Tips match score | 80+: "excellent", 60-79: "diverse", 40-59: "moderately high", 0-39: "needs attention" | **PASS** | `getTips()` L64-86: matches exactly; 80+→3 tips, 60-79→3, 40-59→3, 0-39→4 tips |
| T7.5 — Recent scans table | Platform/Type/Verdict/Confidence/Time + colored verdicts | **PASS** | L204-237: table with colored verdict classes; `ai_generated`=red, `heavy_edit`=orange, `light_edit`=amber, human=green |
| T7.6 — Empty state | "No scans yet" message | **PASS** | L200-201: `scans.length === 0 ? <p>No scans yet...</p>` |

---

## Test Group 8: Frontend — /extension Page

| Test | Expected | Code Review Result | Notes |
|------|----------|-------------------|-------|
| T8.1 — Page renders all sections | Hero + banner + features + steps + CTA | **PASS** | `extension/page.tsx`: All 5 sections present |
| T8.2 — 6 feature cards | Works Everywhere/Auto-Scanning/Content Filtering/Real-Time Stats/Instant Results/Text Detection | **PASS** | `FEATURES` array L6-37: exactly 6 entries with Globe/Eye/Shield/BarChart3/Zap/ScanSearch icons |
| T8.3 — 3 install steps | Download/Unpack/Load Extension | **PASS** | `STEPS` array L39-58: 3 entries; Step 3 mentions "chrome://extensions" and "Developer Mode" |
| T8.4 — CTA navigates to /dashboard | Link to /dashboard | **PASS** | L125-130: `<Link href="/dashboard">Open Dashboard</Link>` |

---

## Test Group 9: Navbar

| Test | Expected | Code Review Result | Notes |
|------|----------|-------------------|-------|
| T9.1 — 6 links present | Demo Feed/Analyze/My Diet/Platform/Dashboard/Extension | **PASS** | `Navbar.tsx` L8-15: `NAV_LINKS` array with exactly 6 entries |
| T9.2 — Active link highlighting | Current page = white + font-medium; others = slate-400 | **PASS** | L31-35: `pathname === link.href ? "text-white font-medium" : "text-slate-400 hover:text-white"` |
| T9.3 — All links navigate correctly | /feed, /analyze, /my-diet, /platform, /dashboard, /extension | **PASS** | All 6 page.tsx files exist in `src/app/` subdirectories |

---

## Test Group 10: Cross-Cutting & Edge Cases

| Test | Expected | Code Review Result | Notes |
|------|----------|-------------------|-------|
| T10.1 — API fallback (offline) | Mock fallback with random verdicts | **PASS** | `background.js` L139-147: `detectWithFallback()` catches errors → calls `mockImageResult()`; L269-271: text mock fallback; console warns "[Baloney] API unavailable, using mock fallback" |
| T10.2 — Rapid scroll throttle | Max 3 concurrent requests | **PASS** | `content.js` L6: `MAX_CONCURRENT = 3`; L43-64: `RequestQueue` class enforces limit with queue |
| T10.3 — Extension on chrome:// pages | No crashes | **MANUAL** | Chrome prevents content scripts on chrome:// URLs by default; `<all_urls>` excludes chrome:// |
| T10.4 — Multiple tabs | Independent per-page stats | **PASS** | `content.js` L88: `pageHostname = window.location.hostname` per content script instance; `popup.html` L476: queries active tab |
| T10.5 — Production site loads | All 7 pages render | **MANUAL** | All page files exist. Requires live verification. |

---

## Issues Found During Code Review

### Bug: `updateStats()` only counts `ai_generated` as flagged, but filtering also acts on `heavy_edit`

**Location:** `content.js` L74-79
**Details:** `updateStats()` only increments `flaggedAI` when verdict is `ai_generated`, but `shouldFilter()` (L135-137) filters both `ai_generated` and `heavy_edit`. The popup stats will undercount flagged content.
**Impact:** Low — affects stat accuracy but not functionality.
**Fix:** Also count `heavy_edit` in `updateStats()` and `updateTextStats()`.

### Bug: `updateTextStats()` also only counts `ai_generated`

**Location:** `content.js` L81-85
**Same issue** — `textFlagged` doesn't include `heavy_edit` verdicts.

### Minor: IDS endpoint is GET-only, test plan says POST

**Location:** `information-diet/route.ts` — only exports `GET`
**Details:** Test plan mentions testing with POST body `{"user_id": "test-user-1"}`, but the route only handles GET with `?user_id=` query param.
**Impact:** None — all callers (popup.js, api.ts) use GET correctly.

### Minor: Context menu text check has no mock fallback

**Location:** `background.js` L190-207
**Details:** The context menu `check-text` handler calls the API directly without a `try/catch` + mock fallback, unlike the `analyze-text` message handler (L246-276). If the API is down, right-click text check will silently fail.
**Impact:** Medium — degrades gracefully (error logged but no toast shown).

### Minor: `popup.html` uses `innerHTML` with pageStats hostname

**Location:** `popup.html` L512-517
**Details:** `e.host` is directly interpolated into innerHTML. While hostnames are from `window.location.hostname` (browser-controlled), this is technically an XSS risk if the hostname were manipulated.
**Impact:** Very low — hostnames come from the browser, not user input.

---

## Quick Smoke Test Checklist (Demo Day)

- [x] Extension manifest has `<all_urls>` for content_scripts and host_permissions
- [x] Content script logs `[Baloney] Content script loaded`
- [x] Image scanning: MIN_IMAGE_SIZE=200, skip /icon /logo /avatar /emoji
- [x] Text scanning: MIN_TEXT_LENGTH=100, skip nav/header/footer/aside
- [x] IntersectionObserver for viewport-based lazy scanning
- [x] MutationObserver for dynamic content (infinite scroll)
- [x] RequestQueue with MAX_CONCURRENT=3
- [x] Filter modes: Label (default), Blur (20px + reveal), Hide (display:none)
- [x] Filter stored in chrome.storage.local, reapplied on change
- [x] Popup: combined stats, exposure bar, filter buttons, IDS card
- [x] Popup: This Page (hostname stats), Top Pages (top 5), session timer
- [x] Context menus: "Scan with Baloney" (image) + "Check with Baloney" (selection)
- [x] Toast: 5-second auto-dismiss with verdict colors
- [x] Mock fallback on API failure (images + text)
- [x] /my-diet: gauge + 4 cards + tips + recent scans table
- [x] /extension: hero + 6 features + 3 steps + CTA
- [x] Navbar: 6 links with active highlighting
- [x] **VERIFIED:** All 7 frontend pages load on https://baloney.app (post-redeploy)
- [x] **VERIFIED:** Navbar shows all 6 links on every page
- [x] **VERIFIED:** /my-diet has heading + loading state + data fetch
- [x] **VERIFIED:** /extension has v0.2.0 badge, 6 features, 3 steps, CTA
- [x] **VERIFIED:** /feed has 20 demo posts with scan counter
- [ ] **MANUAL:** Load extension in Chrome and verify green dot
- [ ] **MANUAL:** Visit BBC article → verify badges + borders appear
- [ ] **MANUAL:** Toggle Blur → verify blur effect on page
- [ ] **MANUAL:** Toggle Hide → verify content disappears
- [ ] **MANUAL:** Right-click image → verify toast appears
