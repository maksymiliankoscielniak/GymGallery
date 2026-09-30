import { MUSCLE_MAP } from '../../data/muscles'
import { volumeStatus } from '../../lib/volume'
import type { MuscleId, PigmentHue } from '../../types'

/** Trzy warstwy farby dla każdej rodziny barw: laserunek → ciało koloru → głęboka glazura. */
export const PIGMENT_LAYERS: Record<PigmentHue, [string, string, string]> = {
  crimson: ['#d9938a', '#b3261e', '#6e0c10'],
  cobalt: ['#8ea9d2', '#2f5d9a', '#132b52'],
  gold: ['#ecd08a', '#c99a2e', '#7c560f'],
}

export interface PaintState {
  /** 0–3 warstwy farby */
  layers: number
  /** krycie pierwszej warstwy (partie niedotrenowane są wyblakłe) */
  wash: number
  /** 0–1 przyciemnienie (przetrenowanie) */
  darken: number
}

/** Stan „farby” partii wynikający z objętości względem MEV / MAV / MRV. */
export function paintStateFor(muscle: MuscleId, sets: number): PaintState {
  const l = MUSCLE_MAP[muscle].landmarks
  if (sets <= 0) return { layers: 0, wash: 0, darken: 0 }
  const st = volumeStatus(muscle, sets)
  switch (st) {
    case 'under':
      return { layers: 1, wash: 0.25 + 0.45 * (sets / l.mev), darken: 0 }
    case 'effective':
      return { layers: 2, wash: 0.9, darken: 0 }
    case 'optimal':
      return { layers: 3, wash: 1, darken: 0 }
    case 'high':
      return { layers: 3, wash: 1, darken: 0.25 + 0.35 * ((sets - l.mavHigh) / Math.max(1, l.mrv - l.mavHigh)) }
    case 'over':
      return { layers: 3, wash: 1, darken: Math.min(0.92, 0.65 + 0.05 * (sets - l.mrv)) }
  }
}

