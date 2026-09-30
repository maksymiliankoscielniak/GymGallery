import { TriangleAlert } from 'lucide-react'
import { MUSCLES } from '../../data/muscles'
import { useI18n } from '../../i18n/useI18n'
import { cn } from '../../lib/cn'
import { volumeStatus } from '../../lib/volume'
import { useGallery } from '../../state/GalleryContext'
import type { VolumeStatus } from '../../types'

const CELL: Record<VolumeStatus, string> = {
  under: 'text-marble-chisel/45',
  effective: 'bg-white/[0.04] text-marble-chisel/80',
  optimal: 'bg-[rgba(12,163,12,0.16)] text-marble-white',
  high: 'bg-[rgba(250,178,25,0.16)] text-marble-white',
  over: 'bg-[rgba(208,59,59,0.32)] text-marble-white font-semibold',
}

const LEGEND: Array<{ st: VolumeStatus; key: 'status.effective.label' | 'matrix.legend.optimal' | 'matrix.legend.high' | 'matrix.legend.over'; swatch: string }> = [
  { st: 'effective', key: 'status.effective.label', swatch: 'bg-white/10' },
  { st: 'optimal', key: 'matrix.legend.optimal', swatch: 'bg-[rgba(12,163,12,0.45)]' },
  { st: 'high', key: 'matrix.legend.high', swatch: 'bg-[rgba(250,178,25,0.5)]' },
  { st: 'over', key: 'matrix.legend.over', swatch: 'bg-[rgba(208,59,59,0.7)]' },
]

/** Load matrix: sets of every muscle group across the weeks, relative to MRV. */
export function MrvMatrix() {
  const { meso } = useGallery()
  const i18n = useI18n()
  const { t } = i18n
  const { weeks } = meso

  return (
    <section className="slab p-4 sm:p-6" aria-labelledby="matrix-title">
      <h2 id="matrix-title" className="font-marble text-xl tracking-[0.12em] text-marble-white engraved">
        {t('matrix.title')}
      </h2>
      <p className="font-body text-base italic text-marble-chisel/55">
        {t('matrix.hint')}
      </p>
      <div className="no-scrollbar mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-separate border-spacing-[3px] text-center">
          <thead>
            <tr className="font-mono text-[11px] text-marble-chisel/55">
              <th scope="col" className="text-left font-normal">
                {t('matrix.muscle')}
              </th>
              {weeks.map((w) => (
                <th key={w.label} scope="col" className={cn('font-normal', w.deload && 'text-marble-kintsugi')}>
                  {w.deload ? t('matrix.deload') : w.label}
                </th>
              ))}
              <th scope="col" className="font-normal text-marble-chisel/40">
                MRV
              </th>
            </tr>
          </thead>
          <tbody>
            {MUSCLES.map((m) => (
              <tr key={m.id}>
                <th scope="row" className="whitespace-nowrap pr-2 text-left font-body text-[15px] font-medium text-marble-chisel/85">
                  {i18n.muscleShort(m.id)}
                </th>
                {weeks.map((w) => {
                  const sets = w.volume[m.id]
                  const st = volumeStatus(m.id, sets)
                  return (
                    <td
                      key={w.label}
                      className={cn(
                        'rounded-sm px-1 py-1.5 font-mono text-sm tabular',
                        w.deload ? 'bg-[repeating-linear-gradient(45deg,rgba(212,168,67,0.12)_0_2px,transparent_2px_6px)] text-marble-kintsugi' : CELL[st],
                      )}
                      title={t('matrix.cellTitle', { name: i18n.muscle(m.id), week: w.deload ? t('matrix.deload') : w.label, sets })}
                    >
                      <span className="inline-flex items-center gap-1">
                        {!w.deload && st === 'over' && <TriangleAlert className="h-3 w-3 text-[#ff8a80]" aria-label={t('matrix.overMrv')} />}
                        {sets}
                      </span>
                    </td>
                  )
                })}
                <td className="font-mono text-xs text-marble-chisel/40 tabular">{m.landmarks.mrv}</td>
              </tr>
            ))}
            <tr>
              <th scope="row" className="whitespace-nowrap pr-2 pt-2 text-left font-body text-[15px] font-medium text-marble-chisel/85">
                {t('matrix.central')}
              </th>
              {weeks.map((w) => {
                const pct = Math.round(w.centralFatigue * 100)
                const over = !w.deload && w.centralFatigue > 1
                return (
                  <td key={w.label} className="pt-2 align-bottom">
                    <div className="mx-auto flex h-10 w-6 items-end overflow-hidden rounded-sm bg-white/[0.04]" aria-hidden>
                      <div
                        className={cn('w-full rounded-sm', over ? 'bg-[#d03b3b]' : w.deload ? 'bg-marble-kintsugi/60' : 'bg-[#8fa2c0]')}
                        style={{ height: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <span className={cn('font-mono text-[11px] tabular', over ? 'text-[#ff8a80]' : 'text-marble-chisel/60')}>{pct}%</span>
                  </td>
                )
              })}
              <td className="pt-2 align-bottom font-mono text-xs text-marble-chisel/40">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-body text-sm text-marble-chisel/70" aria-label={t('matrix.legend')}>
        {LEGEND.map((l) => (
          <li key={l.st} className="flex items-center gap-2">
            <span className={cn('h-3 w-5 rounded-sm', l.swatch)} aria-hidden />
            {t(l.key)}
          </li>
        ))}
      </ul>
    </section>
  )
}
