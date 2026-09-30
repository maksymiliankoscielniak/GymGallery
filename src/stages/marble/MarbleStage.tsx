import { useState } from 'react'
import { MarblePlate } from '../../components/anatomy/MarblePlate'
import { StageHeading } from '../../components/common/StageHeading'
import { MUSCLE_MAP } from '../../data/muscles'
import { useI18n } from '../../i18n/useI18n'
import { useGallery } from '../../state/GalleryContext'
import type { MuscleId } from '../../types'
import { ChiselPanel } from './ChiselPanel'
import { DeloadPlan } from './DeloadPlan'
import { MrvMatrix } from './MrvMatrix'
import { ProgressionPanel } from './ProgressionPanel'
import { VTaperPanel } from './VTaperPanel'

export function MarbleStage() {
  const { state, meso } = useGallery()
  const i18n = useI18n()
  const { t } = i18n
  const [selected, setSelected] = useState<MuscleId | null>(null)
  const healed = Boolean(state.deload)
  const peakWeek = meso.weeks.filter((w) => !w.deload).at(-1)

  const label = (m: MuscleId) => {
    const first = meso.weeks[0]?.volume[m] ?? 0
    const peak = peakWeek?.volume[m] ?? first
    return `${first} → ${peak} / MRV ${MUSCLE_MAP[m].landmarks.mrv}`
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <StageHeading stage="marble" numeral="III" title={t('marble.title')} subtitle={t('marble.subtitle')}>
        {t('marble.intro')}
      </StageHeading>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section className="slab overflow-hidden p-2 sm:p-4" aria-label={t('marble.section')}>
          <MarblePlate
            cracked={meso.crackedMuscles}
            centralCrack={meso.centralCrack}
            healed={healed}
            selected={selected}
            onSelect={(m) => setSelected((cur) => (cur === m ? null : m))}
            label={label}
          />
          <p className="px-2 pb-1 text-center font-body text-sm italic text-marble-chisel/50">
            {meso.crackedMuscles.length === 0 && !meso.centralCrack
              ? t('marble.intact')
              : healed
                ? t('marble.healed')
                : t('marble.cracks', {
                    list: meso.crackedMuscles.map((m) => i18n.muscleShort(m)).join(', '),
                    central: meso.centralCrack ? t('marble.centralSuffix') : '',
                  })}
          </p>
        </section>
        <ChiselPanel />
      </div>

      <div className="mt-6">
        <DeloadPlan />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VTaperPanel />
        <ProgressionPanel />
      </div>

      <div className="mt-6">
        <MrvMatrix />
      </div>
    </main>
  )
}
