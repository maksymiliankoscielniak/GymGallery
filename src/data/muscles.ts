import type { MuscleDef, MuscleId } from '../types'

/**
 * Punkty orientacyjne objętości (serie robocze tygodniowo) dla średniozaawansowanego
 * trenującego — oparte na powszechnie stosowanych widełkach MEV / MAV / MRV
 * (m.in. wytyczne Renaissance Periodization). To punkt wyjścia, nie dogmat.
 */
export const MUSCLES: MuscleDef[] = [
  {
    id: 'shoulders',
    name: 'Barki',
    short: 'Barki',
    latin: 'Deltoideus',
    views: ['front', 'back'],
    hue: 'gold',
    landmarks: { mv: 0, mev: 8, mavLow: 16, mavHigh: 22, mrv: 26 },
    vTaperRole: 'width',
  },
  {
    id: 'chest',
    name: 'Klatka piersiowa',
    short: 'Klatka',
    latin: 'Pectoralis major',
    views: ['front'],
    hue: 'crimson',
    landmarks: { mv: 4, mev: 10, mavLow: 12, mavHigh: 20, mrv: 22 },
  },
  {
    id: 'lats',
    name: 'Najszerszy grzbietu',
    short: 'Najszerszy',
    latin: 'Latissimus dorsi',
    views: ['back'],
    hue: 'cobalt',
    landmarks: { mv: 6, mev: 10, mavLow: 14, mavHigh: 22, mrv: 25 },
    vTaperRole: 'width',
  },
  {
    id: 'triceps',
    name: 'Triceps',
    short: 'Triceps',
    latin: 'Triceps brachii',
    views: ['back'],
    hue: 'crimson',
    landmarks: { mv: 4, mev: 6, mavLow: 10, mavHigh: 14, mrv: 18 },
  },
  {
    id: 'biceps',
    name: 'Biceps',
    short: 'Biceps',
    latin: 'Biceps brachii',
    views: ['front'],
    hue: 'cobalt',
    landmarks: { mv: 5, mev: 8, mavLow: 14, mavHigh: 20, mrv: 26 },
  },
  {
    id: 'abs',
    name: 'Brzuch',
    short: 'Brzuch',
    latin: 'Rectus abdominis',
    views: ['front'],
    hue: 'gold',
    landmarks: { mv: 0, mev: 4, mavLow: 10, mavHigh: 16, mrv: 20 },
    vTaperRole: 'waist',
  },
  {
    id: 'quads',
    name: 'Czworogłowe uda',
    short: 'Czworogłowe',
    latin: 'Quadriceps femoris',
    views: ['front'],
    hue: 'crimson',
    landmarks: { mv: 6, mev: 8, mavLow: 12, mavHigh: 18, mrv: 20 },
  },
  {
    id: 'hamstrings',
    name: 'Tył uda',
    short: 'Tył uda',
    latin: 'Biceps femoris',
    views: ['back'],
    hue: 'cobalt',
    landmarks: { mv: 4, mev: 6, mavLow: 10, mavHigh: 16, mrv: 20 },
  },
]

export const MUSCLE_IDS: MuscleId[] = MUSCLES.map((m) => m.id)

export const MUSCLE_MAP: Record<MuscleId, MuscleDef> = Object.fromEntries(
  MUSCLES.map((m) => [m.id, m]),
) as Record<MuscleId, MuscleDef>

/** Pomocnik: rekord z wartością dla każdej partii. */
export function recordOfMuscles<T>(factory: (id: MuscleId) => T): Record<MuscleId, T> {
  return Object.fromEntries(MUSCLE_IDS.map((id) => [id, factory(id)])) as Record<MuscleId, T>
}
