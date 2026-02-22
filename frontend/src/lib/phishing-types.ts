// frontend/src/lib/phishing-types.ts — Type system for phishing website detection

// ──────────────────────────────────────────────
// Feature extraction types
// ──────────────────────────────────────────────

export interface MetaTagFeatures {
  has_title: boolean;
  title_length: number;
  title_has_phishing_keywords: boolean;
  title_keyword_count: number;
  has_description: boolean;
  description_length: number;
  has_og_tags: boolean;
  og_tag_count: number;
  og_title_mismatch: boolean;
  og_url_mismatch: boolean;
  has_viewport: boolean;
  has_charset: boolean;
  has_robots: boolean;
  robots_noindex: boolean;
  has_author: boolean;
  has_generator: boolean;
  has_favicon: boolean;
  favicon_external: boolean;
  has_canonical: boolean;
  canonical_mismatch: boolean;
  has_referrer_no_referrer: boolean;
  meta_completeness_score: number; // 0-1: ratio of expected meta tags present
}

export interface FormFeatures {
  form_count: number;
  has_password_field: boolean;
  password_field_count: number;
  has_external_action: boolean;
  external_action_domains: string[];
  has_empty_action: boolean;
  has_mailto_action: boolean;
  has_php_action: boolean;
  hidden_input_count: number;
  has_autocomplete_off: boolean;
  has_login_form: boolean;
  credential_field_count: number; // email + password + username fields
}

export interface LinkFeatures {
  total_links: number;
  external_link_count: number;
  internal_link_count: number;
  external_link_ratio: number;
  null_link_count: number; // href="", href="#", javascript:void(0)
  null_link_ratio: number;
  unique_external_domains: number;
  has_anchor_text_url_mismatch: boolean;
  links_using_ip_address: number;
  links_with_at_symbol: number;
  links_with_hex_encoding: number;
  has_shortened_urls: number;
}

export interface ResourceFeatures {
  external_css_count: number;
  external_js_count: number;
  total_resource_count: number;
  external_resource_ratio: number;
  external_resource_domains: string[];
  has_iframe: boolean;
  iframe_count: number;
  hidden_iframe_count: number;
  base64_image_count: number;
  total_image_count: number;
}

export interface ScriptFeatures {
  total_script_tags: number;
  inline_script_count: number;
  has_eval: boolean;
  has_unescape: boolean;
  has_atob: boolean;
  has_document_write: boolean;
  has_right_click_disable: boolean;
  has_mouseover_hiding: boolean;
  obfuscation_indicator_count: number;
  js_to_html_ratio: number;
  has_keylogger_pattern: boolean;
  has_external_data_exfil: boolean;
}

export interface ContentFeatures {
  page_content_length: number;
  text_to_html_ratio: number;
  has_copyright: boolean;
  has_privacy_policy: boolean;
  has_terms_of_service: boolean;
  brand_mentions: string[];
  brand_mention_count: number;
  has_urgency_language: boolean;
  urgency_word_count: number;
  has_threatening_language: boolean;
  hidden_element_count: number;
  hidden_elements_with_forms: number;
}

export interface URLFeatures {
  url_length: number;
  has_ip_address: boolean;
  has_at_symbol: boolean;
  has_double_slash_redirect: boolean;
  has_dash_in_domain: boolean;
  dash_count_in_domain: number;
  subdomain_count: number;
  has_https: boolean;
  domain_length: number;
  path_length: number;
  has_suspicious_tld: boolean;
  has_brand_in_subdomain: boolean;
  has_hex_characters: boolean;
  digit_count_in_domain: number;
  has_punycode: boolean;
}

// ──────────────────────────────────────────────
// Aggregated feature vector
// ──────────────────────────────────────────────

export interface PhishingFeatureVector {
  meta_tags: MetaTagFeatures;
  forms: FormFeatures;
  links: LinkFeatures;
  resources: ResourceFeatures;
  scripts: ScriptFeatures;
  content: ContentFeatures;
  url: URLFeatures;
}

// ──────────────────────────────────────────────
// Detection results
// ──────────────────────────────────────────────

export type PhishingVerdict = "phishing" | "suspicious" | "legitimate";

export interface PhishingSignal {
  feature: string;
  value: number | string | boolean;
  weight: number;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
}

export interface PhishingDetectionResult {
  verdict: PhishingVerdict;
  confidence: number;
  phishing_probability: number;
  risk_score: number; // 0-100
  signals: PhishingSignal[];
  feature_vector: PhishingFeatureVector;
  top_indicators: string[];
  scan_duration_ms: number;
  model_used: string;
}
