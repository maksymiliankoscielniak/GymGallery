import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { SketchPlate } from '../../components/anatomy/SketchPlate'
import { Seal } from '../../components/common/Seal'
import { StageHeading } from '../../components/common/StageHeading'
import { useI18n } from '../../i18n/useI18n'
import { sessionFlags } from '../../lib/session'
import { useGallery } from '../../state/GalleryContext'
import type { MuscleId } from '../../types'
import { MuscleNote } from './MuscleNote'
import { SplitEditor } from './SplitEditor'
import { VolumeLedger } from './VolumeLedger'

export function SketchStage({ onAdvance }: { onAdvance: () => void }) {
  const { state, sketch } = useGallery()
  const { t } = useI18n()
  const [selected, setSelected] = useState<MuscleId | null>('shoulders')
  const reduced = useReducedMotion()
  // pencil animation once per session; with reduced motion the plate appears at once
  const [drawIn] = useState(() => !sessionFlags.sketchDrawn && !reduced)
  const [drawn, setDrawn] = useState(!drawIn)

  useEffect(() => {
    sessionFlags.sketchDrawn = true
    if (!drawIn) return
    const id = window.setTimeout(() => setDrawn(true), 3200)
    return () => window.clearTimeout(id)
  }, [drawIn])

  const select = (m: MuscleId) => setSelected((cur) => (cur === m ? null : m))

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <StageHeading stage="sketch" numeral="I" title={t('sketch.title')} subtitle={t('sketch.subtitle')}>
        {t('sketch.intro')}
      </StageHeading>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section className="sketch-card p-3 sm:p-5" aria-label={t('sketch.plate')}>
          <SketchPlate volume={state.volume} status={sketch.status} selected={selected} onSelect={select} drawIn={drawIn} />
          <div className="mt-2 flex flex-col items-stretch gap-6 border-t border-dashed border-sketch-lines/30 pt-4 sm:flex-row sm:items-center">
            <MuscleNote muscle={selected} />
            <div className="flex shrink-0 flex-col items-center justify-center sm:w-44">
              <AnimatePresence mode="wait">
                {sketch.balanced && drawn ? (
                  <Seal key="seal" onActivate={onAdvance} />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-36 w-36 flex-col items-center justify-center rounded-full border border-dashed border-sketch-lines/40 p-4 text-center"
                  >
                    <span className="font-hand text-lg leading-tight text-sketch-accent">
                      {drawn ? t('sketch.sealWaiting') : t('sketch.drawing')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {!sketch.balanced && drawn && (
            <ul className="mt-4 space-y-1 font-sketch text-sm text-sketch-sanguine" aria-live="polite">
              {sketch.issues.slice(0, 4).map((issue, i) => (
                <li key={i}>✎ {issue.message}</li>
              ))}
              {sketch.issues.length > 4 && <li className="text-sketch-accent">{t('sketch.moreIssues', { n: sketch.issues.length - 4 })}</li>}
            </ul>
          )}
        </section>

        <VolumeLedger selected={selected} onSelect={select} />
      </div>

      <div className="mt-6">
        <SplitEditor />
      </div>
    </main>
  )
}
