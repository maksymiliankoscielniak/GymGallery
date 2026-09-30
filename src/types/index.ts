/* ------------------------------------------------------------------
 *  Gym Gallery — domain types
 * ------------------------------------------------------------------ */

/** Muscle groups modelled by the engine. */
export type MuscleId =
  | 'shoulders'
  | 'chest'
  | 'lats'
  | 'triceps'
  | 'biceps'
  | 'abs'
  | 'quads'
  | 'hamstrings'

/** The three stages of the creative process. */
export type StageId = 'sketch' | 'oil' | 'marble'

/** Kind of animated transition between stages. */
export type TransitionKind = 'paint' | 'chisel'

/** Resistance-curve profile of an exercise (a “pigment”). */
export type ResistanceProfile = 'stretch' | 'peak'

/** Colour family in which a muscle group is painted on the canvas. */
export type PigmentHue = 'crimson' | 'cobalt' | 'gold'

export type BodyView = 'front' | 'back'

/** Volume landmarks (working sets / week). */
export interface VolumeLandmarks {
  /** MV — maintenance volume */
  mv: number
  /** MEV — minimum effective volume */
  mev: number
  /** Lower bound of MAV — maximum adaptive volume */
  mavLow: number
  /** Upper bound of MAV */
  mavHigh: number
  /** MRV — maximum recoverable volume */
  mrv: number
}

export type VolumeStatus = 'under' | 'effective' | 'optimal' | 'high' | 'over'

export interface MuscleDef {
  id: MuscleId
  name: string
  short: string
  latin: string
  views: BodyView[]
  hue: PigmentHue
  landmarks: VolumeLandmarks
  /** Role in the V-taper aesthetic: widening the shoulder girdle, or the waist. */
  vTaperRole?: 'width' | 'waist'
}

export interface LiftBaseline {
  /** Working weight in kg */
  weight: number
  /** Repetitions per set */
  reps: number
}

export interface ExerciseDef {
  id: string
  name: string
  muscle: MuscleId
  profile: ResistanceProfile
  /** Pure hypertrophic stimulus, 1–10 */
  stimulus: number
  /** Joint / connective-tissue cost, 0–10 */
  jointFatigue: number
  /** Axial cost (spine, nervous system), 0–10 */
  axialFatigue: number
  compound: boolean
  baseline: LiftBaseline
  note?: string
}

export interface SplitDay {
  id: string
  name: string
  /** Session theme; `null` means "use the localized default for this day". */
  focus: string | null
  muscles: MuscleId[]
}

/** A pigment applied to a muscle group — an exercise with a “layer thickness” (its share of the volume). */
export interface PigmentStroke {
  exerciseId: string
  /** 1–3: relative share of the muscle group's weekly volume */
  layers: number
}

export type VolumePlan = Record<MuscleId, number>
export type PigmentPlan = Record<MuscleId, PigmentStroke[]>

export interface Measurements {
  /** Shoulder-girdle circumference (cm) */
  shoulders: number
  /** Waist circumference (cm) */
  waist: number
}

export interface MesocycleSettings {
  /** Liczba tygodni akumulacji */
  weeks: number
  /** Extra sets per muscle group in every following week */
  rampSets: number
}

export interface DeloadRecord {
  carvedAt: string
}

export interface GalleryState {
  version: 1
  stage: StageId
  introSeen: boolean
  split: SplitDay[]
  volume: VolumePlan
  pigments: PigmentPlan
  lifts: Record<string, LiftBaseline>
  measurements: Measurements
  meso: MesocycleSettings
  deload: DeloadRecord | null
}

/* ---------- computed results ---------- */

export interface ScheduledExercise {
  exerciseId: string
  muscle: MuscleId
  sets: number
}

export interface DayPlan {
  day: SplitDay
  items: ScheduledExercise[]
  totalSets: number
}

export interface MesoWeek {
  /** 1…n; the deload week carries the `deload` flag */
  index: number
  label: string
  deload: boolean
  volume: VolumePlan
  /** Muscle groups that exceed MRV this week */
  overMrv: MuscleId[]
  tonnage: number
  /** Central fatigue relative to the systemic MRV (1 = 100%) */
  centralFatigue: number
  e1rm: Record<string, number>
}
