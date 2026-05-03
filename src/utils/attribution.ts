/**
 * Unified Attribution Helper
 * 
 * Centralizes all tracking attribution data (UTMs, gclid, fbclid, referrer, landing page)
 * into a single function used by all event payloads and backend submissions.
 * 
 * First-touch attribution: values are stored on first visit and never overwritten.
 */

const ATTRIBUTION_KEYS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'fbclid',
] as const;

const STORAGE_PREFIX = 'tracking_';

/**
 * Persist attribution params from URL on landing (first-touch only).
 * Call this once on app load.
 */
export function persistAttributionParams(): void {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);

  for (const key of ATTRIBUTION_KEYS) {
    const urlValue = urlParams.get(key);
    if (urlValue) {
      // First-touch: only save if not already set
      if (!localStorage.getItem(`${STORAGE_PREFIX}${key}`)) {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, urlValue);
      }
    }
  }

  // Referrer (first-touch)
  if (!localStorage.getItem(`${STORAGE_PREFIX}referrer`) && document.referrer) {
    localStorage.setItem(`${STORAGE_PREFIX}referrer`, document.referrer);
  }

  // Landing page (first-touch)
  if (!localStorage.getItem(`${STORAGE_PREFIX}landing_page`)) {
    localStorage.setItem(`${STORAGE_PREFIX}landing_page`, window.location.href);
  }
}

export interface AttributionParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_page?: string;
}

/**
 * Get all stored attribution params.
 * Call this in every event payload and backend submission.
 */
export function getAttributionParams(): AttributionParams {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  const result: AttributionParams = {};

  for (const key of ATTRIBUTION_KEYS) {
    // URL value takes priority (for last-touch scenarios), then localStorage
    const urlValue = urlParams.get(key);
    const storedValue = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    const value = urlValue || storedValue || undefined;
    if (value) {
      (result as any)[key] = value;
    }
  }

  const referrer = localStorage.getItem(`${STORAGE_PREFIX}referrer`);
  if (referrer) result.referrer = referrer;

  const landingPage = localStorage.getItem(`${STORAGE_PREFIX}landing_page`);
  if (landingPage) result.landing_page = landingPage;

  return result;
}
