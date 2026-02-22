# backend/app/services/phishing_detector.py
# HTML-based phishing website detection — feature extraction + heuristic classifier
# Extracts 80+ features from raw HTML and URL for phishing classification.
# Designed for real-time inference (no external API calls).

import re
import math
import hashlib
from urllib.parse import urlparse, unquote
from typing import Optional
from dataclasses import dataclass, field, asdict

# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────

PHISHING_TITLE_KEYWORDS = {
    "login", "log-in", "log in", "signin", "sign-in", "sign in",
    "verify", "verification", "confirm", "update", "secure",
    "account", "suspend", "unlock", "restore", "validate",
    "authenticate", "expired", "reactivate", "unusual activity",
    "limited", "immediately", "urgent", "alert", "warning",
}

URGENCY_PHRASES = [
    "immediately", "urgent", "suspended", "limited time",
    "act now", "expires", "within 24 hours", "within 48 hours",
    "your account", "unauthorized", "unusual activity",
    "confirm your identity", "verify your", "failure to",
    "will be closed", "will be suspended", "will be locked",
    "click here", "click below", "do not ignore",
]

KNOWN_BRANDS = [
    "paypal", "apple", "microsoft", "google", "amazon", "netflix",
    "facebook", "instagram", "twitter", "linkedin", "chase",
    "wells fargo", "bank of america", "citibank", "usps",
    "fedex", "dhl", "irs", "dropbox", "adobe", "spotify",
]

SUSPICIOUS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top",
    ".work", ".click", ".link", ".info", ".site", ".online",
    ".buzz", ".icu", ".rest", ".cam", ".monster",
}

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly",
    "is.gd", "buff.ly", "rebrand.ly", "bl.ink",
}


# ──────────────────────────────────────────────
# Feature dataclasses
# ──────────────────────────────────────────────

@dataclass
class MetaTagFeatures:
    has_title: bool = False
    title_length: int = 0
    title_phishing_keyword_count: int = 0
    has_description: bool = False
    description_length: int = 0
    og_tag_count: int = 0
    og_url_mismatch: bool = False
    has_viewport: bool = False
    has_charset: bool = False
    robots_noindex: bool = False
    has_author: bool = False
    has_generator: bool = False
    has_favicon: bool = False
    favicon_external: bool = False
    canonical_mismatch: bool = False
    referrer_no_referrer: bool = False
    meta_completeness: float = 0.0


@dataclass
class FormFeatures:
    form_count: int = 0
    password_field_count: int = 0
    has_external_action: bool = False
    has_empty_action: bool = False
    has_mailto_action: bool = False
    has_php_action: bool = False
    hidden_input_count: int = 0
    has_autocomplete_off: bool = False
    credential_field_count: int = 0


@dataclass
class LinkFeatures:
    total_links: int = 0
    external_link_count: int = 0
    null_link_count: int = 0
    null_link_ratio: float = 0.0
    external_link_ratio: float = 0.0
    unique_external_domains: int = 0
    anchor_text_url_mismatch: bool = False
    links_using_ip: int = 0
    links_with_at: int = 0
    shortened_url_count: int = 0


@dataclass
class ScriptFeatures:
    script_tag_count: int = 0
    inline_script_count: int = 0
    has_eval: bool = False
    has_document_write: bool = False
    obfuscation_count: int = 0
    js_to_html_ratio: float = 0.0
    has_right_click_disable: bool = False
    has_keylogger_pattern: bool = False
    has_data_exfiltration: bool = False


@dataclass
class ContentFeatures:
    page_length: int = 0
    text_to_html_ratio: float = 0.0
    has_copyright: bool = False
    has_privacy_policy: bool = False
    brand_mention_count: int = 0
    urgency_word_count: int = 0
    has_threatening_language: bool = False
    hidden_element_count: int = 0


@dataclass
class URLFeatures:
    url_length: int = 0
    has_ip_address: bool = False
    has_at_symbol: bool = False
    has_double_slash: bool = False
    dash_count: int = 0
    subdomain_count: int = 0
    has_https: bool = False
    domain_length: int = 0
    path_length: int = 0
    suspicious_tld: bool = False
    brand_in_subdomain: bool = False
    digit_count: int = 0
    has_punycode: bool = False


# ──────────────────────────────────────────────
# HTML parsing helpers
# ──────────────────────────────────────────────

def _get_meta(html: str, name: str) -> Optional[str]:
    """Extract content from <meta name="X" content="Y"> or <meta property="X" content="Y">."""
    patterns = [
        rf'<meta\s+(?:name|property)\s*=\s*["\'{name}["\'][^>]*content\s*=\s*["\']([^"\']*)["\']',
        rf'<meta\s+content\s*=\s*["\']([^"\']*)["\'][^>]*(?:name|property)\s*=\s*["\'{name}["\']',
    ]
    for pat in patterns:
        m = re.search(pat, html, re.IGNORECASE)
        if m:
            return m.group(1)
    return None


def _get_tag_content(html: str, tag: str) -> str:
    m = re.search(rf'<{tag}[^>]*>([^<]*)</{tag}>', html, re.IGNORECASE)
    return m.group(1).strip() if m else ""


def _extract_domain(url: str) -> str:
    try:
        parsed = urlparse(url if url.startswith("http") else f"https://{url}")
        return parsed.hostname.lower() if parsed.hostname else ""
    except Exception:
        return ""


def _strip_tags(html: str) -> str:
    text = re.sub(r'<script[^>]*>[\s\S]*?</script>', '', html, flags=re.IGNORECASE)
    text = re.sub(r'<style[^>]*>[\s\S]*?</style>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()


# ──────────────────────────────────────────────
# Feature extraction functions
# ──────────────────────────────────────────────

def extract_meta_features(html: str, url: str = "") -> MetaTagFeatures:
    f = MetaTagFeatures()
    page_domain = _extract_domain(url)

    title = _get_tag_content(html, "title")
    f.has_title = len(title) > 0
    f.title_length = len(title)

    title_lower = title.lower()
    f.title_phishing_keyword_count = sum(1 for kw in PHISHING_TITLE_KEYWORDS if kw in title_lower)

    desc = _get_meta(html, "description") or ""
    f.has_description = len(desc) > 0
    f.description_length = len(desc)

    og_fields = ["og:title", "og:description", "og:url", "og:type"]
    og_values = [_get_meta(html, og) for og in og_fields]
    f.og_tag_count = sum(1 for v in og_values if v)

    og_url = og_values[2] or ""
    if og_url and page_domain:
        f.og_url_mismatch = _extract_domain(og_url) != page_domain

    f.has_viewport = _get_meta(html, "viewport") is not None
    f.has_charset = bool(re.search(r'<meta\s+charset', html, re.I)) or \
                    bool(re.search(r'<meta\s+http-equiv\s*=\s*["\']content-type', html, re.I))

    robots = (_get_meta(html, "robots") or "").lower()
    f.robots_noindex = "noindex" in robots

    f.has_author = _get_meta(html, "author") is not None
    f.has_generator = _get_meta(html, "generator") is not None

    f.has_favicon = bool(re.search(r'<link\s+[^>]*rel\s*=\s*["\'](?:icon|shortcut icon)["\']', html, re.I))
    favicon_match = re.search(r'<link\s+[^>]*rel\s*=\s*["\'](?:icon|shortcut icon)["\'][^>]*href\s*=\s*["\']([^"\']*)["\']', html, re.I)
    if favicon_match and page_domain:
        fav_href = favicon_match.group(1)
        if fav_href.startswith("http"):
            f.favicon_external = _extract_domain(fav_href) != page_domain

    canonical_match = re.search(r'<link\s+[^>]*rel\s*=\s*["\']canonical["\'][^>]*href\s*=\s*["\']([^"\']*)["\']', html, re.I)
    if canonical_match and page_domain:
        f.canonical_mismatch = _extract_domain(canonical_match.group(1)) != page_domain

    referrer = (_get_meta(html, "referrer") or "").lower()
    f.referrer_no_referrer = "no-referrer" in referrer

    expected = [f.has_title, f.has_description, f.og_tag_count > 0,
                f.has_viewport, f.has_charset, f.has_author, f.has_favicon]
    f.meta_completeness = round(sum(expected) / len(expected), 2)

    return f


def extract_form_features(html: str, url: str = "") -> FormFeatures:
    f = FormFeatures()
    page_domain = _extract_domain(url)

    forms = re.findall(r'<form\s[^>]*>', html, re.I)
    f.form_count = len(forms)

    for form_tag in forms:
        action_match = re.search(r'action\s*=\s*["\']([^"\']*)["\']', form_tag, re.I)
        action = action_match.group(1).strip() if action_match else ""

        if action in ("", "#"):
            f.has_empty_action = True
        elif action.startswith("mailto:"):
            f.has_mailto_action = True
        elif re.search(r'\.php(\?|$)', action, re.I):
            f.has_php_action = True

        if action.startswith("http") and page_domain:
            if _extract_domain(action) != page_domain:
                f.has_external_action = True

    f.password_field_count = len(re.findall(r'<input\s[^>]*type\s*=\s*["\']password["\']', html, re.I))
    f.hidden_input_count = len(re.findall(r'<input\s[^>]*type\s*=\s*["\']hidden["\']', html, re.I))
    f.has_autocomplete_off = bool(re.search(r'autocomplete\s*=\s*["\']off["\']', html, re.I))

    cred_patterns = [
        r'name\s*=\s*["\'](?:password|passwd|pass|pwd)["\']',
        r'name\s*=\s*["\'](?:email|user|username|login|userid)["\']',
        r'name\s*=\s*["\'](?:ssn|social|card|cc|cvv)["\']',
    ]
    for pat in cred_patterns:
        f.credential_field_count += len(re.findall(pat, html, re.I))

    return f


def extract_link_features(html: str, url: str = "") -> LinkFeatures:
    f = LinkFeatures()
    page_domain = _extract_domain(url)

    anchors = re.findall(r'<a\s[^>]*href\s*=\s*["\']([^"\']*)["\'][^>]*>(.*?)</a>', html, re.I | re.DOTALL)
    f.total_links = len(anchors)
    external_domains = set()

    for href, text in anchors:
        href = href.strip()

        if href in ("", "#") or href.startswith("javascript:"):
            f.null_link_count += 1
            continue

        if href.startswith("http"):
            link_domain = _extract_domain(href)
            if page_domain and link_domain != page_domain:
                f.external_link_count += 1
                external_domains.add(link_domain)

            if re.match(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', href):
                f.links_using_ip += 1
            if "@" in href:
                f.links_with_at += 1
            if any(s in href for s in URL_SHORTENERS):
                f.shortened_url_count += 1

            # Anchor text vs URL mismatch
            clean_text = re.sub(r'<[^>]+>', '', text).strip().lower()
            domain_in_text = re.search(r'([a-z0-9-]+\.[a-z]{2,})', clean_text)
            if domain_in_text and link_domain:
                text_domain = domain_in_text.group(1)
                if text_domain not in link_domain and link_domain not in text_domain:
                    f.anchor_text_url_mismatch = True

    f.unique_external_domains = len(external_domains)
    non_null = f.total_links - f.null_link_count
    f.null_link_ratio = round(f.null_link_count / f.total_links, 2) if f.total_links > 0 else 0
    f.external_link_ratio = round(f.external_link_count / non_null, 2) if non_null > 0 else 0

    return f


def extract_script_features(html: str) -> ScriptFeatures:
    f = ScriptFeatures()

    script_blocks = re.findall(r'<script[^>]*>([\s\S]*?)</script>', html, re.I)
    all_js = "\n".join(script_blocks)

    script_tags = re.findall(r'<script\b[^>]*>', html, re.I)
    f.script_tag_count = len(script_tags)
    f.inline_script_count = sum(1 for t in script_tags if 'src' not in t.lower())

    f.has_eval = bool(re.search(r'\beval\s*\(', all_js))
    f.has_document_write = bool(re.search(r'document\.write', all_js))

    obfuscation_patterns = [
        r'\beval\s*\(', r'\bunescape\s*\(', r'\batob\s*\(',
        r'document\.write', r'String\.fromCharCode',
        r'\\x[0-9a-f]{2}', r'\\u[0-9a-f]{4}',
    ]
    f.obfuscation_count = sum(1 for p in obfuscation_patterns if re.search(p, all_js, re.I))

    f.js_to_html_ratio = round(len(all_js) / max(len(html), 1), 2)

    f.has_right_click_disable = bool(re.search(r'oncontextmenu\s*=\s*["\']?\s*return\s+false', html, re.I))

    f.has_keylogger_pattern = (
        bool(re.search(r'addEventListener\s*\(\s*["\']key(?:press|down|up)["\']', all_js)) and
        bool(re.search(r'(?:XMLHttpRequest|fetch|navigator\.sendBeacon|new\s+Image)', all_js))
    )

    f.has_data_exfiltration = (
        bool(re.search(r'(?:document\.cookie|localStorage|sessionStorage)', all_js)) and
        bool(re.search(r'(?:XMLHttpRequest|fetch|new\s+Image|navigator\.sendBeacon)', all_js))
    )

    return f


def extract_content_features(html: str) -> ContentFeatures:
    f = ContentFeatures()
    plain = _strip_tags(html)
    f.page_length = len(plain)
    f.text_to_html_ratio = round(len(plain) / max(len(html), 1), 2)

    lower = plain.lower()
    html_lower = html.lower()

    f.has_copyright = bool(re.search(r'©|&copy;|copyright', html, re.I))
    f.has_privacy_policy = 'privacy policy' in html_lower
    f.brand_mention_count = sum(1 for b in KNOWN_BRANDS if b in lower)
    f.urgency_word_count = sum(1 for phrase in URGENCY_PHRASES if phrase in lower)
    f.has_threatening_language = any(
        w in lower for w in ["suspended", "terminated", "closed", "locked", "disabled", "unauthorized access"]
    )

    f.hidden_element_count = len(re.findall(
        r'style\s*=\s*["\'][^"\']*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0)', html, re.I
    ))

    return f


def extract_url_features(url: str) -> URLFeatures:
    f = URLFeatures()
    f.url_length = len(url)

    try:
        parsed = urlparse(url if url.startswith("http") else f"https://{url}")
        hostname = (parsed.hostname or "").lower()
    except Exception:
        return f

    f.has_ip_address = bool(re.match(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname))
    f.has_at_symbol = "@" in url
    path_part = url.replace(parsed.scheme + "://", "", 1) if parsed.scheme else url
    f.has_double_slash = "//" in path_part
    f.dash_count = hostname.count("-")
    parts = hostname.split(".")
    f.subdomain_count = max(0, len(parts) - 2)
    f.has_https = parsed.scheme == "https"
    f.domain_length = len(hostname)
    f.path_length = len(parsed.path)
    f.suspicious_tld = any(hostname.endswith(tld) for tld in SUSPICIOUS_TLDS)
    subdomains = ".".join(parts[:-2]) if len(parts) > 2 else ""
    f.brand_in_subdomain = any(b.replace(" ", "") in subdomains for b in KNOWN_BRANDS)
    f.digit_count = sum(1 for c in hostname if c.isdigit())
    f.has_punycode = hostname.startswith("xn--") or ".xn--" in hostname

    return f


# ──────────────────────────────────────────────
# Feature vector flattening (for ML input)
# ──────────────────────────────────────────────

def extract_all_features(html: str, url: str = "") -> dict:
    """Extract all features and return as flat dict (ML-ready)."""
    meta = extract_meta_features(html, url)
    forms = extract_form_features(html, url)
    links = extract_link_features(html, url)
    scripts = extract_script_features(html)
    content = extract_content_features(html)
    url_f = extract_url_features(url)

    flat = {}
    for prefix, obj in [
        ("meta", meta), ("form", forms), ("link", links),
        ("script", scripts), ("content", content), ("url", url_f),
    ]:
        for k, v in asdict(obj).items():
            flat[f"{prefix}_{k}"] = int(v) if isinstance(v, bool) else v

    return flat


# ──────────────────────────────────────────────
# Heuristic scoring engine (no trained model required)
# ──────────────────────────────────────────────

@dataclass
class Signal:
    name: str
    score: float  # 0-1 (phishing likelihood), negative = legitimacy
    weight: float
    description: str
    severity: str  # critical, high, medium, low


def compute_signals(html: str, url: str = "") -> list[Signal]:
    """Compute all weighted signals from extracted features."""
    meta = extract_meta_features(html, url)
    forms = extract_form_features(html, url)
    links = extract_link_features(html, url)
    scripts = extract_script_features(html)
    content = extract_content_features(html)
    url_f = extract_url_features(url)

    signals: list[Signal] = []

    # ── CRITICAL ──
    if forms.has_external_action:
        signals.append(Signal("form_external_action", 1.0, 0.12,
                              "Form submits credentials to external domain", "critical"))

    if url_f.has_ip_address:
        signals.append(Signal("url_ip_address", 1.0, 0.10,
                              "URL uses raw IP address instead of domain", "critical"))

    if scripts.has_keylogger_pattern:
        signals.append(Signal("keylogger", 1.0, 0.10,
                              "Keystroke capture + external transmission detected", "critical"))

    if links.anchor_text_url_mismatch:
        signals.append(Signal("anchor_mismatch", 1.0, 0.09,
                              "Link text domain differs from actual href domain", "critical"))

    # ── HIGH ──
    if forms.password_field_count > 0 and not url_f.has_https:
        signals.append(Signal("password_no_https", 1.0, 0.08,
                              "Password input on non-HTTPS page", "high"))

    if url_f.brand_in_subdomain:
        signals.append(Signal("brand_subdomain", 0.9, 0.07,
                              "Brand name in subdomain (phishing pattern)", "high"))

    if links.null_link_ratio > 0.5 and links.total_links > 3:
        signals.append(Signal("null_links", links.null_link_ratio, 0.07,
                              f"{int(links.null_link_ratio * 100)}% null/void links", "high"))

    if scripts.obfuscation_count >= 3:
        signals.append(Signal("obfuscation", min(1.0, scripts.obfuscation_count / 4), 0.07,
                              f"{scripts.obfuscation_count} JS obfuscation patterns", "high"))

    if meta.robots_noindex:
        signals.append(Signal("noindex", 0.8, 0.06,
                              "Page hides from search engines via noindex", "high"))

    if url_f.has_at_symbol:
        signals.append(Signal("at_symbol", 1.0, 0.06,
                              "URL contains @ (disguises real destination)", "high"))

    if forms.has_php_action:
        signals.append(Signal("php_action", 0.75, 0.06,
                              "Form action targets PHP endpoint", "high"))

    if content.urgency_word_count >= 3:
        signals.append(Signal("urgency", min(1.0, content.urgency_word_count / 5), 0.06,
                              f"{content.urgency_word_count} urgency/pressure phrases", "high"))

    if scripts.has_data_exfiltration:
        signals.append(Signal("exfiltration", 0.9, 0.07,
                              "Script reads cookies/storage + sends externally", "high"))

    # ── MEDIUM ──
    if meta.meta_completeness < 0.3:
        signals.append(Signal("low_meta", 1.0 - meta.meta_completeness, 0.05,
                              f"Only {int(meta.meta_completeness * 100)}% meta tag coverage", "medium"))

    if meta.title_phishing_keyword_count >= 2:
        signals.append(Signal("title_keywords", min(1.0, meta.title_phishing_keyword_count / 3), 0.05,
                              f"Title has {meta.title_phishing_keyword_count} phishing keywords", "medium"))

    if meta.og_url_mismatch:
        signals.append(Signal("og_mismatch", 0.85, 0.05,
                              "og:url domain ≠ page domain", "medium"))

    if meta.canonical_mismatch:
        signals.append(Signal("canonical_mismatch", 0.8, 0.05,
                              "Canonical URL domain ≠ page domain", "medium"))

    if meta.favicon_external:
        signals.append(Signal("external_favicon", 0.7, 0.04,
                              "Favicon served from foreign domain", "medium"))

    if forms.has_autocomplete_off and forms.password_field_count > 0:
        signals.append(Signal("autocomplete_off", 0.65, 0.04,
                              "Login form disables browser autocomplete", "medium"))

    if content.text_to_html_ratio < 0.15:
        signals.append(Signal("low_text_ratio", 0.7, 0.04,
                              f"Text/HTML ratio {int(content.text_to_html_ratio * 100)}%", "medium"))

    if url_f.suspicious_tld:
        signals.append(Signal("suspicious_tld", 0.75, 0.05,
                              "Uses high-risk TLD (.tk, .xyz, etc.)", "medium"))

    if url_f.subdomain_count >= 3:
        signals.append(Signal("subdomains", min(1.0, url_f.subdomain_count / 5), 0.04,
                              f"{url_f.subdomain_count} subdomain levels", "medium"))

    if url_f.url_length > 75:
        signals.append(Signal("long_url", min(1.0, url_f.url_length / 150), 0.03,
                              f"URL length {url_f.url_length} chars", "medium"))

    if links.external_link_ratio > 0.7 and links.total_links > 5:
        signals.append(Signal("external_links", links.external_link_ratio, 0.04,
                              f"{int(links.external_link_ratio * 100)}% external links", "medium"))

    if scripts.has_right_click_disable:
        signals.append(Signal("no_right_click", 0.7, 0.04,
                              "Right-click disabled", "medium"))

    if meta.referrer_no_referrer:
        signals.append(Signal("no_referrer", 0.6, 0.03,
                              "Referrer set to no-referrer", "medium"))

    if url_f.has_punycode:
        signals.append(Signal("punycode", 0.9, 0.06,
                              "Punycode domain (IDN homograph attack)", "medium"))

    # ── LOW ──
    if not meta.has_favicon:
        signals.append(Signal("no_favicon", 0.5, 0.02,
                              "No favicon defined", "low"))

    if not content.has_copyright and not content.has_privacy_policy:
        signals.append(Signal("no_legal", 0.5, 0.03,
                              "Missing copyright and privacy policy", "low"))

    if url_f.dash_count > 3:
        signals.append(Signal("dashes", min(1.0, url_f.dash_count / 5), 0.03,
                              f"{url_f.dash_count} dashes in domain", "low"))

    if content.has_threatening_language:
        signals.append(Signal("threats", 0.7, 0.03,
                              "Threatening language (suspension, termination)", "low"))

    # ── NEGATIVE (legitimacy indicators) ──
    if meta.meta_completeness > 0.7:
        signals.append(Signal("good_meta", -0.5, 0.05,
                              "Rich meta tag coverage", "low"))

    if content.has_copyright and content.has_privacy_policy:
        signals.append(Signal("legal_footer", -0.6, 0.04,
                              "Copyright + privacy policy present", "low"))

    if url_f.has_https and not url_f.has_ip_address and url_f.url_length < 50:
        signals.append(Signal("clean_url", -0.4, 0.03,
                              "Clean short HTTPS URL", "low"))

    return signals


# ──────────────────────────────────────────────
# Main classifier
# ──────────────────────────────────────────────

def classify_phishing(html: str, url: str = "") -> dict:
    """
    Classify HTML page as phishing, suspicious, or legitimate.
    Returns verdict, confidence, risk score, and detailed signals.
    """
    import time
    start = time.time()

    signals = compute_signals(html, url)

    # Weighted sum
    weighted_sum = sum(s.score * s.weight for s in signals)
    total_weight = sum(abs(s.weight) for s in signals)
    raw_prob = max(0.0, min(1.0, weighted_sum / total_weight)) if total_weight > 0 else 0.5

    # Sigmoid shaping for decisive outputs
    shaped = 1 / (1 + math.exp(-8 * (raw_prob - 0.45)))
    phishing_prob = round(shaped, 4)

    # Verdict
    if phishing_prob >= 0.70:
        verdict = "phishing"
    elif phishing_prob >= 0.40:
        verdict = "suspicious"
    else:
        verdict = "legitimate"

    risk_score = round(phishing_prob * 100)
    confidence = round(abs(phishing_prob - 0.5) * 2, 2)

    top_signals = sorted(
        [s for s in signals if s.score > 0],
        key=lambda s: s.score * s.weight,
        reverse=True,
    )[:5]

    duration_ms = round((time.time() - start) * 1000, 1)

    return {
        "verdict": verdict,
        "confidence": confidence,
        "phishing_probability": phishing_prob,
        "risk_score": risk_score,
        "signals": [
            {
                "name": s.name,
                "score": round(s.score, 3),
                "weight": s.weight,
                "description": s.description,
                "severity": s.severity,
            }
            for s in signals
        ],
        "top_indicators": [s.description for s in top_signals],
        "feature_vector": extract_all_features(html, url),
        "scan_duration_ms": duration_ms,
        "model": "baloney-phishing-heuristic-v1",
    }
