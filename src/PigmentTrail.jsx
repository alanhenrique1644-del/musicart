import { useEffect, useRef } from 'react'

const lifetime = 1500
const pigments = ['#ff374e', '#9b44ed', '#d747bb', '#ff475f', '#7345ff']

export default function PigmentTrail() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    if (!context || reduced.matches) return

    let width = 0
    let height = 0
    let previous
    let frame = 0
    let marks = []

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    function paint(now) {
      context.clearRect(0, 0, width, height)
      marks = marks.filter(mark => now - mark.time < lifetime)
      for (const mark of marks) {
        const age = Math.max(0, (now - mark.time) / lifetime)
        const fade = (1 - age) ** 1.45
        const spread = 1 - (1 - Math.min(1, age * 6)) ** 3
        context.globalAlpha = fade * mark.opacity
        context.fillStyle = mark.color
        context.beginPath()
        context.ellipse(
          mark.x + mark.vx * spread,
          mark.y + mark.vy * spread,
          Math.max(0.1, mark.radius * (0.4 + 0.6 * fade)),
          Math.max(0.1, mark.radius * mark.aspect * (0.4 + 0.6 * fade)),
          mark.angle,
          0,
          Math.PI * 2,
        )
        context.fill()
      }
      frame = marks.length ? requestAnimationFrame(paint) : 0
    }

    function blot(x, y, radius, time, index, vx = 0, vy = 0) {
      marks.push({
        x, y, radius, time, vx, vy,
        color: pigments[index % pigments.length],
        opacity: vx || vy ? 0.86 : 0.57,
        angle: Math.atan2(vy, vx) || Math.random() * Math.PI,
        aspect: 0.5 + Math.random() * 0.45,
      })
    }

    function move(event) {
      if (event.pointerType === 'touch') return
      const x = event.clientX
      const y = event.clientY
      const time = performance.now()

      if (previous && time - previous.time < 100) {
        const distance = Math.hypot(x - previous.x, y - previous.y)
        const steps = Math.min(25, Math.ceil(distance / 4))
        for (let i = 1; i <= steps; i++) {
          const ratio = i / steps
          const px = previous.x + (x - previous.x) * ratio
          const py = previous.y + (y - previous.y) * ratio
          const ink = Math.floor(time / 140)
          blot(px, py, 2 + Math.min(distance, 48) / 15 + Math.random() * 1.2, time, ink)
          if (Math.random() < 0.18) blot(px, py, 0.6 + Math.random() * 1.8, time, ink + 1, (Math.random() - 0.5) * 21, (Math.random() - 0.5) * 21)
        }
      }
      previous = { x, y, time }
      if (!frame && marks.length) frame = requestAnimationFrame(paint)
    }

    function splash(event) {
      if (event.button !== 0) return
      const time = performance.now()
      blot(event.clientX, event.clientY, 10, time, 0)
      for (let i = 0; i < 37; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = 11 + Math.random() ** 1.6 * 88
        blot(event.clientX, event.clientY, 1 + Math.random() ** 2 * 6, time, i, Math.cos(angle) * distance, Math.sin(angle) * distance)
      }
      if (!frame) frame = requestAnimationFrame(paint)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', splash, { passive: true })
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', splash)
      cancelAnimationFrame(frame)
      context.clearRect(0, 0, width, height)
    }
  }, [])

  return <canvas ref={canvasRef} className="pigment-trail" aria-hidden="true" />
}
