import { EXERCISE_MAP } from '../data/exercises'
import { createDefaultState, createVTaperSplit, createDefaultVolume } from '../data/template'
import { autoCompose } from '../lib/sfr'
import { MAX_SETS_PER_MUSCLE } from '../lib/volume'
import type { GalleryState, LiftBaseline, Measurements, MesocycleSettings, MuscleId, StageId } from '../types'

export type GalleryAction =
  | { type: 'setStage'; stage: StageId }
  | { type: 'finishIntro' }
  | { type: 'setVolume'; muscle: MuscleId; sets: number }
  | { type: 'adjustVolume'; muscle: MuscleId; delta: number }
  | { type: 'toggleDayMuscle'; dayId: string; muscle: MuscleId }
  | { type: 'renameDay'; dayId: string; name: string }
  | { type: 'setDayFocus'; dayId: string; focus: string }
  | { type: 'addDay' }
  | { type: 'removeDay'; dayId: string }
  | { type: 'resetTemplate' }
  | { type: 'addPigment'; muscle: MuscleId; exerciseId: string }
  | { type: 'removePigment'; muscle: MuscleId; exerciseId: string }
  | { type: 'setPigmentLayers'; muscle: MuscleId; exerciseId: string; layers: number }
  | { type: 'autoCompose' }
  | { type: 'setLift'; exerciseId: string; lift: Partial<LiftBaseline> }
  | { type: 'setMeasurements'; measurements: Partial<Measurements> }
  | { type: 'setMeso'; meso: Partial<MesocycleSettings> }
  | { type: 'carveDeload' }
  | { type: 'restoreDeload' }
  | { type: 'resetAll' }

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

let dayCounter = 0
const newDayId = () => `d-${Date.now().toString(36)}-${(dayCounter++).toString(36)}`

/** Każda zmiana planu unieważnia wcześniej wykuty deload. */
const invalidateDeload = (s: GalleryState): GalleryState => (s.deload ? { ...s, deload: null } : s)

export function galleryReducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case 'setStage':
      return { ...state, stage: action.stage }

    case 'finishIntro':
      return { ...state, introSeen: true }

    case 'setVolume':
      return invalidateDeload({
        ...state,
        volume: { ...state.volume, [action.muscle]: clamp(Math.round(action.sets), 0, MAX_SETS_PER_MUSCLE) },
      })

    case 'adjustVolume':
      return invalidateDeload({
        ...state,
        volume: {
          ...state.volume,
          [action.muscle]: clamp(state.volume[action.muscle] + action.delta, 0, MAX_SETS_PER_MUSCLE),
        },
      })

    case 'toggleDayMuscle':
      return invalidateDeload({
        ...state,
        split: state.split.map((d) =>
          d.id !== action.dayId
            ? d
            : {
                ...d,
                muscles: d.muscles.includes(action.muscle)
                  ? d.muscles.filter((m) => m !== action.muscle)
                  : [...d.muscles, action.muscle],
              },
        ),
      })

    case 'renameDay':
      return {
        ...state,
        split: state.split.map((d) => (d.id === action.dayId ? { ...d, name: action.name.slice(0, 24) } : d)),
      }

    case 'setDayFocus':
      return {
        ...state,
        split: state.split.map((d) => (d.id === action.dayId ? { ...d, focus: action.focus.slice(0, 60) } : d)),
      }

    case 'addDay':
      if (state.split.length >= 7) return state
      return invalidateDeload({
        ...state,
        split: [...state.split, { id: newDayId(), name: `Dzień ${state.split.length + 1}`, focus: 'Nowa karta szkicownika', muscles: [] }],
      })

    case 'removeDay':
      if (state.split.length <= 2) return state
      return invalidateDeload({ ...state, split: state.split.filter((d) => d.id !== action.dayId) })

    case 'resetTemplate':
      return invalidateDeload({ ...state, split: createVTaperSplit(), volume: createDefaultVolume() })

    case 'addPigment': {
      const ex = EXERCISE_MAP[action.exerciseId]
      const current = state.pigments[action.muscle]
      if (!ex || ex.muscle !== action.muscle || current.some((p) => p.exerciseId === action.exerciseId)) return state
      if (current.length >= 4) return state
      return invalidateDeload({
        ...state,
        pigments: { ...state.pigments, [action.muscle]: [...current, { exerciseId: action.exerciseId, layers: 2 }] },
      })
    }

    case 'removePigment':
      return invalidateDeload({
        ...state,
        pigments: {
          ...state.pigments,
          [action.muscle]: state.pigments[action.muscle].filter((p) => p.exerciseId !== action.exerciseId),
        },
      })

    case 'setPigmentLayers':
      return invalidateDeload({
        ...state,
        pigments: {
          ...state.pigments,
          [action.muscle]: state.pigments[action.muscle].map((p) =>
            p.exerciseId === action.exerciseId ? { ...p, layers: clamp(Math.round(action.layers), 1, 3) } : p,
          ),
        },
      })

    case 'autoCompose':
      return invalidateDeload({ ...state, pigments: autoCompose(state.pigments) })

    case 'setLift': {
      const prev = state.lifts[action.exerciseId] ?? EXERCISE_MAP[action.exerciseId]?.baseline
      if (!prev) return state
      const weight = action.lift.weight !== undefined ? clamp(action.lift.weight, 0, 1000) : prev.weight
      const reps = action.lift.reps !== undefined ? clamp(Math.round(action.lift.reps), 1, 30) : prev.reps
      return { ...state, lifts: { ...state.lifts, [action.exerciseId]: { weight, reps } } }
    }

    case 'setMeasurements':
      return { ...state, measurements: { ...state.measurements, ...action.measurements } }

    case 'setMeso':
      return {
        ...state,
        meso: {
          weeks: clamp(action.meso.weeks ?? state.meso.weeks, 3, 8),
          rampSets: clamp(action.meso.rampSets ?? state.meso.rampSets, 0, 3),
        },
      }

    case 'carveDeload':
      return { ...state, deload: { carvedAt: new Date().toISOString() } }

    case 'restoreDeload':
      return { ...state, deload: null }

    case 'resetAll':
      return { ...createDefaultState(), introSeen: true }

    default:
      return state
  }
}
