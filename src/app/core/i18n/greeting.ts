import type { Copy } from './copy/en';

export type PartOfDay = 'morning' | 'afternoon' | 'evening';

/** Morning 5:00–11:59, afternoon 12:00–17:59, evening 18:00–4:59 (late nights count as evening). */
export function partOfDay(date: Date): PartOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Home's heading: "Good evening, K." / "Buenas noches, K.", or just
 * "Good evening." while the name isn't known.
 */
export function greeting(date: Date, copy: Copy, name?: string | null): string {
  const hello = copy.home.greeting[partOfDay(date)];
  const trimmed = name?.trim();
  return trimmed ? `${hello}, ${trimmed}.` : `${hello}.`;
}
