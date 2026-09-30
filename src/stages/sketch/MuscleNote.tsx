import { AnimatePresence, motion } from 'framer-motion'
import { MousePointerClick } from 'lucide-react'
import { MUSCLE_MAP } from '../../data/muscles'
import { Stepper } from '../../components/common/Stepper'
import { useI18n } from '../../i18n/useI18n'
import { cn } from '../../lib/cn'
import { isBalancedStatus } from '../../lib/volume'
import { useGallery } from '../../state/GalleryContext'
import type { MuscleId } from '../../types'

/** A note in the margin of the plate — edit the sets of the selected muscle group. */
export function MuscleNote({ muscle }: { muscle: MuscleId | null }) {
  const { state, dispatch, sketch } = useGallery()
  const i18n = useI18n()
  const { t } = i18n

  return (
    <div className="min-h-[7.5rem] flex-1">
      <AnimatePresence mode="wait">
        {!muscle ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 font-hand text-xl text-sketch-accent"
          >
            <MousePointerClick className="h-5 w-5" aria-hidden /> {t('note.hint')}
          </motion.p>
        ) : (
          <motion.div
            key={muscle}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {(() => {
              const def = MUSCLE_MAP[muscle]
              const sets = state.volume[muscle]
              const st = sketch.status[muscle]
              const meta = i18n.status(st)
              const l = def.landmarks
              const days = state.split.filter((d) => d.muscles.includes(muscle))
              return (
                <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
                  <div className="w-full sm:w-72 sm:shrink-0">
                    <p className="font-hand text-3xl leading-none text-sketch-sanguine">{i18n.muscle(muscle)}</p>
                    <p className="font-sketch text-sm italic text-sketch-faint">{def.latin}</p>
                    <p className={cn('mt-1 font-sketch text-sm', isBalancedStatus(st) ? 'text-sketch-accent' : 'text-sketch-sanguine')}>
                      {meta.label} — {meta.hint}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start">
                    <Stepper
                      value={sets}
                      onChange={(delta) => dispatch({ type: 'adjustVolume', muscle, delta })}
                      label={t('note.stepperAria', { name: i18n.muscle(muscle) })}
                      size="lg"
                      buttonClassName="border-sketch-lines/50 text-sketch-lines hover:border-sketch-sanguine hover:text-sketch-sanguine"
                      valueClassName="min-w-[2.4ch] font-hand text-5xl leading-none text-sketch-lines"
                    />
                    <span className="mt-0.5 pl-12 font-sketch text-xs text-sketch-faint">{t('note.setsPerWeek')}</span>
                  </div>
                  <dl className="grid grid-cols-4 gap-x-3 font-sketch text-xs text-sketch-accent">
                    {(
                      [
                        ['MV', l.mv],
                        ['MEV', l.mev],
                        ['MAV', `${l.mavLow}–${l.mavHigh}`],
                        ['MRV', l.mrv],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k}>
                        <dt className="tracking-widest text-sketch-faint">{k}</dt>
                        <dd className="tabular text-sm text-sketch-lines">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="w-full font-sketch text-sm text-sketch-accent">
                    {days.length === 0 ? (
                      <span className="text-sketch-sanguine">{t('note.unassigned')}</span>
                    ) : (
                      <>
                        {t('note.distribution', { n: days.length })}{' '}
                        {days.map((d, i) => (
                          <span key={d.id}>
                            {i > 0 && ' · '}
                            <span className="text-sketch-lines">{d.name}</span>{' '}
                            <span className="tabular">{sketch.perDay[d.id][muscle] ?? 0}</span>
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
