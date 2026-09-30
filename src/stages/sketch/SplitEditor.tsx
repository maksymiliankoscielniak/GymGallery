import { AnimatePresence, motion } from 'framer-motion'
import { Plus, RotateCcw, X } from 'lucide-react'
import { MUSCLES } from '../../data/muscles'
import { TEMPLATE_NAME } from '../../data/template'
import { cn } from '../../lib/cn'
import { SESSION_MUSCLE_CAP, SESSION_TOTAL_CAP } from '../../lib/volume'
import { useGallery } from '../../state/GalleryContext'

/** Kreator podziału — karty tygodnia jak strony szkicownika. */
export function SplitEditor() {
  const { state, dispatch, sketch } = useGallery()
  const { split } = state

  return (
    <section className="sketch-card p-4 sm:p-5" aria-labelledby="split-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="split-title" className="font-hand text-3xl text-sketch-lines">
            Kreator podziału
          </h2>
          <p className="font-sketch text-sm italic text-sketch-accent">
            Szablon: <span className="not-italic text-sketch-lines">{TEMPLATE_NAME}</span> — nazwy, dni i partie są edytowalne.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {split.length < 7 && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'addDay' })}
              className="flex items-center gap-1.5 rounded-full border border-sketch-lines/40 px-3 py-1 font-sketch text-sm text-sketch-accent transition-colors hover:border-sketch-sanguine hover:text-sketch-sanguine"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden /> Dodaj dzień
            </button>
          )}
        <button
          type="button"
          onClick={() => dispatch({ type: 'resetTemplate' })}
          className="flex items-center gap-1.5 rounded-full border border-sketch-lines/40 px-3 py-1 font-sketch text-sm text-sketch-accent transition-colors hover:border-sketch-sanguine hover:text-sketch-sanguine"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Przywróć szablon
        </button>
        </div>
      </div>
      <div className="sketch-rule my-3 opacity-60" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <AnimatePresence initial={false}>
          {split.map((day, idx) => {
            const total = sketch.sessionTotals[day.id] ?? 0
            const overloaded = total > SESSION_TOTAL_CAP
            return (
              <motion.article
                key={day.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative flex flex-col rounded-sm border border-sketch-lines/30 bg-[rgba(250,244,226,0.55)] p-3"
                style={{ rotate: `${((idx % 3) - 1) * 0.35}deg` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-sketch text-[11px] uppercase tracking-[0.2em] text-sketch-faint">Dzień {idx + 1}</span>
                    <input
                      value={day.name}
                      onChange={(e) => dispatch({ type: 'renameDay', dayId: day.id, name: e.target.value })}
                      aria-label={`Nazwa dnia ${idx + 1}`}
                      className="ink-input block w-full font-hand text-2xl leading-tight text-sketch-lines"
                    />
                    <input
                      value={day.focus}
                      onChange={(e) => dispatch({ type: 'setDayFocus', dayId: day.id, focus: e.target.value })}
                      aria-label={`Motyw dnia ${idx + 1}`}
                      placeholder="motyw sesji"
                      className="ink-input mt-0.5 block w-full font-sketch text-xs italic text-sketch-accent"
                    />
                  </div>
                  {split.length > 2 && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'removeDay', dayId: day.id })}
                      aria-label={`Usuń dzień ${day.name}`}
                      className="rounded-full p-1 text-sketch-faint transition-colors hover:text-sketch-sanguine"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </div>

                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Partie w dniu ${day.name}`}>
                  {MUSCLES.map((m) => {
                    const on = day.muscles.includes(m.id)
                    const n = sketch.perDay[day.id]?.[m.id] ?? 0
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => dispatch({ type: 'toggleDayMuscle', dayId: day.id, muscle: m.id })}
                          className={cn(
                            'rounded-full border px-2 py-0.5 font-sketch text-xs transition-colors',
                            on
                              ? 'border-sketch-lines/70 bg-sketch-lines/85 text-sketch-paper'
                              : 'border-dashed border-sketch-lines/35 text-sketch-faint hover:border-sketch-lines/70 hover:text-sketch-lines',
                            on && n > SESSION_MUSCLE_CAP && 'border-sketch-sanguine bg-sketch-sanguine',
                          )}
                        >
                          {m.short}
                          {on && <span className="ml-1 tabular opacity-80">{n}</span>}
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <p className={cn('mt-auto pt-3 font-sketch text-sm', overloaded ? 'text-sketch-sanguine' : 'text-sketch-accent')}>
                  <span className="tabular font-hand text-xl">{total}</span> serii w sesji
                  {overloaded && ' — przeładowana'}
                </p>
              </motion.article>
            )
          })}
        </AnimatePresence>

      </div>

      {sketch.warnings.length > 0 && (
        <ul className="mt-4 space-y-1 font-sketch text-sm text-sketch-accent">
          {sketch.warnings.slice(0, 5).map((w, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-hand text-sketch-sanguine" aria-hidden>
                ✎
              </span>
              {w.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
