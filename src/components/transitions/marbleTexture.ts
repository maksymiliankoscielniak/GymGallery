import { seededRandom } from '../../lib/random'

/**
 * Proceduralna tekstura białego marmuru (kararyjskiego) na offscreen canvas:
 * gradient bazowy, chmurki mineralne, żyłki i światłocień z lewego górnego rogu.
 */
export function createMarbleTexture(W: number, H: number, dpr: number, seed = 42): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = Math.round(W * dpr)
  c.height = Math.round(H * dpr)
  const ctx = c.getContext('2d')
  if (!ctx) return c
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const rnd = seededRandom(seed)

  const base = ctx.createLinearGradient(0, 0, W, H)
  base.addColorStop(0, '#f2f0eb')
  base.addColorStop(0.55, '#e3e0d9')
  base.addColorStop(1, '#cfcbc3')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, W, H)

  // chmurki mineralne
  for (let i = 0; i < 70; i++) {
    const x = rnd() * W
    const y = rnd() * H
    const r = 40 + rnd() * 220
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const tone = rnd() > 0.5 ? '120,124,132' : '200,196,188'
    g.addColorStop(0, `rgba(${tone},${0.05 + rnd() * 0.07})`)
    g.addColorStop(1, `rgba(${tone},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  // żyłki — cienkie, łamane, z miękką poświatą
  const veins = Math.round(6 + (W * H) / 160000)
  for (let v = 0; v < veins; v++) {
    let x = rnd() * W
    let y = rnd() < 0.5 ? -10 : rnd() * H
    let ang = Math.PI * (0.1 + rnd() * 0.35)
    const steps = 60 + Math.floor(rnd() * 90)
    const width = 0.4 + rnd() * 1.1
    const pts: Array<[number, number]> = [[x, y]]
    for (let s = 0; s < steps; s++) {
      // łagodny dryf + okazjonalne załamania
      ang += (rnd() - 0.5) * 0.25 + (rnd() < 0.08 ? (rnd() - 0.5) * 1.4 : 0)
      const len = 6 + rnd() * 10
      x += Math.cos(ang) * len
      y += Math.sin(ang) * len
      pts.push([x, y])
    }
    const path = () => {
      ctx.beginPath()
      pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)))
    }
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    path()
    ctx.strokeStyle = `rgba(120,124,134,${0.04 + rnd() * 0.05})`
    ctx.lineWidth = width * 7
    ctx.stroke()
    path()
    ctx.strokeStyle = `rgba(92,96,106,${0.16 + rnd() * 0.22})`
    ctx.lineWidth = width
    ctx.stroke()
    // odgałęzienie
    if (pts.length > 20 && rnd() > 0.4) {
      const k0 = Math.floor(rnd() * (pts.length - 10))
      let [bx, by] = pts[k0]
      let ba = ang + (rnd() - 0.5) * 2
      ctx.beginPath()
      ctx.moveTo(bx, by)
      for (let s = 0; s < 18; s++) {
        ba += (rnd() - 0.5) * 0.4
        bx += Math.cos(ba) * 7
        by += Math.sin(ba) * 7
        ctx.lineTo(bx, by)
      }
      ctx.strokeStyle = `rgba(96,100,110,${0.1 + rnd() * 0.12})`
      ctx.lineWidth = width * 0.6
      ctx.stroke()
    }
  }

  // ziarno
  for (let i = 0; i < (W * H) / 260; i++) {
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(80,80,90,0.06)'
    ctx.fillRect(rnd() * W, rnd() * H, 1, 1)
  }

  // chiaroscuro
  const light = ctx.createRadialGradient(W * 0.2, -H * 0.1, 0, W * 0.2, -H * 0.1, Math.hypot(W, H) * 0.9)
  light.addColorStop(0, 'rgba(255,255,255,0.35)')
  light.addColorStop(0.5, 'rgba(255,255,255,0)')
  light.addColorStop(1, 'rgba(20,22,30,0.45)')
  ctx.fillStyle = light
  ctx.fillRect(0, 0, W, H)
  return c
}
