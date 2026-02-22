// frontend/src/lib/phishing-detector.ts — Phishing website detection via HTML feature extraction
// Extracts 80+ features from raw HTML source code for phishing classification.
// All features are computed client-side (no external API calls) for real-time detection.

import type {
  MetaTagFeatures,
  FormFeatures,
  LinkFeatures,
  ResourceFeatures,
  ScriptFeatures,
  ContentFeatures,
  URLFeatures,
  PhishingFeatureVector,
  PhishingDetectionResult,
  PhishingVerdict,
  PhishingSignal,
} from "./phishing-types";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const PHISHING_TITLE_KEYWORDS = [
  "login", "log-in", "log in", "signin", "sign-in", "sign in",
  "verify", "verification", "confirm", "update", "secure",
  "account", "suspend", "unlock", "restore", "validate",
  "authenticate", "expired", "reactivate", "unusual activity",
  "limited", "immediately", "urgent", "alert", "warning",
  "paypal", "apple", "microsoft", "google", "amazon", "netflix",
  "bank", "credit card", "ssn", "social security",
];

const URGENCY_WORDS = [
  "immediately", "urgent", "suspended", "limited time",
  "act now", "expires", "within 24 hours", "within 48 hours",
  "your account", "unauthorized", "unusual activity",
  "confirm your identity", "verify your", "failure to",
  "will be closed", "will be suspended", "will be locked",
  "click here", "click below", "do not ignore",
];

const THREATENING_WORDS = [
  "suspended", "terminated", "closed", "locked",
  "disabled", "restricted", "unauthorized access",
  "illegal", "fraudulent", "violation",
];

const KNOWN_BRANDS = [
  "paypal", "apple", "microsoft", "google", "amazon", "netflix",
  "facebook", "instagram", "twitter", "linkedin", "chase",
  "wells fargo", "bank of america", "citibank", "usps",
  "fedex", "dhl", "irs", "dropbox", "adobe", "spotify",
  "walmart", "ebay", "yahoo", "outlook", "office365",
];

const SUSPICIOUS_TLDS = [
  ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top",
  ".work", ".click", ".link", ".info", ".site", ".online",
  ".buzz", ".icu", ".rest", ".cam", ".monster",
];

const URL_SHORTENERS = [
  "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly",
  "is.gd", "buff.ly", "rebrand.ly", "bl.ink",
];

// ──────────────────────────────────────────────
// HTML Parsing Helpers (regex-based, no DOM dependency)
// ──────────────────────────────────────────────

function getMetaContent(html: string, name: string): string | null {
  // Match <meta name="X" content="Y"> or <meta property="X" content="Y">
  const patterns = [
    new RegExp(`<meta\\s+(?:name|property)\\s*=\\s*["']${name}["'][^>]*content\\s*=\\s*["']([^"']*)["']`, "i"),
    new RegExp(`<meta\\s+content\\s*=\\s*["']([^"']*)["'][^>]*(?:name|property)\\s*=\\s*["']${name}["']`, "i"),
  ];
  for (const pat of patterns) {
    const match = html.match(pat);
    if (match) return match[1];
  }
  return null;
}

function getTagContent(html: string, tag: string): string | null {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return match ? match[1].trim() : null;
}

function getAllMatches(html: string, pattern: RegExp): RegExpMatchArray[] {
  const matches: RegExpMatchArray[] = [];
  let match;
  const globalPattern = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
  while ((match = globalPattern.exec(html)) !== null) {
    matches.push(match);
  }
  return matches;
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.toLowerCase();
  } catch {
    return "";
  }
}

function stripTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ──────────────────────────────────────────────
// Feature Extractors
// ──────────────────────────────────────────────

export function extractMetaTagFeatures(html: string, pageUrl?: string): MetaTagFeatures {
  const title = getTagContent(html, "title") || "";
  const description = getMetaContent(html, "description") || "";
  const ogTitle = getMetaContent(html, "og:title") || "";
  const ogDescription = getMetaContent(html, "og:description") || "";
  const ogUrl = getMetaContent(html, "og:url") || "";
  const ogType = getMetaContent(html, "og:type") || "";
  const viewport = getMetaContent(html, "viewport");
  const robots = getMetaContent(html, "robots") || "";
  const author = getMetaContent(html, "author");
  const generator = getMetaContent(html, "generator");
  const referrer = getMetaContent(html, "referrer") || "";

  const hasCharset = /<meta\s+charset/i.test(html) || /<meta\s+http-equiv\s*=\s*["']content-type["']/i.test(html);
  const hasFavicon = /<link\s+[^>]*rel\s*=\s*["'](?:icon|shortcut icon|apple-touch-icon)["']/i.test(html);
  const hasCanonical = /<link\s+[^>]*rel\s*=\s*["']canonical["']/i.test(html);

  // Favicon external check
  const faviconMatch = html.match(/<link\s+[^>]*rel\s*=\s*["'](?:icon|shortcut icon)["'][^>]*href\s*=\s*["']([^"']*)["']/i);
  const faviconHref = faviconMatch ? faviconMatch[1] : "";
  const faviconExternal = faviconHref.startsWith("http") && pageUrl
    ? extractDomain(faviconHref) !== extractDomain(pageUrl)
    : false;

  // Canonical mismatch
  const canonicalMatch = html.match(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*)["']/i);
  const canonicalHref = canonicalMatch ? canonicalMatch[1] : "";
  const canonicalMismatch = canonicalHref && pageUrl
    ? extractDomain(canonicalHref) !== extractDomain(pageUrl)
    : false;

  // OG tag checks
  const ogTagCount = [ogTitle, ogDescription, ogUrl, ogType].filter(v => v.length > 0).length;
  const ogTitleMismatch = ogTitle.length > 0 && title.length > 0
    ? ogTitle.toLowerCase() !== title.toLowerCase() && !title.toLowerCase().includes(ogTitle.toLowerCase().substring(0, 20))
    : false;
  const ogUrlMismatch = ogUrl.length > 0 && pageUrl
    ? extractDomain(ogUrl) !== extractDomain(pageUrl)
    : false;

  // Title keyword analysis
  const titleLower = title.toLowerCase();
  const matchedKeywords = PHISHING_TITLE_KEYWORDS.filter(kw => titleLower.includes(kw));

  // Meta completeness: how many standard meta tags are present (out of 8 expected)
  const expectedTags = [
    title.length > 0,
    description.length > 0,
    ogTagCount > 0,
    viewport !== null,
    hasCharset,
    author !== null,
    hasFavicon,
    hasCanonical,
  ];
  const metaCompleteness = expectedTags.filter(Boolean).length / expectedTags.length;

  return {
    has_title: title.length > 0,
    title_length: title.length,
    title_has_phishing_keywords: matchedKeywords.length > 0,
    title_keyword_count: matchedKeywords.length,
    has_description: description.length > 0,
    description_length: description.length,
    has_og_tags: ogTagCount > 0,
    og_tag_count: ogTagCount,
    og_title_mismatch: ogTitleMismatch,
    og_url_mismatch: ogUrlMismatch,
    has_viewport: viewport !== null,
    has_charset: hasCharset,
    has_robots: robots.length > 0,
    robots_noindex: /noindex/i.test(robots),
    has_author: author !== null,
    has_generator: generator !== null,
    has_favicon: hasFavicon,
    favicon_external: faviconExternal,
    has_canonical: hasCanonical,
    canonical_mismatch: canonicalMismatch,
    has_referrer_no_referrer: /no-referrer/i.test(referrer),
    meta_completeness_score: Math.round(metaCompleteness * 100) / 100,
  };
}

export function extractFormFeatures(html: string, pageUrl?: string): FormFeatures {
  const formMatches = getAllMatches(html, /<form\s[^>]*>/gi);
  const pageDomain = pageUrl ? extractDomain(pageUrl) : "";

  let hasExternalAction = false;
  let hasEmptyAction = false;
  let hasMailtoAction = false;
  let hasPhpAction = false;
  const externalDomains: string[] = [];

  for (const form of formMatches) {
    const actionMatch = form[0].match(/action\s*=\s*["']([^"']*)["']/i);
    const action = actionMatch ? actionMatch[1].trim() : "";

    if (action === "" || action === "#") {
      hasEmptyAction = true;
    } else if (action.startsWith("mailto:")) {
      hasMailtoAction = true;
    } else if (/\.php(\?|$)/i.test(action)) {
      hasPhpAction = true;
    }

    if (action.startsWith("http")) {
      const actionDomain = extractDomain(action);
      if (actionDomain && pageDomain && actionDomain !== pageDomain) {
        hasExternalAction = true;
        if (!externalDomains.includes(actionDomain)) {
          externalDomains.push(actionDomain);
        }
      }
    }
  }

  // Password fields
  const passwordFields = getAllMatches(html, /<input\s[^>]*type\s*=\s*["']password["'][^>]*>/gi);

  // Hidden inputs
  const hiddenInputs = getAllMatches(html, /<input\s[^>]*type\s*=\s*["']hidden["'][^>]*>/gi);

  // Autocomplete off
  const hasAutocompleteOff = /autocomplete\s*=\s*["']off["']/i.test(html);

  // Login form detection
  const hasLoginForm = passwordFields.length > 0 && (
    /type\s*=\s*["'](?:email|text)["']/i.test(html) ||
    /name\s*=\s*["'](?:user|email|login|username)["']/i.test(html)
  );

  // Credential fields (email, password, username, SSN, credit card)
  const credentialPatterns = [
    /name\s*=\s*["'](?:password|passwd|pass|pwd)["']/gi,
    /name\s*=\s*["'](?:email|user|username|login|userid)["']/gi,
    /name\s*=\s*["'](?:ssn|social|card|cc|cvv|expiry)["']/gi,
  ];
  let credentialFieldCount = 0;
  for (const pat of credentialPatterns) {
    credentialFieldCount += getAllMatches(html, pat).length;
  }

  return {
    form_count: formMatches.length,
    has_password_field: passwordFields.length > 0,
    password_field_count: passwordFields.length,
    has_external_action: hasExternalAction,
    external_action_domains: externalDomains,
    has_empty_action: hasEmptyAction,
    has_mailto_action: hasMailtoAction,
    has_php_action: hasPhpAction,
    hidden_input_count: hiddenInputs.length,
    has_autocomplete_off: hasAutocompleteOff,
    has_login_form: hasLoginForm,
    credential_field_count: credentialFieldCount,
  };
}

export function extractLinkFeatures(html: string, pageUrl?: string): LinkFeatures {
  const anchorMatches = getAllMatches(html, /<a\s[^>]*href\s*=\s*["']([^"']*)["'][^>]*>/gi);
  const pageDomain = pageUrl ? extractDomain(pageUrl) : "";

  let externalCount = 0;
  let internalCount = 0;
  let nullCount = 0;
  let ipCount = 0;
  let atSymbolCount = 0;
  let hexCount = 0;
  let shortenedCount = 0;
  const externalDomains = new Set<string>();
  let anchorTextUrlMismatch = false;

  for (const match of anchorMatches) {
    const href = match[1].trim();

    // Null/void links
    if (href === "" || href === "#" || href.startsWith("javascript:") || href === "#content" || href === "#skip") {
      nullCount++;
      continue;
    }

    // External vs internal
    if (href.startsWith("http")) {
      const linkDomain = extractDomain(href);
      if (pageDomain && linkDomain !== pageDomain) {
        externalCount++;
        externalDomains.add(linkDomain);
      } else {
        internalCount++;
      }

      // IP address check
      if (/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(href)) {
        ipCount++;
      }

      // @ symbol (credential phishing in URL)
      if (href.includes("@")) {
        atSymbolCount++;
      }

      // Hex encoding
      if (/%[0-9a-f]{2}/i.test(href)) {
        hexCount++;
      }

      // URL shorteners
      if (URL_SHORTENERS.some(s => href.includes(s))) {
        shortenedCount++;
      }
    } else {
      internalCount++;
    }

    // Anchor text vs URL mismatch (e.g., text says "paypal.com" but href goes elsewhere)
    const anchorText = match[0].replace(/<[^>]+>/g, "").toLowerCase();
    if (anchorText.match(/[a-z]+\.[a-z]{2,}/) && href.startsWith("http")) {
      const textDomain = anchorText.match(/([a-z0-9-]+\.[a-z]{2,})/)?.[1] || "";
      const hrefDomain = extractDomain(href);
      if (textDomain && hrefDomain && !hrefDomain.includes(textDomain) && !textDomain.includes(hrefDomain)) {
        anchorTextUrlMismatch = true;
      }
    }
  }

  const totalLinks = anchorMatches.length;
  const nonNullLinks = totalLinks - nullCount;

  return {
    total_links: totalLinks,
    external_link_count: externalCount,
    internal_link_count: internalCount,
    external_link_ratio: nonNullLinks > 0 ? Math.round((externalCount / nonNullLinks) * 100) / 100 : 0,
    null_link_count: nullCount,
    null_link_ratio: totalLinks > 0 ? Math.round((nullCount / totalLinks) * 100) / 100 : 0,
    unique_external_domains: externalDomains.size,
    has_anchor_text_url_mismatch: anchorTextUrlMismatch,
    links_using_ip_address: ipCount,
    links_with_at_symbol: atSymbolCount,
    links_with_hex_encoding: hexCount,
    has_shortened_urls: shortenedCount,
  };
}

export function extractResourceFeatures(html: string, pageUrl?: string): ResourceFeatures {
  const pageDomain = pageUrl ? extractDomain(pageUrl) : "";

  // External CSS
  const cssLinks = getAllMatches(html, /<link\s[^>]*href\s*=\s*["']([^"']*)["'][^>]*rel\s*=\s*["']stylesheet["']/gi);
  const cssLinks2 = getAllMatches(html, /<link\s[^>]*rel\s*=\s*["']stylesheet["'][^>]*href\s*=\s*["']([^"']*)["']/gi);
  const allCss = [...cssLinks, ...cssLinks2];
  let externalCssCount = 0;
  const externalDomains = new Set<string>();

  for (const m of allCss) {
    if (m[1].startsWith("http")) {
      const domain = extractDomain(m[1]);
      if (pageDomain && domain !== pageDomain) {
        externalCssCount++;
        externalDomains.add(domain);
      }
    }
  }

  // External JS
  const jsScripts = getAllMatches(html, /<script\s[^>]*src\s*=\s*["']([^"']*)["']/gi);
  let externalJsCount = 0;
  for (const m of jsScripts) {
    if (m[1].startsWith("http")) {
      const domain = extractDomain(m[1]);
      if (pageDomain && domain !== pageDomain) {
        externalJsCount++;
        externalDomains.add(domain);
      }
    }
  }

  // Iframes
  const iframes = getAllMatches(html, /<iframe\s[^>]*>/gi);
  let hiddenIframeCount = 0;
  for (const iframe of iframes) {
    const tag = iframe[0].toLowerCase();
    if (
      /style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden|width\s*:\s*0|height\s*:\s*0)/i.test(tag) ||
      /width\s*=\s*["']0["']/i.test(tag) ||
      /height\s*=\s*["']0["']/i.test(tag)
    ) {
      hiddenIframeCount++;
    }
  }

  // Images
  const images = getAllMatches(html, /<img\s[^>]*src\s*=\s*["']([^"']*)["']/gi);
  let base64Count = 0;
  for (const img of images) {
    if (img[1].startsWith("data:")) base64Count++;
  }

  const totalResources = allCss.length + jsScripts.length;
  const externalResources = externalCssCount + externalJsCount;

  return {
    external_css_count: externalCssCount,
    external_js_count: externalJsCount,
    total_resource_count: totalResources,
    external_resource_ratio: totalResources > 0 ? Math.round((externalResources / totalResources) * 100) / 100 : 0,
    external_resource_domains: Array.from(externalDomains),
    has_iframe: iframes.length > 0,
    iframe_count: iframes.length,
    hidden_iframe_count: hiddenIframeCount,
    base64_image_count: base64Count,
    total_image_count: images.length,
  };
}

export function extractScriptFeatures(html: string): ScriptFeatures {
  // Extract all script tag content
  const scriptBlocks = getAllMatches(html, /<script[^>]*>([\s\S]*?)<\/script>/gi);
  const allScriptContent = scriptBlocks.map(m => m[1]).join("\n");

  const scriptTags = getAllMatches(html, /<script\b[^>]*>/gi);
  const inlineScripts = scriptTags.filter(m => !/src\s*=/i.test(m[0]));

  const hasEval = /\beval\s*\(/i.test(allScriptContent);
  const hasUnescape = /\bunescape\s*\(/i.test(allScriptContent);
  const hasAtob = /\batob\s*\(/i.test(allScriptContent);
  const hasDocumentWrite = /document\.write/i.test(allScriptContent);
  const hasRightClickDisable = /oncontextmenu\s*=\s*["']?\s*return\s+false/i.test(html) ||
    /event\.preventDefault/i.test(allScriptContent) && /contextmenu/i.test(allScriptContent);
  const hasMouseoverHiding = /onmouseover\s*=.*(?:window\.status|location\.href)/i.test(html);

  // Obfuscation indicators
  let obfuscationCount = 0;
  if (hasEval) obfuscationCount++;
  if (hasUnescape) obfuscationCount++;
  if (hasAtob) obfuscationCount++;
  if (hasDocumentWrite) obfuscationCount++;
  if (/String\.fromCharCode/i.test(allScriptContent)) obfuscationCount++;
  if (/\\x[0-9a-f]{2}/i.test(allScriptContent)) obfuscationCount++;
  if (/\\u[0-9a-f]{4}/i.test(allScriptContent)) obfuscationCount++;

  // JS to HTML ratio
  const htmlLength = html.length;
  const jsLength = allScriptContent.length;
  const jsToHtmlRatio = htmlLength > 0 ? Math.round((jsLength / htmlLength) * 100) / 100 : 0;

  // Keylogger patterns: addEventListener on input fields sending data
  const hasKeylogger = /addEventListener\s*\(\s*["']key(?:press|down|up)["']/.test(allScriptContent) &&
    /(?:XMLHttpRequest|fetch|navigator\.sendBeacon|new\s+Image)/.test(allScriptContent);

  // External data exfiltration patterns
  const hasExfil = /(?:document\.cookie|localStorage|sessionStorage)/.test(allScriptContent) &&
    /(?:XMLHttpRequest|fetch|new\s+Image|navigator\.sendBeacon)/.test(allScriptContent);

  return {
    total_script_tags: scriptTags.length,
    inline_script_count: inlineScripts.length,
    has_eval: hasEval,
    has_unescape: hasUnescape,
    has_atob: hasAtob,
    has_document_write: hasDocumentWrite,
    has_right_click_disable: hasRightClickDisable,
    has_mouseover_hiding: hasMouseoverHiding,
    obfuscation_indicator_count: obfuscationCount,
    js_to_html_ratio: jsToHtmlRatio,
    has_keylogger_pattern: hasKeylogger,
    has_external_data_exfil: hasExfil,
  };
}

export function extractContentFeatures(html: string, pageUrl?: string): ContentFeatures {
  const plainText = stripTags(html);
  const textLength = plainText.length;
  const htmlLength = html.length;
  const textToHtmlRatio = htmlLength > 0 ? Math.round((textLength / htmlLength) * 100) / 100 : 0;

  const textLower = plainText.toLowerCase();
  const htmlLower = html.toLowerCase();

  // Legal/trust indicators
  const hasCopyright = /©|&copy;|copyright/i.test(html);
  const hasPrivacyPolicy = /privacy\s+policy/i.test(htmlLower);
  const hasTerms = /terms\s+(?:of\s+service|of\s+use|and\s+conditions)/i.test(htmlLower);

  // Brand detection
  const detectedBrands: string[] = [];
  for (const brand of KNOWN_BRANDS) {
    if (textLower.includes(brand)) {
      detectedBrands.push(brand);
    }
  }

  // Urgency language
  const urgencyMatches = URGENCY_WORDS.filter(w => textLower.includes(w));
  const threatMatches = THREATENING_WORDS.filter(w => textLower.includes(w));

  // Hidden elements containing forms/links
  const hiddenElements = getAllMatches(html, /style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0)[^"']*["']/gi);
  // Check for hidden elements that wrap forms
  const hiddenFormPattern = /style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0)[^"']*["'][^>]*>[\s\S]{0,500}<(?:form|input|a\s)/gi;
  const hiddenFormsCount = getAllMatches(html, hiddenFormPattern).length;

  return {
    page_content_length: textLength,
    text_to_html_ratio: textToHtmlRatio,
    has_copyright: hasCopyright,
    has_privacy_policy: hasPrivacyPolicy,
    has_terms_of_service: hasTerms,
    brand_mentions: detectedBrands,
    brand_mention_count: detectedBrands.length,
    has_urgency_language: urgencyMatches.length > 0,
    urgency_word_count: urgencyMatches.length,
    has_threatening_language: threatMatches.length > 0,
    hidden_element_count: hiddenElements.length,
    hidden_elements_with_forms: hiddenFormsCount,
  };
}

export function extractURLFeatures(url: string): URLFeatures {
  let parsed: URL;
  try {
    parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return {
      url_length: url.length,
      has_ip_address: false,
      has_at_symbol: false,
      has_double_slash_redirect: false,
      has_dash_in_domain: false,
      dash_count_in_domain: 0,
      subdomain_count: 0,
      has_https: false,
      domain_length: 0,
      path_length: 0,
      has_suspicious_tld: false,
      has_brand_in_subdomain: false,
      has_hex_characters: false,
      digit_count_in_domain: 0,
      has_punycode: false,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const domain = hostname;
  const parts = hostname.split(".");
  const subdomainCount = Math.max(0, parts.length - 2);

  // IP address check
  const hasIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);

  // Dash analysis
  const dashCount = (domain.match(/-/g) || []).length;

  // Digit count in domain
  const digitCount = (domain.match(/\d/g) || []).length;

  // Suspicious TLD
  const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));

  // Brand in subdomain (e.g., paypal.evil.com)
  const subdomains = parts.slice(0, -2).join(".");
  const hasBrandInSubdomain = KNOWN_BRANDS.some(b => subdomains.includes(b.replace(/\s/g, "")));

  // Double slash redirect (after protocol)
  const pathAndQuery = url.replace(/^https?:\/\//, "");
  const hasDoubleSlash = pathAndQuery.includes("//");

  return {
    url_length: url.length,
    has_ip_address: hasIp,
    has_at_symbol: url.includes("@"),
    has_double_slash_redirect: hasDoubleSlash,
    has_dash_in_domain: dashCount > 0,
    dash_count_in_domain: dashCount,
    subdomain_count: subdomainCount,
    has_https: parsed.protocol === "https:",
    domain_length: domain.length,
    path_length: parsed.pathname.length,
    has_suspicious_tld: hasSuspiciousTld,
    has_brand_in_subdomain: hasBrandInSubdomain,
    has_hex_characters: /%[0-9a-f]{2}/i.test(url),
    digit_count_in_domain: digitCount,
    has_punycode: hostname.startsWith("xn--") || hostname.includes(".xn--"),
  };
}

// ──────────────────────────────────────────────
// Full Feature Extraction
// ──────────────────────────────────────────────

export function extractAllFeatures(html: string, url?: string): PhishingFeatureVector {
  return {
    meta_tags: extractMetaTagFeatures(html, url),
    forms: extractFormFeatures(html, url),
    links: extractLinkFeatures(html, url),
    resources: extractResourceFeatures(html, url),
    scripts: extractScriptFeatures(html),
    content: extractContentFeatures(html, url),
    url: url ? extractURLFeatures(url) : extractURLFeatures(""),
  };
}

// ──────────────────────────────────────────────
// Heuristic Scoring Engine
// ──────────────────────────────────────────────

interface WeightedSignal {
  feature: string;
  score: number; // 0-1 contribution to phishing probability
  weight: number;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
}

function computeSignals(features: PhishingFeatureVector): WeightedSignal[] {
  const signals: WeightedSignal[] = [];
  const { meta_tags, forms, links, resources, scripts, content, url } = features;

  // ── CRITICAL signals (weight 0.08-0.12) ──

  if (forms.has_external_action) {
    signals.push({
      feature: "form_external_action",
      score: 1.0,
      weight: 0.12,
      description: `Form submits to external domain: ${forms.external_action_domains.join(", ")}`,
      severity: "critical",
    });
  }

  if (url.has_ip_address) {
    signals.push({
      feature: "url_ip_address",
      score: 1.0,
      weight: 0.10,
      description: "URL uses IP address instead of domain name",
      severity: "critical",
    });
  }

  if (scripts.has_keylogger_pattern) {
    signals.push({
      feature: "keylogger_pattern",
      score: 1.0,
      weight: 0.10,
      description: "JavaScript contains keylogger-like patterns capturing keystrokes and sending data",
      severity: "critical",
    });
  }

  if (links.has_anchor_text_url_mismatch) {
    signals.push({
      feature: "anchor_text_url_mismatch",
      score: 1.0,
      weight: 0.09,
      description: "Link text shows a different domain than the actual href target",
      severity: "critical",
    });
  }

  if (resources.hidden_iframe_count > 0) {
    signals.push({
      feature: "hidden_iframes",
      score: 1.0,
      weight: 0.09,
      description: `${resources.hidden_iframe_count} hidden iframe(s) detected (zero-size or display:none)`,
      severity: "critical",
    });
  }

  // ── HIGH signals (weight 0.05-0.08) ──

  if (forms.has_password_field && !url.has_https) {
    signals.push({
      feature: "password_no_https",
      score: 1.0,
      weight: 0.08,
      description: "Password field on non-HTTPS page",
      severity: "high",
    });
  }

  if (url.has_brand_in_subdomain) {
    signals.push({
      feature: "brand_in_subdomain",
      score: 0.9,
      weight: 0.07,
      description: "Known brand name appears in subdomain (common phishing pattern)",
      severity: "high",
    });
  }

  if (links.null_link_ratio > 0.5 && links.total_links > 3) {
    signals.push({
      feature: "high_null_link_ratio",
      score: Math.min(1.0, links.null_link_ratio),
      weight: 0.07,
      description: `${Math.round(links.null_link_ratio * 100)}% of links are null/void (phishing pages fake navigation)`,
      severity: "high",
    });
  }

  if (scripts.obfuscation_indicator_count >= 3) {
    signals.push({
      feature: "heavy_obfuscation",
      score: Math.min(1.0, scripts.obfuscation_indicator_count / 4),
      weight: 0.07,
      description: `${scripts.obfuscation_indicator_count} JavaScript obfuscation patterns detected`,
      severity: "high",
    });
  }

  if (meta_tags.robots_noindex) {
    signals.push({
      feature: "robots_noindex",
      score: 0.8,
      weight: 0.06,
      description: "Page uses noindex robots directive (hiding from search engines)",
      severity: "high",
    });
  }

  if (url.has_at_symbol) {
    signals.push({
      feature: "url_at_symbol",
      score: 1.0,
      weight: 0.06,
      description: "URL contains @ symbol (used to disguise real destination)",
      severity: "high",
    });
  }

  if (forms.has_php_action) {
    signals.push({
      feature: "php_form_action",
      score: 0.75,
      weight: 0.06,
      description: "Form action points to PHP script (common in phishing kits)",
      severity: "high",
    });
  }

  if (content.has_urgency_language && content.urgency_word_count >= 3) {
    signals.push({
      feature: "urgency_language",
      score: Math.min(1.0, content.urgency_word_count / 5),
      weight: 0.06,
      description: `${content.urgency_word_count} urgency/pressure phrases detected`,
      severity: "high",
    });
  }

  if (scripts.has_external_data_exfil) {
    signals.push({
      feature: "data_exfiltration",
      score: 0.9,
      weight: 0.07,
      description: "Script accesses cookies/storage and sends data to external endpoint",
      severity: "high",
    });
  }

  // ── MEDIUM signals (weight 0.03-0.05) ──

  if (meta_tags.meta_completeness_score < 0.3) {
    signals.push({
      feature: "low_meta_completeness",
      score: 1.0 - meta_tags.meta_completeness_score,
      weight: 0.05,
      description: `Only ${Math.round(meta_tags.meta_completeness_score * 100)}% of expected meta tags present`,
      severity: "medium",
    });
  }

  if (meta_tags.title_has_phishing_keywords && meta_tags.title_keyword_count >= 2) {
    signals.push({
      feature: "title_phishing_keywords",
      score: Math.min(1.0, meta_tags.title_keyword_count / 3),
      weight: 0.05,
      description: `Title contains ${meta_tags.title_keyword_count} phishing-associated keywords`,
      severity: "medium",
    });
  }

  if (meta_tags.og_url_mismatch) {
    signals.push({
      feature: "og_url_mismatch",
      score: 0.85,
      weight: 0.05,
      description: "og:url domain does not match page domain",
      severity: "medium",
    });
  }

  if (meta_tags.canonical_mismatch) {
    signals.push({
      feature: "canonical_mismatch",
      score: 0.8,
      weight: 0.05,
      description: "Canonical URL domain does not match page domain",
      severity: "medium",
    });
  }

  if (meta_tags.favicon_external) {
    signals.push({
      feature: "external_favicon",
      score: 0.7,
      weight: 0.04,
      description: "Favicon hosted on different domain (often stolen from target brand)",
      severity: "medium",
    });
  }

  if (forms.has_autocomplete_off && forms.has_password_field) {
    signals.push({
      feature: "autocomplete_off",
      score: 0.65,
      weight: 0.04,
      description: "Login form disables autocomplete (avoids browser password manager detection)",
      severity: "medium",
    });
  }

  if (content.text_to_html_ratio < 0.15) {
    signals.push({
      feature: "low_text_ratio",
      score: 0.7,
      weight: 0.04,
      description: `Text-to-HTML ratio is ${Math.round(content.text_to_html_ratio * 100)}% (phishing pages are content-sparse)`,
      severity: "medium",
    });
  }

  if (url.has_suspicious_tld) {
    signals.push({
      feature: "suspicious_tld",
      score: 0.75,
      weight: 0.05,
      description: "Domain uses a TLD commonly associated with phishing (.tk, .ml, .xyz, etc.)",
      severity: "medium",
    });
  }

  if (url.subdomain_count >= 3) {
    signals.push({
      feature: "excessive_subdomains",
      score: Math.min(1.0, url.subdomain_count / 5),
      weight: 0.04,
      description: `${url.subdomain_count} subdomain levels (used to create deceptive long URLs)`,
      severity: "medium",
    });
  }

  if (url.url_length > 75) {
    signals.push({
      feature: "long_url",
      score: Math.min(1.0, url.url_length / 150),
      weight: 0.03,
      description: `URL length is ${url.url_length} characters (phishing URLs tend to be longer)`,
      severity: "medium",
    });
  }

  if (links.external_link_ratio > 0.7 && links.total_links > 5) {
    signals.push({
      feature: "high_external_ratio",
      score: Math.min(1.0, links.external_link_ratio),
      weight: 0.04,
      description: `${Math.round(links.external_link_ratio * 100)}% external link ratio (>70% threshold)`,
      severity: "medium",
    });
  }

  if (scripts.has_right_click_disable) {
    signals.push({
      feature: "right_click_disabled",
      score: 0.7,
      weight: 0.04,
      description: "Right-click context menu is disabled (preventing page inspection)",
      severity: "medium",
    });
  }

  if (content.hidden_elements_with_forms > 0) {
    signals.push({
      feature: "hidden_forms",
      score: 0.85,
      weight: 0.05,
      description: `${content.hidden_elements_with_forms} hidden element(s) containing forms or inputs`,
      severity: "medium",
    });
  }

  if (meta_tags.has_referrer_no_referrer) {
    signals.push({
      feature: "no_referrer_policy",
      score: 0.6,
      weight: 0.03,
      description: "Referrer policy set to no-referrer (hiding traffic origin)",
      severity: "medium",
    });
  }

  if (url.has_punycode) {
    signals.push({
      feature: "punycode_domain",
      score: 0.9,
      weight: 0.06,
      description: "Domain uses punycode (IDN homograph attack indicator)",
      severity: "medium",
    });
  }

  // ── LOW signals (weight 0.01-0.03) ──

  if (forms.hidden_input_count > 3) {
    signals.push({
      feature: "many_hidden_inputs",
      score: Math.min(1.0, forms.hidden_input_count / 6),
      weight: 0.03,
      description: `${forms.hidden_input_count} hidden input fields detected`,
      severity: "low",
    });
  }

  if (!meta_tags.has_favicon) {
    signals.push({
      feature: "missing_favicon",
      score: 0.5,
      weight: 0.02,
      description: "No favicon defined (legitimate sites almost always have one)",
      severity: "low",
    });
  }

  if (!content.has_copyright && !content.has_privacy_policy) {
    signals.push({
      feature: "missing_legal",
      score: 0.5,
      weight: 0.03,
      description: "No copyright notice or privacy policy link found",
      severity: "low",
    });
  }

  if (url.dash_count_in_domain > 3) {
    signals.push({
      feature: "many_dashes_in_domain",
      score: Math.min(1.0, url.dash_count_in_domain / 5),
      weight: 0.03,
      description: `${url.dash_count_in_domain} dashes in domain name (excessive hyphenation)`,
      severity: "low",
    });
  }

  if (url.digit_count_in_domain > 4) {
    signals.push({
      feature: "digits_in_domain",
      score: Math.min(1.0, url.digit_count_in_domain / 8),
      weight: 0.02,
      description: `${url.digit_count_in_domain} digits in domain name`,
      severity: "low",
    });
  }

  if (content.has_threatening_language) {
    signals.push({
      feature: "threatening_language",
      score: 0.7,
      weight: 0.03,
      description: "Page contains threatening language about account suspension/termination",
      severity: "low",
    });
  }

  // ── NEGATIVE signals (legitimacy indicators — reduce phishing score) ──

  if (meta_tags.meta_completeness_score > 0.7) {
    signals.push({
      feature: "high_meta_completeness",
      score: -0.5,
      weight: 0.05,
      description: "Rich meta tag presence indicates professional site development",
      severity: "low",
    });
  }

  if (content.has_copyright && content.has_privacy_policy && content.has_terms_of_service) {
    signals.push({
      feature: "full_legal_footer",
      score: -0.6,
      weight: 0.04,
      description: "Copyright, privacy policy, and terms of service all present",
      severity: "low",
    });
  }

  if (url.has_https && !url.has_ip_address && url.url_length < 50) {
    signals.push({
      feature: "clean_https_url",
      score: -0.4,
      weight: 0.03,
      description: "Clean HTTPS URL with reasonable length",
      severity: "low",
    });
  }

  return signals;
}

// ──────────────────────────────────────────────
// Classification
// ──────────────────────────────────────────────

export function classifyPhishing(html: string, url?: string): PhishingDetectionResult {
  const startTime = Date.now();

  const features = extractAllFeatures(html, url);
  const signals = computeSignals(features);

  // Compute weighted phishing probability
  let weightedSum = 0;
  let totalWeight = 0;
  const activeSignals: PhishingSignal[] = [];

  for (const signal of signals) {
    const contribution = signal.score * signal.weight;
    weightedSum += contribution;
    totalWeight += Math.abs(signal.weight);

    activeSignals.push({
      feature: signal.feature,
      value: signal.score,
      weight: signal.weight,
      description: signal.description,
      severity: signal.severity,
    });
  }

  // Normalize to 0-1 range
  const rawProbability = totalWeight > 0 ? Math.max(0, Math.min(1, weightedSum / totalWeight)) : 0.5;

  // Apply sigmoid-like shaping for more decisive outputs
  // This pushes scores away from 0.5 toward 0 or 1
  const shaped = 1 / (1 + Math.exp(-8 * (rawProbability - 0.45)));
  const phishingProbability = Math.round(shaped * 10000) / 10000;

  // Risk score (0-100)
  const riskScore = Math.round(phishingProbability * 100);

  // Verdict determination
  let verdict: PhishingVerdict;
  if (phishingProbability >= 0.70) {
    verdict = "phishing";
  } else if (phishingProbability >= 0.40) {
    verdict = "suspicious";
  } else {
    verdict = "legitimate";
  }

  // Top indicators (sorted by contribution)
  const topIndicators = signals
    .filter(s => s.score > 0)
    .sort((a, b) => (b.score * b.weight) - (a.score * a.weight))
    .slice(0, 5)
    .map(s => s.description);

  return {
    verdict,
    confidence: Math.round(Math.abs(phishingProbability - 0.5) * 2 * 100) / 100, // How far from uncertain
    phishing_probability: phishingProbability,
    risk_score: riskScore,
    signals: activeSignals,
    feature_vector: features,
    top_indicators: topIndicators,
    scan_duration_ms: Date.now() - startTime,
    model_used: "baloney-phishing-heuristic-v1",
  };
}
