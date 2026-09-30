import { useState } from 'react'
import { MarblePlate } from '../../components/anatomy/MarblePlate'
import { StageHeading } from '../../components/common/StageHeading'
import { MUSCLE_MAP } from '../../data/muscles'
import { useGallery } from '../../state/GalleryContext'
import type { MuscleId } from '../../types'
import { ChiselPanel } from './ChiselPanel'
import { DeloadPlan } from './DeloadPlan'
import { MrvMatrix } from './MrvMatrix'
import { ProgressionPanel } from './ProgressionPanel'
import { VTaperPanel } from './VTaperPanel'

export function MarbleStage() {
  const { state, meso } = useGallery()
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
      <StageHeading stage="marble" numeral="III" title="Marmurowa rzeźba" subtitle="The Sculpture — proporcje V-taper i dłuto deloadu">
        Surowa forma w chłodnym świetle. Oceń proporcje sylwetki, prześledź progresję ciężarów i tonażu, a gdy plan przekroczy
        maksymalną objętość regeneracyjną — wykuj tydzień deloadu jednym uderzeniem dłuta.
      </StageHeading>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section className="slab overflow-hidden p-2 sm:p-4" aria-label="Rzeźba">
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
              ? 'Bryła bez rys — plan mieści się w granicach regeneracji.'
              : healed
                ? 'Złote spoiny kintsugi: rysy zaleczone tygodniem regeneracyjnym.'
                : `Rysy: ${meso.crackedMuscles.map((m) => MUSCLE_MAP[m].short).join(', ')}${meso.centralCrack ? ' + zmęczenie centralne' : ''}.`}
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
