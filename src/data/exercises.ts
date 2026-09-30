import type { ExerciseDef, MuscleId, ResistanceProfile } from '../types'

/**
 * Pigment library — exercises described by their resistance-curve profile.
 *  - `stretch` — peak resistance while the muscle is lengthened,
 *  - `peak`    — peak resistance at the contraction (shortened) end.
 * Stimulus and fatigue scales (0–10) are heuristic and meant for relative comparison.
 * Names here are English; Polish names live in i18n/messages.pl.ts.
 */
export const EXERCISES: ExerciseDef[] = [
  /* ---------- Shoulders ---------- */
  { id: 'sh-cable-behind', name: 'Behind-the-back cable lateral raise', muscle: 'shoulders', profile: 'stretch', stimulus: 8, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 10, reps: 12 } },
  { id: 'sh-lying-lateral', name: 'Side-lying lateral raise', muscle: 'shoulders', profile: 'stretch', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 8, reps: 14 } },
  { id: 'sh-db-press', name: 'Seated dumbbell overhead press', muscle: 'shoulders', profile: 'stretch', stimulus: 7, jointFatigue: 5, axialFatigue: 3, compound: true, baseline: { weight: 26, reps: 8 } },
  { id: 'sh-cable-lateral', name: 'Cable lateral raise', muscle: 'shoulders', profile: 'peak', stimulus: 8, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 12.5, reps: 12 } },
  { id: 'sh-db-lateral', name: 'Dumbbell lateral raise', muscle: 'shoulders', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 12, reps: 14 } },
  { id: 'sh-reverse-pec', name: 'Reverse pec deck', muscle: 'shoulders', profile: 'peak', stimulus: 6, jointFatigue: 1, axialFatigue: 0, compound: false, baseline: { weight: 35, reps: 15 }, note: 'rear delts' },

  /* ---------- Chest ---------- */
  { id: 'ch-incline-db', name: 'Incline dumbbell press', muscle: 'chest', profile: 'stretch', stimulus: 9, jointFatigue: 4, axialFatigue: 1, compound: true, baseline: { weight: 32, reps: 10 } },
  { id: 'ch-db-fly', name: 'Flat dumbbell fly', muscle: 'chest', profile: 'stretch', stimulus: 7, jointFatigue: 3, axialFatigue: 0, compound: false, baseline: { weight: 16, reps: 12 } },
  { id: 'ch-dips', name: 'Forward-leaning dips', muscle: 'chest', profile: 'stretch', stimulus: 8, jointFatigue: 6, axialFatigue: 1, compound: true, baseline: { weight: 20, reps: 10 }, note: 'added weight' },
  { id: 'ch-bench', name: 'Flat barbell bench press', muscle: 'chest', profile: 'stretch', stimulus: 8, jointFatigue: 5, axialFatigue: 3, compound: true, baseline: { weight: 100, reps: 6 } },
  { id: 'ch-crossover', name: 'Cable Crossover', muscle: 'chest', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 17.5, reps: 12 } },
  { id: 'ch-pecdeck', name: 'Pec Deck (butterfly)', muscle: 'chest', profile: 'peak', stimulus: 8, jointFatigue: 1, axialFatigue: 0, compound: false, baseline: { weight: 60, reps: 12 } },

  /* ---------- Lats ---------- */
  { id: 'la-pulldown', name: 'Wide-grip lat pulldown', muscle: 'lats', profile: 'stretch', stimulus: 8, jointFatigue: 3, axialFatigue: 1, compound: true, baseline: { weight: 75, reps: 10 } },
  { id: 'la-kneeling-pulldown', name: 'Kneeling single-arm pulldown', muscle: 'lats', profile: 'stretch', stimulus: 8, jointFatigue: 2, axialFatigue: 1, compound: false, baseline: { weight: 35, reps: 10 } },
  { id: 'la-cable-pullover', name: 'Cable pullover', muscle: 'lats', profile: 'stretch', stimulus: 8, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 30, reps: 12 } },
  { id: 'la-chest-row', name: 'Chest-supported row', muscle: 'lats', profile: 'peak', stimulus: 8, jointFatigue: 2, axialFatigue: 0, compound: true, baseline: { weight: 70, reps: 10 } },
  { id: 'la-iso-row', name: 'Iso-Lateral machine row', muscle: 'lats', profile: 'peak', stimulus: 8, jointFatigue: 2, axialFatigue: 1, compound: true, baseline: { weight: 50, reps: 10 } },
  { id: 'la-bb-row', name: 'Bent-over barbell row', muscle: 'lats', profile: 'peak', stimulus: 8, jointFatigue: 4, axialFatigue: 7, compound: true, baseline: { weight: 90, reps: 8 } },

  /* ---------- Triceps ---------- */
  { id: 'tr-overhead-cable', name: 'Overhead cable triceps extension', muscle: 'triceps', profile: 'stretch', stimulus: 8, jointFatigue: 3, axialFatigue: 0, compound: false, baseline: { weight: 30, reps: 12 } },
  { id: 'tr-skull', name: 'Lying triceps extension (skullcrusher)', muscle: 'triceps', profile: 'stretch', stimulus: 7, jointFatigue: 5, axialFatigue: 0, compound: false, baseline: { weight: 35, reps: 10 } },
  { id: 'tr-pushdown', name: 'Cable triceps pushdown', muscle: 'triceps', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 35, reps: 12 } },
  { id: 'tr-kickback', name: 'Cable kickback', muscle: 'triceps', profile: 'peak', stimulus: 6, jointFatigue: 1, axialFatigue: 0, compound: false, baseline: { weight: 10, reps: 15 } },

  /* ---------- Biceps ---------- */
  { id: 'bi-incline', name: 'Incline dumbbell curl', muscle: 'biceps', profile: 'stretch', stimulus: 8, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 14, reps: 10 } },
  { id: 'bi-bayesian', name: 'Bayesian cable curl', muscle: 'biceps', profile: 'stretch', stimulus: 8, jointFatigue: 1, axialFatigue: 0, compound: false, baseline: { weight: 12.5, reps: 12 } },
  { id: 'bi-spider', name: 'Spider curl', muscle: 'biceps', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 12, reps: 12 } },
  { id: 'bi-cable-peak', name: 'Low cable curl', muscle: 'biceps', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 30, reps: 12 } },

  /* ---------- Abs ---------- */
  { id: 'ab-cable-crunch', name: 'Kneeling cable crunch', muscle: 'abs', profile: 'stretch', stimulus: 8, jointFatigue: 2, axialFatigue: 2, compound: false, baseline: { weight: 50, reps: 12 } },
  { id: 'ab-ball-crunch', name: 'Weighted stability-ball crunch', muscle: 'abs', profile: 'stretch', stimulus: 7, jointFatigue: 1, axialFatigue: 1, compound: false, baseline: { weight: 10, reps: 15 } },
  { id: 'ab-hanging', name: 'Hanging leg raise', muscle: 'abs', profile: 'peak', stimulus: 7, jointFatigue: 3, axialFatigue: 1, compound: false, baseline: { weight: 5, reps: 12 }, note: 'ankle weights' },
  { id: 'ab-machine', name: 'Machine crunch', muscle: 'abs', profile: 'peak', stimulus: 7, jointFatigue: 1, axialFatigue: 1, compound: false, baseline: { weight: 45, reps: 15 } },

  /* ---------- Quads ---------- */
  { id: 'qu-hack', name: 'Hack squat (full depth)', muscle: 'quads', profile: 'stretch', stimulus: 9, jointFatigue: 5, axialFatigue: 3, compound: true, baseline: { weight: 140, reps: 10 } },
  { id: 'qu-squat', name: 'High-bar barbell squat', muscle: 'quads', profile: 'stretch', stimulus: 9, jointFatigue: 6, axialFatigue: 9, compound: true, baseline: { weight: 110, reps: 6 } },
  { id: 'qu-bulgarian', name: 'Bulgarian split squat', muscle: 'quads', profile: 'stretch', stimulus: 8, jointFatigue: 4, axialFatigue: 3, compound: true, baseline: { weight: 24, reps: 10 } },
  { id: 'qu-sissy', name: 'Sissy squat', muscle: 'quads', profile: 'stretch', stimulus: 7, jointFatigue: 5, axialFatigue: 0, compound: false, baseline: { weight: 10, reps: 12 } },
  { id: 'qu-extension', name: 'Leg extension', muscle: 'quads', profile: 'peak', stimulus: 7, jointFatigue: 3, axialFatigue: 0, compound: false, baseline: { weight: 70, reps: 12 } },
  { id: 'qu-press-top', name: 'Leg press — top range of motion', muscle: 'quads', profile: 'peak', stimulus: 6, jointFatigue: 3, axialFatigue: 1, compound: true, baseline: { weight: 200, reps: 12 } },

  /* ---------- Hamstrings ---------- */
  { id: 'ha-rdl', name: 'Romanian deadlift (RDL)', muscle: 'hamstrings', profile: 'stretch', stimulus: 9, jointFatigue: 4, axialFatigue: 8, compound: true, baseline: { weight: 120, reps: 8 } },
  { id: 'ha-seated-curl', name: 'Seated leg curl', muscle: 'hamstrings', profile: 'stretch', stimulus: 9, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 60, reps: 10 } },
  { id: 'ha-good-morning', name: 'Good morning', muscle: 'hamstrings', profile: 'stretch', stimulus: 7, jointFatigue: 4, axialFatigue: 8, compound: true, baseline: { weight: 70, reps: 10 } },
  { id: 'ha-lying-curl', name: 'Lying leg curl', muscle: 'hamstrings', profile: 'peak', stimulus: 7, jointFatigue: 2, axialFatigue: 1, compound: false, baseline: { weight: 50, reps: 10 } },
  { id: 'ha-standing-curl', name: 'Standing single-leg curl', muscle: 'hamstrings', profile: 'peak', stimulus: 6, jointFatigue: 2, axialFatigue: 0, compound: false, baseline: { weight: 25, reps: 12 } },
]

export const EXERCISE_MAP: Record<string, ExerciseDef> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
)

export function exercisesFor(muscle: MuscleId, profile?: ResistanceProfile): ExerciseDef[] {
  return EXERCISES.filter((e) => e.muscle === muscle && (!profile || e.profile === profile))
}

