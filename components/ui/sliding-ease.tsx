"use client"

import { useEffect, useRef } from "react"

interface SlidingEaseVerticalBarsProps {
  backgroundColor?: string
  lineColor?: string
  barColor?: string
  lineWidth?: number
  animationSpeed?: number
  removeWaveLine?: boolean
  /**
   * Word rendered by the bars at the "settled" point of the breathing cycle,
   * before it dissolves into the random noise pattern.
   * @default "usly"
   */
  text?: string
}

interface Bar {
  y: number
  height: number
  width: number
}

const SlidingEaseVerticalBars = ({
  backgroundColor = "#F0EEE6",
  lineColor = "#444",
  barColor = "#5E5D59",
  lineWidth = 1,
  animationSpeed = 0.005,
  removeWaveLine = true,
  text = "usly",
}: SlidingEaseVerticalBarsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let time = 0
    let animationFrameId: number
    const mouse = { x: 0, y: 0 }
    let transitionBursts: Array<{ x: number; y: number; time: number; intensity: number }> = []
    let cachedKey = ""
    let cachedWordPattern: Bar[][] = []
    let cachedRandomPattern: Bar[][] = []

    function noise(x: number, y: number, t: number): number {
      const n = Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t) + Math.sin(x * 0.03 - t) * Math.cos(y * 0.01 + t)
      return (n + 1) / 2
    }

    function getMouseInfluence(x: number, y: number): number {
      const dx = x - mouse.x
      const dy = y - mouse.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const maxDistance = 180
      return Math.max(0, 1 - distance / maxDistance)
    }

    function getTransitionBurstInfluence(x: number, y: number, currentTime: number): number {
      let totalInfluence = 0

      transitionBursts.forEach((burst) => {
        const age = currentTime - burst.time
        const maxAge = 2500
        if (age < maxAge) {
          const dx = x - burst.x
          const dy = y - burst.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const burstRadius = (age / maxAge) * 300
          const burstWidth = 60
          if (Math.abs(distance - burstRadius) < burstWidth) {
            const burstStrength = (1 - age / maxAge) * burst.intensity
            const proximityToBurst = 1 - Math.abs(distance - burstRadius) / burstWidth
            totalInfluence += burstStrength * proximityToBurst
          }
        }
      })

      return Math.min(totalInfluence, 1.5)
    }

    function generatePattern(seed: number, width: number, height: number, numLines: number): Bar[][] {
      const pattern: Bar[][] = []
      const lineSpacing = width / numLines

      for (let i = 0; i < numLines; i++) {
        const lineBars: Bar[] = []
        let currentY = 0

        while (currentY < height) {
          const noiseVal = noise(i * lineSpacing, currentY, seed)
          if (noiseVal > 0.5) {
            const barLength = 10 + noiseVal * 30
            const barWidth = 2 + noiseVal * 3
            lineBars.push({
              y: currentY + barLength / 2,
              height: barLength,
              width: barWidth,
            })
            currentY += barLength + 15
          } else {
            currentY += 15
          }
        }
        pattern.push(lineBars)
      }

      return pattern
    }

    function generateTextPattern(word: string, width: number, height: number, numLines: number): Bar[][] {
      const offCanvas = document.createElement("canvas")
      offCanvas.width = width
      offCanvas.height = height
      const offCtx = offCanvas.getContext("2d")
      if (!offCtx) return []

      offCtx.fillStyle = "#000"
      offCtx.fillRect(0, 0, width, height)
      offCtx.fillStyle = "#fff"
      offCtx.textAlign = "center"
      offCtx.textBaseline = "middle"

      let fontSize = height * 0.65
      const maxTextWidth = width * 0.92
      offCtx.font = `700 ${fontSize}px Arial, sans-serif`
      while (offCtx.measureText(word).width > maxTextWidth && fontSize > 10) {
        fontSize -= 2
        offCtx.font = `700 ${fontSize}px Arial, sans-serif`
      }

      offCtx.fillText(word, width / 2, height / 2)

      const imageData = offCtx.getImageData(0, 0, width, height).data
      const lineSpacing = width / numLines
      const isPixelOn = (x: number, y: number) => {
        const px = Math.min(width - 1, Math.max(0, Math.floor(x)))
        const py = Math.min(height - 1, Math.max(0, Math.floor(y)))
        return imageData[(py * width + px) * 4] > 128
      }

      const pattern: Bar[][] = []
      for (let i = 0; i < numLines; i++) {
        const x = i * lineSpacing + lineSpacing / 2
        const lineBars: Bar[] = []
        let y = 0

        while (y < height) {
          if (isPixelOn(x, y)) {
            const startY = y
            while (y < height && isPixelOn(x, y)) y++
            lineBars.push({ y: startY + (y - startY) / 2, height: y - startY, width: 4 })
          } else {
            y++
          }
        }
        pattern.push(lineBars)
      }

      return pattern
    }

    function resizeCanvas() {
      if (!canvas) return

      const dpr = window.devicePixelRatio || 1
      const displayWidth = window.innerWidth
      const displayHeight = window.innerHeight

      // Set the actual size in memory (scaled up for high DPI)
      canvas.width = displayWidth * dpr
      canvas.height = displayHeight * dpr

      // Scale the canvas back down using CSS
      canvas.style.width = displayWidth + "px"
      canvas.style.height = displayHeight + "px"

      // Scale the drawing context so everything draws at the correct size
      ctx?.scale(dpr, dpr)
    }

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    function handleMouseDown(e: MouseEvent) {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()

      transitionBursts.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        time: Date.now(),
        intensity: 2,
      })

      const now = Date.now()
      transitionBursts = transitionBursts.filter((burst) => now - burst.time < 2500)
    }

    function animate() {
      if (!canvas || !ctx) return

      const currentTime = Date.now()
      time += animationSpeed

      // Use CSS pixel dimensions for calculations
      const canvasWidth = canvas.clientWidth
      const canvasHeight = canvas.clientHeight

      const numLines = Math.floor(canvasWidth / 15)
      const lineSpacing = canvasWidth / numLines

      // Regenerate patterns only when canvas dimensions change, not every frame
      const key = `${canvasWidth}x${canvasHeight}x${numLines}x${text}`
      if (key !== cachedKey) {
        cachedWordPattern = generateTextPattern(text, canvasWidth, canvasHeight, numLines)
        cachedRandomPattern = generatePattern(5, canvasWidth, canvasHeight, numLines)
        cachedKey = key
      }
      const pattern1 = cachedWordPattern
      const pattern2 = cachedRandomPattern

      // Create cycle with mouse influence
      const baseCycleTime = time % (Math.PI * 2)
      const mouseInfluenceOnCycle = getMouseInfluence(canvasWidth / 2, canvasHeight / 2) * 0.5

      let easingFactor: number
      const adjustedCycleTime = baseCycleTime + mouseInfluenceOnCycle

      if (adjustedCycleTime < Math.PI * 0.1) {
        easingFactor = 0
      } else if (adjustedCycleTime < Math.PI * 0.9) {
        easingFactor = (adjustedCycleTime - Math.PI * 0.1) / (Math.PI * 0.8)
      } else if (adjustedCycleTime < Math.PI * 1.1) {
        easingFactor = 1
      } else if (adjustedCycleTime < Math.PI * 1.9) {
        easingFactor = 1 - (adjustedCycleTime - Math.PI * 1.1) / (Math.PI * 0.8)
      } else {
        easingFactor = 0
      }

      const smoothEasing =
        easingFactor < 0.5 ? 4 * easingFactor * easingFactor * easingFactor : 1 - Math.pow(-2 * easingFactor + 2, 3) / 2

      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Draw lines and interpolated bars
      for (let i = 0; i < numLines; i++) {
        const x = i * lineSpacing + lineSpacing / 2
        const lineMouseInfluence = getMouseInfluence(x, canvasHeight / 2)

        // Draw vertical line with mouse influence
        ctx.beginPath()
        ctx.strokeStyle = lineColor
        ctx.lineWidth = lineWidth + lineMouseInfluence * 2
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasHeight)
        ctx.stroke()

        // Interpolate between patterns
        const bars1 = pattern1[i] || []
        const bars2 = pattern2[i] || []
        const maxBars = Math.max(bars1.length, bars2.length)

        for (let j = 0; j < maxBars; j++) {
          let bar1 = bars1[j]
          let bar2 = bars2[j]

          if (!bar1) bar1 = { y: bar2.y - 100, height: 0, width: 0 }
          if (!bar2) bar2 = { y: bar1.y + 100, height: 0, width: 0 }

          const barMouseInfluence = getMouseInfluence(x, bar1.y)
          const burstInfluence = getTransitionBurstInfluence(x, bar1.y, currentTime)

          // Enhanced wave motion with mouse and burst influence
          const baseWaveOffset =
            Math.sin(i * 0.3 + j * 0.5 + time * 2) * 10 * (smoothEasing * (1 - smoothEasing) * 4)

          const mouseWaveOffset = barMouseInfluence * Math.sin(time * 3 + i * 0.2) * 15
          const burstWaveOffset = burstInfluence * Math.sin(time * 4 + j * 0.3) * 20
          const totalWaveOffset = baseWaveOffset + mouseWaveOffset + burstWaveOffset

          // Interpolate properties
          const barY = bar1.y + (bar2.y - bar1.y) * smoothEasing + totalWaveOffset
          const barHeight =
            bar1.height + (bar2.height - bar1.height) * smoothEasing + barMouseInfluence * 5 + burstInfluence * 8
          const barWidth =
            bar1.width + (bar2.width - bar1.width) * smoothEasing + barMouseInfluence * 2 + burstInfluence * 3

          // Draw bar with enhanced effects
          if (barHeight > 0.1 && barWidth > 0.1) {
            const intensity = Math.min(1, 0.8 + barMouseInfluence * 0.2 + burstInfluence * 0.3)
            const red = Number.parseInt(barColor.slice(1, 3), 16)
            const green = Number.parseInt(barColor.slice(3, 5), 16)
            const blue = Number.parseInt(barColor.slice(5, 7), 16)

            ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${intensity})`
            ctx.fillRect(x - barWidth / 2, barY - barHeight / 2, barWidth, barHeight)
          }
        }
      }

      // Draw transition burst effects
      if (!removeWaveLine) {
        transitionBursts.forEach((burst) => {
          const age = currentTime - burst.time
          const maxAge = 2500
          if (age < maxAge) {
            const progress = age / maxAge
            const radius = progress * 300
            const alpha = (1 - progress) * 0.2 * burst.intensity

            ctx.beginPath()
            ctx.strokeStyle = `rgba(100, 100, 100, ${alpha})`
            ctx.lineWidth = 2
            ctx.arc(burst.x, burst.y, radius, 0, 2 * Math.PI)
            ctx.stroke()
          }
        })
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()

    window.addEventListener("resize", resizeCanvas)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mousedown", handleMouseDown)

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mousedown", handleMouseDown)
      cancelAnimationFrame(animationFrameId)
    }
  }, [backgroundColor, lineColor, barColor, lineWidth, animationSpeed, removeWaveLine, text])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ backgroundColor }}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}

export default SlidingEaseVerticalBars
