import { MUSCLE_IDS, MUSCLE_MAP } from '../data/muscles'
import type { I18n } from '../i18n/createI18n'
import type { Measurements, MesoWeek, MuscleId } from '../types'

/** Golden ratio — the classic “Adonis index” shoulders : waist. */
export const GOLDEN_RATIO = 1.618
/** Maximum monthly gain in shoulder circumference (cm) with an optimal stimulus. */
export const MAX_MONTHLY_GAIN = 0.6
/** Diminishing gains from month to month. */
export const DIMINISHING = 0.93

export interface VTaperProjection {
  label: string
  months: number
  shoulders: number
  ratio: number
}

export interface VTaperAnalysis {
  ratio: number
  /** Share of sets going to shoulders + lats in the whole plan */
  widthShare: number
  /** 0–1: stimulus quality for the “width” muscles */
  stimulusIndex: number
  perMuscle: Record<'shoulders' | 'lats', { avgSets: number; factor: number }>
  monthlyGain: number
  projections: VTaperProjection[]
  monthsToGolden: number | null
  targetShoulders: number
}

function factorFor(muscle: MuscleId, avgSets: number): number {
  const l = MUSCLE_MAP[muscle].landmarks
  let f = (avgSets - l.mev) / (l.mavHigh - l.mev)
  f = Math.max(0, Math.min(1, f))
  if (avgSets > l.mrv) f *= 0.6 // overreaching eats into adaptation
  return f
}

function gainAfter(months: number, monthly: number): number {
  let total = 0
  for (let k = 0; k < Math.floor(months); k++) total += monthly * Math.pow(DIMINISHING, k)
  const frac = months - Math.floor(months)
  total += frac * monthly * Math.pow(DIMINISHING, Math.floor(months))
  return total
}

export function analyzeVTaper(measurements: Measurements, weeks: MesoWeek[], i18n: I18n): VTaperAnalysis {
  const acc = weeks.filter((w) => !w.deload)
  const avg = (m: MuscleId) => (acc.length ? acc.reduce((a, w) => a + w.volume[m], 0) / acc.length : 0)
  const shAvg = avg('shoulders')
  const laAvg = avg('lats')
  const fSh = factorFor('shoulders', shAvg)
  const fLa = factorFor('lats', laAvg)
  const stimulusIndex = 0.45 * fSh + 0.55 * fLa
  const monthlyGain = MAX_MONTHLY_GAIN * stimulusIndex

  const first = weeks[0]
  const total = first ? MUSCLE_IDS.reduce((a, m) => a + first.volume[m], 0) : 0
  const widthShare = first && total > 0 ? (first.volume.shoulders + first.volume.lats) / total : 0

  const { shoulders, waist } = measurements
  const ratio = waist > 0 ? shoulders / waist : 0
  const mesoMonths = weeks.length / 4.345
  const horizons: Array<[string, number]> = [
    [i18n.t('vt.today'), 0],
    [i18n.t('vt.afterMeso'), mesoMonths],
    [i18n.t('vt.m6'), 6],
    [i18n.t('vt.m12'), 12],
  ]
  const projections = horizons.map(([label, months]) => {
    const sh = shoulders + gainAfter(months, monthlyGain)
    return { label, months, shoulders: sh, ratio: waist > 0 ? sh / waist : 0 }
  })

  const targetShoulders = GOLDEN_RATIO * waist
  let monthsToGolden: number | null = null
  if (ratio >= GOLDEN_RATIO) monthsToGolden = 0
  else if (monthlyGain > 0) {
    for (let mo = 1; mo <= 72; mo++) {
      if (shoulders + gainAfter(mo, monthlyGain) >= targetShoulders) {
        monthsToGolden = mo
        break
      }
    }
  }

  return {
    ratio,
    widthShare,
    stimulusIndex,
    perMuscle: { shoulders: { avgSets: shAvg, factor: fSh }, lats: { avgSets: laAvg, factor: fLa } },
    monthlyGain,
    projections,
    monthsToGolden,
    targetShoulders,
  }
}
