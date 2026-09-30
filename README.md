# Gym Gallery

> An art-inspired hypertrophy planner: sketch your split on parchment, paint your exercise selection in oil, then carve the final physique in marble. React + TypeScript, no backend, all data stays in your browser.

**The Artistic Engine for Physique Architecture and Hypertrophy** — a training-mesocycle planner told as a creative
process: parchment sketch → oil canvas → marble sculpture.

A backend-free SPA: all state (split, volume, pigments, lifts, measurements, deload) is saved to the browser's
`localStorage` under the key `gym-gallery/state/v1`.

The interface is available in **English** (default) and **Polish**. Switch with the EN | PL toggle in the header (also on
the intro screen); the choice is remembered in `localStorage` under `gym-gallery/lang`.

## Getting started

```bash
npm install
npm run dev        # development server
npm run build      # typecheck (tsc -b) + production build to dist/
npm run preview    # preview the build
npm run lint       # oxlint
```

Requires Node.js 20.19+ or 22.12+ (Vite 8).

## Deploying to GitHub Pages

`vite.config.ts` sets `base: './'`, so the build works under any URL
(`https://<user>.github.io/<repository>/`) without configuration changes.

1. Push the repository to GitHub (branch `main`).
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The `.github/workflows/deploy.yml` workflow builds and publishes the app on every push to `main`.

## The three stages

| Stage | What you do | Mechanics |
| --- | --- | --- |
| **I. Sketch** (parchment, pencil, sanguine) | Design the skeleton of the mesocycle | *5-Day V-Taper Split* template (Upper / Lower / Push / Pull / Legs) with editable days and muscle groups; clickable anatomical plate (front + back); live MEV / MAV / MRV indicators. Once every muscle sits within MEV–MAV, a seal appears. |
| **II. Oil Canvas** | Choose exercises by resistance profile | Pigment palette: stretched-position vs. peak-contraction resistance (each muscle needs both); saturation map — muscles below MEV stay faded, those above MAV/MRV darken; SFR (stimulus-to-fatigue) indicator, axial and joint fatigue budgets; the week composed into sessions. |
| **III. Marble Sculpture** | Assess proportions, progression and fatigue | V-taper indicator (shoulders : waist vs. φ 1.618) with projection; e1RM (Brzycki formula) and tonnage week by week; load matrix against MRV; the marble cracks when MRV or central capacity is exceeded; **Carve Deload** cuts 40% of volume and generates a ready-made recovery-week plan (copy / print). |

Transitions between stages: cubist paint splashes (Canvas 2D) and a chisel shattering a marble block (Canvas 2D).
With the system's "reduce motion" setting enabled, animations are shortened.

## Structure

```
src/
  types/                 domain types (MuscleId, GalleryState, MesoWeek…)
  data/                  muscles and MEV/MAV/MRV landmarks, exercise library, V-Taper template
  lib/                   pure logic (no React):
    volume.ts            volume status, distribution of sets across days, sketch analysis
    sfr.ts               SFR, fatigue budgets, splitting sets across exercises, auto-composition
    schedule.ts          laying out the week into sessions and exercises
    progression.ts       Brzycki, volume ramp, MRV detection, deload −40%
    vtaper.ts            shoulder:waist ratio and projection
  state/                 reducer, localStorage validation, context with derived analyses
  i18n/                  EN/PL dictionaries (messages.en.ts is the source of keys), language provider and hook
  components/
    anatomy/             body geometry + variants: sketch, oil, marble
    transitions/         pencil intro, paint transition, chisel transition
    charts/              lightweight SVG charts with tooltips
    common/              seal, "provenance" navigation, language switch, steppers, landmark bars
  stages/                sketch/ · oil/ · marble/
```

## Adding or changing translations

- Every UI string is a key in `src/i18n/messages.en.ts`; `src/i18n/messages.pl.ts` must define the same keys (TypeScript
  enforces this). Placeholders use `{name}` syntax, e.g. `t('issue.under', { name, sets, mev })`.
- Muscle-group and exercise names are English in `src/data`; their Polish names live in `messages.pl.ts`
  (`plMuscles`, `plExercises`).
- To add a language: extend `Lang` and `LANGS` in `src/i18n/createI18n.ts`, add a dictionary with the same keys and
  register it in `createI18n`.

## Model assumptions

The MEV / MAV / MRV ranges, exercise stimulus and fatigue ratings, fatigue budgets and the V-taper projection are
rough heuristics for an intermediate lifter — a starting point for your own observations, not medical advice. All
constants live in `src/data` and at the top of the files in `src/lib`, so they are easy to tune.

Fonts (Caveat, EB Garamond, Playfair Display, Cormorant Garamond, Cinzel, Space Mono) are self-hosted through
`@fontsource` packages — the app makes no requests to Google Fonts.
