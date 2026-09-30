import { useMemo } from 'react'
import { EXERCISE_MAP } from '../../data/exercises'
import { MUSCLE_MAP } from '../../data/muscles'
import { useI18n } from '../../i18n/useI18n'
import { PIGMENT_LAYERS } from '../../components/anatomy/paint'
import { buildWeekSchedule } from '../../lib/schedule'
import { useGallery } from '../../state/GalleryContext'

/** Week composition — how the pigments arrange themselves into concrete sessions. */
export function WeekComposition() {
  const { state } = useGallery()
  const i18n = useI18n()
  const { t } = i18n
  const plan = useMemo(() => buildWeekSchedule(state.split, state.volume, state.pigments), [state.split, state.volume, state.pigments])

  return (
    <section className="oil-card p-4 sm:p-5" aria-labelledby="composition-title">
      <h2 id="composition-title" className="font-oil text-2xl text-oil-cream">
        {t('week.title')}
      </h2>
      <p className="font-body text-base italic text-oil-cream/55">
        {t('week.hint')}
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {plan.map(({ day, items, totalSets }) => (
          <article key={day.id} className="rounded-sm border border-oil-gold/15 bg-black/20 p-3">
            <header className="flex items-baseline justify-between gap-2 border-b border-oil-gold/15 pb-1.5">
              <h3 className="font-oil text-lg italic text-oil-ochre">{day.name}</h3>
              <span className="font-mono text-[11px] text-oil-cream/50">{t('week.setsTotal', { n: totalSets })}</span>
            </header>
            {items.length === 0 ? (
              <p className="pt-2 font-body text-sm italic text-oil-cream/40">{t('week.empty')}</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {items.map((it) => {
                  const ex = EXERCISE_MAP[it.exerciseId]
                  const colors = PIGMENT_LAYERS[MUSCLE_MAP[it.muscle].hue]
                  return (
                    <li key={`${it.exerciseId}`} className="flex items-start gap-2 font-body text-[15px] leading-snug text-oil-cream/80">
                      <span
                        className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: colors[1], boxShadow: ex.profile === 'peak' ? `0 0 0 2px ${colors[0]}40` : undefined }}
                        title={i18n.profile(ex.profile).tip}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">{i18n.exercise(it.exerciseId)}</span>
                      <span className="shrink-0 pt-0.5 font-mono text-xs text-oil-cream/55">
                        {it.sets}×{state.lifts[it.exerciseId]?.reps ?? ex.baseline.reps}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
