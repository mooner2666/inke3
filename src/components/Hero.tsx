import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = 600

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = []
    const particleCount = 100

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      })
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = '#C0C0C0'
      ctx.lineWidth = 0.5

      particles.forEach((particle, i) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.fillStyle = '#C0C0C0'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.globalAlpha = 1 - distance / 100
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = 600
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative h-[600px] overflow-hidden bg-deep-black">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Scan lines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute w-full h-1 bg-silver-light animate-scan-line" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        {/* 新 Logo 图片 */}
        <img 
          src="/万维银客城横版 logo.png" 
          alt="万维银客城 INKE CITY" 
          className="w-auto h-36 mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
        />
        
        <p className="text-lg text-gray-300 font-mono mb-12 max-w-3xl">
          自留地，收藏畅聊你喜欢的作品
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/works">
            <button className="px-8 py-4 bg-transparent border-2 border-silver-main text-silver-main hover:bg-silver-main hover:text-deep-black transition-all duration-300 rounded-lg font-cyber text-lg hover:shadow-[0_0_30px_rgba(192,192,192,0.8)]">
              探索作品库
            </button>
          </Link>
          <Link to="/forum">
            <button className="px-8 py-4 bg-transparent border-2 border-silver-light text-silver-light hover:bg-silver-light hover:text-deep-black transition-all duration-300 rounded-lg font-cyber text-lg hover:shadow-[0_0_30px_rgba(232,232,232,0.8)]">
              加入讨论
            </button>
          </Link>
        </div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(192,192,192,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(192,192,192,0.1)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-30" />
    </div>
  )
}