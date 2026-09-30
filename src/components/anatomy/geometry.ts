import type { BodyView, MuscleId } from '../../types'

/* ------------------------------------------------------------------
 *  Geometria sylwetki — płyta anatomiczna w stylu szkiców Leonarda.
 *  Rysujemy prawą połowę ciała (x ≥ 0); lewa powstaje przez odbicie lustrzane.
 *  Układ lokalny: x ∈ [-80, 80], y ∈ [0, 472].
 * ------------------------------------------------------------------ */

export const FIGURE_BOX = { x: -80, y: 0, w: 160, h: 472 }

/** Odbija ścieżkę SVG (tylko komendy absolutne M L C Q Z) względem osi x = 0. */
export function mirrorPath(d: string): string {
  const tokens = d.match(/[MLCQZ]|-?\d*\.?\d+/gi) ?? []
  const out: string[] = []
  let argIndex = 0
  for (const t of tokens) {
    if (/^[MLCQZ]$/i.test(t)) {
      out.push(t)
      argIndex = 0
    } else {
      const v = parseFloat(t)
      out.push(String(argIndex % 2 === 0 ? -v : v))
      argIndex++
    }
  }
  return out.join(' ')
}

/** Pełna ścieżka: prawa połowa + lustrzane odbicie. */
export const both = (d: string) => `${d} ${mirrorPath(d)}`

/** Kontur prawej połowy ciała (otwarty — do rysowania kreską). */
export const OUTLINE_HALF =
  'M 0 8 C 12 8 19 18 19 32 C 19 44 15 54 9 59 L 11 74 Q 28 78 44 84 C 58 84 68 94 68 110 ' +
  'C 68 122 66 130 64 136 C 67 152 69 170 66 190 C 71 206 72 232 68 258 ' +
  'C 72 272 70 288 63 296 C 59 298 56 292 57 282 L 56 258 ' +
  'C 54 236 51 214 50 194 C 48 172 46 154 43 140 ' +
  'C 40 170 34 200 33 222 C 33 236 38 250 44 262 ' +
  'C 48 285 48 320 42 352 L 38 364 C 42 380 42 400 36 420 C 33 432 30 442 28 452 ' +
  'C 32 460 30 466 22 466 L 14 466 C 12 462 13 456 15 452 ' +
  'C 14 430 12 405 15 384 C 16 374 14 368 13 362 C 10 340 8 320 4 300 L 0 298'

/** Zamknięta sylwetka (do wypełnień). */
export const SILHOUETTE = both(`${OUTLINE_HALF} Z`)

export interface MuscleShape {
  muscle: MuscleId
  view: BodyView
  /** Ścieżka prawej połowy */
  d: string
  /** Punkt kotwiczenia etykiety (prawa połowa) */
  anchor: [number, number]
  /** Odcinek, wzdłuż którego biegnie pęknięcie marmuru */
  crack: [number, number, number, number]
}

const DELTOID =
  'M 36 86 C 50 83 63 89 66 102 C 68 116 66 128 62 137 C 56 129 50 118 46 109 C 42 101 39 93 36 86 Z'

const ABS =
  'M 2 152 C 8 150 13 150 15 152 L 15 174 C 11 176 6 176 2 175 Z ' +
  'M 2 179 L 15 178 L 15 200 C 11 202 6 202 2 201 Z ' +
  'M 2 205 L 15 204 L 15 226 C 11 228 6 228 2 227 Z ' +
  'M 2 231 L 15 230 C 15 248 11 262 3 276 L 2 276 Z ' +
  'M 19 154 C 27 154 34 162 36 178 C 36 196 34 212 33 226 C 29 238 24 246 19 252 C 18 232 18 200 18 174 Z'

export const MUSCLE_SHAPES: MuscleShape[] = [
  /* ----- przód ----- */
  { muscle: 'shoulders', view: 'front', d: DELTOID, anchor: [58, 104], crack: [44, 92, 62, 128] },
  {
    muscle: 'chest',
    view: 'front',
    d: 'M 3 94 C 14 89 27 87 37 89 C 42 97 45 106 46 116 C 43 129 35 141 24 145 C 14 147 6 145 3 141 Z',
    anchor: [24, 116],
    crack: [8, 98, 38, 138],
  },
  {
    muscle: 'biceps',
    view: 'front',
    d: 'M 50 142 C 57 138 64 144 65 156 C 66 170 64 182 59 188 C 54 186 50 178 49 166 C 48 156 48 148 50 142 Z',
    anchor: [57, 164],
    crack: [54, 144, 60, 184],
  },
  { muscle: 'abs', view: 'front', d: ABS, anchor: [9, 200], crack: [6, 156, 12, 262] },
  {
    muscle: 'quads',
    view: 'front',
    d: 'M 40 268 C 46 290 46 322 40 348 C 35 360 25 363 18 357 C 14 344 11 326 9 306 C 13 290 25 278 40 268 Z',
    anchor: [28, 312],
    crack: [36, 276, 20, 352],
  },
  /* ----- tył ----- */
  { muscle: 'shoulders', view: 'back', d: DELTOID, anchor: [58, 104], crack: [44, 92, 62, 128] },
  {
    muscle: 'lats',
    view: 'back',
    d: 'M 22 120 C 33 116 42 124 44 140 C 41 164 36 192 33 214 C 26 226 14 234 3 240 C 3 222 5 198 8 180 C 12 158 17 138 22 120 Z',
    anchor: [26, 176],
    crack: [38, 128, 10, 232],
  },
  {
    muscle: 'triceps',
    view: 'back',
    d: 'M 48 140 C 56 135 65 141 66 155 C 67 169 65 181 60 188 C 55 187 50 179 49 167 C 48 157 47 147 48 140 Z',
    anchor: [57, 162],
    crack: [52, 142, 62, 184],
  },
  {
    muscle: 'hamstrings',
    view: 'back',
    d: 'M 10 310 C 20 306 34 306 44 300 C 46 318 44 338 38 352 C 32 358 23 358 17 354 C 14 340 12 326 10 310 Z',
    anchor: [28, 330],
    crack: [40, 306, 18, 352],
  },
]

export function shapesFor(view: BodyView): MuscleShape[] {
  return MUSCLE_SHAPES.filter((s) => s.view === view)
}

/** Detale anatomiczne (nieklikalne) — linie kreski, rysowane obustronnie. */
export const DETAIL_LINES: Record<BodyView, string[]> = {
  front: [
    // obojczyk
    'M 4 84 C 16 80 28 82 38 86',
    // zębaty przedni
    'M 36 146 L 41 150 M 35 156 L 40 160 M 34 166 L 38 170',
    // pas Adonisa
    'M 22 246 C 18 262 12 276 6 290',
    // mięsień prosty uda / przyśrodkowy
    'M 27 282 C 30 305 30 330 27 352',
    'M 14 330 C 22 336 24 350 19 357',
    // rzepka
    'M 21 362 C 21 356 31 356 31 362 C 31 370 21 372 21 362',
    // piszczel / łydka
    'M 31 380 C 34 400 32 424 26 446',
    // przedramię
    'M 55 200 C 60 218 62 236 61 254',
  ],
  back: [
    // czworoboczny
    'M 2 64 C 8 68 22 76 40 86 C 34 94 24 104 16 118 C 10 130 5 142 2 152',
    // łopatka
    'M 12 100 C 22 98 30 104 32 116 C 28 124 20 128 12 126',
    // prostowniki grzbietu
    'M 5 236 C 7 250 8 262 6 280',
    // pośladki
    'M 3 262 C 14 256 34 258 44 270 C 48 284 44 298 30 304 C 20 306 10 304 3 300',
    // łydka
    'M 16 374 C 24 366 36 370 40 388 C 41 402 35 414 28 420 C 22 414 16 402 15 388',
    'M 27 372 L 27 410',
    // przedramię
    'M 56 200 C 62 218 64 236 62 254',
  ],
}

/** Linia kręgosłupa i mostka (rysowana raz, bez odbicia). */
export const CENTER_LINES: Record<BodyView, string> = {
  front: 'M 0 90 L 0 148',
  back: 'M 0 76 L 0 292',
}

/** Rysy twarzy (przód) / linia włosów (tył) — bez odbicia. */
export const FACE: Record<BodyView, string> = {
  front: 'M -10 29 Q -6 26 -2 29 M 10 29 Q 6 26 2 29 M 0 33 L -2 43 L 1 44 M -4 50 Q 0 52 4 50',
  back: 'M -15 22 C -8 13 8 13 15 22 M -12 30 C -6 26 6 26 12 30',
}

/** Kolejność rysowania w animacji ołówka. */
export const DRAW_ORDER: MuscleId[] = ['shoulders', 'chest', 'lats', 'biceps', 'triceps', 'abs', 'quads', 'hamstrings']
