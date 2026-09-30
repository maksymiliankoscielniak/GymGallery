import { MUSCLE_IDS, MUSCLE_MAP, recordOfMuscles } from '../data/muscles'
import type { GalleryState, MuscleId, SplitDay, VolumePlan, VolumeStatus } from '../types'

export const MAX_SETS_PER_MUSCLE = 40
/** Powyżej tej liczby serii jednej partii w jednej sesji rośnie „śmieciowa” objętość. */
export const SESSION_MUSCLE_CAP = 10
/** Powyżej tej liczby serii w sesji jakość pracy spada. */
export const SESSION_TOTAL_CAP = 26

export function volumeStatus(muscle: MuscleId, sets: number): VolumeStatus {
  const l = MUSCLE_MAP[muscle].landmarks
  if (sets < l.mev) return 'under'
  if (sets < l.mavLow) return 'effective'
  if (sets <= l.mavHigh) return 'optimal'
  if (sets <= l.mrv) return 'high'
  return 'over'
}

export const STATUS_META: Record<VolumeStatus, { label: string; hint: string }> = {
  under: { label: 'poniżej MEV', hint: 'bodziec zbyt słaby, by wywołać wzrost' },
  effective: { label: 'MEV → MAV', hint: 'objętość efektywna — rośnie' },
  optimal: { label: 'w strefie MAV', hint: 'maksymalna adaptacja' },
  high: { label: 'ponad MAV', hint: 'zbliża się do granicy regeneracji' },
  over: { label: 'ponad MRV', hint: 'zmęczenie przerasta regenerację' },
}

export function isBalancedStatus(s: VolumeStatus): boolean {
  return s === 'effective' || s === 'optimal'
}

/** Rozkłada serie równo na n sesji; reszta trafia do pierwszych sesji. */
export function distributeSets(total: number, sessions: number): number[] {
  if (sessions <= 0) return []
  const base = Math.floor(total / sessions)
  const rest = total - base * sessions
  return Array.from({ length: sessions }, (_, i) => base + (i < rest ? 1 : 0))
}

export function frequencyOf(split: SplitDay[], muscle: MuscleId): number {
  return split.filter((d) => d.muscles.includes(muscle)).length
}

/** Serie danej partii w każdym dniu podziału: dayId → muscle → sets */
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
  /** Blokują pieczęć */
  issues: PlanIssue[]
  /** Wskazówki niekrytyczne */
  warnings: PlanIssue[]
  balanced: boolean
}

export function analyzeSketch(state: Pick<GalleryState, 'split' | 'volume'>): SketchAnalysis {
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

  if (split.length < 2) issues.push({ message: 'Podział potrzebuje co najmniej dwóch dni.' })

  for (const m of MUSCLE_IDS) {
    const def = MUSCLE_MAP[m]
    const s = status[m]
    if (s === 'under') {
      issues.push({ muscle: m, message: `${def.name}: ${volume[m]} serii — poniżej MEV (${def.landmarks.mev}).` })
    } else if (s === 'high' || s === 'over') {
      issues.push({
        muscle: m,
        message: `${def.name}: ${volume[m]} serii — ponad MAV (${def.landmarks.mavHigh}). Start mezocyklu powinien zostawić zapas do MRV.`,
      })
    }
    if (volume[m] > 0 && frequency[m] === 0) {
      issues.push({ muscle: m, message: `${def.name}: nie przypisano do żadnego dnia podziału.` })
    } else if (frequency[m] === 1 && volume[m] > 0) {
      warnings.push({ muscle: m, message: `${def.name}: tylko 1× w tygodniu — częstotliwość 2× zwykle daje lepszy bodziec.` })
    }
    for (const d of split) {
      const n = perDay[d.id][m] ?? 0
      if (n > SESSION_MUSCLE_CAP) {
        warnings.push({
          muscle: m,
          dayId: d.id,
          message: `${d.name}: ${n} serii na ${def.short.toLowerCase()} w jednej sesji — ponad ~${SESSION_MUSCLE_CAP} serii rośnie objętość „śmieciowa”.`,
        })
      }
    }
  }
  for (const d of split) {
    if (sessionTotals[d.id] > SESSION_TOTAL_CAP) {
      warnings.push({ dayId: d.id, message: `${d.name}: ${sessionTotals[d.id]} serii w sesji — rozważ przeniesienie partii na inny dzień.` })
    }
    if (d.muscles.length === 0) {
      warnings.push({ dayId: d.id, message: `${d.name}: pusty dzień — dodaj partie lub usuń go z podziału.` })
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

/** Rozkład „intensywności” 0–1 względem MRV — pomocny przy cieniowaniu. */
export function volumeIntensity(muscle: MuscleId, sets: number): number {
  const l = MUSCLE_MAP[muscle].landmarks
  return Math.max(0, Math.min(1.25, sets / l.mrv))
}
