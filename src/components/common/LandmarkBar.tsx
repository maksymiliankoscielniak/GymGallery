import { motion } from 'framer-motion'
import { MUSCLE_MAP } from '../../data/muscles'
import { cn } from '../../lib/cn'
import type { MuscleId, StageId } from '../../types'

interface LandmarkBarProps {
  muscle: MuscleId
  sets: number
  tone: StageId
  /** Opcjonalny drugi znacznik (np. szczyt mezocyklu) */
  peak?: number
  showLabels?: boolean
  className?: string
}

const ZONES: Record<StageId, [string, string, string, string, string]> = {
  sketch: [
    'repeating-linear-gradient(135deg, rgba(59,48,38,.22) 0 1px, transparent 1px 5px)',
    'rgba(156,61,37,.16)',
    'rgba(156,61,37,.36)',
    'repeating-linear-gradient(135deg, rgba(156,61,37,.35) 0 1px, transparent 1px 4px)',
    'rgba(59,48,38,.6)',
  ],
  oil: ['rgba(239,226,196,.07)', 'rgba(201,154,46,.22)', 'rgba(217,164,65,.55)', 'rgba(179,38,30,.4)', 'rgba(12,6,4,.95)'],
  marble: ['rgba(226,232,240,.06)', 'rgba(226,232,240,.14)', 'rgba(212,168,67,.38)', 'rgba(236,131,90,.32)', 'rgba(208,59,59,.5)'],
}

const MARKER: Record<StageId, string> = {
  sketch: 'bg-sketch-lines',
  oil: 'bg-oil-cream',
  marble: 'bg-marble-white',
}

const LABEL: Record<StageId, string> = {
  sketch: 'text-sketch-accent font-sketch',
  oil: 'text-oil-cream/55 font-mono',
  marble: 'text-marble-chisel/50 font-mono',
}

/** Pasek z granicami MEV / MAV / MRV i znacznikiem aktualnej objętości. */
export function LandmarkBar({ muscle, sets, tone, peak, showLabels = true, className }: LandmarkBarProps) {
  const l = MUSCLE_MAP[muscle].landmarks
  const max = l.mrv + 6
  const pct = (v: number) => `${(Math.min(max, Math.max(0, v)) / max) * 100}%`
  const bounds: Array<[number, number]> = [
    [0, l.mev],
    [l.mev, l.mavLow],
    [l.mavLow, l.mavHigh],
    [l.mavHigh, l.mrv],
    [l.mrv, max],
  ]
  const z = ZONES[tone]
  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-3 w-full overflow-hidden rounded-[2px]">
        {bounds.map(([a, b], i) => (
          <div
            key={i}
            className="absolute inset-y-0"
            style={{ left: pct(a), width: `calc(${pct(b)} - ${pct(a)} - 1px)`, background: z[i] }}
          />
        ))}
        {peak !== undefined && peak !== sets && (
          <motion.div
            className={cn('absolute inset-y-0 w-[2px] opacity-45', MARKER[tone])}
            initial={false}
            animate={{ left: `calc(${pct(peak)} - 1px)` }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          />
        )}
        <motion.div
          className={cn('absolute -inset-y-0 w-[3px] rounded-sm', MARKER[tone])}
          initial={false}
          animate={{ left: `calc(${pct(sets)} - 1.5px)` }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        />
      </div>
      {showLabels && (
        <div className={cn('relative mt-0.5 h-3 text-[10px] leading-none', LABEL[tone])} aria-hidden>
          <span className="absolute -translate-x-1/2" style={{ left: pct(l.mev) }}>
            MEV {l.mev}
          </span>
          <span className="absolute -translate-x-1/2" style={{ left: pct((l.mavLow + l.mavHigh) / 2) }}>
            MAV
          </span>
          <span className="absolute -translate-x-1/2" style={{ left: pct(l.mrv) }}>
            MRV {l.mrv}
          </span>
        </div>
      )}
    </div>
  )
}
