import { MUSCLE_IDS, MUSCLE_MAP, recordOfMuscles } from '../data/muscles'
import type { I18n } from '../i18n/createI18n'
import type { GalleryState, MuscleId, SplitDay, VolumePlan, VolumeStatus } from '../types'

export const MAX_SETS_PER_MUSCLE = 40
/** Above this many sets for one muscle group in one session, “junk” volume builds up. */
export const SESSION_MUSCLE_CAP = 10
/** Above this many sets in a session, work quality drops. */
export const SESSION_TOTAL_CAP = 26

export function volumeStatus(muscle: MuscleId, sets: number): VolumeStatus {
  const l = MUSCLE_MAP[muscle].landmarks
  if (sets < l.mev) return 'under'
  if (sets < l.mavLow) return 'effective'
  if (sets <= l.mavHigh) return 'optimal'
  if (sets <= l.mrv) return 'high'
  return 'over'
}

export function isBalancedStatus(s: VolumeStatus): boolean {
  return s === 'effective' || s === 'optimal'
}

/** Spreads sets evenly over n sessions; the remainder goes to the first sessions. */
export function distributeSets(total: number, sessions: number): number[] {
  if (sessions <= 0) return []
  const base = Math.floor(total / sessions)
  const rest = total - base * sessions
  return Array.from({ length: sessions }, (_, i) => base + (i < rest ? 1 : 0))
}

export function frequencyOf(split: SplitDay[], muscle: MuscleId): number {
  return split.filter((d) => d.muscles.includes(muscle)).length
}

/** Sets of each muscle group on every split day: dayId → muscle → sets */
export function setsPerDay(
  split: SplitDay[],
  volume: VolumePlan,
): Record<string, Partial<Record<MuscleId, number>>> {
  const out: Record<string, Partial<Record<MuscleId, number>>> = Object.fromEntries(
    split.map((d) => [d.id, {}]),
  )
  for (const m of MUSCLE_IDS) {
    const days = split.filter((d) => d.muscles.includes(m))
    const parts = distributeSets(volume[m], days.length)
    days.forEach((d, i) => {
      out[d.id][m] = parts[i]
    })
  }
  return out
}

export interface PlanIssue {
  muscle?: MuscleId
  dayId?: string
  message: string
}

export interface SketchAnalysis {
  status: Record<MuscleId, VolumeStatus>
  frequency: Record<MuscleId, number>
  perDay: Record<string, Partial<Record<MuscleId, number>>>
  sessionTotals: Record<string, number>
  weeklyTotal: number
  /** Block the seal */
  issues: PlanIssue[]
  /** Non-critical hints */
  warnings: PlanIssue[]
  balanced: boolean
}

export function analyzeSketch(state: Pick<GalleryState, 'split' | 'volume'>, i18n: I18n): SketchAnalysis {
  const { t } = i18n
  const { split, volume } = state
  const status = recordOfMuscles((m) => volumeStatus(m, volume[m]))
  const frequency = recordOfMuscles((m) => frequencyOf(split, m))
  const perDay = setsPerDay(split, volume)
  const sessionTotals = Object.fromEntries(
    split.map((d) => [d.id, Object.values(perDay[d.id]).reduce((a, b) => a + (b ?? 0), 0)]),
  )
  const weeklyTotal = MUSCLE_IDS.reduce((a, m) => a + volume[m], 0)

  const issues: PlanIssue[] = []
  const warnings: PlanIssue[] = []

  if (split.length < 2) issues.push({ message: t('issue.splitMin') })

  for (const m of MUSCLE_IDS) {
    const def = MUSCLE_MAP[m]
    const name = i18n.muscle(m)
    const s = status[m]
    if (s === 'under') {
      issues.push({ muscle: m, message: t('issue.under', { name, sets: volume[m], mev: def.landmarks.mev }) })
    } else if (s === 'high' || s === 'over') {
      issues.push({
        muscle: m,
        message: t('issue.high', { name, sets: volume[m], mav: def.landmarks.mavHigh }),
      })
    }
    if (volume[m] > 0 && frequency[m] === 0) {
      issues.push({ muscle: m, message: t('issue.unassigned', { name }) })
    } else if (frequency[m] === 1 && volume[m] > 0) {
      warnings.push({ muscle: m, message: t('warn.once', { name }) })
    }
    for (const d of split) {
      const n = perDay[d.id][m] ?? 0
      if (n > SESSION_MUSCLE_CAP) {
        warnings.push({
          muscle: m,
          dayId: d.id,
          message: t('warn.junk', { day: d.name, n, muscle: i18n.muscleShort(m).toLowerCase(), cap: SESSION_MUSCLE_CAP }),
        })
      }
    }
  }
  for (const d of split) {
    if (sessionTotals[d.id] > SESSION_TOTAL_CAP) {
      warnings.push({ dayId: d.id, message: t('warn.session', { day: d.name, n: sessionTotals[d.id] }) })
    }
    if (d.muscles.length === 0) {
      warnings.push({ dayId: d.id, message: t('warn.emptyDay', { day: d.name }) })
    }
  }

  return {
    status,
    frequency,
    perDay,
    sessionTotals,
    weeklyTotal,
    issues,
    warnings,
    balanced: issues.length === 0,
  }
}

/** “Intensity” 0–1 relative to MRV — handy for shading. */
export function volumeIntensity(muscle: MuscleId, sets: number): number {
  const l = MUSCLE_MAP[muscle].landmarks
  return Math.max(0, Math.min(1.25, sets / l.mrv))
}
