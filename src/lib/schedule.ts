import { EXERCISE_MAP } from '../data/exercises'
import { MUSCLE_IDS } from '../data/muscles'
import type { DayPlan, PigmentPlan, ScheduledExercise, SplitDay, VolumePlan } from '../types'
import { exerciseSets } from './sfr'
import { setsPerDay } from './volume'

/**
 * Składa tydzień treningowy: objętość partii → dni podziału → konkretne ćwiczenia.
 * Serie każdego ćwiczenia rozkładane są zachłannie tak, by w każdej sesji
 * pojawiały się oba profile oporu, a sumy tygodniowe zgadzały się co do serii.
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
          // preferuj ćwiczenia z największą niewykorzystaną częścią i jeszcze nieobecne w tej sesji
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
      // ćwiczenia złożone i fazy rozciągnięcia na początku sesji
      const ka = (ea.compound ? 0 : 2) + (ea.profile === 'stretch' ? 0 : 1)
      const kb = (eb.compound ? 0 : 2) + (eb.profile === 'stretch' ? 0 : 1)
      return ka - kb
    })
    return { day, items, totalSets: items.reduce((a, i) => a + i.sets, 0) }
  })
}
