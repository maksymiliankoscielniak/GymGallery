import type {
  GalleryState,
  LiftBaseline,
  Measurements,
  MesocycleSettings,
  PigmentPlan,
  SplitDay,
  VolumePlan,
} from '../types'
import { EXERCISES } from './exercises'

export const TEMPLATE_NAME = '5-Day V-Taper Split'

/** Default aesthetic template: Upper / Lower / Push / Pull / Legs. Focus text is localized at display time (focus: null). */
export function createVTaperSplit(): SplitDay[] {
  return [
    { id: 'd-upper', name: 'Upper', focus: null, muscles: ['chest', 'lats', 'shoulders', 'triceps'] },
    { id: 'd-lower', name: 'Lower', focus: null, muscles: ['quads', 'hamstrings', 'abs'] },
    { id: 'd-push', name: 'Push', focus: null, muscles: ['chest', 'shoulders', 'triceps'] },
    { id: 'd-pull', name: 'Pull', focus: null, muscles: ['lats', 'shoulders', 'biceps'] },
    { id: 'd-legs', name: 'Legs', focus: null, muscles: ['quads', 'hamstrings', 'biceps', 'abs'] },
  ]
}

/** Starting weekly volume (mesocycle week 1) — sits within MEV–MAV. */
export function createDefaultVolume(): VolumePlan {
  return {
    shoulders: 18,
    chest: 12,
    lats: 16,
    triceps: 10,
    biceps: 10,
    abs: 8,
    quads: 12,
    hamstrings: 10,
  }
}

/**
 * Starting palette: every muscle group has only a stretch-phase pigment.
 * Stage II is about completing the palette with peak resistance and balancing SFR.
 */
export function createDefaultPigments(): PigmentPlan {
  return {
    shoulders: [{ exerciseId: 'sh-cable-behind', layers: 2 }],
    chest: [{ exerciseId: 'ch-incline-db', layers: 2 }],
    lats: [{ exerciseId: 'la-pulldown', layers: 2 }],
    triceps: [{ exerciseId: 'tr-overhead-cable', layers: 2 }],
    biceps: [{ exerciseId: 'bi-incline', layers: 2 }],
    abs: [{ exerciseId: 'ab-cable-crunch', layers: 2 }],
    quads: [{ exerciseId: 'qu-hack', layers: 2 }],
    hamstrings: [{ exerciseId: 'ha-rdl', layers: 2 }],
  }
}

export function createDefaultLifts(): Record<string, LiftBaseline> {
  return Object.fromEntries(EXERCISES.map((e) => [e.id, { ...e.baseline }]))
}

export function createDefaultMeasurements(): Measurements {
  return { shoulders: 118, waist: 82 }
}

export function createDefaultMeso(): MesocycleSettings {
  return { weeks: 6, rampSets: 2 }
}

export function createDefaultState(): GalleryState {
  return {
    version: 1,
    stage: 'sketch',
    introSeen: false,
    split: createVTaperSplit(),
    volume: createDefaultVolume(),
    pigments: createDefaultPigments(),
    lifts: createDefaultLifts(),
    measurements: createDefaultMeasurements(),
    meso: createDefaultMeso(),
    deload: null,
  }
}
