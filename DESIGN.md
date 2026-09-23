# Design Brief

## Direction

Field Notes — a calm, credible career-discovery workspace where Vietnamese students work through a Career Trial like a real assignment.

## Tone

Editorial-productivity: refined and quiet, with deep teal carrying all meaning and pale mint holding the space. Confident, never decorative.

## Differentiation

Every task row is a living artifact — a teal check that pops on completion, a mint-tinted completed state, and a mentor chat docked in the corner that turns the trial into a conversation.

## Color Palette

| Token      | OKLCH         | Role                                          |
| ---------- | ------------- | --------------------------------------------- |
| background | 0.975 0.004 170 | page base, layered under a soft mint gradient |
| foreground | 0.235 0.032 240 | dark navy headings and body text              |
| card       | 1 0 0         | white surfaces for tasks, quiz, modals        |
| primary    | 0.5 0.088 174 | deep teal #0F6E5E — CTAs, checks, progress    |
| accent     | 0.63 0.104 172 | lighter teal for hovers, links, active rings  |
| muted      | 0.965 0.005 190 | quiet fills, textarea, disabled states        |
| secondary  | 0.955 0.018 168 | pale mint #E8F5F0 — badges, tags, done rows   |
| success    | 0.55 0.12 158 | completion confirmations                      |
| warning    | 0.74 0.14 78  | pricing "free" emphasis, soft alerts          |
| border     | 0.9 0.008 190 | 1px hairlines on inputs and cards             |

## Typography

- Display: Space Grotesk — headings, task titles, modal headlines, prices
- Body: Figtree — paragraphs, form labels, buttons, Vietnamese diacritics
- Mono: JetBrains Mono — uppercase tracked eyebrows, counters, plan numbers
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, eyebrow `.eyebrow` (12px uppercase tracking-[0.18em]), body `text-base leading-relaxed`

## Elevation & Depth

Three-tier shadow system (`shadow-card` → `shadow-elevated` → `shadow-modal`) with navy-tinted alpha; depth comes from layered white cards over a mint gradient, never from heavy borders.

## Structural Zones

| Zone    | Background            | Border     | Notes                                                    |
| ------- | --------------------- | ---------- | -------------------------------------------------------- |
| Header  | `bg-card`             | `border-b` | Sticky; teal logo tile + navy wordmark + pill login CTA   |
| Content | `bg-gradient-page`    | —          | White cards on gradient; alternating `bg-secondary/40`    |
| Cards   | `bg-card`             | `border`   | rounded-2xl, `shadow-card`, 24–32px padding               |
| Footer  | `bg-muted/60`         | `border-t` | Muted navy text, uppercase tracked links                  |
| Overlay | navy alpha + backdrop-blur | —     | Modals: pricing popup, task note-list, assessment         |

## Spacing & Rhythm

Sections `py-12 md:py-20`; card internals `p-6 md:p-8`; list rows `gap-2.5` with `p-4`; micro-spacing on a 4px base with 12/16/24 tiers.

## Component Patterns

- Buttons: full pill (`rounded-full`), `bg-primary` white text, hover `bg-accent` + lift; secondary = white with border; ghost = transparent teal text
- Cards: `rounded-2xl bg-card border shadow-card`, hover raises to `shadow-elevated`
- Badges: pill, `bg-secondary text-secondary-foreground`, uppercase mono 11px
- Inputs: `rounded-xl border-input bg-card`, focus `ring-2 ring-ring/30 border-primary`
- Radios: full-row option with `border-input`; selected = `border-primary bg-secondary/40` + teal dot
- Checks: circular, hollow `border-border`; done = `bg-primary` white tick with `animate-check-pop`

## Motion

- Entrance: `animate-fade-in-up` on cards and list rows, 40ms stagger
- Hover: `transition-smooth`, shadow lift + 1px translate, 300ms
- Decorative: `animate-check-pop` on tick completion, `animate-progress-fill` on the progress bar, `animate-scale-in` for modals

## Constraints

- All user-facing copy in Vietnamese; font stack must render Vietnamese diacritics cleanly
- Tokens only — no raw hex/rgb in components, no arbitrary color classes
- Teal reserved for action and completion; mint is background context, never a text color
- Light theme is primary; dark theme is a tuned counterpart, not an inversion
- Do not reserve any UI for features listed in doNotBuild

## Signature Detail

The task row that transforms on completion — hollow circle becomes a popping teal check, title goes bold navy, row washes pale mint — making progress feel physical.
