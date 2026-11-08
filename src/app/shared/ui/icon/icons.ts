/**
 * Every icon in the design, drawn on a 24 × 24 grid. Each icon is a single path
 * `d` string, so the component only ever renders one <path>. Circles and the
 * journal's rounded rectangle are written as path commands with the helpers below.
 */
export interface IconDefinition {
  readonly d: string;
  /** Solid shapes (fill) instead of outlines (stroke). */
  readonly filled?: boolean;
}

/** A full circle as two arcs. */
const circle = (cx: number, cy: number, r: number): string =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const ICONS = {
  alert: { d: `${circle(12, 12, 8)}M12 8v5M12 16h.01` },
  'arrow-left': { d: 'M19 12H5M11 6l-6 6 6 6' },
  'arrow-right': { d: 'M5 12h14M13 6l6 6-6 6' },
  check: { d: 'M5 12.5l4.5 4.5L19 7.5' },
  'chevron-right': { d: 'M9 6l6 6-6 6' },
  close: { d: 'M6 6l12 12M18 6L6 18' },
  'cloud-off': {
    d: 'M4 4l16 16M8.5 17H6a4 4 0 0 1-.6-7.95M10 6.2A6 6 0 0 1 17.7 10 3.5 3.5 0 0 1 19.6 16',
  },
  download: { d: 'M12 4v11M7 10l5 5 5-5M5 20h14' },
  home: { d: 'M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z' },
  journal: {
    d:
      'M6.5 3.5h11A1.5 1.5 0 0 1 19 5v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5z' +
      'M9 3.5v17M12.5 8h3.5',
  },
  pen: { d: 'M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17zM14 7l3 3' },
  plus: { d: 'M12 5v14M5 12h14' },
  search: { d: `${circle(11, 11, 6)}M20 20l-4.5-4.5` },
  settings: { d: `M4 7h9M17 7h3M4 17h3M11 17h9${circle(15, 7, 2)}${circle(9, 17, 2)}` },
  'six-dots': {
    d: [8, 16].flatMap((x) => [5.5, 12, 18.5].map((y) => circle(x, y, 1.7))).join(''),
    filled: true,
  },
  trash: { d: 'M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13' },
} as const satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];
