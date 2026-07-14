/**
 * Formats a date string for display, always using the date's own calendar
 * day (year/month/day) rather than converting to the viewer's local
 * timezone. Our trip/route dates are stored as bare calendar dates (e.g.
 * "2026-07-11T00:00:00.000Z") representing a day in the Pacific timezone —
 * if we let `Date` convert that to a viewer's local timezone, viewers east
 * of the Pacific timezone (or on a machine set to UTC) can see the wrong
 * (often previous) day. Formatting in the "UTC" timezone sidesteps that
 * conversion entirely and just shows the date as written.
 */
export function formatDate(
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }

  try {
    return date.toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
  } catch {
    return dateString;
  }
}
