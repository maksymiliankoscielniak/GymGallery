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

/** Domyślny, estetyczny szablon: Upper / Lower / Push / Pull / Legs. */
export function createVTaperSplit(): SplitDay[] {
  return [
    { id: 'd-upper', name: 'Upper', focus: 'Góra — szerokość i gęstość', muscles: ['chest', 'lats', 'shoulders', 'triceps'] },
    { id: 'd-lower', name: 'Lower', focus: 'Dół — fundament kolumn', muscles: ['quads', 'hamstrings', 'abs'] },
    { id: 'd-push', name: 'Push', focus: 'Pchanie — obręcz barkowa', muscles: ['chest', 'shoulders', 'triceps'] },
    { id: 'd-pull', name: 'Pull', focus: 'Ciąganie — skrzydła najszerszego', muscles: ['lats', 'shoulders', 'biceps'] },
    { id: 'd-legs', name: 'Legs', focus: 'Nogi — proporcja i podstawa', muscles: ['quads', 'hamstrings', 'biceps', 'abs'] },
  ]
}

/** Startowa objętość tygodnia (tydzień 1 mezocyklu) — mieści się w MEV–MAV. */
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
 * Startowa paleta: każda partia ma tylko pigment fazy rozciągnięcia.
 * Etap II polega na uzupełnieniu palety o opór szczytowy i zbalansowaniu SFR.
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
