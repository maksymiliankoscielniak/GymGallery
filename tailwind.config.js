/**
 * Tokeny projektu Gym Gallery.
 * Tailwind v4 wczytuje ten plik przez dyrektywę `@config` w src/index.css.
 * (W v4 skanowanie treści jest automatyczne — pole `content` zostaje dla zgodności z edytorami.)
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Etap I — pergamin, grafit i sangwina (czerwona kreda Leonarda)
        sketch: {
          bg: '#e9dcbc',
          paper: '#f1e6c8',
          deep: '#d8c59b',
          lines: '#3b3026',
          accent: '#6b5a45',
          faint: '#8f7d62',
          sanguine: '#9c3d25',
        },
        // Etap II — ciemne płótno olejne
        oil: {
          bg: '#16110e',
          panel: '#221a15',
          umber: '#3b2a20',
          crimson: '#8a0f0f',
          madder: '#b3261e',
          gold: '#c99a2e',
          ochre: '#d9a441',
          cobalt: '#1d3e6b',
          ultramarine: '#2f5d9a',
          cream: '#efe2c4',
        },
        // Etap III — marmur i chiaroscuro
        marble: {
          bg: '#0b0c10',
          slate: '#15171c',
          basalt: '#1e2128',
          vein: '#6b7280',
          chisel: '#e2e8f0',
          white: '#f3f1ec',
          kintsugi: '#d4a843',
        },
      },
      fontFamily: {
        hand: ['Caveat', 'cursive'],
        sketch: ['"EB Garamond"', 'Georgia', 'serif'],
        oil: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        marble: ['Cinzel', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
