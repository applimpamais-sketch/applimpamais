/**
 * Parses a date-only string (YYYY-MM-DD) as local time instead of UTC.
 * This prevents the common timezone shift bug where "2026-02-25" parsed as UTC
 * becomes "2026-02-24 21:00" in UTC-3 (Brazil).
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // If it already has a time component, parse as-is
  if (dateStr.includes('T')) return new Date(dateStr);
  // Force local time interpretation
  return new Date(dateStr + 'T00:00:00');
}
