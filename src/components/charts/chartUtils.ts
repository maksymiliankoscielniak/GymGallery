/** Categorical chart palette for the dark slab (validated for CVD and contrast ≥ 3:1). */
export const SERIES_COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500'] as const

export const CHART_INK = {
  primary: '#f3f1ec',
  secondary: '#b8bfcc',
  muted: '#7d8594',
  grid: 'rgba(226,232,240,0.07)',
  axis: 'rgba(226,232,240,0.22)',
  surface: '#15171c',
}

/** “Nice” Y-axis ticks. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0]
  if (min === max) {
    min -= 1
    max += 1
  }
  const span = max - min
  const raw = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag
  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(10)))
  return ticks
}
