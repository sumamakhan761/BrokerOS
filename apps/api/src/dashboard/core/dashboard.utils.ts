/**
 * Pure date/time utility functions shared across dashboard services.
 * No NestJS dependencies — import these directly wherever needed.
 */

/** Returns the start and end of today (midnight to midnight) in local time */
export function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();

  // Use IST (Asia/Kolkata) to get current year, month, day
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === 'year')!.value);
  const month = parseInt(parts.find((p) => p.type === 'month')!.value) - 1;
  const day = parseInt(parts.find((p) => p.type === 'day')!.value);

  // Date.UTC(year, month, day) gives UTC midnight for those components.
  // Subtracting 5.5 hours gives IST midnight.
  const start = new Date(Date.UTC(year, month, day, 0, 0, 0) - 5.5 * 3600000);
  const end = new Date(
    Date.UTC(year, month, day, 23, 59, 59, 999) - 5.5 * 3600000,
  );

  return { start, end };
}

/** Returns the start and end of the current calendar month in local time */
export function getMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { start, end };
}

export function getStartDate(range?: string): Date | undefined {
  if (range === 'all-time') return undefined;

  const now = new Date();
  if (range === 'weekly') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  } else if (range === 'yearly') {
    return new Date(now.getFullYear(), 0, 1);
  }
  // Default to monthly
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
