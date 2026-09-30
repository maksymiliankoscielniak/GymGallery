import { MUSCLES } from '../../data/muscles'
import { LandmarkBar } from '../../components/common/LandmarkBar'
import { Stepper } from '../../components/common/Stepper'
import { useI18n } from '../../i18n/useI18n'
import { cn } from '../../lib/cn'
import { isBalancedStatus } from '../../lib/volume'
import { useGallery } from '../../state/GalleryContext'
import type { MuscleId } from '../../types'

interface VolumeLedgerProps {
  selected: MuscleId | null
  onSelect: (m: MuscleId) => void
}

/** Volume ledger — MEV / MAV threshold indicators computed live for every muscle group. */
export function VolumeLedger({ selected, onSelect }: VolumeLedgerProps) {
  const { state, dispatch, sketch } = useGallery()
  const i18n = useI18n()
  const { t } = i18n
  const balancedCount = MUSCLES.filter((m) => isBalancedStatus(sketch.status[m.id])).length

  return (
    <section className="sketch-card p-4 sm:p-5" aria-labelledby="ledger-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="ledger-title" className="font-hand text-3xl text-sketch-lines">
          {t('ledger.title')}
        </h2>
        <p className="font-sketch text-sm text-sketch-accent">
          <span className="tabular font-medium text-sketch-lines">{sketch.weeklyTotal}</span> {t('ledger.setsPerWeek')} ·{' '}
          <span className={cn('tabular font-medium', balancedCount === MUSCLES.length ? 'text-sketch-sanguine' : 'text-sketch-lines')}>
            {balancedCount}/{MUSCLES.length}
          </span>{' '}
          {t('ledger.balanced')}
        </p>
      </div>
      <div className="sketch-rule my-3 opacity-60" />

      <ul className="flex flex-col gap-1">
        {MUSCLES.map((m) => {
          const sets = state.volume[m.id]
          const st = sketch.status[m.id]
          const meta = i18n.status(st)
          const ok = isBalancedStatus(st)
          const isSel = selected === m.id
          return (
            <li key={m.id}>
              <div
                className={cn(
                  'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded px-2 py-1.5 transition-colors sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto]',
                  isSel ? 'bg-[rgba(156,61,37,0.08)]' : 'hover:bg-[rgba(59,48,38,0.05)]',
                )}
              >
                <button type="button" onClick={() => onSelect(m.id)} className="col-start-1 row-start-1 min-w-0 text-left" aria-pressed={isSel}>
                  <span className={cn('block truncate font-sketch text-[15px] leading-tight', isSel ? 'text-sketch-sanguine' : 'text-sketch-lines')}>
                    {i18n.muscle(m.id)}
                  </span>
                  <span className="block truncate font-sketch text-xs italic text-sketch-faint">{m.latin}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelect(m.id)}
                  className="col-span-2 row-start-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-1"
                  tabIndex={-1}
                  aria-hidden
                >
                  <LandmarkBar muscle={m.id} sets={sets} tone="sketch" />
                </button>
                <Stepper
                  value={sets}
                  onChange={(delta) => dispatch({ type: 'adjustVolume', muscle: m.id, delta })}
                  label={t('ledger.stepperAria', { name: i18n.muscle(m.id) })}
                  className="col-start-2 row-start-1 sm:col-start-3"
                  size="sm"
                  buttonClassName="border-sketch-lines/40 text-sketch-lines hover:border-sketch-sanguine hover:text-sketch-sanguine"
                  valueClassName={cn('font-hand text-xl', ok ? 'text-sketch-lines' : 'text-sketch-sanguine')}
                />
              </div>
              <p className="-mt-1 pl-2 font-sketch text-[11px] text-sketch-faint">
                <span className={ok ? '' : 'text-sketch-sanguine'}>{meta.label}</span> · {meta.hint} ·{' '}
                {t('ledger.freq', { n: sketch.frequency[m.id] })}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
