const LIVE_SESSION_KEY = 'live_session_id';
const LIVE_SESSION_CREATED_AT_KEY = 'live_session_created_at';
const LEGACY_PIXEL_SESSION_KEY = 'pixel_session_id';

const LIVE_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuidV4(value: string | null): value is string {
  return !!value && UUID_V4_REGEX.test(value);
}

export function getOrCreateLiveSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem(LIVE_SESSION_KEY);
  const legacyPixelSessionId = localStorage.getItem(LEGACY_PIXEL_SESSION_KEY);

  if (!sessionId && legacyPixelSessionId) {
    sessionId = legacyPixelSessionId;
  }

  const createdAtRaw = localStorage.getItem(LIVE_SESSION_CREATED_AT_KEY);
  const createdAt = createdAtRaw ? Number(createdAtRaw) : 0;
  const isExpired = !createdAt || Number.isNaN(createdAt) || Date.now() - createdAt > LIVE_SESSION_TTL_MS;

  if (!isValidUuidV4(sessionId) || isExpired) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(LIVE_SESSION_CREATED_AT_KEY, Date.now().toString());
  } else if (!createdAtRaw) {
    localStorage.setItem(LIVE_SESSION_CREATED_AT_KEY, Date.now().toString());
  }

  localStorage.setItem(LIVE_SESSION_KEY, sessionId);
  localStorage.removeItem(LEGACY_PIXEL_SESSION_KEY);

  return sessionId;
}

export function clearLiveSessionId(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(LIVE_SESSION_KEY);
  localStorage.removeItem(LIVE_SESSION_CREATED_AT_KEY);
  localStorage.removeItem(LEGACY_PIXEL_SESSION_KEY);
}
