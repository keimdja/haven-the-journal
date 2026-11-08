import type { Copy } from '../i18n/copy/en';
import { formatLongDate, formatTime } from '../i18n/format-date';
import type { Entry } from './models';
import { REFLECTION_PARTS } from './reflection-parts';

/** Pure helpers behind Settings → Export journal. The screen does the download. */

const live = (entries: readonly Entry[]) => entries.filter((entry) => !entry.deletedAt);

/** "haven-journal-2026-10-21.json" — the date is today's, on this device. */
export function exportFileName(extension: 'json' | 'md', now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `haven-journal-${day}.${extension}`;
}

/**
 * Every entry as JSON, exactly as stored (feelings and patterns as keys), so the
 * file is complete and could be read back in later. Deleted entries are left out.
 */
export function exportJson(entries: readonly Entry[], now = new Date()): string {
  return JSON.stringify(
    { app: 'Haven', version: 1, exportedAt: now.toISOString(), entries: live(entries) },
    null,
    2,
  );
}

/**
 * A readable copy of the journal in Markdown, in the current language: one
 * section per entry with its date, and for reflections each answered part
 * under its question. Parts left empty are skipped.
 */
export function exportMarkdown(
  entries: readonly Entry[],
  copy: Copy,
  locale: string,
  now = new Date(),
): string {
  const lines = [
    `# ${copy.export.title}`,
    '',
    `${copy.export.exportedOn} ${formatLongDate(now, locale, true)}`,
  ];
  for (const entry of live(entries)) {
    lines.push('', '---', '', ...entryMarkdown(entry, copy, locale));
  }
  return lines.join('\n') + '\n';
}

function entryMarkdown(entry: Entry, copy: Copy, locale: string): string[] {
  const written = new Date(entry.writtenAt);
  const meta = [
    copy.entry.kind[entry.kind],
    entry.status === 'draft' ? copy.entry.draft : null,
    formatLongDate(written, locale, true),
    formatTime(written, locale),
  ].filter(Boolean);

  const lines = [`## ${entry.title?.trim() || copy.entry.untitled}`, '', meta.join(' · ')];
  const section = (heading: string, text: string | null | undefined) => {
    if (text?.trim()) lines.push('', `### ${heading}`, '', text.trim());
  };
  const feelings = [
    ...entry.feelings.map((key) => copy.feelings[key]),
    ...entry.customFeelings,
  ].join(', ');

  if (entry.kind === 'free') {
    if (entry.body?.trim()) lines.push('', entry.body.trim());
    section(copy.entry.feelings, feelings);
    return lines;
  }

  for (const part of REFLECTION_PARTS) {
    const { question } = copy.reflect.parts[part.key];
    if (part.kind === 'feelings') {
      section(question, [feelings, entry.feelingsNote?.trim()].filter(Boolean).join('\n\n'));
    } else if (part.kind === 'patterns') {
      section(question, entry.patterns.map((key) => `- ${copy.patterns[key].label}`).join('\n'));
    } else {
      section(question, entry[part.key]);
    }
  }
  return lines;
}
