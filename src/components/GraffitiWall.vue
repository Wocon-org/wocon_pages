<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
let animationId: number | null = null
let doodles: any[] = []
let mouseX = 0
let mouseY = 0

const phrases = [
  { text: "经历你未曾所想，从这里开始", language: "中文" },
  { text: "Experience the unimagined, start here", language: "English" },
  { text: "Vivez l'inimaginable, commencez ici", language: "Français" },
  { text: "Erlebe das Unvorstellbare, beginne hier", language: "Deutsch" },
  { text: "Vivi l'inimmaginabile, inizia da qui", language: "Italiano" },
  { text: "Experimenta lo inimaginable, comienza aquí", language: "Español" },
  { text: "経験したことのないことを経験してください、ここから始めましょう", language: "日本語" },
  { text: "상상하지 못한 경험을 하세요, 여기에서 시작하세요", language: "한국어" },
  { text: "Испытайте невообразимое, начните здесь", language: "Русский" },
  { text: "اختبر ما لم تتخيله، ابدأ من هنا", language: "العربية" },
  { text: "अकल्पनीय अनुभव करें, यहां से शुरू करें", language: "हिन्दी" },
  { text: "Experiență neimaginabilul, începe aici", language: "Română" },
  { text: "Upplev det ofattbara, börja här", language: "Svenska" },
  { text: "Ervaar het onvoorstelbare, begin hier", language: "Nederlands" },
  { text: "Doživite nezamislivo, počnite ovdje", language: "Hrvatski" },
  { text: "Αντιμετωπίστε το αδιανόητο, ξεκινήστε εδώ", language: "Ελληνικά" },
  { text: "מצא את הבלתי נתפס, התחל כאן", language: "עברית" },
  { text: "Dozivi nepojmljivo, počni ovdje", language: "Bosanski" },
  { text: "Pajautājiet neiedomājamo, sāciet šeit", language: "Latviešu" },
  { text: "Patirkite neįsivaizduojamą, pradėkite čia", language: "Lietuvių" },
  { text: "经历你未曾所想，从这里开始", language: "中文简体" },
  { text: "經歷你未曾所想，從這裡開始", language: "中文繁體" },
]

class Doodle {
  constructor(x: number, y: number, text: string, language: string, size: number = 1) {
    this.x = x
    this.y = y
    this.text = text
    this.language = language
    this.size = size
    this.rotation = Math.random() * Math.PI * 0.4 - Math.PI * 0.2
    this.opacity = 0.8 + Math.random() * 0.2
    this.color = this.getRandomColor()
    this.speedX = (Math.random() - 0.5) * 1.5
    this.speedY = (Math.random() - 0.5) * 1.5
    this.wobble = Math.random() * 0.02
    this.wobbleSpeed = Math.random() * 0.05 + 0.02
    this.time = 0
    this.pulse = 0
    this.pulseSpeed = Math.random() * 0.03 + 0.01
    this.maxSpeed = 2.5
    this.hover = false
  }

  getRandomColor() {
    const colors = [
      '#1a9fff', '#00c6ff', '#0affd9', '#2af598', '#00ffaa',
      '#08f7fe', '#09fbd3', '#00ffcc', '#00e6ff', '#0fdaf9',
      '#00e6e6', '#00cccc', '#00b3b3', '#009999', '#008080',
      '#0ac8ff', '#1ee3ff', '#3af7c8', '#5effb5', '#7affa8'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  update(canvasWidth: number, canvasHeight: number) {
    this.speedX += (Math.random() - 0.5) * 0.1
    this.speedY += (Math.random() - 0.5) * 0.1

    if (Math.abs(this.speedX) > this.maxSpeed) this.speedX = Math.sign(this.speedX) * this.maxSpeed
    if (Math.abs(this.speedY) > this.maxSpeed) this.speedY = Math.sign(this.speedY) * this.maxSpeed

    this.x += this.speedX
    this.y += this.speedY

    if (this.x < 0) {
      this.x = 0
      this.speedX = Math.abs(this.speedX) * 0.9
    }
    if (this.x > canvasWidth) {
      this.x = canvasWidth
      this.speedX = -Math.abs(this.speedX) * 0.9
    }
    if (this.y < 0) {
      this.y = 0
      this.speedY = Math.abs(this.speedY) * 0.9
    }
    if (this.y > canvasHeight) {
      this.y = canvasHeight
      this.speedY = -Math.abs(this.speedY) * 0.9
    }

    this.time += this.wobbleSpeed
    this.pulse += this.pulseSpeed
  }

  checkHover(mx: number, my: number): boolean {
    const dx = this.x - mx
    const dy = this.y - my
    const distance = Math.sqrt(dx * dx + dy * dy)
    const fontSize = 18 * this.size
    this.hover = distance < fontSize * 2
    return this.hover
  }

  draw(context: CanvasRenderingContext2D) {
    context.save()
    context.translate(this.x, this.y)
    context.rotate(this.rotation + Math.sin(this.time) * this.wobble)

    const fontSize = 18 * this.size
    const fontFamily = this.language === '中文' || this.language === '中文简体' ||
                          this.language === '中文繁體' || this.language === '日本語'
      ? "'Microsoft YaHei', 'Hiragino Sans GB', sans-serif"
      : "'Arial', sans-serif"

    context.font = `bold ${fontSize}px ${fontFamily}`

    const pulseValue = Math.sin(this.pulse) * 0.2 + 0.8

    if (this.hover) {
      context.shadowColor = this.color
      context.shadowBlur = 15
      context.fillStyle = '#ffffff'
      context.globalAlpha = 1
    } else {
      context.shadowColor = this.color
      context.shadowBlur = 8
      context.fillStyle = this.color
      context.globalAlpha = this.opacity * pulseValue
    }

    context.fillText(this.text, 0, 0)

    context.font = `italic ${fontSize * 0.6}px Arial`
    context.fillText(`[${this.language}]`, 0, fontSize * 1.2)

    context.restore()
  }
}

const initDoodles = () => {
  if (!canvasRef.value || !ctx.value) return
  const width = canvasRef.value.width
  const height = canvasRef.value.height

  doodles = []

  phrases.forEach(phrase => {
    const x = Math.random() * width
    const y = Math.random() * height
    const size = 0.7 + Math.random() * 1.3
    doodles.push(new Doodle(x, y, phrase.text, phrase.language, size))
  })

  for (let i = 0; i < 15; i++) {
    const phrase = phrases[Math.floor(Math.random() * phrases.length)]
    const x = Math.random() * width
    const y = Math.random() * height
    const size = 0.7 + Math.random() * 1.3
    doodles.push(new Doodle(x, y, phrase.text, phrase.language, size))
  }
}

const drawBackground = () => {
  if (!canvasRef.value || !ctx.value) return
  const width = canvasRef.value.width
  const height = canvasRef.value.height

  const gradient = ctx.value.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#0a2a43')
  gradient.addColorStop(0.3, '#0d4d4d')
  gradient.addColorStop(0.6, '#0a6e6e')
  gradient.addColorStop(1, '#08a8a8')

  ctx.value.fillStyle = gradient
  ctx.value.fillRect(0, 0, width, height)

  const noiseOpacity = 0.03
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const radius = Math.random() * 2

    ctx.value.beginPath()
    ctx.value.arc(x, y, radius, 0, Math.PI * 2)
    ctx.value.fillStyle = `rgba(255,255,255,${Math.random() * noiseOpacity})`
    ctx.value.fill()
  }
}

const drawConnections = () => {
  if (!ctx.value) return

  for (let i = 0; i < doodles.length; i++) {
    for (let j = i + 1; j < doodles.length; j++) {
      const dx = doodles[i].x - doodles[j].x
      const dy = doodles[i].y - doodles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 250) {
        ctx.value.beginPath()
        ctx.value.moveTo(doodles[i].x, doodles[i].y)
        ctx.value.lineTo(doodles[j].x, doodles[j].y)

        const opacity = 0.1 * (1 - distance / 250)
        const lineWidth = 0.5 + (1 - distance / 250) * 1.5

        ctx.value.strokeStyle = `rgba(10, 255, 217, ${opacity})`
        ctx.value.lineWidth = lineWidth
        ctx.value.stroke()
      }
    }
  }
}

const animate = () => {
  if (!canvasRef.value || !ctx.value) return
  const width = canvasRef.value.width
  const height = canvasRef.value.height

  drawBackground()

  doodles.forEach(doodle => {
    doodle.update(width, height)
    doodle.draw(ctx.value)
  })

  drawConnections()

  animationId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (!canvasRef.value) return
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
}

const updateMousePosition = (e: MouseEvent) => {
  mouseX = e.clientX
  mouseY = e.clientY

  doodles.forEach(doodle => {
    doodle.checkHover(mouseX, mouseY)
  })
}

onMounted(() => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
    ctx.value = canvasRef.value.getContext('2d')

    if (ctx.value) {
      initDoodles()
      animate()

      window.addEventListener('resize', handleResize)
      canvasRef.value.addEventListener('mousemove', updateMousePosition)
    }
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousemove', updateMousePosition)
  }
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="graffiti-canvas"
  />
</template>

<style scoped>
.graffiti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}
</style>
