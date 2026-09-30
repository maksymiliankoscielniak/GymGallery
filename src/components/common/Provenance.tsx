import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { cn } from '../../lib/cn'
import type { StageId } from '../../types'
import { LanguageSwitch } from './LanguageSwitch'

interface ProvenanceProps {
  stage: StageId
  unlocked: Record<StageId, boolean>
  onNavigate: (stage: StageId) => void
  onReset: () => void
}

const STAGES: Array<{ id: StageId; numeral: string }> = [
  { id: 'sketch', numeral: 'I' },
  { id: 'oil', numeral: 'II' },
  { id: 'marble', numeral: 'III' },
]

const TONE: Record<StageId, { wrap: string; mark: string; active: string; idle: string; locked: string; reset: string }> = {
  sketch: {
    wrap: 'text-sketch-lines',
    mark: 'font-hand text-2xl',
    active: 'text-sketch-sanguine',
    idle: 'text-sketch-accent hover:text-sketch-lines',
    locked: 'text-sketch-faint/50',
    reset: 'border-sketch-lines/40 text-sketch-accent hover:text-sketch-sanguine',
  },
  oil: {
    wrap: 'text-oil-cream',
    mark: 'font-oil italic text-xl',
    active: 'text-oil-ochre',
    idle: 'text-oil-cream/60 hover:text-oil-cream',
    locked: 'text-oil-cream/20',
    reset: 'border-oil-gold/30 text-oil-cream/60 hover:text-oil-ochre',
  },
  marble: {
    wrap: 'text-marble-white',
    mark: 'font-marble text-base tracking-[0.3em]',
    active: 'text-marble-kintsugi',
    idle: 'text-marble-chisel/55 hover:text-marble-white',
    locked: 'text-marble-chisel/20',
    reset: 'border-marble-chisel/15 text-marble-chisel/55 hover:text-marble-kintsugi',
  },
}

/**
 * The work's “provenance” — a signature and numbered stages instead of classic tabs.
 * Lets you go back to an earlier stage; later ones unlock once the plan is balanced.
 */
export function Provenance({ stage, unlocked, onNavigate, onReset }: ProvenanceProps) {
  const t = TONE[stage]
  const { t: tr } = useI18n()
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!confirming) return
    const id = window.setTimeout(() => setConfirming(false), 4000)
    return () => window.clearTimeout(id)
  }, [confirming])

  return (
    <header className={cn('relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6', t.wrap)}>
      <div className={cn('leading-none', t.mark)}>
        Gym Gallery
      </div>

      <nav aria-label={tr('nav.stages')} className="flex items-center gap-1 sm:gap-3">
        {STAGES.map((s, i) => {
          const isActive = s.id === stage
          const enabled = unlocked[s.id]
          const name = tr(`nav.stage.${s.id}` as 'nav.stage.sketch')
          return (
            <div key={s.id} className="flex items-center gap-1 sm:gap-3">
              {i > 0 && <span className="h-px w-3 bg-current opacity-30 sm:w-6" aria-hidden />}
              <button
                type="button"
                disabled={!enabled || isActive}
                onClick={() => onNavigate(s.id)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={tr('nav.stageAria', { numeral: s.numeral, name })}
                className={cn(
                  'relative flex items-baseline gap-1.5 rounded px-1 py-0.5 text-sm transition-colors disabled:cursor-default',
                  isActive ? t.active : enabled ? t.idle : t.locked,
                )}
                title={enabled ? tr('nav.stageAria', { numeral: s.numeral, name }) : tr('nav.locked', { numeral: s.numeral })}
              >
                <span className={cn(stage === 'marble' ? 'font-marble' : stage === 'oil' ? 'font-oil' : 'font-sketch', 'text-base')}>
                  {s.numeral}
                </span>
                <span className="hidden sm:inline">{name}</span>
                {isActive && (
                  <motion.span layoutId="provenance-underline" className="absolute -bottom-1 left-0 right-0 h-px bg-current" />
                )}
              </button>
            </div>
          )
        })}
      </nav>

      <div className="relative flex items-center gap-2">
        <LanguageSwitch tone={stage} />
        <button
          type="button"
          onClick={() => (confirming ? (setConfirming(false), onReset()) : setConfirming(true))}
          className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors', t.reset)}
          aria-label={confirming ? tr('nav.resetConfirmAria') : tr('nav.reset')}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={confirming ? 'c' : 'n'}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="hidden sm:inline"
            >
              {confirming ? tr('nav.resetConfirm') : tr('nav.reset')}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </header>
  )
}
