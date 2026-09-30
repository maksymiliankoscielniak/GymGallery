import { EXERCISE_MAP, exercisesFor } from '../data/exercises'
import { MUSCLE_IDS, recordOfMuscles } from '../data/muscles'
import type { I18n } from '../i18n/createI18n'
import type { ExerciseDef, GalleryState, MuscleId, PigmentPlan, VolumePlan } from '../types'
import { isBalancedStatus, volumeStatus, type PlanIssue } from './volume'

/* ------------------------------------------------------------------
 *  SFR — Stimulus-to-Fatigue Ratio
 *  fatigue cost = 2 (base cost of a set) + 0.45 × joint + 0.6 × axial
 * ------------------------------------------------------------------ */

export function fatigueCost(ex: ExerciseDef): number {
  return 2 + 0.45 * ex.jointFatigue + 0.6 * ex.axialFatigue
}

export function exerciseSfr(ex: ExerciseDef): number {
  return ex.stimulus / fatigueCost(ex)
}

/** Weekly axial-load budget (Σ sets × axial cost). */
export const AXIAL_BUDGET = 100
/** Weekly joint-load budget (Σ sets × joint cost). */
export const JOINT_BUDGET = 300
/** Minimum global SFR required to move on. */
export const SFR_TARGET = 1.8

export type SfrGrade = 'costly' | 'balanced' | 'efficient'

export function sfrGrade(sfr: number): SfrGrade {
  if (sfr >= 2.2) return 'efficient'
  if (sfr >= SFR_TARGET) return 'balanced'
  return 'costly'
}

/** Splits an integer proportionally to weights (largest-remainder method). */
export function allocateByWeights(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  if (sum <= 0 || weights.length === 0) return weights.map(() => 0)
  const raw = weights.map((w) => (total * w) / sum)
  const floors = raw.map(Math.floor)
  let rest = total - floors.reduce((a, b) => a + b, 0)
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i)
  for (const { i } of order) {
    if (rest <= 0) break
    floors[i] += 1
    rest -= 1
  }
  return floors
}

export interface ExerciseSets {
  exerciseId: string
  sets: number
}

/** Weekly sets of each exercise derived from the muscle volume and layer thickness. */
export function exerciseSets(volume: VolumePlan, pigments: PigmentPlan): Record<MuscleId, ExerciseSets[]> {
  return recordOfMuscles((m) => {
    const strokes = pigments[m].filter((p) => EXERCISE_MAP[p.exerciseId])
    const alloc = allocateByWeights(
      volume[m],
      strokes.map((s) => s.layers),
    )
    return strokes.map((s, i) => ({ exerciseId: s.exerciseId, sets: alloc[i] }))
  })
}

export interface MuscleCanvas {
  hasStretch: boolean
  hasPeak: boolean
  stretchSets: number
  peakSets: number
  sfr: number
  sets: ExerciseSets[]
  avgCost: number
}

export interface CanvasAnalysis {
  perMuscle: Record<MuscleId, MuscleCanvas>
  globalSfr: number
  grade: SfrGrade
  stimulusLoad: number
  fatigueLoad: number
  jointLoad: number
  axialLoad: number
  issues: PlanIssue[]
  balanced: boolean
}

export function analyzeCanvas(state: Pick<GalleryState, 'volume' | 'pigments'>, i18n: I18n): CanvasAnalysis {
  const { t } = i18n
  const sets = exerciseSets(state.volume, state.pigments)
  let stim = 0
  let fat = 0
  let joint = 0
  let axial = 0
  const issues: PlanIssue[] = []

  const perMuscle = recordOfMuscles<MuscleCanvas>((m) => {
    let mStim = 0
    let mFat = 0
    let stretchSets = 0
    let peakSets = 0
    let hasStretch = false
    let hasPeak = false
    for (const { exerciseId, sets: n } of sets[m]) {
      const ex = EXERCISE_MAP[exerciseId]
      if (ex.profile === 'stretch') {
        hasStretch = true
        stretchSets += n
      } else {
        hasPeak = true
        peakSets += n
      }
      mStim += n * ex.stimulus
      mFat += n * fatigueCost(ex)
      joint += n * ex.jointFatigue
      axial += n * ex.axialFatigue
    }
    stim += mStim
    fat += mFat
    const strokes = state.pigments[m]
    const weightSum = strokes.reduce((a, s) => a + s.layers, 0)
    const avgCost =
      weightSum > 0
        ? strokes.reduce((a, s) => a + s.layers * fatigueCost(EXERCISE_MAP[s.exerciseId]), 0) / weightSum
        : 3.5
    return {
      hasStretch,
      hasPeak,
      stretchSets,
      peakSets,
      sfr: mFat > 0 ? mStim / mFat : 0,
      sets: sets[m],
      avgCost,
    }
  })

  for (const m of MUSCLE_IDS) {
    const name = i18n.muscle(m)
    const pm = perMuscle[m]
    if (!pm.hasStretch && !pm.hasPeak) {
      issues.push({ muscle: m, message: t('canvas.noPigments', { name }) })
    } else if (!pm.hasStretch) {
      issues.push({ muscle: m, message: t('canvas.noStretch', { name }) })
    } else if (!pm.hasPeak) {
      issues.push({ muscle: m, message: t('canvas.noPeak', { name }) })
    }
    const st = volumeStatus(m, state.volume[m])
    if (!isBalancedStatus(st)) {
      issues.push({
        muscle: m,
        message: st === 'under' ? t('canvas.faded', { name }) : t('canvas.darkening', { name }),
      })
    }
  }

  const globalSfr = fat > 0 ? stim / fat : 0
  if (globalSfr < SFR_TARGET) {
    issues.push({
      message: t('canvas.sfrLow', { sfr: globalSfr.toFixed(2), target: SFR_TARGET.toFixed(1) }),
    })
  }
  if (axial > AXIAL_BUDGET) {
    issues.push({ message: t('canvas.axialOver', { value: Math.round(axial), budget: AXIAL_BUDGET }) })
  }
  if (joint > JOINT_BUDGET) {
    issues.push({ message: t('canvas.jointOver', { value: Math.round(joint), budget: JOINT_BUDGET }) })
  }

  return {
    perMuscle,
    globalSfr,
    grade: sfrGrade(globalSfr),
    stimulusLoad: stim,
    fatigueLoad: fat,
    jointLoad: joint,
    axialLoad: axial,
    issues,
    balanced: issues.length === 0,
  }
}

/** Fills missing profiles with the most efficient (highest SFR) pigment. */
export function autoCompose(pigments: PigmentPlan): PigmentPlan {
  return recordOfMuscles((m) => {
    const strokes = [...pigments[m]]
    for (const profile of ['stretch', 'peak'] as const) {
      const has = strokes.some((s) => EXERCISE_MAP[s.exerciseId]?.profile === profile)
      if (!has) {
        const best = exercisesFor(m, profile)
          .filter((e) => !strokes.some((s) => s.exerciseId === e.id))
          .sort((a, b) => exerciseSfr(b) - exerciseSfr(a))[0]
        if (best) strokes.push({ exerciseId: best.id, layers: 2 })
      }
    }
    return strokes
  })
}
