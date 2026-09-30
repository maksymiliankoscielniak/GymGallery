import { EXERCISE_MAP } from '../data/exercises'
import { MUSCLE_IDS, MUSCLE_MAP, recordOfMuscles } from '../data/muscles'
import type { GalleryState, MesoWeek, MuscleId, VolumePlan } from '../types'
import { exerciseSets, fatigueCost } from './sfr'

/** Wzór Brzyckiego: e1RM = ciężar × 36 / (37 − powtórzenia) */
export function brzycki(weight: number, reps: number): number {
  const r = Math.max(1, Math.min(30, reps))
  return (weight * 36) / (37 - r)
}

/** Tygodniowy przyrost ciężaru roboczego przy stałych powtórzeniach (spadające RIR). */
export const LOAD_PROGRESSION = { compound: 0.025, isolation: 0.015 }
/** Deload: odcięcie 40% objętości. */
export const DELOAD_CUT = 0.4
/** Zdolność regeneracji centralnej jako ułamek sumy lokalnych MRV. */
export const CENTRAL_CAPACITY = 0.9

export function rampVolume(base: VolumePlan, rampSets: number, week: number): VolumePlan {
  return recordOfMuscles((m) => base[m] + (base[m] > 0 ? rampSets * (week - 1) : 0))
}

export function deloadVolume(peak: VolumePlan): VolumePlan {
  return recordOfMuscles((m) => (peak[m] > 0 ? Math.max(1, Math.round(peak[m] * (1 - DELOAD_CUT))) : 0))
}

export function loadForWeek(exerciseId: string, baseWeight: number, week: number): number {
  const ex = EXERCISE_MAP[exerciseId]
  const rate = ex?.compound ? LOAD_PROGRESSION.compound : LOAD_PROGRESSION.isolation
  return baseWeight * Math.pow(1 + rate, week - 1)
}

/** Wybiera do 4 kluczowych bojów (po jednym dla partii budujących sylwetkę). */
export function pickKeyLifts(state: Pick<GalleryState, 'pigments'>): string[] {
  const order: MuscleId[] = ['chest', 'lats', 'quads', 'hamstrings', 'shoulders']
  const out: string[] = []
  for (const m of order) {
    const strokes = state.pigments[m].filter((s) => EXERCISE_MAP[s.exerciseId])
    if (strokes.length === 0) continue
    const sorted = [...strokes].sort((a, b) => {
      const ea = EXERCISE_MAP[a.exerciseId]
      const eb = EXERCISE_MAP[b.exerciseId]
      return Number(eb.compound) - Number(ea.compound) || b.layers - a.layers
    })
    out.push(sorted[0].exerciseId)
    if (out.length === 4) break
  }
  return out
}

function systemicCapacity(avgCost: Record<MuscleId, number>): number {
  return CENTRAL_CAPACITY * MUSCLE_IDS.reduce((a, m) => a + MUSCLE_MAP[m].landmarks.mrv * avgCost[m], 0)
}

export interface Mesocycle {
  weeks: MesoWeek[]
  /** Pierwszy tydzień, w którym plan (bez deloadu) przekracza MRV lub zdolność centralną */
  breachWeek: number | null
  /** Partie pękające w planie bez deloadu */
  crackedMuscles: MuscleId[]
  /** Czy pęka zmęczenie centralne */
  centralCrack: boolean
  /** Numer tygodnia deloadu (gdy wykuty) */
  deloadWeek: number | null
  keyLifts: string[]
  peakVolume: VolumePlan
}

function computeWeek(
  state: GalleryState,
  index: number,
  volume: VolumePlan,
  loadWeek: number,
  deload: boolean,
  keyLifts: string[],
  capacity: number,
): MesoWeek {
  const sets = exerciseSets(volume, state.pigments)
  let tonnage = 0
  let fatigue = 0
  for (const m of MUSCLE_IDS) {
    for (const { exerciseId, sets: n } of sets[m]) {
      const lift = state.lifts[exerciseId] ?? EXERCISE_MAP[exerciseId].baseline
      tonnage += n * lift.reps * loadForWeek(exerciseId, lift.weight, loadWeek)
      fatigue += n * fatigueCost(EXERCISE_MAP[exerciseId])
    }
  }
  const e1rm: Record<string, number> = {}
  for (const id of keyLifts) {
    const lift = state.lifts[id] ?? EXERCISE_MAP[id].baseline
    e1rm[id] = brzycki(loadForWeek(id, lift.weight, loadWeek), lift.reps)
  }
  const overMrv = MUSCLE_IDS.filter((m) => volume[m] > MUSCLE_MAP[m].landmarks.mrv)
  return {
    index,
    label: deload ? 'D' : `T${index}`,
    deload,
    volume,
    overMrv: deload ? [] : overMrv,
    tonnage,
    centralFatigue: capacity > 0 ? fatigue / capacity : 0,
    e1rm,
  }
}

export function buildMesocycle(state: GalleryState): Mesocycle {
  const keyLifts = pickKeyLifts(state)
  const avgCost = recordOfMuscles((m) => {
    const strokes = state.pigments[m].filter((s) => EXERCISE_MAP[s.exerciseId])
    const w = strokes.reduce((a, s) => a + s.layers, 0)
    return w > 0 ? strokes.reduce((a, s) => a + s.layers * fatigueCost(EXERCISE_MAP[s.exerciseId]), 0) / w : 3.5
  })
  const capacity = systemicCapacity(avgCost)
  const n = Math.max(1, state.meso.weeks)

  // Plan „surowy” — bez deloadu — służy wykrywaniu pęknięć.
  const raw: MesoWeek[] = []
  for (let w = 1; w <= n; w++) {
    raw.push(computeWeek(state, w, rampVolume(state.volume, state.meso.rampSets, w), w, false, keyLifts, capacity))
  }
  const breach = raw.find((w) => w.overMrv.length > 0 || w.centralFatigue > 1)
  const breachWeek = breach ? breach.index : null
  const cracked = new Set<MuscleId>()
  let centralCrack = false
  for (const w of raw) {
    w.overMrv.forEach((m) => cracked.add(m))
    if (w.centralFatigue > 1) centralCrack = true
  }

  if (!state.deload) {
    const lastSafe = breachWeek ? Math.max(1, breachWeek - 1) : n
    return {
      weeks: raw,
      breachWeek,
      crackedMuscles: MUSCLE_IDS.filter((m) => cracked.has(m)),
      centralCrack,
      deloadWeek: null,
      keyLifts,
      peakVolume: raw[lastSafe - 1].volume,
    }
  }

  // Deload wykuty: akumulacja kończy się tydzień przed pęknięciem (lub po pełnym bloku).
  const accumulation = breachWeek ? Math.max(1, breachWeek - 1) : n
  const weeks = raw.slice(0, accumulation)
  const peak = weeks[weeks.length - 1]
  const dVol = deloadVolume(peak.volume)
  const deloadWeek = accumulation + 1
  weeks.push(computeWeek(state, deloadWeek, dVol, accumulation, true, keyLifts, capacity))
  return {
    weeks,
    breachWeek,
    crackedMuscles: MUSCLE_IDS.filter((m) => cracked.has(m)),
    centralCrack,
    deloadWeek,
    keyLifts,
    peakVolume: peak.volume,
  }
}
