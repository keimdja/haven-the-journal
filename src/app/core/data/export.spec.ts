import { en } from '../i18n/copy/en';
import { es } from '../i18n/copy/es';
import { blankEntry } from './entries-repo';
import { exportFileName, exportJson, exportMarkdown } from './export';
import type { Entry } from './models';

const at = (iso: string) => new Date(iso);
const now = new Date(2026, 9, 21, 22, 0);

const free: Entry = {
  ...blankEntry('free', at('2026-10-18T16:00:00')),
  title: 'Sunday at Abuela’s',
  body: 'She showed me how to fold pasteles.',
  feelings: ['tender'],
};
const reflection: Entry = {
  ...blankEntry('reflection', at('2026-10-20T20:40:00')),
  title: 'The meeting with Ana',
  whatHappened: 'She pushed back on the timeline.',
  feelings: ['anxious'],
  customFeelings: ['Embarrassed'],
  feelingsNote: 'Hot in the face.',
  patterns: ['reading_minds'],
};
const deleted: Entry = { ...blankEntry('free'), deletedAt: '2026-10-21T00:00:00.000Z' };
const entries = [reflection, free, deleted];

describe('export', () => {
  it('names files by today’s date', () => {
    expect(exportFileName('json', now)).toBe('haven-journal-2026-10-21.json');
    expect(exportFileName('md', now)).toBe('haven-journal-2026-10-21.md');
  });

  it('exports every live entry as JSON, as stored', () => {
    const file = JSON.parse(exportJson(entries, now));
    expect(file.app).toBe('Haven');
    expect(file.version).toBe(1);
    expect(file.entries).toEqual([reflection, free]);
  });

  it('writes readable Markdown with each answered part under its question', () => {
    const md = exportMarkdown(entries, en, 'en-US', now);

    expect(md).toContain('# Haven journal');
    expect(md).toContain('Exported: Wednesday, October 21, 2026');
    expect(md).toContain('## The meeting with Ana');
    expect(md).toContain('Reflection · Draft · Tuesday, October 20, 2026');
    expect(md).toContain('### What happened?\n\nShe pushed back on the timeline.');
    expect(md).toContain('### What did I feel?\n\nAnxious, Embarrassed\n\nHot in the face.');
    expect(md).toContain('- Reading minds');
    // Empty parts are skipped.
    expect(md).not.toContain('### What am I grateful for?');
    // Free writing: the body, then its feelings.
    expect(md).toContain('She showed me how to fold pasteles.\n\n### Feelings\n\nTender');
    expect(md.match(/^## /gm)).toHaveLength(2);
  });

  it('writes Markdown in Spanish too', () => {
    const md = exportMarkdown([reflection], es, 'es-PR', now);
    expect(md).toContain('# Diario de Haven');
    expect(md).toContain('Exportado: Miércoles, 21 de octubre de 2026');
    expect(md).toContain('Reflexión · Borrador · Martes, 20 de octubre de 2026');
    expect(md).toContain('### ¿Qué sentí?\n\nAnsiedad, Embarrassed');
    expect(md).toContain('- Leer mentes');
  });
});
