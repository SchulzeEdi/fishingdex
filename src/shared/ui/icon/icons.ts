// Conjunto próprio do fishingdex (assets/Icons do design system): grade 24, traço 1,75,
// pontas e cantos arredondados. Copiado dos SVGs — não aproximar.

export type IconShape =
  | { kind: 'path'; d: string; strokeWidth?: number }
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'rect'; x: number; y: number; width: number; height: number; rx: number };

export interface IconDef {
  viewBox: string;
  /** stroke = contorno na cor; fill = forma preenchida na cor. */
  paint: 'stroke' | 'fill';
  shapes: IconShape[];
}

const stroke = (shapes: IconShape[]): IconDef => ({ viewBox: '0 0 24 24', paint: 'stroke', shapes });
const p = (d: string, strokeWidth?: number): IconShape => ({ kind: 'path', d, strokeWidth });

export const ICONS = {
  feed: stroke([
    p('M3 8c2 0 2-1.5 4.5-1.5S9.5 8 12 8s2-1.5 4.5-1.5S18.5 8 21 8'),
    p('M3 13c2 0 2-1.5 4.5-1.5S9.5 13 12 13s2-1.5 4.5-1.5S18.5 13 21 13'),
    p('M3 18c2 0 2-1.5 4.5-1.5S9.5 18 12 18s2-1.5 4.5-1.5S18.5 18 21 18'),
  ]),
  trophy: stroke([
    p('M8 4h8v5a4 4 0 0 1-8 0z'),
    p('M8 6H5a3 3 0 0 0 3.2 4'),
    p('M16 6h3a3 3 0 0 1-3.2 4'),
    p('M12 13v4'),
    p('M8 20h8'),
    p('M9.5 17h5'),
  ]),
  plus: stroke([p('M12 5v14M5 12h14')]),
  fish: stroke([
    p('M2.5 12c2.5-4 8-5.5 12.5-2.5L20 6v12l-5-3.5C10.5 17.5 5 16 2.5 12z'),
    p('M7 11.3v.01', 2.4),
  ]),
  user: stroke([{ kind: 'circle', cx: 12, cy: 8, r: 4 }, p('M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5')]),
  heart: stroke([p('M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z')]),
  'heart-fill': {
    viewBox: '0 0 24 24',
    paint: 'fill',
    shapes: [p('M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z')],
  },
  star: stroke([p('m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.8l-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z')]),
  'star-fill': {
    viewBox: '0 0 24 24',
    paint: 'fill',
    shapes: [p('m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.8l-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z', 1)],
  },
  lock: stroke([
    { kind: 'rect', x: 5, y: 11, width: 14, height: 9, rx: 2 },
    p('M8 11V8a4 4 0 0 1 8 0v3'),
  ]),
  'map-pin': stroke([
    p('M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z'),
    { kind: 'circle', cx: 12, cy: 10, r: 2 },
  ]),
  ruler: stroke([p('M3 16 16 3l5 5L8 21z'), p('m7 12 2 2M10 9l2 2M13 6l2 2')]),
  camera: stroke([p('M4 8h3l2-3h6l2 3h3v11H4z'), { kind: 'circle', cx: 12, cy: 13, r: 3.5 }]),
  search: stroke([{ kind: 'circle', cx: 11, cy: 11, r: 6 }, p('m20 20-4.5-4.5')]),
  check: stroke([p('m5 12.5 4.5 4.5L19 7')]),
  'chevron-right': stroke([p('m9 6 6 6-6 6')]),
  alert: stroke([{ kind: 'circle', cx: 12, cy: 12, r: 8.5 }, p('M12 7.5v5'), p('M12 16v.01', 2.4)]),
  'wifi-off': stroke([
    p('M3 3l18 18'),
    p('M8.5 16.5a5 5 0 0 1 7 0'),
    p('M5 12.5a10 10 0 0 1 4.5-2.4M19 12.5a10 10 0 0 0-3-2'),
    p('M12 20v.01', 2.4),
  ]),
  message: stroke([p('M4 20l1.5-4A8 8 0 1 1 9 19.5z')]),
  'fish-silhouette': {
    viewBox: '0 0 64 40',
    paint: 'fill',
    shapes: [
      p('M2 21C9 9 28 4 42 13.5L58 4v34l-16-9.5C28 38 9 33 2 21z'),
      p('M20 10.5C23 4.5 31 2.5 37 5l-3 6.5z'),
    ],
  },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;
