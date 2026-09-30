import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Provenance } from './components/common/Provenance'
import { ChiselTransition } from './components/transitions/ChiselTransition'
import { IntroOverlay } from './components/transitions/IntroOverlay'
import { PaintTransition } from './components/transitions/PaintTransition'
import { useI18n } from './i18n/useI18n'
import { cn } from './lib/cn'
import { useGallery } from './state/GalleryContext'
import { MarbleStage } from './stages/marble/MarbleStage'
import { OilStage } from './stages/oil/OilStage'
import { SketchStage } from './stages/sketch/SketchStage'
import type { StageId, TransitionKind } from './types'

const TEXTURE: Record<StageId, string> = {
  sketch: 'tex-parchment',
  oil: 'tex-oil',
  marble: 'tex-marble-hall',
}

const BODY_BG: Record<StageId, string> = {
  sketch: '#e9dcbc',
  oil: '#16110e',
  marble: '#0b0c10',
}

const FOOTER: Record<StageId, string> = {
  sketch: 'text-sketch-faint font-sketch',
  oil: 'text-oil-cream/35 font-body',
  marble: 'text-marble-chisel/35 font-body',
}

export default function App() {
  const { state, dispatch, sketch, canvas } = useGallery()
  const { t } = useI18n()
  const reduced = useReducedMotion() ?? false
  const [transition, setTransition] = useState<TransitionKind | null>(null)

  const unlocked: Record<StageId, boolean> = {
    sketch: true,
    oil: sketch.balanced,
    marble: sketch.balanced && canvas.balanced,
  }

  useEffect(() => {
    document.body.style.background = BODY_BG[state.stage]
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', BODY_BG[state.stage])
  }, [state.stage])

  const handleCovered = () => {
    dispatch({ type: 'setStage', stage: transition === 'paint' ? 'oil' : 'marble' })
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }

  const navigate = (stage: StageId) => {
    if (!unlocked[stage] || transition) return
    dispatch({ type: 'setStage', stage })
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }

  const advance = (kind: TransitionKind) => {
    if (transition) return
    setTransition(kind)
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {!state.introSeen && <IntroOverlay key="intro" onBegin={() => dispatch({ type: 'finishIntro' })} />}
      </AnimatePresence>

      {state.introSeen && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={state.stage}
            className={cn('min-h-dvh', TEXTURE[state.stage])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transition ? 0.05 : 0.35 }}
          >
            <Provenance
              stage={state.stage}
              unlocked={unlocked}
              onNavigate={navigate}
              onReset={() => dispatch({ type: 'resetAll' })}
            />
            {state.stage === 'sketch' && <SketchStage onAdvance={() => advance('paint')} />}
            {state.stage === 'oil' && <OilStage onAdvance={() => advance('chisel')} />}
            {state.stage === 'marble' && <MarbleStage />}
            <footer className={cn('mx-auto max-w-7xl px-4 pb-8 text-sm sm:px-6', FOOTER[state.stage])}>
              {t('app.footer')}
            </footer>
          </motion.div>
        </AnimatePresence>
      )}

      {transition === 'paint' && (
        <PaintTransition reduced={reduced} onCovered={handleCovered} onDone={() => setTransition(null)} />
      )}
      {transition === 'chisel' && (
        <ChiselTransition reduced={reduced} onCovered={handleCovered} onDone={() => setTransition(null)} />
      )}
    </MotionConfig>
  )
}
