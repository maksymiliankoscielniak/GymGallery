import { EXERCISE_MAP } from '../data/exercises'
import { MUSCLE_MAP } from '../data/muscles'
import type { SfrGrade } from '../lib/sfr'
import type { MuscleId, ResistanceProfile, SplitDay, VolumeStatus } from '../types'
import { en, type MessageKey } from './messages.en'
import { pl, plExercises, plMuscles } from './messages.pl'

export type Lang = 'en' | 'pl'
export const LANGS: Array<{ code: Lang; name: string }> = [
  { code: 'en', name: 'English' },
  { code: 'pl', name: 'Polski' },
]
export const DEFAULT_LANG: Lang = 'en'

export type Params = Record<string, string | number>

/** Everything the UI and the pure `lib` analyses need to speak the current language. */
export interface I18n {
  lang: Lang
  t: (key: MessageKey, params?: Params) => string
  muscle: (id: MuscleId) => string
  muscleShort: (id: MuscleId) => string
  exercise: (id: string) => string
  exerciseNote: (id: string) => string | undefined
  status: (s: VolumeStatus) => { label: string; hint: string }
  grade: (g: SfrGrade) => string
  profile: (p: ResistanceProfile) => { title: string; subtitle: string; tip: string }
  /** Session theme of a split day; falls back to the localized template default. */
  dayFocus: (day: SplitDay) => string
  /** Localized week label: W1 / T1. */
  weekLabel: (n: number) => string
}

const interpolate = (template: string, params?: Params) =>
  params ? template.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m)) : template

export function isLang(v: unknown): v is Lang {
  return v === 'en' || v === 'pl'
}

export function createI18n(lang: Lang): I18n {
  const dict: Record<MessageKey, string> = lang === 'pl' ? pl : en
  const t = (key: MessageKey, params?: Params) => interpolate(dict[key] ?? en[key] ?? key, params)
  const has = (key: string): key is MessageKey => key in en

  return {
    lang,
    t,
    muscle: (id) => (lang === 'pl' ? plMuscles[id].name : MUSCLE_MAP[id].name),
    muscleShort: (id) => (lang === 'pl' ? plMuscles[id].short : MUSCLE_MAP[id].short),
    exercise: (id) => (lang === 'pl' ? (plExercises[id]?.name ?? EXERCISE_MAP[id]?.name ?? id) : (EXERCISE_MAP[id]?.name ?? id)),
    exerciseNote: (id) => (lang === 'pl' ? plExercises[id]?.note : EXERCISE_MAP[id]?.note),
    status: (s) => ({ label: t(`status.${s}.label` as MessageKey), hint: t(`status.${s}.hint` as MessageKey) }),
    grade: (g) => t(`grade.${g}` as MessageKey),
    profile: (p) => ({
      title: t(`profile.${p}.title` as MessageKey),
      subtitle: t(`profile.${p}.subtitle` as MessageKey),
      tip: t(`profile.${p}.tip` as MessageKey),
    }),
    dayFocus: (day) => {
      if (day.focus !== null) return day.focus
      const key = `split.focus.${day.id}`
      return t(has(key) ? key : 'split.focus.new')
    },
    weekLabel: (n) => t('week.short', { n }),
  }
}
