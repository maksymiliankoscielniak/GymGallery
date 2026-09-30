import { EXERCISE_MAP } from '../data/exercises'
import { MUSCLE_IDS } from '../data/muscles'
import type { DayPlan, PigmentPlan, ScheduledExercise, SplitDay, VolumePlan } from '../types'
import { exerciseSets } from './sfr'
import { setsPerDay } from './volume'

/**
 * Assembles the training week: muscle volume → split days → concrete exercises.
 * Sets of each exercise are spread greedily so that both resistance profiles
 * show up in every session and the weekly totals match set for set.
 */
export function buildWeekSchedule(split: SplitDay[], volume: VolumePlan, pigments: PigmentPlan): DayPlan[] {
  const perDay = setsPerDay(split, volume)
  const weekly = exerciseSets(volume, pigments)
  const byDay: Record<string, ScheduledExercise[]> = Object.fromEntries(split.map((d) => [d.id, []]))

  for (const m of MUSCLE_IDS) {
    const exs = weekly[m].filter((e) => e.sets > 0)
    if (exs.length === 0) continue
    const remaining = exs.map((e) => e.sets)
    for (const d of split) {
      const quota = perDay[d.id][m] ?? 0
      const taken = exs.map(() => 0)
      for (let k = 0; k < quota; k++) {
        let best = -1
        let bestScore = -Infinity
        exs.forEach((e, i) => {
          if (remaining[i] <= 0) return
          // prefer exercises with the largest unused share that are not yet in this session
          const score = remaining[i] / e.sets + (taken[i] === 0 ? 0.5 : 0)
          if (score > bestScore) {
            bestScore = score
            best = i
          }
        })
        if (best < 0) break
        remaining[best] -= 1
        taken[best] += 1
      }
      exs.forEach((e, i) => {
        if (taken[i] > 0) byDay[d.id].push({ exerciseId: e.exerciseId, muscle: m, sets: taken[i] })
      })
    }
  }

  return split.map((day) => {
    const items = byDay[day.id].sort((a, b) => {
      const ea = EXERCISE_MAP[a.exerciseId]
      const eb = EXERCISE_MAP[b.exerciseId]
      // compound lifts and stretch phases at the start of the session
      const ka = (ea.compound ? 0 : 2) + (ea.profile === 'stretch' ? 0 : 1)
      const kb = (eb.compound ? 0 : 2) + (eb.profile === 'stretch' ? 0 : 1)
      return ka - kb
    })
    return { day, items, totalSets: items.reduce((a, i) => a + i.sets, 0) }
  })
}
