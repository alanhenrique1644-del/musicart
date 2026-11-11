import { useEffect, useRef } from 'react'

const lifetime = 1500
const reds = ['#f82f49', '#ff4a53', '#e63360']
const purples = ['#873cf0', '#a943df', '#752ae0']

function fade(age) {
  return Math.max(0, 1 - age) ** 1.55
}

export default function PigmentTrail() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    if (!ctx || reducedMotion.matches) return

    let width, height, previous
    let frame = 0
    let distanceTravelled = 0
    let stroke = 0
    let points = []
    let drops = []
    let splashes = []

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * ratio
      canvas.height = height * ratio
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    function oval(x, y, radius, aspect, angle, color, opacity) {
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.ellipse(x, y, radius, radius * aspect, angle, 0, 2 * Math.PI)
      ctx.fill()
    }

    function ribbon(a, b, left, right, color, opacity) {
      const aw = a.width
      const bw = b.width
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(a.x + a.nx * aw * left, a.y + a.ny * aw * left)
      ctx.lineTo(b.x + b.nx * bw * left, b.y + b.ny * bw * left)
      ctx.lineTo(b.x + b.nx * bw * right, b.y + b.ny * bw * right)
      ctx.lineTo(a.x + a.nx * aw * right, a.y + a.ny * aw * right)
      ctx.closePath()
      ctx.fill()
    }

    function paint(now) {
      ctx.clearRect(0, 0, width, height)
      points = points.filter(point => now - point.time < lifetime)
      drops = drops.filter(drop => now - drop.time < lifetime)
      splashes = splashes.filter(splash => now - splash.time < lifetime)

      let tail
      for (const point of points) {
        const opacity = fade((now - point.time) / lifetime)
        const tip = { ...point, width: point.width * (0.27 + 0.73 * opacity) }
        const red = reds[point.shade]
        const purple = purples[point.shade]
        if (tail?.stroke === tip.stroke) {
          ribbon(tail, tip, 0.97, -0.77, purple, 0.92 * opacity)
          ribbon(tail, tip, 0.88, -0.2, red, 0.96 * opacity)
          ribbon(tail, tip, -0.22, -0.45, '#e471d6', 0.43 * opacity)
        }
        oval(tip.x, tip.y, tip.width * 0.57, 0.75, tip.angle, purple, 0.47 * opacity)
        tail = tip
      }

      for (const splash of splashes) {
        const age = Math.max(0, (now - splash.time) / lifetime)
        const opacity = fade(age)
        const bloom = 0.32 + 0.68 * (1 - (1 - Math.min(1, age * 7)) ** 3)
        for (const ray of splash.rays) {
          const distance = ray.length * bloom * (0.56 + 0.44 * opacity)
          const w = ray.width * (0.28 + 0.72 * opacity)
          ctx.save()
          ctx.translate(splash.x, splash.y)
          ctx.rotate(ray.angle)
          ctx.globalAlpha = opacity
          ctx.fillStyle = ray.color
          ctx.beginPath()
          ctx.moveTo(-w * 0.45, -w * 0.55)
          ctx.bezierCurveTo(distance * 0.32, -w * 1.25, distance * 0.54, w * 0.3, distance, w * 0.07)
          ctx.bezierCurveTo(distance * 0.56, w * 0.31, distance * 0.28, w * 0.86, -w * 0.36, w * 0.54)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }
        oval(splash.x, splash.y, 9 * (0.45 + 0.55 * opacity), 0.82, 0.34, '#e83569', opacity)
      }

      for (const drop of drops) {
        const age = Math.max(0, (now - drop.time) / lifetime)
        const opacity = fade(age)
        const spread = 1 - (1 - Math.min(1, age * 6)) ** 3
        oval(drop.x + drop.vx * spread, drop.y + drop.vy * spread, drop.radius * (0.27 + 0.73 * opacity),
          drop.aspect, drop.angle, drop.color, 0.88 * opacity)
      }
      ctx.globalAlpha = 1
      frame = points.length || drops.length || splashes.length ? requestAnimationFrame(paint) : 0
    }

    function wake() {
      if (!frame) frame = requestAnimationFrame(paint)
    }

    function makeDrop(x, y, time, angle, length, radius, color) {
      drops.push({ x, y, time, angle, vx: Math.cos(angle) * length, vy: Math.sin(angle) * length,
        radius, color, aspect: 0.42 + Math.random() * 0.54 })
    }

    function move(event) {
      if (event.pointerType === 'touch') return
      const x = event.clientX
      const y = event.clientY
      const time = performance.now()

      if (previous && time - previous.time < 110) {
        const dx = x - previous.x
        const dy = y - previous.y
        const distance = Math.hypot(dx, dy)
        if (distance > 0) {
          const angle = Math.atan2(dy, dx)
          const speed = distance / Math.max(8, time - previous.time)
          const count = Math.min(48, Math.ceil(distance / 3.6))
          for (let i = 0; i <= count; i++) {
            const t = i / count
            const px = previous.x + dx * t
            const py = previous.y + dy * t
            distanceTravelled += distance / (count + 1)
            const wave = Math.sin(distanceTravelled / 20)
            const shade = Math.floor(distanceTravelled / 29) % reds.length
            points.push({ x: px, y: py, time: previous.time + (time - previous.time) * t, angle, stroke,
              nx: -dy / distance, ny: dx / distance, shade,
              width: Math.max(2.7, 4.9 + Math.min(3.5, speed * 0.75) + wave * 2 + Math.random() * 0.9) })
            if (i > 0 && Math.random() < 0.15) {
              makeDrop(px, py, time, angle + (Math.random() < 0.5 ? -1 : 1) * 1.6,
                5 + Math.random() * 19, 1 + Math.random() * 2.2, i % 2 ? reds[shade] : purples[shade])
            }
          }
          wake()
        }
      } else {
        stroke++
      }
      previous = { x, y, time }
    }

    function splash(event) {
      if (event.button !== 0) return
      const x = event.clientX
      const y = event.clientY
      const time = performance.now()
      const offset = Math.random() * Math.PI
      const rays = Array.from({ length: 10 }, (_, index) => ({
        angle: offset + (index + Math.random() * 0.55) * Math.PI / 5,
        width: 4 + Math.random() * 10,
        length: 17 + Math.random() * 48,
        color: index % 2 ? reds[index % 3] : purples[index % 3],
      }))
      splashes.push({ x, y, time, rays })
      for (let i = 0; i < 32; i++) {
        const ray = rays[i % rays.length]
        makeDrop(x, y, time, ray.angle + (Math.random() - 0.5) * 0.76,
          17 + Math.random() ** 1.45 * 87, 1 + Math.random() ** 1.75 * 4.8, ray.color)
      }
      wake()
    }

    function breakStroke() { previous = undefined }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', splash, { passive: true })
    window.addEventListener('blur', breakStroke)
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', splash)
      window.removeEventListener('blur', breakStroke)
      cancelAnimationFrame(frame)
      ctx.clearRect(0, 0, width, height)
    }
  }, [])

  return <canvas ref={canvasRef} className="pigment-trail" aria-hidden="true" />
}
