// Single source of truth for business details.
// Sources (checked 28 Oct 2026): antiqbarbers.com/book-now (hours, phone, email),
// Booksy listing (services, prices, staff, reviews, amenities), Google reviews, Facebook (opening date).

export const site = {
  name: 'Antiq Barbers',
  tagline: 'Not your average barbershop',
  intro: "Melbourne's 1st antique barbershop",
  opened: '30 June 2026',
  // Two ways to book while customers move across: our own appointment book
  // (the default everywhere) and the existing Booksy listing, always labelled.
  bookUrl: '/book',
  booksyUrl: 'https://booksy.com/en-au/6282_antiq-barbers_barbers_40678_epping',
  // Where /book POSTs a request once the booking backend exists. Until then
  // the request is handed to the customer's email app, addressed to the shop.
  bookingEndpoint: '',
  instagram: 'https://www.instagram.com/antiqbarbers/',
  instagramHandle: '@antiqbarbers',
  facebook: 'https://www.facebook.com/share/1cMcZyEKXe/',
  phone: '(03) 8407 3631',
  phoneHref: 'tel:+61384073631',
  email: 'antiqbarbers@gmail.com',
  rating: { score: '5.0', count: 287, source: 'Booksy' },
  google: {
    score: '4.7',
    count: 208,
    url: 'https://www.google.com/search?q=Antiq+Barbers+Epping#lrd=0x6ad64eedf9b0be9b:0xbb370c6017845833,1,,,,',
  },
  priceRange: '$20–$89',
  address: {
    line1: '5/60 Miller Street',
    suburb: 'Epping',
    state: 'VIC',
    postcode: '3076',
  },
  geo: { lat: -37.6455562, lng: 145.0208989 },
  mapsUrl: 'https://www.google.com/maps/place/Antiq+Barbers/@-37.6455562,145.0208989,17z/data=!4m6!3m5!1s0x6ad64eedf9b0be9b:0xbb370c6017845833!8m2!3d-37.6455562!4d145.0208989',
  // Amenities as listed on Booksy; the one-liners are the shop's pitch for each.
  amenities: [
    { icon: 'parking', label: 'Parking', line: 'Park and walk straight in.' },
    { icon: 'card', label: 'Cards accepted', line: 'Pay by card at the counter.' },
    { icon: 'access', label: 'Wheelchair accessible', line: 'Easy access for everyone.' },
    { icon: 'kids', label: 'Kids welcome', line: 'Junior cuts for ages 5–12.' },
    { icon: 'paw', label: 'Pets allowed', line: 'Bring your dog along.' },
    { icon: 'wifi', label: 'Wi-Fi', line: 'Stay connected while you wait.' },
    { icon: 'heart', label: 'Loyalty program', line: 'Regulars get rewarded.' },
  ],
};

// day: 0 = Sunday … 6 = Saturday. open/close in 24h "HH:MM"; null = closed.
export const hours = [
  { day: 1, label: 'Monday', open: null, close: null },
  { day: 2, label: 'Tuesday', open: '10:00', close: '18:00' },
  { day: 3, label: 'Wednesday', open: '10:00', close: '18:00' },
  { day: 4, label: 'Thursday', open: '11:00', close: '21:00' },
  { day: 5, label: 'Friday', open: '11:00', close: '21:00' },
  { day: 6, label: 'Saturday', open: '09:00', close: '18:00' },
  { day: 0, label: 'Sunday', open: '10:00', close: '16:00' },
] as { day: number; label: string; open: string | null; close: string | null }[];

export const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const hh = h % 12 || 12;
  return `${hh}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`;
};

type Service = { name: string; price: string; duration: string; note?: string; popular?: boolean };

// Prices and durations exactly as listed on Booksy. "+" means price from.
export const serviceGroups: { title: string; items: Service[] }[] = [
  {
    title: 'Barber services',
    items: [
      { name: 'Skin Fade & Beard Trim', price: '$75', duration: '45 min', note: 'The full works', popular: true },
      { name: 'Skin Fade', price: '$55–60', duration: '30 min', note: 'Bald to blended', popular: true },
      { name: 'Standard Haircut', price: '$50–55', duration: '30 min', note: 'Clipper & scissor', popular: true },
      { name: 'Stylish Scissor Haircut', price: '$60–65', duration: '40 min', note: 'Shaped by hand' },
      { name: 'Skin Fade, Beard Trim & Eyebrow Threading', price: '$80', duration: '45 min', note: 'Head to brow' },
      { name: 'Beard Trim', price: '$30–35', duration: '25 min', note: 'Shape & line-up' },
      { name: 'Buzz Cut', price: '$40+', duration: '20 min', note: 'One length, no fuss' },
      { name: 'Junior Haircut', price: '$40+', duration: '30 min', note: 'Ages 5 to 12' },
    ],
  },
  {
    title: 'Grooming',
    items: [
      { name: 'Eyebrow Threading', price: '$20', duration: '15 min' },
      { name: 'Nose & Ears Waxing', price: '$25', duration: '15 min' },
    ],
  },
  {
    title: 'Skin facials with Mim',
    items: [
      { name: 'Express Skin Reset Facial', price: '$65', duration: '30 min' },
      { name: 'Premium Skin Reset Facial', price: '$89', duration: '50 min' },
    ],
  },
];

// Verified Booksy reviews (public). First names only, as shown on Booksy.
export const reviews = [
  {
    name: 'Aneesh',
    service: 'Skin Fade & Beard Trim',
    text: 'This is definitely the most unique barbershop anywhere in Melbourne. The sounds of birds and flowing water create a relaxing atmosphere.',
  },
  {
    name: 'John',
    service: 'Fade & Beard Trim',
    text: 'The shop itself is a sight unlike anything in Melbourne, let alone the northern suburbs.',
  },
  {
    name: 'Jowen',
    service: 'Stylish Scissor Haircut',
    text: 'The birds chirping and the water trickling from the water fountain inside the shop brings that calm and relaxing energy that you would want in a barbershop.',
  },
  {
    name: 'Dylan',
    service: 'Skin Fade & Beard Trim',
    text: 'Ali and Antiq have amazing atmosphere and even better service. Highly recommend.',
  },
];

export const barbers = [
  { name: 'Alz', role: 'Lead barber' }, // TODO: confirm titles + add portraits
  { name: 'Diaz', role: 'Barber' },
  { name: 'Mim', role: 'Skin facials' },
];

// Public Google reviews (checked 28 Oct 2026). First name + initial; excerpts verbatim.
export const googleReviews = [
  { name: 'Elijah J.', text: 'Stylish atmosphere, very clean, welcoming staff and top-quality service. One of the best barber experiences I’ve had.' },
  { name: 'Harpreet S.', text: 'It’s the best barber shop in Melbourne. The interior is beautiful and whole vibe of the place is great.' },
  { name: 'Saj T.', text: 'Took his time to understand what I wanted and gave me some really good suggestions. Haircut and beard came out exactly how I wanted.' },
  { name: 'Jye C.', text: 'To finally have a Barber out in the northern suburbs like this is amazing. Watching birds while having your hair cut.' },
  { name: 'Benjamin T.', text: 'The vibe was really nice and welcoming, and the haircut was done very professionally. Everything felt top-notch and the price was excellent for the quality.' },
];

// Link into our own appointment book, optionally with a service and/or barber picked.
export const bookHref = (opts: { service?: string; barber?: string } = {}) => {
  const q = new URLSearchParams();
  if (opts.service) q.set('service', opts.service);
  if (opts.barber) q.set('barber', opts.barber);
  const s = q.toString();
  return s ? `${site.bookUrl}?${s}` : site.bookUrl;
};
