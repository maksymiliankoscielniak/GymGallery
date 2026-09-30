import { useEffect, useRef } from 'react'
import { seededRandom } from '../../lib/random'
import { createMarbleTexture } from './marbleTexture'

interface ChiselTransitionProps {
  onCovered: () => void
  onDone: () => void
  reduced?: boolean
}

type Pt = [number, number]

interface Shard {
  pts: Pt[]
  ring: number
  cx: number
  cy: number
  img: HTMLCanvasElement
  ox: number
  oy: number
  vx: number
  vy: number
  vr: number
  delay: number
}

interface Chip {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  life: number
  born: number
  dust: boolean
}

const clamp01 = (t: number) => Math.max(0, Math.min(1, t))

/**
 * Transition II → III: a marble block fills the screen, the chisel strikes three times,
 * cracks radiate outward and the shards fall away, revealing the sculpture.
 */
export function ChiselTransition({ onCovered, onDone, reduced = false }: ChiselTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cb = useRef({ onCovered, onDone })
  useEffect(() => {
    cb.current = { onCovered, onDone }
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) {
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
    const k = reduced ? 0.4 : 1
    const rnd = seededRandom((Date.now() & 0xffff) + 5)

    const texture = createMarbleTexture(W, H, dpr, 1234)
    const impact: Pt = [W * 0.5, H * 0.46]

    /* --- radial crack network --- */
    const rays = 15
    const diag = Math.hypot(W, H)
    const radii = [0, 34, 90, 170, 290, 450, 650, 900, 1250, 1700].filter((_, i, a) => i === 0 || a[i - 1] < diag)
    if (radii[radii.length - 1] < diag) radii.push(diag * 1.05)
    const angles = Array.from({ length: rays }, (_, i) => ((i + (rnd() - 0.5) * 0.55) / rays) * Math.PI * 2)
    const V: Pt[][] = angles.map((a) =>
      radii.map((r, j) => {
        if (j === 0) return impact
        const rr = r * (0.85 + rnd() * 0.3)
        const aa = a + (rnd() - 0.5) * 0.12
        return [impact[0] + Math.cos(aa) * rr, impact[1] + Math.sin(aa) * rr] as Pt
      }),
    )
    const polys: Array<{ pts: Pt[]; ring: number }> = []
    for (let i = 0; i < rays; i++) {
      const n = (i + 1) % rays
      for (let j = 0; j < radii.length - 1; j++) {
        if (j === 0) {
          polys.push({ pts: [impact, V[i][1], V[n][1]], ring: 0 })
        } else if (j >= 3 && rnd() > 0.35) {
          polys.push({ pts: [V[i][j], V[n][j], V[n][j + 1]], ring: j })
          polys.push({ pts: [V[i][j], V[n][j + 1], V[i][j + 1]], ring: j })
        } else {
          polys.push({ pts: [V[i][j], V[n][j], V[n][j + 1], V[i][j + 1]], ring: j })
        }
      }
    }

    // crack edges: all the rays + some of the arcs (looks like stone, not a spider web)
    const crackEdges: Array<{ a: Pt; b: Pt; ring: number }> = []
    for (let i = 0; i < rays; i++) {
      const n = (i + 1) % rays
      for (let j = 0; j < radii.length - 1; j++) {
        crackEdges.push({ a: V[i][j], b: V[i][j + 1], ring: j })
        if (j >= 1 && rnd() < 0.45) crackEdges.push({ a: V[i][j], b: V[n][j], ring: j })
      }
    }

    // pre-render the shards onto their own canvases
    const shards: Shard[] = polys.map(({ pts, ring }) => {
      const xs = pts.map((p) => p[0])
      const ys = pts.map((p) => p[1])
      const minX = Math.floor(Math.min(...xs)) - 2
      const minY = Math.floor(Math.min(...ys)) - 2
      const maxX = Math.ceil(Math.max(...xs)) + 2
      const maxY = Math.ceil(Math.max(...ys)) + 2
      const w = Math.max(1, maxX - minX)
      const h = Math.max(1, maxY - minY)
      const img = document.createElement('canvas')
      img.width = Math.round(w * dpr)
      img.height = Math.round(h * dpr)
      const g = img.getContext('2d')!
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.beginPath()
      pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x - minX, y - minY) : g.lineTo(x - minX, y - minY)))
      g.closePath()
      g.save()
      g.clip()
      g.drawImage(texture, minX * dpr, minY * dpr, w * dpr, h * dpr, 0, 0, w, h)
      g.restore()
      g.lineWidth = 1.2
      g.strokeStyle = 'rgba(255,255,255,0.55)'
      g.stroke()
      g.lineWidth = 0.8
      g.strokeStyle = 'rgba(40,42,50,0.35)'
      g.stroke()
      const cx = xs.reduce((a, b) => a + b, 0) / xs.length
      const cy = ys.reduce((a, b) => a + b, 0) / ys.length
      const dx = cx - impact[0]
      const dy = cy - impact[1]
      const dl = Math.hypot(dx, dy) || 1
      const push = 1.5 + rnd() * 3.5
      return {
        pts,
        ring,
        cx,
        cy,
        img,
        ox: minX,
        oy: minY,
        vx: (dx / dl) * push,
        vy: (dy / dl) * push * 0.6 - rnd() * 2.5,
        vr: (rnd() - 0.5) * 0.08,
        delay: ring * 55 + rnd() * 90,
      }
    })

    /* --- timeline --- */
    const T_BLOCK = 380 * k
    const STRIKES = [700, 1100, 1500].map((t) => t * k)
    const T_BREAK = 1700 * k
    const T_DONE = 3300 * k
    const chips: Chip[] = []
    const burst = (t: number, n: number) => {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI * (0.1 + rnd() * 0.8) + (rnd() > 0.5 ? 0 : Math.PI * 0.1)
        const v = 2 + rnd() * 7
        chips.push({ x: impact[0], y: impact[1], vx: Math.cos(a) * v * (rnd() > 0.5 ? 1 : -1), vy: Math.sin(a) * v, r: 1 + rnd() * 3.5, life: 700 + rnd() * 600, born: t, dust: false })
      }
      for (let i = 0; i < 10; i++) {
        chips.push({ x: impact[0] + (rnd() - 0.5) * 20, y: impact[1] + (rnd() - 0.5) * 10, vx: (rnd() - 0.5) * 1.2, vy: -0.3 - rnd() * 0.8, r: 8 + rnd() * 16, life: 900, born: t, dust: true })
      }
    }
    const firedStrikes = new Set<number>()
    const firedBreak = { done: false }

    const drawTools = (t: number) => {
      // chisel: tip at the point of impact, shaft pointing up-left
      const angle = -0.62
      const SWING = 110 * k
      const RECOIL = 140 * k
      const liftAt = (time: number): number => {
        if (time < STRIKES[0] - SWING) return 0.3 + 0.7 * clamp01(time / (STRIKES[0] - SWING))
        for (let i = 0; i < STRIKES.length; i++) {
          const s = STRIKES[i]
          if (time >= s - SWING && time < s) return 1 - (time - (s - SWING)) / SWING
          if (time >= s && time < s + RECOIL) return 0
          const next = STRIKES[i + 1]
          if (next !== undefined && time >= s + RECOIL && time < next - SWING) {
            return clamp01((time - s - RECOIL) / (next - SWING - s - RECOIL))
          }
        }
        return clamp01((time - STRIKES[STRIKES.length - 1] - RECOIL) / (300 * k)) * 0.4
      }
      const lift = liftAt(t)
      let push = 0
      for (const s of STRIKES) {
        const dt = t - s
        if (dt >= 0 && dt < RECOIL) push = 6 * (1 - dt / RECOIL)
      }
      const toolsAlpha = t < T_BLOCK ? clamp01(t / T_BLOCK) : t > T_BREAK ? 1 - clamp01((t - T_BREAK) / (250 * k)) : 1
      if (toolsAlpha <= 0) return
      ctx.save()
      ctx.globalAlpha = toolsAlpha
      ctx.translate(impact[0], impact[1])
      ctx.rotate(angle)
      ctx.translate(0, -push)
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fillRect(4, -150, 12, 150)
      // blade
      const steel = ctx.createLinearGradient(-8, 0, 8, 0)
      steel.addColorStop(0, '#6f7682')
      steel.addColorStop(0.45, '#e6ebf2')
      steel.addColorStop(1, '#565c66')
      ctx.fillStyle = steel
      ctx.beginPath()
      ctx.moveTo(-3, 0)
      ctx.lineTo(3, 0)
      ctx.lineTo(7, -42)
      ctx.lineTo(-7, -42)
      ctx.closePath()
      ctx.fill()
      ctx.fillRect(-6, -150, 12, 110)
      // head (slightly mushroomed)
      ctx.fillStyle = '#8a919c'
      ctx.beginPath()
      ctx.ellipse(0, -152, 10, 5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // mallet — swing along the axis of the chisel
      ctx.save()
      ctx.globalAlpha = toolsAlpha
      ctx.translate(impact[0], impact[1])
      ctx.rotate(angle)
      ctx.translate(0, -152 - 30 - lift * 70)
      ctx.rotate(-lift * 0.55)
      // shaft
      const wood = ctx.createLinearGradient(0, -6, 0, 6)
      wood.addColorStop(0, '#9a6a3c')
      wood.addColorStop(1, '#5c3a1c')
      ctx.fillStyle = wood
      ctx.fillRect(-4, -10, 150, 9)
      // poll
      const head = ctx.createLinearGradient(-40, 0, 40, 0)
      head.addColorStop(0, '#4b5058')
      head.addColorStop(0.4, '#b8bec8')
      head.addColorStop(1, '#3d4148')
      ctx.fillStyle = head
      ctx.beginPath()
      ctx.roundRect(-40, -30, 80, 50, 8)
      ctx.fill()
      ctx.restore()
    }

    const start = performance.now()
    let raf = 0
    let covered = false

    const frame = (now: number) => {
      const t = now - start
      ctx.clearRect(0, 0, W, H)

      // shake after the strike
      let shake = 0
      for (const s of STRIKES) {
        const dt = t - s
        if (dt >= 0 && dt < 180 * k) shake = Math.max(shake, 7 * (1 - dt / (180 * k)))
        if (dt >= 0 && !firedStrikes.has(s)) {
          firedStrikes.add(s)
          burst(t, reduced ? 6 : 22)
        }
      }
      ctx.save()
      if (shake > 0) ctx.translate((rnd() - 0.5) * shake * 2, (rnd() - 0.5) * shake * 2)

      if (t < T_BREAK) {
        // the whole marble block
        ctx.globalAlpha = clamp01(t / T_BLOCK)
        ctx.drawImage(texture, 0, 0, W, H)
        ctx.globalAlpha = 1
        // cracks spreading with every strike: rays + ring fragments
        const struck = STRIKES.filter((s) => t >= s).length
        const reach = struck === 0 ? 0 : struck === 1 ? 2 : struck === 2 ? 4 : radii.length
        if (reach > 0) {
          const since = t - STRIKES[struck - 1]
          const grow = clamp01(since / (160 * k))
          ctx.lineCap = 'round'
          for (const e of crackEdges) {
            if (e.ring >= reach) continue
            const partial = e.ring === reach - 1 ? grow : 1
            const [ax, ay] = e.a
            const bx = ax + (e.b[0] - ax) * partial
            const by = ay + (e.b[1] - ay) * partial
            ctx.beginPath()
            ctx.moveTo(ax, ay)
            ctx.lineTo(bx, by)
            ctx.lineWidth = Math.max(0.6, 2.2 - e.ring * 0.25)
            ctx.strokeStyle = 'rgba(28,30,36,0.8)'
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(ax + 0.9, ay + 0.9)
            ctx.lineTo(bx + 0.9, by + 0.9)
            ctx.lineWidth = 0.7
            ctx.strokeStyle = 'rgba(255,255,255,0.55)'
            ctx.stroke()
          }
        }
      } else {
        if (!firedBreak.done) {
          firedBreak.done = true
          burst(t, reduced ? 10 : 40)
        }
        const bt = t - T_BREAK
        for (const sh of shards) {
          const lt = Math.max(0, bt - sh.delay * k) / 16.7
          const x = sh.vx * lt
          const y = sh.vy * lt + 0.5 * 0.55 * lt * lt
          const rot = sh.vr * lt
          const alpha = 1 - clamp01((bt - sh.delay * k - 700 * k) / (600 * k))
          if (alpha <= 0 || sh.cy + y - 400 > H) continue
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.translate(sh.cx + x, sh.cy + y)
          ctx.rotate(rot)
          ctx.drawImage(sh.img, sh.ox - sh.cx, sh.oy - sh.cy, sh.img.width / dpr, sh.img.height / dpr)
          ctx.restore()
        }
      }
      ctx.restore()

      // shards and dust
      for (const c of chips) {
        const age = t - c.born
        if (age > c.life) continue
        const f = age / 16.7
        const p = age / c.life
        if (c.dust) {
          ctx.fillStyle = `rgba(225,225,220,${0.25 * (1 - p)})`
          ctx.beginPath()
          ctx.arc(c.x + c.vx * f, c.y + c.vy * f, c.r * (1 + p * 2.5), 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = `rgba(240,238,232,${1 - p})`
          const x = c.x + c.vx * f
          const y = c.y + c.vy * f + 0.5 * 0.35 * f * f
          ctx.beginPath()
          ctx.moveTo(x, y - c.r)
          ctx.lineTo(x + c.r, y + c.r * 0.6)
          ctx.lineTo(x - c.r * 0.8, y + c.r * 0.4)
          ctx.closePath()
          ctx.fill()
        }
      }

      drawTools(t)

      if (!covered && t >= T_BLOCK) {
        covered = true
        cb.current.onCovered()
      }
      if (t >= T_DONE) {
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
