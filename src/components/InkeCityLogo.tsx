interface InkeCityLogoProps {
  className?: string
  showText?: boolean
  animated?: boolean
}

export default function InkeCityLogo({ className = '', showText = true, animated = true }: InkeCityLogoProps) {
  return (
    <div className={`flex flex-row items-center gap-3 ${className}`}>
      {/* Water Drops SVG */}
      <svg
        viewBox="0 0 120 60"
        className="w-12 h-6 flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Mercury metallic gradient for drops */}
          <linearGradient id="mercuryDrop1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="20%" stopColor="#F5F5F5" stopOpacity="1" />
            <stop offset="50%" stopColor="#E8E8E8" stopOpacity="1" />
            <stop offset="80%" stopColor="#C0C0C0" stopOpacity="1" />
            <stop offset="100%" stopColor="#A8A8A8" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="mercuryDrop2" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#F5F5F5" stopOpacity="1" />
            <stop offset="30%" stopColor="#E8E8E8" stopOpacity="1" />
            <stop offset="60%" stopColor="#D4D4D4" stopOpacity="1" />
            <stop offset="100%" stopColor="#BEBEBE" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="mercuryDrop3" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="25%" stopColor="#F5F5F5" stopOpacity="1" />
            <stop offset="55%" stopColor="#E8E8E8" stopOpacity="1" />
            <stop offset="85%" stopColor="#C0C0C0" stopOpacity="1" />
            <stop offset="100%" stopColor="#909090" stopOpacity="1" />
          </linearGradient>

          {/* Highlight effect for liquid metal shine */}
          <radialGradient id="dropHighlight" cx="35%" cy="30%" r="35%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="40%" stopColor="#F5F5F5" stopOpacity="0.7" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Shadow for 3D effect */}
          <filter id="dropShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="1" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Drop 1 - Left */}
        <g filter="url(#dropShadow)">
          <path
            d="M 30 15
               C 30 12, 32 8, 32 5
               C 32 8, 34 12, 34 15
               C 34 20, 32 24, 30 24
               C 28 24, 26 20, 26 15
               C 26 12, 28 8, 30 5
               C 30 8, 30 12, 30 15 Z"
            fill="url(#mercuryDrop1)"
            stroke="#FFFFFF"
            strokeWidth="0.3"
            filter="url(#glow)"
          />
          <ellipse cx="31" cy="10" rx="4" ry="6" fill="url(#dropHighlight)" />
          {animated && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,-3;0,0;0,0;0,-3"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </g>

        {/* Drop 2 - Center */}
        <g filter="url(#dropShadow)">
          <path
            d="M 60 15
               C 60 12, 62 8, 62 5
               C 62 8, 64 12, 64 15
               C 64 20, 62 24, 60 24
               C 58 24, 56 20, 56 15
               C 56 12, 58 8, 60 5
               C 60 8, 60 12, 60 15 Z"
            fill="url(#mercuryDrop2)"
            stroke="#F5F5F5"
            strokeWidth="0.3"
            filter="url(#glow)"
          />
          <ellipse cx="61" cy="10" rx="4" ry="6" fill="url(#dropHighlight)" />
          {animated && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,-3;0,0;0,0;0,-3"
              dur="3s"
              repeatCount="indefinite"
              begin="0.4s"
            />
          )}
        </g>

        {/* Drop 3 - Right Top (Small) */}
        <g filter="url(#dropShadow)">
          <path
            d="M 90 10
               C 90 8, 91 6, 91 4
               C 91 6, 92 8, 92 10
               C 92 13, 91 15, 90 15
               C 89 15, 88 13, 88 10
               C 88 8, 89 6, 90 4
               C 90 6, 90 8, 90 10 Z"
            fill="url(#mercuryDrop3)"
            stroke="#F5F5F5"
            strokeWidth="0.2"
            filter="url(#glow)"
          />
          <ellipse cx="90.5" cy="7" rx="2" ry="3" fill="url(#dropHighlight)" />
          {animated && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,-2;0,0;0,0;0,-2"
              dur="3s"
              repeatCount="indefinite"
              begin="0.8s"
            />
          )}
        </g>

        {/* Bottom Drop - Large */}
        <g filter="url(#dropShadow)">
          <path
            d="M 60 50
               C 60 45, 63 40, 63 35
               C 63 40, 66 45, 66 50
               C 66 57, 63 62, 60 62
               C 57 62, 54 57, 54 50
               C 54 45, 57 40, 60 35
               C 60 40, 60 45, 60 50 Z"
            fill="url(#mercuryDrop1)"
            stroke="#FFFFFF"
            strokeWidth="0.4"
            filter="url(#glow)"
          />
          <ellipse cx="61" cy="43" rx="5" ry="8" fill="url(#dropHighlight)" />
          {animated && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,-4;0,0;0,0;0,-4"
              dur="3s"
              repeatCount="indefinite"
              begin="0.2s"
            />
          )}
        </g>
      </svg>

      {/* Text Part */}
      {showText && (
        <div className="flex flex-row items-center gap-2">
          {/* Chinese Text - 万维银客城 */}
          <div
            className="text-lg md:text-xl font-title font-bold whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 25%, #E8E8E8 50%, #D4D4D4 75%, #C0C0C0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(255,255,255,0.3)',
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
              letterSpacing: '0.05em',
              fontWeight: 900,
            }}
          >
            万维银客城
          </div>

          {/* English Text - INKE CITY */}
          <div
            className="text-xs md:text-sm font-sans font-normal tracking-widest whitespace-nowrap"
            style={{
              color: '#E8E8E8',
              textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
              letterSpacing: '0.2em',
            }}
          >
            INKE CITY
          </div>
        </div>
      )}
    </div>
  )
}
