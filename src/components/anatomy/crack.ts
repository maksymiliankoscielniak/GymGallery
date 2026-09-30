import { seededRandom } from '../../lib/random'

/**
 * Generates a jagged crack path along the segment (x1,y1)→(x2,y2)
 * with a few branches — deterministic for a given seed.
 */
export function crackPath(x1: number, y1: number, x2: number, y2: number, seed: number, severity = 1): string {
  const rnd = seededRandom(seed)
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  const nx = -dy / len
  const ny = dx / len
  const segments = 7 + Math.round(severity * 3)
  const amp = 3.2 + severity * 1.6
  const points: Array<[number, number]> = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const off = i === 0 || i === segments ? 0 : (rnd() - 0.5) * 2 * amp
    points.push([x1 + dx * t + nx * off, y1 + dy * t + ny * off])
  }
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`
  for (const [x, y] of points.slice(1)) d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`

  const branches = 1 + Math.round(severity * 1.5)
  for (let b = 0; b < branches; b++) {
    const idx = 1 + Math.floor(rnd() * (segments - 2))
    const [bx, by] = points[idx]
    const side = rnd() > 0.5 ? 1 : -1
    const blen = len * (0.18 + rnd() * 0.2)
    const angle = Math.atan2(dy, dx) + side * (0.6 + rnd() * 0.6)
    let px = bx
    let py = by
    d += ` M ${px.toFixed(1)} ${py.toFixed(1)}`
    const steps = 3
    for (let s = 1; s <= steps; s++) {
      px = bx + Math.cos(angle) * (blen * s) / steps + (rnd() - 0.5) * 3
      py = by + Math.sin(angle) * (blen * s) / steps + (rnd() - 0.5) * 3
      d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`
    }
  }
  return d
}
