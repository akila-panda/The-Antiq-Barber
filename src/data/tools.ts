// Engraved barber-tool illustrations (viewBox 0 0 100 100), used by the
// preloader and the floating parallax ornaments. Drawn with currentColor
// strokes; the brass accents use --tool-accent.

export const tools = {
  scissors: `
    <circle cx="28" cy="76" r="11" fill="none" stroke="currentColor" stroke-width="3"/>
    <circle cx="52" cy="82" r="11" fill="none" stroke="currentColor" stroke-width="3"/>
    <path d="M36 68 L84 14 L72 48 Z" fill="var(--tool-accent)" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M58 73 L88 24 L62 54 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="60" cy="52" r="2.6" fill="currentColor"/>`,
  razor: `
    <path d="M6 66 C18 58 42 55 60 58 C63 62 61 67 57 68 C40 67 22 71 9 74 C4 73 3 68 6 66 Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M57 57 L91 33 C96 30 100 36 96 40 L63 67 Z" fill="var(--tool-accent)" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M64 56 L92 37" stroke="currentColor" stroke-width="1.3" opacity=".55"/>
    <circle cx="59" cy="62" r="2.6" fill="currentColor"/>`,
  comb: `
    <rect x="10" y="28" width="80" height="16" rx="3" fill="var(--tool-accent)" stroke="currentColor" stroke-width="2.6"/>
    <path d="M16 44v24M23 44v24M30 44v24M37 44v24M44 44v24M51 44v24M58 44v18M65 44v18M72 44v18M79 44v18M85 44v18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  brush: `
    <path d="M37 13 C25 22 27 46 38 58 H62 C73 46 75 22 63 13 C56 8 44 8 37 13 Z" fill="var(--tool-accent)" stroke="currentColor" stroke-width="2.6"/>
    <path d="M42 22 C40 32 41 44 45 54M50 18 V54M58 22 C60 32 59 44 55 54" stroke="currentColor" stroke-width="1.4" opacity=".55" fill="none"/>
    <rect x="35" y="58" width="30" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2.6"/>
    <path d="M38 66 H62 L59 90 Q50 94 41 90 Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>`,
  tin: `
    <ellipse cx="50" cy="38" rx="34" ry="11" fill="var(--tool-accent)" stroke="currentColor" stroke-width="2.6"/>
    <path d="M16 38 V62 A34 11 0 0 0 84 62 V38" fill="none" stroke="currentColor" stroke-width="2.6"/>
    <path d="M16 48 A34 11 0 0 0 84 48" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".6"/>
    <path d="M38 36 Q50 30 62 36" fill="none" stroke="currentColor" stroke-width="2"/>`,
  moustache: `
    <path d="M50 50 C45 38 31 37 23 47 C17 55 9 54 6 47 C7 61 23 66 36 59 C42 56 47 54 50 55 C53 54 58 56 64 59 C77 66 93 61 94 47 C91 54 83 55 77 47 C69 37 55 38 50 50 Z" fill="var(--tool-accent)" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`,
};

export type ToolName = keyof typeof tools;
