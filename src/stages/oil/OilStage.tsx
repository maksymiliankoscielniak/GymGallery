import { useState } from 'react'
import { OilPlate } from '../../components/anatomy/OilPlate'
import { PIGMENT_LAYERS } from '../../components/anatomy/paint'
import { StageHeading } from '../../components/common/StageHeading'
import { useGallery } from '../../state/GalleryContext'
import type { MuscleId } from '../../types'
import { PigmentPalette } from './PigmentPalette'
import { SfrPanel } from './SfrPanel'
import { WeekComposition } from './WeekComposition'

function HeatLegend() {
  const c = PIGMENT_LAYERS.crimson
  const items = [
    { label: 'Wyblakłe', hint: 'poniżej MEV', style: { background: c[0], opacity: 0.45 } },
    { label: 'Nasycone', hint: 'MEV → MAV', style: { background: `linear-gradient(135deg, ${c[0]}, ${c[1]} 50%, ${c[2]})` } },
    { label: 'Ciemniejące', hint: 'ponad MAV / MRV', style: { background: `linear-gradient(135deg, ${c[2]}, #140a06)` } },
  ]
  return (
    <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Legenda mapy nasycenia">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span className="h-4 w-7 rounded-[40%_60%_55%_45%]" style={i.style} aria-hidden />
          <span className="font-body text-sm text-oil-cream/75">
            <span className="font-semibold">{i.label}</span> <span className="italic text-oil-cream/50">— {i.hint}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export function OilStage({ onAdvance }: { onAdvance: () => void }) {
  const { state } = useGallery()
  const [selected, setSelected] = useState<MuscleId>('shoulders')

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <StageHeading stage="oil" numeral="II" title="Płótno olejne" subtitle="The Oil Canvas — paleta biomechaniki i nasycenie objętością">
        Dobierz pigmenty — ćwiczenia o różnych krzywych oporu — dla każdej partii. Sylwetka wypełnia się warstwami
        karmazynu, kobaltu i złota wraz z tygodniową objętością: partie niedotrenowane pozostają wyblakłe, przetrenowane
        ciemnieją. Bez klikania pojedynczych serii — liczy się kompozycja.
      </StageHeading>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <section aria-label="Mapa nasycenia objętością" className="lg:sticky lg:top-4 lg:self-start">
          <div className="gilded-frame">
            <div className="frame-inner p-2 sm:p-4">
              <OilPlate volume={state.volume} selected={selected} onSelect={setSelected} />
            </div>
          </div>
          <HeatLegend />
        </section>
        <PigmentPalette selected={selected} onSelect={setSelected} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
        <SfrPanel onAdvance={onAdvance} />
        <WeekComposition />
      </div>
    </main>
  )
}
