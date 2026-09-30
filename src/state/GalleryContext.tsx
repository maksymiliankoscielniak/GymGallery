import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
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

  // Każda zmiana stanu trafia do localStorage.
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

  const sketch = useMemo(() => analyzeSketch(state), [state])
  const canvas = useMemo(() => analyzeCanvas(state), [state])
  const meso = useMemo(() => buildMesocycle(state), [state])

  const value = useMemo(() => ({ state, dispatch, sketch, canvas, meso }), [state, dispatch, sketch, canvas, meso])

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- hook współdzieli plik z providerem
export function useGallery(): GalleryContextValue {
  const ctx = useContext(GalleryContext)
  if (!ctx) throw new Error('useGallery musi być użyte wewnątrz <GalleryProvider>')
  return ctx
}
