import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Fonty hostowane lokalnie (działają offline i na GitHub Pages, bez zapytań do Google).
import '@fontsource/caveat/latin-500.css'
import '@fontsource/caveat/latin-ext-500.css'
import '@fontsource/caveat/latin-700.css'
import '@fontsource/caveat/latin-ext-700.css'
import '@fontsource/eb-garamond/latin-400.css'
import '@fontsource/eb-garamond/latin-ext-400.css'
import '@fontsource/eb-garamond/latin-400-italic.css'
import '@fontsource/eb-garamond/latin-ext-400-italic.css'
import '@fontsource/eb-garamond/latin-500.css'
import '@fontsource/eb-garamond/latin-ext-500.css'
import '@fontsource/playfair-display/latin-500.css'
import '@fontsource/playfair-display/latin-ext-500.css'
import '@fontsource/playfair-display/latin-500-italic.css'
import '@fontsource/playfair-display/latin-ext-500-italic.css'
import '@fontsource/playfair-display/latin-700.css'
import '@fontsource/playfair-display/latin-ext-700.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-ext-500.css'
import '@fontsource/cormorant-garamond/latin-500-italic.css'
import '@fontsource/cormorant-garamond/latin-ext-500-italic.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/cormorant-garamond/latin-ext-600.css'
import '@fontsource/cinzel/latin-400.css'
import '@fontsource/cinzel/latin-ext-400.css'
import '@fontsource/cinzel/latin-600.css'
import '@fontsource/cinzel/latin-ext-600.css'
import '@fontsource/space-mono/latin-400.css'
import '@fontsource/space-mono/latin-ext-400.css'

import './index.css'
import App from './App'
import { GalleryProvider } from './state/GalleryContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GalleryProvider>
      <App />
    </GalleryProvider>
  </StrictMode>,
)
