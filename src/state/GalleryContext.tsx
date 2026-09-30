import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { useI18n } from '../i18n/useI18n'
import { buildMesocycle, type Mesocycle } from '../lib/progression'
import { analyzeCanvas, type CanvasAnalysis } from '../lib/sfr'
import { analyzeSketch, type SketchAnalysis } from '../lib/volume'
import type { GalleryState } from '../types'
import { galleryReducer, type GalleryAction } from './reducer'
import { clearState, loadState, saveState } from './storage'

interface GalleryContextValue {
  state: GalleryState
  dispatch: Dispatch<GalleryAction>
  sketch: SketchAnalysis
  canvas: CanvasAnalysis
  meso: Mesocycle
}

const GalleryContext = createContext<GalleryContextValue | null>(null)

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(galleryReducer, undefined, loadState)
  const i18n = useI18n()

  // Every state change is written to localStorage.
  useEffect(() => {
    saveState(state)
  }, [state])

  const dispatch = useMemo<Dispatch<GalleryAction>>(
    () => (action) => {
      if (action.type === 'resetAll') clearState()
      rawDispatch(action)
    },
    [],
  )

  // analyses carry localized messages/labels, so they are recomputed when the language changes
  const sketch = useMemo(() => analyzeSketch(state, i18n), [state, i18n])
  const canvas = useMemo(() => analyzeCanvas(state, i18n), [state, i18n])
  const meso = useMemo(() => buildMesocycle(state, i18n), [state, i18n])

  const value = useMemo(() => ({ state, dispatch, sketch, canvas, meso }), [state, dispatch, sketch, canvas, meso])

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- the hook shares a file with the provider
export function useGallery(): GalleryContextValue {
  const ctx = useContext(GalleryContext)
  if (!ctx) throw new Error('useGallery must be used inside <GalleryProvider>')
  return ctx
}
