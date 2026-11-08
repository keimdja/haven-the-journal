import type { Entry } from '../../core/data/models';
import { formatMonth } from '../../core/i18n/format-date';

export interface MonthGroupData {
  /** Year and month, e.g. "2026-9", unique per group. */
  readonly key: string;
  /** Heading, e.g. "October 2026". */
  readonly label: string;
  readonly entries: readonly Entry[];
}

/** Splits entries (already newest first) into months, on this device's calendar. */
export function groupByMonth(entries: readonly Entry[], locale: string): MonthGroupData[] {
  const groups: { key: string; label: string; entries: Entry[] }[] = [];
  for (const entry of entries) {
    const written = new Date(entry.writtenAt);
    const key = `${written.getFullYear()}-${written.getMonth()}`;
    const last = groups.at(-1);
    if (last?.key === key) last.entries.push(entry);
    else groups.push({ key, label: formatMonth(written, locale), entries: [entry] });
  }
  return groups;
}
