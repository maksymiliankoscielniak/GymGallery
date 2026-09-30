import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { StageId } from '../../types'

interface StageHeadingProps {
  stage: StageId
  numeral: string
  title: string
  subtitle: string
  children?: ReactNode
}

const STYLES: Record<StageId, { numeral: string; title: string; subtitle: string; body: string }> = {
  sketch: {
    numeral: 'font-sketch text-sketch-sanguine',
    title: 'font-hand text-5xl sm:text-6xl text-sketch-lines',
    subtitle: 'font-sketch italic text-sketch-accent',
    body: 'font-sketch text-sketch-accent',
  },
  oil: {
    numeral: 'font-oil italic text-oil-ochre',
    title: 'font-oil text-4xl sm:text-5xl text-oil-cream',
    subtitle: 'font-body italic text-oil-ochre/80 text-lg',
    body: 'font-body text-lg text-oil-cream/70',
  },
  marble: {
    numeral: 'font-marble text-marble-kintsugi',
    title: 'font-marble text-3xl sm:text-4xl tracking-[0.12em] text-marble-white engraved',
    subtitle: 'font-body italic text-marble-chisel/60 text-lg',
    body: 'font-body text-lg text-marble-chisel/65',
  },
}

export function StageHeading({ stage, numeral, title, subtitle, children }: StageHeadingProps) {
  const s = STYLES[stage]
  return (
    <motion.div
      className="mb-6 mt-6 max-w-3xl sm:mb-8 sm:mt-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
    >
      <div className="flex items-baseline gap-3">
        <span className={cn('text-2xl', s.numeral)}>{numeral}.</span>
        <h1 className={cn('leading-none', s.title)}>{title}</h1>
      </div>
      <p className={cn('mt-2', s.subtitle)}>{subtitle}</p>
      {children && <div className={cn('mt-3 leading-relaxed', s.body)}>{children}</div>}
    </motion.div>
  )
}
