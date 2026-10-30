// The Appointment Book (/book). Draws the next fortnight of open days and the
// free start times from the shop hours in Melbourne time, keeps the ticket in
// step with the form, and sends the request: to the booking backend when
// `bookingEndpoint` is set, otherwise as an email drafted to the shop.
import { gsap } from 'gsap';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Day = { day: number; label: string; open: string | null; close: string | null };
const hours: Day[] = JSON.parse(document.getElementById('shop-hours')?.textContent || '[]');
const config: { endpoint: string; email: string } = JSON.parse(document.getElementById('book-config')?.textContent || '{}');

const form = document.getElementById('book-form') as HTMLFormElement;
const daysEl = document.querySelector<HTMLElement>('[data-days]')!;
const timesEl = document.querySelector<HTMLElement>('[data-times]')!;
const timesEmpty = document.querySelector<HTMLElement>('[data-times-empty]')!;
const errorEl = document.querySelector<HTMLElement>('[data-error]')!;
const sum = (k: string) => document.querySelector<HTMLElement>(`[data-sum="${k}"]`)!;

const DAYS_AHEAD = 14;
const STEP_MIN = 15;
const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fmt = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h < 12 ? 'am' : 'pm'}`;
};

// ---------- "now" in the shop's time zone ----------
const parts = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Melbourne',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
}).formatToParts(new Date());
const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
const nowMin = get('hour') * 60 + get('minute');
// calendar maths in UTC so the browser's own zone never shifts a day
const todayUTC = Date.UTC(get('year'), get('month') - 1, get('day'));

document.querySelectorAll('[data-today]').forEach((el) => {
  el.textContent = new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(todayUTC);
});

// ---------- the day strip ----------
const dayLong = new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const wk = new Intl.DateTimeFormat('en-AU', { weekday: 'short', timeZone: 'UTC' });
const mon = new Intl.DateTimeFormat('en-AU', { month: 'short', timeZone: 'UTC' });

for (let i = 0; i < DAYS_AHEAD; i++) {
  const t = todayUTC + i * 864e5;
  const d = new Date(t);
  const h = hours.find((x) => x.day === d.getUTCDay());
  // today only counts while there's still time to fit a cut in
  const trading = !!(h?.open && h.close);
  const open = trading && (i > 0 || nowMin < toMin(h!.close!) - 30);
  const iso = d.toISOString().slice(0, 10);
  const label = document.createElement('label');
  label.className = 'appt-day';
  label.innerHTML = `
    <input type="radio" name="day" value="${iso}" ${open ? '' : 'disabled'} required />
    <span class="kicker">${i === 0 ? 'Today' : i === 1 ? 'Tmrw' : wk.format(t)}</span>
    <span class="num font-display text-3xl font-bold leading-none">${d.getUTCDate()}</span>
    <span class="kicker">${open ? mon.format(t) : trading ? 'Too late' : 'Closed'}</span>`;
  label.querySelector('input')!.dataset.long = dayLong.format(t);
  label.querySelector('input')!.dataset.offset = String(i);
  daysEl.append(label);
}

// ---------- start times for the chosen day + service ----------
const checked = (name: string) => form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);

function drawTimes() {
  const day = checked('day');
  const service = checked('service');
  const prev = checked('time')?.value;
  timesEl.replaceChildren();
  if (!day || !service) {
    timesEmpty.hidden = false;
    return;
  }
  const h = hours.find((x) => x.day === new Date(day.value + 'T00:00:00Z').getUTCDay());
  if (!h?.open || !h.close) return;
  const length = parseInt(service.dataset.duration || '30', 10);
  const earliest = day.dataset.offset === '0' ? Math.ceil((nowMin + 30) / STEP_MIN) * STEP_MIN : 0;
  let count = 0;
  for (let m = toMin(h.open); m + length <= toMin(h.close); m += STEP_MIN) {
    if (m < earliest) continue;
    const label = document.createElement('label');
    label.className = 'appt-time';
    label.innerHTML = `<input type="radio" name="time" value="${fmt(m)}" required /><span class="num">${fmt(m)}</span>`;
    if (fmt(m) === prev) label.querySelector('input')!.checked = true;
    timesEl.append(label);
    count++;
  }
  timesEmpty.hidden = count > 0;
  if (!count) timesEmpty.textContent = 'No times left that day. Try another.';
  if (!reduced) gsap.from(timesEl.children, { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.012, ease: 'expo.out' });
}

// ---------- the ticket ----------
function setSum(k: string, v: string) {
  const el = sum(k);
  if (el.textContent === v) return;
  el.textContent = v;
  if (!reduced) gsap.fromTo(el, { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'expo.out' });
}
function syncTicket() {
  const s = checked('service');
  setSum('service', s?.value ?? '—');
  setSum('price', s?.dataset.price ?? '—');
  setSum('barber', checked('barber')?.value ?? "Whoever's free");
  setSum('day', checked('day')?.dataset.long ?? '—');
  setSum('time', checked('time')?.value ?? '—');
}

form.addEventListener('change', (e) => {
  const t = e.target as HTMLInputElement;
  // facials are Mim's; pick her if nobody was chosen yet
  if (t.name === 'service' && t.dataset.group?.startsWith('Skin facials') && checked('barber')?.value === "Whoever's free") {
    form.querySelector<HTMLInputElement>('input[name="barber"][value="Mim"]')!.checked = true;
  }
  if (t.name === 'service' || t.name === 'day') drawTimes();
  errorEl.hidden = true;
  syncTicket();
});

// ---------- arriving from a "Book" button with a service or barber in mind ----------
const params = new URLSearchParams(location.search);
for (const name of ['service', 'barber'] as const) {
  const v = params.get(name);
  const input = v && [...form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)].find((i) => i.value === v);
  if (input) {
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
// first open day by default
const firstDay = daysEl.querySelector<HTMLInputElement>('input:not(:disabled)');
if (firstDay) {
  firstDay.checked = true;
  firstDay.dispatchEvent(new Event('change', { bubbles: true }));
}

// ---------- sending ----------
const missing: [string, string][] = [
  ['service', 'Pick a service.'],
  ['day', 'Pick a day.'],
  ['time', 'Pick a time.'],
];

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  for (const [name, msg] of missing) {
    if (!checked(name)) return fail(msg, form.querySelector(`input[name="${name}"]`));
  }
  const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
  const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();
  const notes = (form.elements.namedItem('notes') as HTMLTextAreaElement).value.trim();
  if (!name) return fail('Add your name.', form.elements.namedItem('name') as HTMLElement);
  if (phone.replace(/\D/g, '').length < 8) return fail('Add a mobile number we can text.', form.elements.namedItem('phone') as HTMLElement);

  const request = {
    service: checked('service')!.value,
    barber: checked('barber')!.value,
    date: checked('day')!.value,
    day: checked('day')!.dataset.long!,
    time: checked('time')!.value,
    name,
    phone,
    notes,
  };

  let viaEmail = !config.endpoint;
  if (config.endpoint) {
    try {
      const res = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      viaEmail = true; // never lose a booking: fall back to email
    }
  }
  if (viaEmail) {
    const body = [
      `Service: ${request.service}`,
      `Barber: ${request.barber}`,
      `When: ${request.day}, ${request.time}`,
      `Name: ${request.name}`,
      `Mobile: ${request.phone}`,
      request.notes && `Notes: ${request.notes}`,
    ]
      .filter(Boolean)
      .join('\n');
    location.href = `mailto:${config.email}?subject=${encodeURIComponent(`Booking request: ${request.day}, ${request.time}`)}&body=${encodeURIComponent(body)}`;
  }
  done(request, viaEmail);
});

function fail(msg: string, el?: Element | null) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
  el?.closest('fieldset, label')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  if (el instanceof HTMLElement) el.focus({ preventScroll: true });
}

function done(r: { service: string; day: string; time: string; barber: string }, viaEmail: boolean) {
  const panel = document.querySelector<HTMLElement>('[data-done]')!;
  panel.querySelector('[data-done-line]')!.textContent =
    `${r.service}, ${r.day} at ${r.time}${r.barber === "Whoever's free" ? '' : ` with ${r.barber}`}.`;
  panel.querySelector<HTMLElement>('[data-done-mail]')!.hidden = !viaEmail;
  form.closest('.grid')!.setAttribute('hidden', '');
  panel.hidden = false;
  panel.focus();
  window.scrollTo({ top: panel.offsetTop - 40, behavior: reduced ? 'auto' : 'smooth' });
  if (!reduced) {
    gsap.from(panel, { autoAlpha: 0, y: 40, filter: 'blur(8px)', duration: 1, ease: 'expo.out', clearProps: 'filter' });
    gsap.from(panel.querySelector('.stamp'), { scale: 2.4, rotate: -18, autoAlpha: 0, duration: 0.7, ease: 'expo.out', delay: 0.15 });
  }
}

// ---------- arrival ----------
if (!reduced) {
  gsap.from('[data-in]', {
    autoAlpha: 0,
    y: 36,
    filter: 'blur(8px)',
    duration: 1.2,
    stagger: 0.08,
    ease: 'expo.out',
    clearProps: 'filter',
  });
}
