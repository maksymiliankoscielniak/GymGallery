/* ------------------------------------------------------------------
 *  Gym Gallery — typy domenowe
 * ------------------------------------------------------------------ */

/** Partie mięśniowe modelowane w silniku. */
export type MuscleId =
  | 'shoulders'
  | 'chest'
  | 'lats'
  | 'triceps'
  | 'biceps'
  | 'abs'
  | 'quads'
  | 'hamstrings'

/** Trzy etapy procesu twórczego. */
export type StageId = 'sketch' | 'oil' | 'marble'

/** Rodzaj animowanego przejścia pomiędzy etapami. */
export type TransitionKind = 'paint' | 'chisel'

/** Profil krzywej oporu ćwiczenia („pigment”). */
export type ResistanceProfile = 'stretch' | 'peak'

/** Rodzina barw, którą partia maluje się na płótnie. */
export type PigmentHue = 'crimson' | 'cobalt' | 'gold'

export type BodyView = 'front' | 'back'

/** Punkty orientacyjne objętości (serie robocze / tydzień). */
export interface VolumeLandmarks {
  /** MV — objętość podtrzymująca */
  mv: number
  /** MEV — minimalna objętość efektywna */
  mev: number
  /** Dolna granica MAV — maksymalnej objętości adaptacyjnej */
  mavLow: number
  /** Górna granica MAV */
  mavHigh: number
  /** MRV — maksymalna objętość regeneracyjna */
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
  /** Rola w estetyce V-taper: poszerzanie obręczy barkowej lub talia. */
  vTaperRole?: 'width' | 'waist'
}

export interface LiftBaseline {
  /** Ciężar roboczy w kg */
  weight: number
  /** Powtórzenia w serii */
  reps: number
}

export interface ExerciseDef {
  id: string
  name: string
  muscle: MuscleId
  profile: ResistanceProfile
  /** Czysty bodziec hipertroficzny, 1–10 */
  stimulus: number
  /** Koszt stawowy / tkanek łącznych, 0–10 */
  jointFatigue: number
  /** Koszt osiowy (kręgosłup, układ nerwowy), 0–10 */
  axialFatigue: number
  compound: boolean
  baseline: LiftBaseline
  note?: string
}

export interface SplitDay {
  id: string
  name: string
  focus: string
  muscles: MuscleId[]
}

/** Pigment nałożony na partię — ćwiczenie z „grubością warstwy” (udziałem w objętości). */
export interface PigmentStroke {
  exerciseId: string
  /** 1–3: względny udział w tygodniowej objętości partii */
  layers: number
}

export type VolumePlan = Record<MuscleId, number>
export type PigmentPlan = Record<MuscleId, PigmentStroke[]>

export interface Measurements {
  /** Obwód obręczy barkowej (cm) */
  shoulders: number
  /** Obwód talii (cm) */
  waist: number
}

export interface MesocycleSettings {
  /** Liczba tygodni akumulacji */
  weeks: number
  /** Dodatkowe serie na partię w każdym kolejnym tygodniu */
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

/* ---------- wyniki obliczeń ---------- */

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
  /** 1…n; tydzień deloadu ma flagę `deload` */
  index: number
  label: string
  deload: boolean
  volume: VolumePlan
  /** Partie, które w tym tygodniu przekraczają MRV */
  overMrv: MuscleId[]
  tonnage: number
  /** Zmęczenie centralne względem systemowego MRV (1 = 100%) */
  centralFatigue: number
  e1rm: Record<string, number>
}
