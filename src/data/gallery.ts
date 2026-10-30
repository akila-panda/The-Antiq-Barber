// Client-supplied photography (Oct 2026), exported to /public/images/{shop,work}.
import sizes from './image-sizes.json';

// Intrinsic [width, height] so lazy images reserve their space before loading.
export const dims = (src: string) => {
  const [width, height] = (sizes as Record<string, number[]>)[src] ?? [];
  return { width, height };
};

export type Plate = { src: string; caption: string; wide?: boolean };
export type Room = { numeral: string; title: string; blurb: string; plates: Plate[] };

// The interior tour, room by room. Plates are numbered in order across rooms.
export const rooms: Room[] = [
  {
    numeral: 'I',
    title: 'The Front Bar',
    blurb: 'Hand-burnt timber, a wall of old bottles and a barrel at every elbow.',
    plates: [
      { src: '/images/shop/front-bar-wide.webp', caption: 'The front bar, looking through to the courtyard', wide: true },
      { src: '/images/shop/bar-shelf.webp', caption: 'The apothecary shelf behind the counter' },
      { src: '/images/shop/bar-counter.webp', caption: 'The counter, darts and a barrel-lamp', wide: true },
      { src: '/images/shop/bar-mirror.webp', caption: 'The long room under a barrel lamp', wide: true },
    ],
  },
  {
    numeral: 'II',
    title: 'The Parlour',
    blurb: 'Tufted leather chairs, porthole mirrors and textured amber walls.',
    plates: [
      { src: '/images/shop/parlour-row.webp', caption: 'The row of chairs along the glass' },
      { src: '/images/shop/parlour-chairs.webp', caption: 'Porthole mirrors, lit', wide: true },
      { src: '/images/shop/chair-deer.webp', caption: 'A chair, a barrel and a stag' },
      { src: '/images/shop/parlour-nook.webp', caption: 'The corner station' },
      { src: '/images/shop/client-seated.webp', caption: 'Settled in for a cut' },
    ],
  },
  {
    numeral: 'III',
    title: 'The Aviary',
    blurb: 'A glass courtyard in the middle of the shop: plants, birdsong and a fountain.',
    plates: [
      { src: '/images/shop/courtyard-glass.webp', caption: 'The courtyard, seen from the parlour', wide: true },
      { src: '/images/shop/courtyard-sun.webp', caption: 'Afternoon light through the aviary' },
      { src: '/images/shop/courtyard-boy.webp', caption: 'A young client meets the birds' },
      { src: '/images/shop/client-courtyard.webp', caption: 'Waiting by the aviary glass' },
      { src: '/images/shop/courtyard-bag.webp', caption: 'The courtyard and the punching bag', wide: true },
    ],
  },
  {
    numeral: 'IV',
    title: 'The Raised Booth',
    blurb: 'A private chair on a tiled stage, rimmed in red light.',
    plates: [
      { src: '/images/shop/booth.webp', caption: 'The booth on its tiled platform' },
      { src: '/images/shop/booth-chair.webp', caption: 'The booth chair from the floor' },
      { src: '/images/shop/booth-overhead.webp', caption: 'From above: booth, courtyard and parlour' },
    ],
  },
  {
    numeral: 'V',
    title: 'Curiosities',
    blurb: 'Collected oddities on carved stone walls.',
    plates: [
      { src: '/images/shop/deer.webp', caption: 'The stag over the red seam' },
      { src: '/images/shop/bmx.webp', caption: 'A golden BMX and a dreamcatcher' },
      { src: '/images/shop/neon-rock.webp', caption: 'Stone, wire and a line of red neon' },
    ],
  },
  {
    numeral: 'VI',
    title: 'Up the Stairs',
    blurb: 'Street art, skylights and a full-size pool table.',
    plates: [
      { src: '/images/shop/entrance.webp', caption: 'The street entrance, stairs to the loft' },
      { src: '/images/shop/lounge-mural.webp', caption: 'The mural wall and the staircase', wide: true },
      { src: '/images/shop/lounge-moto.webp', caption: 'A motorcycle parked in the hall' },
      { src: '/images/shop/lounge-mickey.webp', caption: 'Graffiti from floor to skylight' },
      { src: '/images/shop/lounge-pool-window.webp', caption: 'The pool table by daylight' },
      { src: '/images/shop/lounge-pool-skylight.webp', caption: 'Skylights over the graffiti wall' },
      { src: '/images/shop/lounge-pool-tall.webp', caption: 'The loft, floor to skylight' },
      { src: '/images/shop/lounge-pool-day.webp', caption: 'Racked and ready' },
      { src: '/images/shop/lounge-pool-mural.webp', caption: 'The pool table and the full mural' },
      { src: '/images/shop/lounge-pool-graffiti.webp', caption: 'Graffiti and skylights' },
    ],
  },
  {
    numeral: 'VII',
    title: 'The Loft by Neon',
    blurb: 'The same loft after dark.',
    plates: [
      { src: '/images/shop/lounge-pool-wide.webp', caption: 'Neon, graffiti and the pool table' },
      { src: '/images/shop/lounge-neon-wide.webp', caption: 'Neon stair rails over the felt', wide: true },
    ],
  },
];

export type Look = { src: string; caption: string; tags: string[] };

export const lookFilters = [
  { id: 'all', label: 'All work' },
  { id: 'fade', label: 'Fades' },
  { id: 'taper', label: 'Tapers' },
  { id: 'mullet', label: 'Mullets' },
  { id: 'crop', label: 'Crops & texture' },
  { id: 'beard', label: 'Beards' },
  { id: 'classic', label: 'Classic & scissor' },
  { id: 'junior', label: 'Juniors' },
  { id: 'colour', label: 'Colour' },
];

const w = (name: string) => `/images/work/${name}.webp`;

// Captions describe the cut in each photo; ordered strongest first.
export const looks: Look[] = [
  { src: w('skin-fade-beard'), caption: 'Skin fade, full beard', tags: ['fade', 'beard'] },
  { src: w('mullet-burst'), caption: 'Burst fade mullet', tags: ['mullet', 'fade'] },
  { src: w('blue-colour'), caption: 'Blue colour, low fade', tags: ['colour', 'fade'] },
  { src: w('long-beard'), caption: 'Long beard, slick back', tags: ['beard', 'classic'] },
  { src: w('high-skin-fade'), caption: 'High skin fade', tags: ['fade'] },
  { src: w('taper-neon-tee'), caption: 'Low taper, textured fringe', tags: ['taper', 'crop'] },
  { src: w('mullet-slick'), caption: 'Slicked mullet & beard', tags: ['mullet', 'beard'] },
  { src: w('beard-frame'), caption: 'Drop fade & beard, framed', tags: ['fade', 'beard'] },
  { src: w('low-taper'), caption: 'Low taper, messy top', tags: ['taper', 'crop'] },
  { src: w('flat-top'), caption: 'Crew cut, high skin fade', tags: ['fade', 'classic'] },
  { src: w('bleach-crop'), caption: 'Bleached textured crop', tags: ['crop', 'colour'] },
  { src: w('slick-back'), caption: 'Classic slick back', tags: ['classic'] },
  { src: w('textured-crop'), caption: 'Textured crop, nape taper', tags: ['crop', 'taper'] },
  { src: w('fade-beard-window'), caption: 'Textured top, skin fade & beard', tags: ['fade', 'beard'] },
  { src: w('pompadour'), caption: 'Scissor-cut pompadour', tags: ['classic'] },
  { src: w('teen-taper'), caption: 'Teen taper', tags: ['taper', 'junior'] },
  { src: w('mullet'), caption: 'Modern mullet & beard', tags: ['mullet', 'beard'] },
  { src: w('taper-beard'), caption: 'Drop fade, beard line-up', tags: ['fade', 'beard'] },
  { src: w('crop-fringe-beard'), caption: 'Crop fringe & full beard', tags: ['crop', 'beard'] },
  { src: w('curly-top'), caption: 'Curly top, tapered sides', tags: ['crop', 'taper'] },
  { src: w('fade-beard-courtyard'), caption: 'Mid fade & sculpted beard', tags: ['fade', 'beard'] },
  { src: w('taper-black-wall'), caption: 'Taper with a heavy fringe', tags: ['taper', 'crop'] },
  { src: w('side-part'), caption: 'Side part, scissor finish', tags: ['classic'] },
  { src: w('beard-mirror'), caption: 'Long beard at the porthole', tags: ['beard'] },
  { src: w('scissor-cut'), caption: 'Scissor cut, longer length', tags: ['classic'] },
  { src: w('junior'), caption: 'Junior cut by the aviary', tags: ['junior'] },
  { src: w('fade-courtyard'), caption: 'Skin fade, textured quiff', tags: ['fade'] },
  { src: w('beard-chair'), caption: 'Beard sculpt & fade', tags: ['beard', 'fade'] },
  { src: w('fade-textured'), caption: 'Textured crop, skin fade', tags: ['fade', 'crop'] },
  { src: w('fade-classic'), caption: 'Classic short fade', tags: ['fade'] },
  { src: w('fade-chair'), caption: 'Fresh skin fade', tags: ['fade'] },
  { src: w('fade-courtyard-2'), caption: 'Short back & sides', tags: ['fade', 'classic'] },
  { src: w('fade-neon'), caption: 'Fade & beard under the neon', tags: ['fade', 'beard'] },
  { src: w('fade-mirror'), caption: 'Fade, seen in the porthole', tags: ['fade'] },
];

// Gallery I walks the five downstairs rooms by day; everything upstairs
// hangs on the neon wall in the night edition.
export const downstairs = rooms.slice(0, 5);
export const upstairs: Plate[] = [
  { src: '/images/shop/lounge-stairs-pool.webp', caption: 'The lit staircase beside the pool table' },
  { src: '/images/shop/lounge-neon-pool.webp', caption: 'Pink and blue over the felt' },
  { src: '/images/shop/lounge-guitars.webp', caption: 'Guitars on the neon wall' },
  ...rooms.slice(5).flatMap((r) => r.plates),
];

// The day/neon comparison pair for the "slide the lights" moment.
export const lightsPair = {
  day: { src: '/images/shop/lounge-pool-window.webp', alt: 'The loft by day' },
  night: { src: '/images/shop/lounge-pool-wide.webp', alt: 'The loft by neon' },
};
