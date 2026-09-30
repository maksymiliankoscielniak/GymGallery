import { AnimatePresence, motion } from 'framer-motion'
import { Check, Plus, Wand2, X } from 'lucide-react'
import { EXERCISE_MAP, PROFILE_LABEL, exercisesFor } from '../../data/exercises'
import { MUSCLES, MUSCLE_MAP } from '../../data/muscles'
import { PIGMENT_LAYERS, paintStateFor } from '../../components/anatomy/paint'
import { LandmarkBar } from '../../components/common/LandmarkBar'
import { Stepper } from '../../components/common/Stepper'
import { cn } from '../../lib/cn'
import { exerciseSfr, sfrGrade } from '../../lib/sfr'
import { STATUS_META, isBalancedStatus, volumeStatus } from '../../lib/volume'
import { useGallery } from '../../state/GalleryContext'
import type { ExerciseDef, MuscleId, ResistanceProfile } from '../../types'

interface PigmentPaletteProps {
  selected: MuscleId
  onSelect: (m: MuscleId) => void
}

const GRADE_TEXT = {
  costly: 'text-[#e0786c]',
  balanced: 'text-oil-ochre',
  efficient: 'text-[#86b5a8]',
} as const

function Dots({ value, label }: { value: number; label: string }) {
  const filled = Math.round(value / 2)
  return (
    <span className="inline-flex items-center gap-1" title={`${label}: ${value}/10`}>
      <span className="font-mono text-[9px] uppercase text-oil-cream/40">{label}</span>
      <span className="inline-flex gap-[2px]" aria-label={`${label} ${value} na 10`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={cn('h-1.5 w-1.5 rounded-full', i < filled ? 'bg-oil-cream/70' : 'bg-oil-cream/12')} />
        ))}
      </span>
    </span>
  )
}

/** Paleta pigmentów — dobór ćwiczeń według profilu krzywej oporu. */
export function PigmentPalette({ selected, onSelect }: PigmentPaletteProps) {
  const { state, dispatch, canvas } = useGallery()
  const def = MUSCLE_MAP[selected]
  const sets = state.volume[selected]
  const st = volumeStatus(selected, sets)
  const strokes = state.pigments[selected]
  const muscleCanvas = canvas.perMuscle[selected]
  const setsById = Object.fromEntries(muscleCanvas.sets.map((s) => [s.exerciseId, s.sets]))
  const missing = MUSCLES.filter((m) => !canvas.perMuscle[m.id].hasStretch || !canvas.perMuscle[m.id].hasPeak).length

  const renderExercise = (ex: ExerciseDef) => {
    const stroke = strokes.find((s) => s.exerciseId === ex.id)
    const active = Boolean(stroke)
    const sfr = exerciseSfr(ex)
    const grade = sfrGrade(sfr)
    const colors = PIGMENT_LAYERS[def.hue]
    const full = !active && strokes.length >= 4
    return (
      <li key={ex.id}>
        <div
          className={cn(
            'rounded-sm border px-2.5 py-2 transition-colors',
            active ? 'border-oil-gold/45 bg-[rgba(201,154,46,0.08)]' : 'border-oil-cream/10 hover:border-oil-cream/25',
          )}
        >
          <div className="flex items-start gap-2">
            <button
              type="button"
              disabled={full}
              onClick={() =>
                dispatch(active ? { type: 'removePigment', muscle: selected, exerciseId: ex.id } : { type: 'addPigment', muscle: selected, exerciseId: ex.id })
              }
              aria-pressed={active}
              aria-label={active ? `Usuń pigment: ${ex.name}` : `Dodaj pigment: ${ex.name}`}
              className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-oil-cream/25 transition-transform hover:scale-110 disabled:opacity-30"
              style={{
                background: active ? `radial-gradient(circle at 35% 30%, ${colors[0]}, ${colors[1]} 55%, ${colors[2]})` : 'transparent',
              }}
              title={full ? 'Maksymalnie 4 pigmenty na partię' : undefined}
            >
              {active ? <Check className="h-3.5 w-3.5 text-oil-cream" aria-hidden /> : <Plus className="h-3.5 w-3.5 text-oil-cream/60" aria-hidden />}
            </button>
            <div className="min-w-0 flex-1">
              <p className={cn('font-body text-[15px] font-semibold leading-snug', active ? 'text-oil-cream' : 'text-oil-cream/70')}>
                {ex.name}
                {ex.note && <span className="ml-1 text-xs font-medium italic text-oil-cream/45">({ex.note})</span>}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={cn('font-mono text-[11px]', GRADE_TEXT[grade])}>SFR {sfr.toFixed(2)}</span>
                <Dots value={ex.jointFatigue} label="staw" />
                <Dots value={ex.axialFatigue} label="oś" />
              </div>
            </div>
            {active && (
              <span className="shrink-0 text-right font-mono text-xs text-oil-ochre">
                <span className="text-base tabular">{setsById[ex.id] ?? 0}</span>
                <span className="block text-[9px] uppercase tracking-wider text-oil-cream/40">serii</span>
              </span>
            )}
          </div>
          {active && stroke && (
            <div className="mt-2 flex items-center gap-2 pl-9">
              <span className="font-body text-xs italic text-oil-cream/50">grubość warstwy</span>
              <div className="flex gap-1" role="radiogroup" aria-label={`Udział ${ex.name} w objętości`}>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={stroke.layers === n}
                    aria-label={`${n} z 3`}
                    onClick={() => dispatch({ type: 'setPigmentLayers', muscle: selected, exerciseId: ex.id, layers: n })}
                    className={cn(
                      'h-3 rounded-full border border-oil-gold/50 transition-all',
                      n <= stroke.layers ? 'bg-oil-gold' : 'bg-transparent',
                    )}
                    style={{ width: 10 + n * 4 }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </li>
    )
  }

  const column = (profile: ResistanceProfile) => {
    const has = profile === 'stretch' ? muscleCanvas.hasStretch : muscleCanvas.hasPeak
    const n = profile === 'stretch' ? muscleCanvas.stretchSets : muscleCanvas.peakSets
    return (
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h4 className="font-oil text-base text-oil-cream">
            {PROFILE_LABEL[profile].title}
            <span className="ml-1.5 font-body text-sm italic text-oil-cream/45">{PROFILE_LABEL[profile].subtitle}</span>
          </h4>
          <span className={cn('shrink-0 font-mono text-[11px]', has ? 'text-oil-cream/55' : 'text-[#e0786c]')}>
            {has ? `${n} serii` : 'brak pigmentu'}
          </span>
        </div>
        <ul className="flex flex-col gap-1.5">{exercisesFor(selected, profile).map(renderExercise)}</ul>
      </div>
    )
  }

  return (
    <section className="oil-card p-4 sm:p-5" aria-labelledby="palette-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="palette-title" className="font-oil text-2xl text-oil-cream">
            Paleta pigmentów
          </h2>
          <p className="font-body text-base italic text-oil-cream/55">Każda partia potrzebuje obu krzywych oporu.</p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'autoCompose' })}
          disabled={missing === 0}
          className="flex items-center gap-1.5 rounded-full border border-oil-gold/40 px-3 py-1.5 font-body text-sm font-semibold text-oil-ochre transition-colors hover:bg-oil-gold/10 disabled:opacity-35"
        >
          <Wand2 className="h-4 w-4" aria-hidden /> Dobierz brakujące pigmenty
          {missing > 0 && <span className="rounded-full bg-oil-gold/20 px-1.5 font-mono text-[10px]">{missing}</span>}
        </button>
      </div>

      {/* wybór partii — plamy farby */}
      <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Partia mięśniowa">
        {MUSCLES.map((m) => {
          const paint = paintStateFor(m.id, state.volume[m.id])
          const colors = PIGMENT_LAYERS[m.hue]
          const pm = canvas.perMuscle[m.id]
          const ok = pm.hasStretch && pm.hasPeak && isBalancedStatus(volumeStatus(m.id, state.volume[m.id]))
          const isSel = m.id === selected
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={isSel}
              onClick={() => onSelect(m.id)}
              className={cn(
                'group flex shrink-0 flex-col items-center gap-1 rounded-sm px-2 py-1.5 transition-colors',
                isSel ? 'bg-oil-cream/8' : 'hover:bg-oil-cream/5',
              )}
            >
              <span
                className={cn('relative h-9 w-9 rounded-[45%_55%_50%_50%] border transition-transform group-hover:scale-105', isSel ? 'border-oil-ochre' : 'border-oil-cream/15')}
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${colors[0]}, ${colors[1]} 55%, ${colors[2]})`,
                  opacity: paint.layers === 0 ? 0.2 : paint.layers === 1 ? 0.45 : 1,
                  filter: paint.darken > 0 ? `brightness(${1 - paint.darken * 0.7})` : undefined,
                }}
              >
                <span
                  className={cn(
                    'absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border text-[9px]',
                    ok ? 'border-oil-gold/60 bg-oil-bg text-oil-ochre' : 'border-[#e0786c]/60 bg-oil-bg text-[#e0786c]',
                  )}
                  aria-hidden
                >
                  {ok ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                </span>
              </span>
              <span className={cn('font-body text-xs font-semibold', isSel ? 'text-oil-ochre' : 'text-oil-cream/60')}>{m.short}</span>
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mt-4"
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-oil-gold/15 py-3">
            <div className="min-w-0">
              <h3 className="font-oil text-xl italic text-oil-cream">{def.name}</h3>
              <p className={cn('font-body text-sm', isBalancedStatus(st) ? 'text-oil-cream/55' : 'text-[#e0786c]')}>
                {STATUS_META[st].label} · SFR partii {muscleCanvas.sfr ? muscleCanvas.sfr.toFixed(2) : '—'}
              </p>
            </div>
            <Stepper
              value={sets}
              onChange={(delta) => dispatch({ type: 'adjustVolume', muscle: selected, delta })}
              label={`${def.name} — tygodniowa objętość`}
              buttonClassName="border-oil-gold/40 text-oil-ochre hover:bg-oil-gold/10"
              valueClassName="font-oil text-3xl text-oil-cream"
            />
            <LandmarkBar muscle={selected} sets={sets} tone="oil" className="min-w-[12rem] flex-1" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {column('stretch')}
            {column('peak')}
          </div>
          {strokes.length > 0 && (
            <p className="mt-3 font-body text-sm italic text-oil-cream/45">
              Nałożone: {strokes.map((s) => EXERCISE_MAP[s.exerciseId]?.name).filter(Boolean).join(' · ')}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
