import { EXERCISE_MAP } from '../data/exercises'
import { MUSCLE_IDS } from '../data/muscles'
import { createDefaultState } from '../data/template'
import type { GalleryState, LiftBaseline, MuscleId, PigmentStroke, SplitDay, StageId } from '../types'

export const STORAGE_KEY = 'gym-gallery/state/v1'

const STAGES: StageId[] = ['sketch', 'oil', 'marble']

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const num = (v: unknown, fallback: number, min = -Infinity, max = Infinity) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback

/** Focus texts the Polish-only build used to store as literal values; they map back to the localized defaults. */
const LEGACY_FOCUS = new Set([
  'Góra — szerokość i gęstość',
  'Dół — fundament kolumn',
  'Pchanie — obręcz barkowa',
  'Ciąganie — skrzydła najszerszego',
  'Nogi — proporcja i podstawa',
  'Nowa karta szkicownika',
])

function sanitizeFocus(v: unknown): string | null {
  if (typeof v !== 'string') return null
  return LEGACY_FOCUS.has(v) ? null : v.slice(0, 60)
}

/**
 * Loads and validates state from localStorage. Corrupt or incomplete data is
 * filled in with defaults, so the app always starts correctly.
 */
export function loadState(): GalleryState {
  const defaults = createDefaultState()
  let raw: unknown
  try {
    const text = window.localStorage.getItem(STORAGE_KEY)
    if (!text) return defaults
    raw = JSON.parse(text)
  } catch {
    return defaults
  }
  if (!isObj(raw) || raw.version !== 1) return defaults

  const stage = STAGES.includes(raw.stage as StageId) ? (raw.stage as StageId) : defaults.stage

  const split: SplitDay[] = Array.isArray(raw.split)
    ? raw.split
        .filter(isObj)
        .map((d, i) => ({
          id: typeof d.id === 'string' ? d.id : `d-${i}`,
          name: typeof d.name === 'string' ? d.name.slice(0, 24).replace(/^Dzień (\d+)$/, 'Day $1') : `Day ${i + 1}`,
          focus: sanitizeFocus(d.focus),
          muscles: Array.isArray(d.muscles)
            ? (d.muscles.filter((m) => MUSCLE_IDS.includes(m as MuscleId)) as MuscleId[])
            : [],
        }))
        .slice(0, 7)
    : defaults.split

  const volume = { ...defaults.volume }
  if (isObj(raw.volume)) {
    for (const m of MUSCLE_IDS) volume[m] = Math.round(num(raw.volume[m], defaults.volume[m], 0, 40))
  }

  const pigments = { ...defaults.pigments }
  if (isObj(raw.pigments)) {
    for (const m of MUSCLE_IDS) {
      const list = raw.pigments[m]
      if (Array.isArray(list)) {
        pigments[m] = list
          .filter(isObj)
          .filter((p) => typeof p.exerciseId === 'string' && EXERCISE_MAP[p.exerciseId]?.muscle === m)
          .map((p): PigmentStroke => ({ exerciseId: p.exerciseId as string, layers: Math.round(num(p.layers, 2, 1, 3)) }))
      }
    }
  }

  const lifts: Record<string, LiftBaseline> = { ...defaults.lifts }
  if (isObj(raw.lifts)) {
    for (const [id, v] of Object.entries(raw.lifts)) {
      if (EXERCISE_MAP[id] && isObj(v)) {
        lifts[id] = { weight: num(v.weight, lifts[id].weight, 0, 1000), reps: Math.round(num(v.reps, lifts[id].reps, 1, 30)) }
      }
    }
  }

  const m = isObj(raw.measurements) ? raw.measurements : {}
  const measurements = {
    shoulders: num(m.shoulders, defaults.measurements.shoulders, 50, 200),
    waist: num(m.waist, defaults.measurements.waist, 40, 200),
  }

  const ms = isObj(raw.meso) ? raw.meso : {}
  const meso = {
    weeks: Math.round(num(ms.weeks, defaults.meso.weeks, 3, 8)),
    rampSets: Math.round(num(ms.rampSets, defaults.meso.rampSets, 0, 3)),
  }

  const deload = isObj(raw.deload) && typeof raw.deload.carvedAt === 'string' ? { carvedAt: raw.deload.carvedAt } : null

  return {
    version: 1,
    stage,
    introSeen: raw.introSeen === true,
    split: split.length ? split : defaults.split,
    volume,
    pigments,
    lifts,
    measurements,
    meso,
    deload,
  }
}

export function saveState(state: GalleryState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* private mode / no space — the app keeps working in memory */
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
