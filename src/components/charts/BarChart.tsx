import { useId, useState } from 'react'
import { useElementWidth } from '../../hooks/useElementWidth'
import { useI18n } from '../../i18n/useI18n'
import { CHART_INK, niceTicks } from './chartUtils'

export type BarMark = 'normal' | 'deload' | 'breach'

interface BarChartProps {
  labels: string[]
  values: number[]
  marks?: BarMark[]
  color: string
  format: (v: number) => string
  height?: number
  ariaLabel: string
}

const M = { top: 20, right: 12, bottom: 26, left: 52 }

/** Bar chart with a tooltip for every bar; deload hatched, MRV breach marked with an icon. */
export function BarChart({ labels, values, marks = [], color, format, height = 210, ariaLabel }: BarChartProps) {
  const { t } = useI18n()
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const uid = useId().replace(/:/g, '')
  const w = Math.max(240, width)
  const innerW = w - M.left - M.right
  const innerH = height - M.top - M.bottom
  const ticks = niceTicks(0, Math.max(...values, 1) * 1.08, 4)
  const top = ticks[ticks.length - 1]
  const n = values.length
  const band = innerW / Math.max(1, n)
  const barW = Math.min(46, band - 8)
  const yAt = (v: number) => M.top + innerH - (v / top) * innerH

  return (
    <div ref={ref} className="relative w-full">
      <svg width={w} height={height} role="img" aria-label={ariaLabel} className="block">
        <defs>
          <pattern id={`hatch-${uid}`} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
            <rect width={6} height={6} fill={color} opacity={0.25} />
            <line x1={0} y1={0} x2={0} y2={6} stroke={color} strokeWidth={2.2} />
          </pattern>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={M.left + innerW} y1={yAt(t)} y2={yAt(t)} stroke={CHART_INK.grid} />
            <text x={M.left - 8} y={yAt(t) + 3.5} textAnchor="end" fontSize={10} fill={CHART_INK.muted} className="font-mono">
              {format(t)}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          const x = M.left + band * i + (band - barW) / 2
          const y = yAt(v)
          const h = M.top + innerH - y
          const mark = marks[i] ?? 'normal'
          const r = Math.min(4, h / 2)
          const d = `M ${x} ${M.top + innerH} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + barW - r} ${y} Q ${x + barW} ${y} ${x + barW} ${y + r} L ${x + barW} ${M.top + innerH} Z`
          return (
            <g key={i}>
              <path
                d={d}
                fill={mark === 'deload' ? `url(#hatch-${uid})` : color}
                opacity={hover === null || hover === i ? 1 : 0.55}
                stroke={hover === i ? CHART_INK.primary : 'none'}
                strokeWidth={1}
              />
              {mark === 'breach' && (
                <g transform={`translate(${x + barW / 2} ${y - 9})`} aria-hidden>
                  <path d="M 0 -6 L 6 5 L -6 5 Z" fill="none" stroke="#d03b3b" strokeWidth={1.5} strokeLinejoin="round" />
                  <line x1={0} y1={-2} x2={0} y2={1.5} stroke="#d03b3b" strokeWidth={1.4} />
                </g>
              )}
              <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize={10} fill={CHART_INK.muted} className="font-mono">
                {labels[i]}
              </text>
              <rect
                x={M.left + band * i}
                y={M.top}
                width={band}
                height={innerH}
                fill="transparent"
                tabIndex={0}
                aria-label={`${labels[i]}: ${format(v)}${mark === 'deload' ? ` (${t('chart.deload')})` : mark === 'breach' ? ` (${t('chart.breach')})` : ''}`}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                style={{ outline: 'none' }}
              />
            </g>
          )
        })}
        <line x1={M.left} x2={M.left + innerW} y1={M.top + innerH} y2={M.top + innerH} stroke={CHART_INK.axis} />
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 rounded border border-white/10 bg-[#0f1115]/95 px-3 py-2 text-xs shadow-xl"
          style={{ left: Math.min(w - 150, M.left + band * hover + band / 2 + 8), top: Math.max(0, yAt(values[hover]) - 10) }}
          role="status"
        >
          <p className="font-mono font-semibold" style={{ color: CHART_INK.primary }}>
            {format(values[hover])}
          </p>
          <p style={{ color: CHART_INK.secondary }}>
            {labels[hover]}
            {marks[hover] === 'deload' && ` · ${t('chart.deload')}`}
            {marks[hover] === 'breach' && ` · ${t('chart.breach')}`}
          </p>
        </div>
      )}
    </div>
  )
}
