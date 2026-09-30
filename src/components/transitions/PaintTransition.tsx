import { useEffect, useRef } from 'react'
import { seededRandom } from '../../lib/random'

interface PaintTransitionProps {
  /** Ekran całkowicie zalany farbą — moment na podmianę etapu pod spodem */
  onCovered: () => void
  onDone: () => void
  reduced?: boolean
}

type Pt = [number, number]

interface Facet {
  pts: Pt[]
  cx: number
  cy: number
  color: string
  edge: string
  inDelay: number
  outDelay: number
  spin: number
}

interface Splat {
  x: number
  y: number
  r: number
  color: string
  shape: number[]
  delay: number
  drops: Array<{ a: number; d: number; r: number; v: number }>
}

/** Rodziny barw (karmazyn, kobalt, złoto, zieleń ziemi, umbra) — ciemne → jasne. */
const FAMILIES: string[][] = [
  ['#5e0a0d', '#8a0f0f', '#b3261e', '#d0543f', '#e39a86'],
  ['#0f2446', '#1d3e6b', '#2f5d9a', '#5b86c0', '#9fb8dc'],
  ['#6f4c12', '#9c7219', '#c99a2e', '#dcb458', '#efd79a'],
  ['#1f3d3a', '#2f6f6a', '#4d8f86', '#86b5a8', '#c3dccf'],
  ['#1c120c', '#3b2a20', '#6b4a33', '#a47a55', '#e6d3b0'],
]

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInCubic = (t: number) => t * t * t
const easeOutBack = (t: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
const clamp01 = (t: number) => Math.max(0, Math.min(1, t))

/**
 * Przejście I → II: organiczne chlapnięcia farby olejnej, które rozlewają się
 * w geometryczne, kubistyczne płaszczyzny barwne i zalewają ekran.
 */
export function PaintTransition({ onCovered, onDone, reduced = false }: PaintTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cb = useRef({ onCovered, onDone })
  useEffect(() => {
    cb.current = { onCovered, onDone }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      cb.current.onCovered()
      cb.current.onDone()
      return
    }
    const W = window.innerWidth
    const H = window.innerHeight
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const speed = reduced ? 0.35 : 1
    const rnd = seededRandom((Date.now() & 0xffff) + 17)

    /* --- ogniska chlapnięć: jedno zawsze w prawym dolnym rogu (tam była pieczęć) --- */
    const origins = [
      { x: W * (0.72 + rnd() * 0.12), y: H * (0.7 + rnd() * 0.15), fam: 0 },
      { x: W * (0.12 + rnd() * 0.2), y: H * (0.18 + rnd() * 0.25), fam: 1 },
      { x: W * (0.45 + rnd() * 0.15), y: H * (0.05 + rnd() * 0.2), fam: 2 },
      { x: W * (0.2 + rnd() * 0.2), y: H * (0.75 + rnd() * 0.2), fam: 3 },
    ]
    const maxDist = Math.hypot(W, H) * 0.75

    /* --- siatka kubistycznych fasetek (trójkąty z poszarpanego gridu) --- */
    const cell = Math.max(64, Math.min(W, H) / 7)
    const cols = Math.ceil(W / cell) + 2
    const rows = Math.ceil(H / cell) + 2
    const grid: Pt[][] = []
    for (let r = 0; r < rows; r++) {
      grid.push([])
      for (let c = 0; c < cols; c++) {
        const jx = (rnd() - 0.5) * cell * 0.8
        const jy = (rnd() - 0.5) * cell * 0.8
        grid[r].push([(c - 0.5) * cell + jx, (r - 0.5) * cell + jy])
      }
    }
    const facets: Facet[] = []
    const addFacet = (pts: Pt[]) => {
      const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length
      const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length
      let nearest = origins[0]
      let nd = Infinity
      for (const o of origins) {
        const d = Math.hypot(o.x - cx, o.y - cy) * (0.8 + rnd() * 0.4)
        if (d < nd) {
          nd = d
          nearest = o
        }
      }
      const fam = rnd() < 0.72 ? FAMILIES[nearest.fam] : FAMILIES[Math.floor(rnd() * FAMILIES.length)]
      const shade = Math.floor(rnd() * 5)
      const centerDist = Math.hypot(cx - W / 2, cy - H / 2)
      facets.push({
        pts,
        cx,
        cy,
        color: fam[shade],
        edge: fam[Math.max(0, shade - 2)],
        inDelay: (nd / maxDist) * 1000 + rnd() * 160,
        outDelay: (centerDist / (Math.hypot(W, H) / 2)) * 420 + rnd() * 140,
        spin: (rnd() - 0.5) * 0.9,
      })
    }
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = grid[r][c]
        const b = grid[r][c + 1]
        const d = grid[r + 1][c]
        const e = grid[r + 1][c + 1]
        if (rnd() > 0.5) {
          addFacet([a, b, e])
          addFacet([a, e, d])
        } else {
          addFacet([a, b, d])
          addFacet([b, e, d])
        }
      }
    }

    /* --- organiczne plamy z kroplami --- */
    const splats: Splat[] = origins.map((o, i) => {
      const n = 28
      const shape = Array.from({ length: n }, () => 0.72 + rnd() * 0.5)
      return {
        x: o.x,
        y: o.y,
        r: Math.min(W, H) * (0.12 + rnd() * 0.08),
        color: FAMILIES[o.fam][1 + Math.floor(rnd() * 2)],
        shape,
        delay: i * 110,
        drops: Array.from({ length: 16 }, () => ({ a: rnd() * Math.PI * 2, d: 0.9 + rnd() * 1.6, r: 2 + rnd() * 9, v: 0.6 + rnd() * 0.8 })),
      }
    })

    const IN_ANIM = 300
    const coverAt = (1000 + 160 + IN_ANIM + 40) * speed
    const holdUntil = coverAt + 180 * speed
    const OUT_ANIM = 420
    const doneAt = holdUntil + (560 + 140 + OUT_ANIM) * speed

    let covered = false
    let raf = 0
    const start = performance.now()

    const drawSplat = (s: Splat, t: number, fade: number) => {
      const p = easeOutBack(clamp01((t - s.delay * speed) / (380 * speed)))
      if (p <= 0) return
      ctx.globalAlpha = fade
      ctx.fillStyle = s.color
      ctx.beginPath()
      s.shape.forEach((k, i) => {
        const ang = (i / s.shape.length) * Math.PI * 2
        const rr = s.r * k * p
        const x = s.x + Math.cos(ang) * rr
        const y = s.y + Math.sin(ang) * rr
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.fill()
      for (const d of s.drops) {
        const q = easeOutCubic(clamp01((t - s.delay * speed) / (600 * speed)))
        const dist = s.r * d.d * q * d.v * 1.4
        ctx.beginPath()
        ctx.arc(s.x + Math.cos(d.a) * dist, s.y + Math.sin(d.a) * dist + q * q * 30, d.r * (1 - q * 0.3), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const frame = (now: number) => {
      const t = now - start
      ctx.clearRect(0, 0, W, H)

      const outT = t - holdUntil
      const splatFade = outT > 0 ? 1 - clamp01(outT / (300 * speed)) : 1
      for (const s of splats) drawSplat(s, t, splatFade)

      for (const f of facets) {
        let scale: number
        let alpha = 1
        let rot = 0
        if (outT <= 0) {
          scale = easeOutCubic(clamp01((t - f.inDelay * speed) / (IN_ANIM * speed)))
          if (scale <= 0) continue
          scale *= 1.04
        } else {
          const q = clamp01((outT - f.outDelay * speed) / (OUT_ANIM * speed))
          if (q >= 1) continue
          const e = easeInCubic(q)
          scale = 1.04 * (1 - e)
          alpha = 1 - e * 0.6
          rot = f.spin * e
        }
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(f.cx, f.cy)
        ctx.rotate(rot)
        ctx.scale(scale, scale)
        ctx.beginPath()
        f.pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x - f.cx, y - f.cy) : ctx.lineTo(x - f.cx, y - f.cy)))
        ctx.closePath()
        ctx.fillStyle = f.color
        ctx.fill()
        ctx.lineWidth = 1.2
        ctx.strokeStyle = f.edge
        ctx.globalAlpha = alpha * 0.45
        ctx.stroke()
        ctx.restore()
      }

      if (!covered && t >= coverAt) {
        covered = true
        cb.current.onCovered()
      }
      if (t >= doneAt) {
        cb.current.onDone()
        return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  return (
    <div className="fixed inset-0 z-[60]" role="presentation" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
