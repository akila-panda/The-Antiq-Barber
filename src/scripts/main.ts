import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

// ---------- smooth scroll ----------
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.11, anchors: { offset: -64 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ---------- today's date in the dateline ----------
const today = new Intl.DateTimeFormat('en-AU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date());
document.querySelectorAll('[data-today]').forEach((el) => (el.textContent = today));

// ---------- live open / closed stamp (shop time, Melbourne) ----------
type Day = { day: number; open: string | null; close: string | null };
try {
  const hours: Day[] = JSON.parse(document.getElementById('shop-hours')?.textContent || '[]');
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const dayIdx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const now = `${get('hour')}:${get('minute')}`;
  const today = hours.find((h) => h.day === dayIdx);
  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`;
  };
  const isOpen = !!(today?.open && today.close && now >= today.open && now < today.close);
  const label = isOpen
    ? `Open now · until ${fmt(today!.close!)}`
    : today?.open && now < today.open
      ? `Opens today at ${fmt(today.open)}`
      : 'Closed now';

  document.querySelectorAll<HTMLElement>('[data-open-status]').forEach((el) => {
    el.textContent = el.tagName === 'SPAN' ? `${label}.` : label;
    el.classList.toggle('text-oxblood', isOpen);
    el.classList.toggle('border-oxblood', isOpen);
  });
  document
    .querySelector(`[data-hours-day="${dayIdx}"]`)
    ?.classList.add('font-semibold', 'bg-paper-deep/70', '-mx-2', 'px-2');
} catch {}

// ---------- preloader hand-off ----------
// The inline preloader (components/Preloader.astro) fires `antiq:ready` once the
// sheet has lifted. Hold the page still until then; if it already finished, go now.
function whenReady(start: () => void) {
  if (!root.classList.contains('is-loading')) {
    initReveals();
    return start();
  }
  lenis?.stop();
  window.addEventListener(
    'antiq:ready',
    () => {
      lenis?.start();
      start();
    },
    { once: true },
  );
}

// ---------- motion system ----------
// One easing family across the site: expo-out for arrivals, expo-in-out for
// unveils. Nothing is hidden in the HTML; states are only set here, by JS.
const EASE_OUT = 'expo.out';
const EASE_IN_OUT = 'expo.inOut';

// Wrap each word's characters so they can rise out of a mask. Only text nodes
// are split, so <em>, <br> and icons inside headings survive.
function splitChars(el: HTMLElement) {
  if (el.dataset.splitDone) return el.querySelectorAll<HTMLElement>('.split-c');
  el.dataset.splitDone = '1';
  el.setAttribute('aria-label', el.textContent?.replace(/\s+/g, ' ').trim() ?? '');
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.textContent!.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
      const word = document.createElement('span');
      word.className = 'split-w';
      word.setAttribute('aria-hidden', 'true');
      [...part].forEach((ch) => {
        const c = document.createElement('span');
        c.className = 'split-c';
        c.textContent = ch;
        word.append(c);
      });
      frag.append(word);
    });
    node.replaceWith(frag);
  });
  return el.querySelectorAll<HTMLElement>('.split-c');
}

// The front page arrives as the preloader sheet lifts away.
function heroTimeline() {
  const name = document.querySelector<HTMLElement>('[data-hero="name"]');
  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE_OUT, duration: 1.2 } });
  tl.from('[data-hero="dateline"]', { yPercent: -120, autoAlpha: 0, duration: 0.9 }, 0);
  if (name) tl.from(splitChars(name), { yPercent: 115, rotate: 7, stagger: 0.028, duration: 1.1 }, 0.05);
  tl.from('[data-hero="crest"]', { scale: 0.35, rotate: -120, autoAlpha: 0, duration: 1.5 }, 0.1)
    .from('[data-hero="tagline"]', { y: 22, autoAlpha: 0, filter: 'blur(8px)' }, 0.35)
    .from('[data-nav-row] li', { y: -22, autoAlpha: 0, stagger: 0.06, duration: 0.9 }, 0.45)
    .from('[data-hero="antiq"]', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: EASE_IN_OUT }, 0.3)
    .from('[data-hero="antiq"] svg', { yPercent: 35, duration: 1.8 }, 0.35);
  return tl;
}
let revealsReady = false; // declared before any initReveals() call below
let hero: gsap.core.Timeline | null = null;
// if the script arrives after the sheet already began lifting, just reveal
if (document.querySelector('.preloader.is-leaving')) {
  initReveals();
} else if (root.classList.contains('is-loading')) {
  if (!reduced) hero = heroTimeline();
  // set reveals up while the sheet still covers the page, so nothing flashes
  window.addEventListener(
    'antiq:lift',
    () => {
      initReveals();
      hero?.play();
    },
    { once: true },
  );
}

// ---------- the desk ----------
// First visit: once the preloader finishes, its dark sheet becomes a burnt-timber
// desk under a lamp, the barber tools come to rest on it, and the front page lies
// there as a sheet of newsprint (rough-cut edge, aged margins, yesterday's paper
// underneath), fully printed. Then it's picked up to fill the screen. The
// preloader calls this, then cleans up via `done`.

// A paper outline as polygon points over a w×h box. With amp > 0 every edge is
// slightly fibrous; with amp 0 it's the same points laid straight, so one tweens
// cleanly into the other.
function paperEdge(w: number, h: number, amp: number) {
  // many small nicks read as fibre; a few bigger ones read as handling
  const across = 150;
  const down = 90;
  const nick = () => (amp ? Math.random() * amp * (Math.random() < 0.06 ? 2.4 : 1) : 0);
  const pts: string[] = [];
  for (let i = 0; i <= across; i++) pts.push(`${((w * i) / across).toFixed(1)}px ${nick().toFixed(1)}px`);
  for (let i = 1; i < down; i++) pts.push(`${(w - nick()).toFixed(1)}px ${((h * i) / down).toFixed(1)}px`);
  for (let i = across; i >= 0; i--) pts.push(`${((w * i) / across).toFixed(1)}px ${(h - nick()).toFixed(1)}px`);
  for (let i = down - 1; i >= 1; i--) pts.push(`${nick().toFixed(1)}px ${((h * i) / down).toFixed(1)}px`);
  return `polygon(${pts.join(', ')})`;
}

(window as unknown as { __antiqDesk?: (pre: HTMLElement, done: () => void) => void }).__antiqDesk = (pre, done) => {
  const sheet = document.getElementById('sheet');
  if (!sheet || reduced) return done();
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  hero?.progress(1); // the page arrives already printed
  const shadow = pre.querySelector<HTMLElement>('.pl-desk-shadow');
  const under = pre.querySelector<HTMLElement>('.pl-under');
  // the inner wrapper: no CSS transition or animation left on it to fight with
  const tools = pre.querySelectorAll<HTMLElement>('.pl-tool-in');
  const pieces = shadow ? [sheet, shadow] : [sheet];
  const phone = window.matchMedia('(max-width: 767px)').matches;
  const scale = phone ? 0.84 : 0.56;
  const tilt = phone ? 0 : -3;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const rest = (h * (1 - scale)) / 2; // centred on the desk

  // aged newsprint margins sit over the page while it's on the desk
  const age = document.createElement('div');
  age.className = 'desk-age';
  age.setAttribute('aria-hidden', 'true');
  sheet.append(age);

  root.classList.add('is-desk');
  // only the first screen of the page shows, cut like newsprint
  gsap.set(sheet, { clipPath: paperEdge(w, h, 4.5) });
  gsap.set(pieces, { transformOrigin: '50% 0%', y: rest + 90, scale, rotate: tilt, autoAlpha: 0 });
  if (under) {
    (under.firstElementChild as HTMLElement).style.clipPath = paperEdge(w, h, 5.5);
    gsap.set(under, { transformOrigin: '50% 0%', y: rest + 90, x: 0, scale, rotate: tilt, autoAlpha: 0 });
  }

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(pieces, { clearProps: 'all' });
      age.remove();
      root.classList.remove('is-desk');
      initReveals(true);
      done();
    },
  });
  tl.to(pieces, { autoAlpha: 1, y: rest, duration: 0.9, ease: EASE_OUT }, 0.25)
    // the tools come down onto the desk as the page lands
    .to(tools, { y: 12, scale: 0.9, duration: 0.9, ease: EASE_OUT, stagger: 0.03 }, 0.15);
  // yesterday's paper lands first, a little askew, and peeks out from under today's
  if (under) tl.to(under, { autoAlpha: 1, y: rest + (phone ? 16 : 30), x: phone ? 10 : 46, rotate: tilt + (phone ? 3 : 5), duration: 1, ease: EASE_OUT }, 0.1);
  tl.addLabel('lift', '+=0.5')
    .to(pieces, { y: 0, scale: 1, rotate: 0, duration: 1.4, ease: EASE_IN_OUT }, 'lift')
    .to(sheet, { clipPath: paperEdge(w, h, 0), duration: 1.4, ease: EASE_IN_OUT }, 'lift')
    .to(age, { opacity: 0, duration: 0.9, ease: 'power1.in' }, 'lift');
  // as the page is picked up, the old paper and the tools slide off the desk
  if (under) tl.to(under, { y: `+=${h * 0.45}`, rotate: tilt + 12, autoAlpha: 0, duration: 1.1, ease: 'expo.in' }, 'lift');
  tools.forEach((t) => {
    const b = t.getBoundingClientRect();
    const dx = b.left + b.width / 2 - w / 2;
    const dy = b.top + b.height / 2 - h / 2;
    tl.to(t, { x: Math.sign(dx || 1) * w * 0.45, y: 12 + dy * 0.6, rotate: Math.sign(dx || 1) * 25, autoAlpha: 0, duration: 1.1, ease: 'power3.in' }, 'lift');
  });
  tl.to(pre, { autoAlpha: 0, duration: 0.5, ease: 'none' }, '-=0.4');
  // dev only: lets the timeline be paused and stepped through when checking the desk
  if (import.meta.env.DEV) (window as unknown as { __deskTl?: gsap.core.Timeline }).__deskTl = tl;
};

// Scroll reveals: characters rise, blocks ease up out of a soft blur,
// photographs unveil from the bottom, tools drift at their own depth.
// After the desk, anything already on screen was seen printed, so it stays put.
function initReveals(keepVisible = false) {
  if (reduced || revealsReady) return;
  revealsReady = true;
  const fresh = (el: Element) => !keepVisible || el.getBoundingClientRect().top > window.innerHeight;

  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    if (!fresh(el)) return;
    gsap.from(splitChars(el), {
      yPercent: 115,
      rotate: 6,
      stagger: 0.022,
      duration: 1.15,
      ease: EASE_OUT,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  const rise = gsap.utils.toArray<HTMLElement>('[data-rise]').filter(fresh);
  gsap.set(rise, { autoAlpha: 0, y: 46, filter: 'blur(8px)' });
  ScrollTrigger.batch(rise, {
    start: 'top 90%',
    once: true,
    onEnter: (els) =>
      gsap.to(els, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1.15, ease: EASE_OUT, stagger: 0.09, clearProps: 'filter' }),
  });

  document.querySelectorAll<HTMLElement>('[data-unveil]').forEach((el) => {
    if (!fresh(el)) return;
    const img = el.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: EASE_IN_OUT });
    if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.9, ease: EASE_OUT }, 0);
  });

  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const speed = Number(el.dataset.parallax) || 1;
    gsap.fromTo(
      el,
      { yPercent: 60 * speed, rotate: -8 * speed },
      {
        yPercent: -60 * speed,
        rotate: 8 * speed,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      },
    );
  });
}

// ---------- scroll choreography ----------
function initScroll() {

  // sticky slim header once the masthead leaves
  const bar = document.getElementById('slimbar');
  const masthead = document.getElementById('masthead');
  if (bar && masthead) {
    ScrollTrigger.create({
      trigger: masthead,
      start: 'bottom top',
      onEnter: () => bar.classList.remove('-translate-y-full'),
      onLeaveBack: () => bar.classList.add('-translate-y-full'),
    });
  }

  // The Gallery: on desktop, vertical scroll walks the plates sideways
  const pinEl = document.querySelector<HTMLElement>('[data-gallery-pin]');
  const track = document.querySelector<HTMLElement>('[data-gallery-track]');
  const progress = document.querySelector<HTMLElement>('[data-gallery-progress]');
  if (pinEl && track) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: pinEl,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => progress && gsap.set(progress, { scaleX: self.progress }),
        },
      });
    });
    // mobile: progress follows the swipe rail
    const rail = track.parentElement!;
    rail.addEventListener(
      'scroll',
      () => {
        const max = rail.scrollWidth - rail.clientWidth;
        if (progress && max > 0) gsap.set(progress, { scaleX: rail.scrollLeft / max });
      },
      { passive: true },
    );
  }

  // Night edition: the page goes dark from the centre, ink turns to neon.
  const stage = document.querySelector<HTMLElement>('[data-night-stage]');
  const night = document.querySelector<HTMLElement>('[data-night-layer]');
  if (stage && night && !reduced) {
    gsap.set(night, { clipPath: 'circle(0% at 50% 55%)' });
    gsap
      .timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: '+=170%',
          pin: true,
          scrub: 0.6,
          // the whole paper goes to night as the lights-out circle spreads, and
          // back to day if you scroll up out of it
          onUpdate: (self) => {
            const edition = self.progress > 0.5 ? 'night' : 'day';
            if (root.dataset.edition !== edition) root.dataset.edition = edition;
          },
        },
      })
      // hold the day headline long enough to read, then lights out
      .to('[data-day-ink]', { opacity: 0.15, scale: 0.96, duration: 0.3 }, 0.35)
      .to(night, { clipPath: 'circle(150% at 50% 55%)', duration: 0.7, ease: 'power2.inOut' }, 0.35)
      .from('[data-night-title]', { scale: 1.12, opacity: 0, duration: 0.35 }, 0.75)
      .to({}, { duration: 0.2 });
  }

  // Slide the lights: day loft vs neon loft.
  document.querySelectorAll<HTMLElement>('[data-lights]').forEach((wrap) => {
    const range = wrap.querySelector<HTMLInputElement>('input[type=range]')!;
    const update = () => wrap.style.setProperty('--split', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  });

  // The neon wall: tubes switch on a few at a time as they scroll in.
  ScrollTrigger.batch('.tube-frame:not(.lit)', {
    start: 'top 85%',
    once: true,
    onEnter: (els) => els.forEach((el) => el.classList.add('lit')),
  });

  // The darkroom: prints develop as they reach the safelight.
  const darkroom = document.querySelector<HTMLElement>('[data-darkroom]');
  if (darkroom && !reduced) {
    darkroom.classList.add('is-developing');
    ScrollTrigger.batch('.print', {
      start: 'top 80%',
      once: true,
      onEnter: (els) => els.forEach((el, i) => setTimeout(() => el.classList.add('developed'), i * 180)),
    });
  }

  // Dawn: the morning paper lands on the doorstep, unfolds, and opens into the day.
  const dawn = document.querySelector<HTMLElement>('[data-dawn-stage]');
  if (dawn) {
    if (reduced) {
      gsap.set('[data-dawn-dark], [data-dawn-hint], [data-paper-back], [data-paper-crease]', { display: 'none' });
    } else {
      const flap = '[data-paper-half="top"]';
      const sheet = '[data-paper-sheet]';
      gsap.set(flap, { rotateX: -180, transformPerspective: 2400, transformOrigin: '50% 100%', zIndex: 2 });
      gsap.set('[data-paper-front="top"]', { autoAlpha: 0 });
      // the paper falls in while the section scrolls up, so there's never an empty screen
      gsap.fromTo(
        sheet,
        { yPercent: -110, rotate: -18, scale: 0.62 },
        { yPercent: -25, rotate: -5, ease: 'power2.out', scrollTrigger: { trigger: dawn, start: 'top 85%', end: 'top top', scrub: 0.6 } },
      );
      gsap
        .timeline({ scrollTrigger: { trigger: dawn, start: 'top top', end: '+=130%', pin: true, scrub: 0.6 } })
        .to('[data-dawn-hint]', { autoAlpha: 0, duration: 0.1 }, 0)
        // the top half unfolds; its back shows until it passes upright
        .to(flap, { rotateX: 0, ease: 'power1.inOut', duration: 0.4 }, 0)
        .fromTo(sheet, { yPercent: -25 }, { yPercent: 0, ease: 'power1.inOut', duration: 0.4, immediateRender: false }, 0)
        .set('[data-paper-front="top"]', { autoAlpha: 1 }, 0.2)
        .set('[data-paper-back]', { autoAlpha: 0 }, 0.2)
        // then it opens out to fill the page
        .fromTo(sheet, { scale: 0.62, rotate: -5 }, { scale: 1, rotate: 0, ease: 'power2.inOut', duration: 0.4, immediateRender: false }, 0.45)
        .to('[data-dawn-dark]', { autoAlpha: 0, duration: 0.3 }, 0.5)
        .to('[data-paper-crease]', { autoAlpha: 0, duration: 0.1 }, 0.8)
        .to({}, { duration: 0.1 });
    }
  }

  // Nav tickets: the section on screen keeps its ticket inked in.
  const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')];
  [...new Set(navLinks.map((a) => a.getAttribute('href')!))].forEach((href) => {
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    ScrollTrigger.create({
      trigger: target,
      start: 'top 50%',
      end: 'bottom 50%',
      refreshPriority: -1,
      onToggle: (self) =>
        navLinks
          .filter((a) => a.getAttribute('href') === href)
          .forEach((a) => (self.isActive ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'))),
    });
  });

  // without the pinned lights-out, the stage simply joins the night edition
  if (stage && reduced) {
    stage.dataset.edition = 'night';
    stage.dataset.editionStart = 'top 60%';
  }

  // Editions: whichever section holds the middle of the screen sets the
  // whole paper's light. Measured last, after every pin above has its spacing.
  document.querySelectorAll<HTMLElement>('[data-edition]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: section.dataset.editionStart ?? 'top 50%',
      end: 'bottom 50%',
      refreshPriority: -1,
      onToggle: (self) => {
        if (self.isActive) document.documentElement.dataset.edition = section.dataset.edition;
      },
    });
  });

  // dashed route on the directions map draws itself
  const route = document.querySelector<SVGPathElement>('[data-route]');
  if (route) {
    const len = route.getTotalLength();
    // dashed look comes from a mask: draw a solid copy, mask the dashed path with it
    const mask = document.querySelector<SVGPathElement>('[data-route-mask]');
    if (mask && !reduced) {
      mask.style.strokeDasharray = `${len}`;
      mask.style.strokeDashoffset = `${len}`;
      gsap.to(mask, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: { trigger: route.closest('svg'), start: 'top 75%', end: 'bottom 55%', scrub: 0.5 },
      });
    }
  }

  // touch screens can't hover, so newsprint photos develop as they reach mid-screen
  if (window.matchMedia('(hover: none)').matches) {
    ScrollTrigger.batch('.halftone', {
      start: 'top 55%',
      once: true,
      onEnter: (els) => els.forEach((el) => el.classList.add('is-developed')),
    });
  }

  // headlines drift slightly against the scroll (parallax print)
  if (!reduced) {
    gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el) => {
      gsap.to(el, {
        yPercent: Number(el.dataset.drift) || -10,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }
}

// ---------- draggable rail (only while it actually scrolls sideways) ----------
document.querySelectorAll<HTMLElement>('.rail').forEach((rail) => {
  let down = false;
  let startX = 0;
  let startLeft = 0;
  let moved = 0;
  const scrollable = () => getComputedStyle(rail).overflowX !== 'visible';
  const syncLenis = () => rail.toggleAttribute('data-lenis-prevent-wheel', scrollable());
  syncLenis();
  window.addEventListener('resize', syncLenis);

  rail.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || !scrollable()) return;
    down = true;
    moved = 0;
    startX = e.clientX;
    startLeft = rail.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    moved = Math.abs(dx);
    if (moved > 4) rail.classList.add('is-dragging');
    rail.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    rail.classList.remove('is-dragging');
    // swallow the click that ends a drag so it doesn't open the lightbox
    if (moved > 4) rail.addEventListener('click', (e) => e.stopPropagation(), { capture: true, once: true });
  });
  // vertical wheel scrolls the rail sideways only while it still can
  rail.addEventListener(
    'wheel',
    (e) => {
      if (!scrollable() || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = rail.scrollWidth - rail.clientWidth;
      const next = rail.scrollLeft + e.deltaY;
      if (next > 0 && next < max) {
        e.preventDefault();
        e.stopPropagation();
        rail.scrollLeft = next;
      }
    },
    { passive: false },
  );
});

// ---------- lightbox ----------
const lb = document.getElementById('lightbox') as HTMLDialogElement | null;
if (lb) {
  const img = lb.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const cap = lb.querySelector<HTMLElement>('[data-lb-caption]')!;
  const count = lb.querySelector<HTMLElement>('[data-lb-count]')!;
  const book = lb.querySelector<HTMLElement>('[data-lb-book]')!;
  let items: HTMLElement[] = [];
  let index = 0;

  const show = (i: number) => {
    index = (i + items.length) % items.length;
    const el = items[index];
    img.src = el.dataset.src!;
    img.alt = el.querySelector('img')?.alt ?? '';
    cap.textContent = el.dataset.caption ?? '';
    count.textContent = `${index + 1} / ${items.length}`;
    book.classList.toggle('hidden', el.dataset.lightbox !== 'looks');
  };

  document.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-lightbox]');
    if (!trigger) return;
    const group = trigger.dataset.lightbox;
    // only the photos currently visible (respects the style filter)
    items = [...document.querySelectorAll<HTMLElement>(`[data-lightbox="${group}"]`)].filter(
      (el) => el.offsetParent !== null,
    );
    show(items.indexOf(trigger));
    lenis?.stop();
    lb.showModal();
  });
  lb.querySelector('[data-lb-prev]')!.addEventListener('click', () => show(index - 1));
  lb.querySelector('[data-lb-next]')!.addEventListener('click', () => show(index + 1));
  lb.querySelector('[data-lb-close]')!.addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => {
    if (e.target === lb || (e.target as HTMLElement).matches('dialog > div')) lb.close();
  });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  lb.addEventListener('close', () => lenis?.start());
}

// ---------- client-work filters ----------
const lookGrid = document.querySelector<HTMLElement>('[data-look-grid]');
const moreBtn = document.querySelector<HTMLButtonElement>('[data-look-more]');
let showAll = false;
const applyLooks = (filter: string) => {
  lookGrid?.querySelectorAll<HTMLElement>('.look').forEach((card) => {
    const match = filter === 'all' || card.dataset.tags!.split(' ').includes(filter);
    // a specific style shows every match; "all" respects the show-more cap
    const capped = filter === 'all' && !showAll && card.classList.contains('is-extra');
    card.classList.toggle('hidden', !match || capped);
    // cards revealed by a filter develop in place
    if (match && !capped) setTimeout(() => card.classList.add('developed'), 80);
  });
  moreBtn?.classList.toggle('hidden', filter !== 'all' || showAll);
  ScrollTrigger.refresh();
};
document.querySelectorAll<HTMLButtonElement>('[data-look-filters] [data-filter]').forEach((btn, _, all) => {
  btn.addEventListener('click', () => {
    all.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    applyLooks(btn.dataset.filter!);
  });
});
moreBtn?.addEventListener('click', () => {
  showAll = true;
  applyLooks('all');
});

// ---------- map switch: illustrated / Google Maps ----------
document.querySelectorAll<HTMLElement>('[data-map]').forEach((map) => {
  const tabs = [...map.querySelectorAll<HTMLButtonElement>('[data-map-tab]')];
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      const which = tab.dataset.mapTab;
      tabs.forEach((t) => (t === tab ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current')));
      map.querySelectorAll<HTMLElement>('[data-map-panel]').forEach((p) => p.classList.toggle('hidden', p.dataset.mapPanel !== which));
      // the Google map only loads once someone asks for it
      const frame = map.querySelector<HTMLIFrameElement>(`[data-map-panel="${which}"] iframe[data-src]`);
      if (frame && !frame.src) frame.src = frame.dataset.src!;
    }),
  );
});

// ---------- mobile menu ----------
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('mobile-menu');
menuBtn?.addEventListener('click', () => {
  const open = menu!.classList.toggle('hidden') === false;
  menuBtn.setAttribute('aria-expanded', String(open));
});
menu?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    menu.classList.add('hidden');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }),
);

whenReady(() => {
  initScroll();
  ScrollTrigger.refresh();
});
