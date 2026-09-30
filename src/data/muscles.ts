import type { MuscleDef, MuscleId } from '../types'

/**
 * Volume landmarks (working sets per week) for an intermediate lifter — based on the
 * widely used MEV / MAV / MRV ranges (e.g. Renaissance Periodization guidelines).
 * A starting point, not dogma. Names are English; Polish ones live in i18n/messages.pl.ts.
 */
export const MUSCLES: MuscleDef[] = [
  {
    id: 'shoulders',
    name: 'Shoulders',
    short: 'Shoulders',
    latin: 'Deltoideus',
    views: ['front', 'back'],
    hue: 'gold',
    landmarks: { mv: 0, mev: 8, mavLow: 16, mavHigh: 22, mrv: 26 },
    vTaperRole: 'width',
  },
  {
    id: 'chest',
    name: 'Chest',
    short: 'Chest',
    latin: 'Pectoralis major',
    views: ['front'],
    hue: 'crimson',
    landmarks: { mv: 4, mev: 10, mavLow: 12, mavHigh: 20, mrv: 22 },
  },
  {
    id: 'lats',
    name: 'Lats',
    short: 'Lats',
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
    name: 'Abs',
    short: 'Abs',
    latin: 'Rectus abdominis',
    views: ['front'],
    hue: 'gold',
    landmarks: { mv: 0, mev: 4, mavLow: 10, mavHigh: 16, mrv: 20 },
    vTaperRole: 'waist',
  },
  {
    id: 'quads',
    name: 'Quadriceps',
    short: 'Quads',
    latin: 'Quadriceps femoris',
    views: ['front'],
    hue: 'crimson',
    landmarks: { mv: 6, mev: 8, mavLow: 12, mavHigh: 18, mrv: 20 },
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings',
    short: 'Hamstrings',
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

/** Helper: a record with one value per muscle group. */
export function recordOfMuscles<T>(factory: (id: MuscleId) => T): Record<MuscleId, T> {
  return Object.fromEntries(MUSCLE_IDS.map((id) => [id, factory(id)])) as Record<MuscleId, T>
}
