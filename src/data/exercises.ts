import type { ExerciseDef, MuscleId, ResistanceProfile } from '../types'

/**
 * Biblioteka pigmentów — ćwiczeń opisanych profilem krzywej oporu.
 *  - `stretch` — opór maksymalny w fazie rozciągnięcia mięśnia,
 *  - `peak`    — opór maksymalny w fazie skurczu (szczytowy).
 * Skale bodźca i zmęczenia (0–10) są heurystyczne i służą do porównań względnych.
 */
export const EXERCISES: ExerciseDef[] = [
  /* ---------- Barki ---------- */
  { id: 'sh-cable-behind', name: 'Wznosy bokiem na wyciągu zza pleców', muscle: 'shoulders', profile: 'stretch', stimulus: 8, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 10, reps: 12 } },
  { id: 'sh-lying-lateral', name: 'Wznosy bokiem w leżeniu bokiem', muscle: 'shoulders', profile: 'stretch', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 8, reps: 14 } },
  { id: 'sh-db-press', name: 'Wyciskanie hantli nad głowę siedząc', muscle: 'shoulders', profile: 'stretch', stimulus: 7, jointFatigue: 5, axialFatigue: 3, compound: true, baseline: { weight: 26, reps: 8 } },
  { id: 'sh-cable-lateral', name: 'Wznosy bokiem na wyciągu', muscle: 'shoulders', profile: 'peak', stimulus: 8, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 12.5, reps: 12 } },
  { id: 'sh-db-lateral', name: 'Wznosy bokiem z hantlami', muscle: 'shoulders', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 12, reps: 14 } },
  { id: 'sh-reverse-pec', name: 'Odwrotne rozpiętki na maszynie', muscle: 'shoulders', profile: 'peak', stimulus: 6, jointFatigue: 1, axialFatigue: 0, compound: false, baseline: { weight: 35, reps: 15 }, note: 'tylne aktony' },

  /* ---------- Klatka ---------- */
  { id: 'ch-incline-db', name: 'Wyciskanie hantli na skosie dodatnim', muscle: 'chest', profile: 'stretch', stimulus: 9, jointFatigue: 4, axialFatigue: 1, compound: true, baseline: { weight: 32, reps: 10 } },
  { id: 'ch-db-fly', name: 'Rozpiętki z hantlami na ławce płaskiej', muscle: 'chest', profile: 'stretch', stimulus: 7, jointFatigue: 3, axialFatigue: 0, compound: false, baseline: { weight: 16, reps: 12 } },
  { id: 'ch-dips', name: 'Pompki na poręczach z pochyleniem', muscle: 'chest', profile: 'stretch', stimulus: 8, jointFatigue: 6, axialFatigue: 1, compound: true, baseline: { weight: 20, reps: 10 }, note: 'ciężar dodatkowy' },
  { id: 'ch-bench', name: 'Wyciskanie sztangi na ławce płaskiej', muscle: 'chest', profile: 'stretch', stimulus: 8, jointFatigue: 5, axialFatigue: 3, compound: true, baseline: { weight: 100, reps: 6 } },
  { id: 'ch-crossover', name: 'Cable Crossover', muscle: 'chest', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 17.5, reps: 12 } },
  { id: 'ch-pecdeck', name: 'Pec Deck (butterfly)', muscle: 'chest', profile: 'peak', stimulus: 8, jointFatigue: 1, axialFatigue: 0, compound: false, baseline: { weight: 60, reps: 12 } },

  /* ---------- Najszerszy ---------- */
  { id: 'la-pulldown', name: 'Ściąganie drążka szerokim nachwytem', muscle: 'lats', profile: 'stretch', stimulus: 8, jointFatigue: 3, axialFatigue: 1, compound: true, baseline: { weight: 75, reps: 10 } },
  { id: 'la-kneeling-pulldown', name: 'Ściąganie jednorącz w klęku', muscle: 'lats', profile: 'stretch', stimulus: 8, jointFatigue: 2, axialFatigue: 1, compound: false, baseline: { weight: 35, reps: 10 } },
  { id: 'la-cable-pullover', name: 'Pullover na wyciągu', muscle: 'lats', profile: 'stretch', stimulus: 8, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 30, reps: 12 } },
  { id: 'la-chest-row', name: 'Wiosłowanie w oparciu o ławkę', muscle: 'lats', profile: 'peak', stimulus: 8, jointFatigue: 2, axialFatigue: 0, compound: true, baseline: { weight: 70, reps: 10 } },
  { id: 'la-iso-row', name: 'Wiosłowanie na maszynie Iso-Lateral', muscle: 'lats', profile: 'peak', stimulus: 8, jointFatigue: 2, axialFatigue: 1, compound: true, baseline: { weight: 50, reps: 10 } },
  { id: 'la-bb-row', name: 'Wiosłowanie sztangą w opadzie', muscle: 'lats', profile: 'peak', stimulus: 8, jointFatigue: 4, axialFatigue: 7, compound: true, baseline: { weight: 90, reps: 8 } },

  /* ---------- Triceps ---------- */
  { id: 'tr-overhead-cable', name: 'Francuskie wyciskanie na wyciągu zza głowy', muscle: 'triceps', profile: 'stretch', stimulus: 8, jointFatigue: 3, axialFatigue: 0, compound: false, baseline: { weight: 30, reps: 12 } },
  { id: 'tr-skull', name: 'Wyciskanie francuskie leżąc', muscle: 'triceps', profile: 'stretch', stimulus: 7, jointFatigue: 5, axialFatigue: 0, compound: false, baseline: { weight: 35, reps: 10 } },
  { id: 'tr-pushdown', name: 'Prostowanie ramion na wyciągu', muscle: 'triceps', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 35, reps: 12 } },
  { id: 'tr-kickback', name: 'Kickback na wyciągu', muscle: 'triceps', profile: 'peak', stimulus: 6, jointFatigue: 1, axialFatigue: 0, compound: false, baseline: { weight: 10, reps: 15 } },

  /* ---------- Biceps ---------- */
  { id: 'bi-incline', name: 'Uginanie hantli na ławce skośnej', muscle: 'biceps', profile: 'stretch', stimulus: 8, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 14, reps: 10 } },
  { id: 'bi-bayesian', name: 'Uginanie Bayesian na wyciągu', muscle: 'biceps', profile: 'stretch', stimulus: 8, jointFatigue: 1, axialFatigue: 0, compound: false, baseline: { weight: 12.5, reps: 12 } },
  { id: 'bi-spider', name: 'Spider curl', muscle: 'biceps', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 12, reps: 12 } },
  { id: 'bi-cable-peak', name: 'Uginanie na wyciągu dolnym', muscle: 'biceps', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 30, reps: 12 } },

  /* ---------- Brzuch ---------- */
  { id: 'ab-cable-crunch', name: 'Spięcia brzucha na wyciągu klęcząc', muscle: 'abs', profile: 'stretch', stimulus: 8, jointFatigue: 2, axialFatigue: 2, compound: false, baseline: { weight: 50, reps: 12 } },
  { id: 'ab-ball-crunch', name: 'Brzuszki na piłce z obciążeniem', muscle: 'abs', profile: 'stretch', stimulus: 7, jointFatigue: 1, axialFatigue: 1, compound: false, baseline: { weight: 10, reps: 15 } },
  { id: 'ab-hanging', name: 'Unoszenie nóg w zwisie', muscle: 'abs', profile: 'peak', stimulus: 7, jointFatigue: 3, axialFatigue: 1, compound: false, baseline: { weight: 5, reps: 12 }, note: 'obciążniki na kostki' },
  { id: 'ab-machine', name: 'Spięcia na maszynie', muscle: 'abs', profile: 'peak', stimulus: 7, jointFatigue: 1, axialFatigue: 1, compound: false, baseline: { weight: 45, reps: 15 } },

  /* ---------- Czworogłowe ---------- */
  { id: 'qu-hack', name: 'Przysiad na hack maszynie (pełna głębokość)', muscle: 'quads', profile: 'stretch', stimulus: 9, jointFatigue: 5, axialFatigue: 3, compound: true, baseline: { weight: 140, reps: 10 } },
  { id: 'qu-squat', name: 'Przysiad ze sztangą high-bar', muscle: 'quads', profile: 'stretch', stimulus: 9, jointFatigue: 6, axialFatigue: 9, compound: true, baseline: { weight: 110, reps: 6 } },
  { id: 'qu-bulgarian', name: 'Bułgarski przysiad wykroczny', muscle: 'quads', profile: 'stretch', stimulus: 8, jointFatigue: 4, axialFatigue: 3, compound: true, baseline: { weight: 24, reps: 10 } },
  { id: 'qu-sissy', name: 'Sissy squat', muscle: 'quads', profile: 'stretch', stimulus: 7, jointFatigue: 5, axialFatigue: 0, compound: false, baseline: { weight: 10, reps: 12 } },
  { id: 'qu-extension', name: 'Prostowanie nóg na maszynie', muscle: 'quads', profile: 'peak', stimulus: 7, jointFatigue: 3, axialFatigue: 0, compound: false, baseline: { weight: 70, reps: 12 } },
  { id: 'qu-press-top', name: 'Suwnica — górny zakres ruchu', muscle: 'quads', profile: 'peak', stimulus: 6, jointFatigue: 3, axialFatigue: 1, compound: true, baseline: { weight: 200, reps: 12 } },

  /* ---------- Tył uda ---------- */
  { id: 'ha-rdl', name: 'Martwy ciąg rumuński (RDL)', muscle: 'hamstrings', profile: 'stretch', stimulus: 9, jointFatigue: 4, axialFatigue: 8, compound: true, baseline: { weight: 120, reps: 8 } },
  { id: 'ha-seated-curl', name: 'Uginanie nóg siedząc', muscle: 'hamstrings', profile: 'stretch', stimulus: 9, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 60, reps: 10 } },
  { id: 'ha-good-morning', name: 'Good morning', muscle: 'hamstrings', profile: 'stretch', stimulus: 7, jointFatigue: 4, axialFatigue: 8, compound: true, baseline: { weight: 70, reps: 10 } },
  { id: 'ha-lying-curl', name: 'Uginanie nóg leżąc', muscle: 'hamstrings', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 1, compound: false, baseline: { weight: 50, reps: 10 } },
  { id: 'ha-standing-curl', name: 'Uginanie nóg stojąc jednonóż', muscle: 'hamstrings', profile: 'peak', stimulus: 6, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 25, reps: 12 } },
]

export const EXERCISE_MAP: Record<string, ExerciseDef> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
)

export function exercisesFor(muscle: MuscleId, profile?: ResistanceProfile): ExerciseDef[] {
  return EXERCISES.filter((e) => e.muscle === muscle && (!profile || e.profile === profile))
}

export const PROFILE_LABEL: Record<ResistanceProfile, { title: string; subtitle: string }> = {
  stretch: { title: 'Faza rozciągnięcia', subtitle: 'mięsień wydłużony' },
  peak: { title: 'Faza skurczu', subtitle: 'opór szczytowy' },
}
