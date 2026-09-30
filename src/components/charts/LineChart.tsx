import { useId, useState, type PointerEvent } from 'react'
import { useElementWidth } from '../../hooks/useElementWidth'
import { useI18n } from '../../i18n/useI18n'
import { CHART_INK, niceTicks } from './chartUtils'

export interface LineSeries {
  id: string
  name: string
  color: string
  values: number[]
}

interface LineChartProps {
  labels: string[]
  series: LineSeries[]
  format: (v: number) => string
  /** Indexes of highlighted columns (e.g. the deload week) */
  shaded?: number[]
  shadedLabel?: string
  height?: number
  ariaLabel: string
}

/** Line chart with a crosshair, a tooltip for every series and direct labels. */
export function LineChart({ labels, series, format, shaded = [], shadedLabel, height = 230, ariaLabel }: LineChartProps) {
  // direct labels only for multiple series — a single one is named by the chart title
  const { t } = useI18n()
  const direct = series.length > 1
  const M = { top: 14, right: direct ? 104 : 16, bottom: 26, left: 48 }
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const uid = useId().replace(/:/g, '')

  const w = Math.max(200, width)
  const innerW = w - M.left - M.right
  const innerH = height - M.top - M.bottom
  const all = series.flatMap((s) => s.values)
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const pad = (hi - lo) * 0.12 || 5
  const ticks = niceTicks(lo - pad, hi + pad, 4)
  const y0 = ticks[0]
  const y1 = ticks[ticks.length - 1]
  const n = labels.length
  const xAt = (i: number) => M.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const yAt = (v: number) => M.top + innerH - ((v - y0) / (y1 - y0 || 1)) * innerH
  const step = n > 1 ? innerW / (n - 1) : innerW

  // direct labels — nudged apart so they do not overlap
  const ends = series
    .map((s) => ({ s, y: yAt(s.values[s.values.length - 1]) }))
    .sort((a, b) => a.y - b.y)
  for (let i = 1; i < ends.length; i++) {
    if (ends[i].y - ends[i - 1].y < 13) ends[i].y = ends[i - 1].y + 13
  }

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - M.left
    const i = Math.round(x / (step || 1))
    setHover(Math.max(0, Math.min(n - 1, i)))
  }

  return (
    <div ref={ref} className="relative w-full">
      {series.length > 1 && (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label={t('chart.legend')}>
          {series.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5" style={{ color: CHART_INK.secondary }}>
              <span className="inline-block h-[2px] w-4 rounded" style={{ background: s.color }} aria-hidden />
              {s.name}
            </li>
          ))}
        </ul>
      )}
      <svg width={w} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible">
        <defs>
          <pattern id={`shade-${uid}`} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={6} stroke="rgba(212,168,67,0.25)" strokeWidth={1.5} />
          </pattern>
        </defs>
        {shaded.map((i) => (
          <g key={`sh-${i}`}>
            <rect x={xAt(i) - step / 2} y={M.top} width={step} height={innerH} fill={`url(#shade-${uid})`} />
            {shadedLabel && (
              <text x={xAt(i)} y={M.top + 10} textAnchor="middle" fontSize={10} fill={CHART_INK.secondary} className="font-mono">
                {shadedLabel}
              </text>
            )}
          </g>
        ))}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={M.left + innerW} y1={yAt(t)} y2={yAt(t)} stroke={CHART_INK.grid} />
            <text x={M.left - 8} y={yAt(t) + 3.5} textAnchor="end" fontSize={10} fill={CHART_INK.muted} className="font-mono">
              {format(t)}
            </text>
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={l + i} x={xAt(i)} y={height - 8} textAnchor="middle" fontSize={10} fill={CHART_INK.muted} className="font-mono">
            {l}
          </text>
        ))}
        {series.map((s) => (
          <g key={s.id}>
            <polyline
              points={s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {s.values.map((v, i) => (
              <circle key={i} cx={xAt(i)} cy={yAt(v)} r={4} fill={s.color} stroke={CHART_INK.surface} strokeWidth={2} />
            ))}
          </g>
        ))}
        {direct && ends.map(({ s, y }) => (
          <text key={`end-${s.id}`} x={M.left + innerW + 10} y={y + 3.5} fontSize={11} fill={CHART_INK.secondary}>
            {s.name.length > 16 ? `${s.name.slice(0, 15)}…` : s.name}
          </text>
        ))}
        {hover !== null && (
          <line x1={xAt(hover)} x2={xAt(hover)} y1={M.top} y2={M.top + innerH} stroke={CHART_INK.axis} strokeWidth={1} />
        )}
        <rect
          x={M.left - step / 2}
          y={M.top}
          width={innerW + step}
          height={innerH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onPointerDown={onMove}
        />
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 min-w-[10rem] rounded border border-white/10 bg-[#0f1115]/95 px-3 py-2 text-xs shadow-xl"
          style={{
            left: xAt(hover) > w / 2 ? Math.max(0, xAt(hover) - 172) : xAt(hover) + 12,
            top: (series.length > 1 ? 26 : 0) + M.top,
          }}
          role="status"
        >
          <p className="mb-1 font-mono" style={{ color: CHART_INK.muted }}>
            {labels[hover]}
          </p>
          {series.map((s) => (
            <p key={s.id} className="flex items-center gap-2">
              <span className="inline-block h-[2px] w-3" style={{ background: s.color }} aria-hidden />
              <span className="font-mono font-semibold" style={{ color: CHART_INK.primary }}>
                {format(s.values[hover])}
              </span>
              <span style={{ color: CHART_INK.secondary }}>{s.name}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
