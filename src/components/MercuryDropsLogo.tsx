interface MercuryDropsLogoProps {
  className?: string
  animated?: boolean
}

export default function MercuryDropsLogo({ className = '', animated = true }: MercuryDropsLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Mercury metallic gradient for drops */}
        <linearGradient id="mercuryGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5F5F5" stopOpacity="1" />
          <stop offset="35%" stopColor="#E8E8E8" stopOpacity="1" />
          <stop offset="60%" stopColor="#C0C0C0" stopOpacity="1" />
          <stop offset="85%" stopColor="#A8A8A8" stopOpacity="1" />
          <stop offset="100%" stopColor="#808080" stopOpacity="1" />
        </linearGradient>

        <linearGradient id="mercuryGradient2" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#E8E8E8" stopOpacity="1" />
          <stop offset="40%" stopColor="#D4D4D4" stopOpacity="1" />
          <stop offset="70%" stopColor="#BEBEBE" stopOpacity="1" />
          <stop offset="100%" stopColor="#A8A8A8" stopOpacity="1" />
        </linearGradient>

        <linearGradient id="mercuryGradient3" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#F5F5F5" stopOpacity="1" />
          <stop offset="30%" stopColor="#D4D4D4" stopOpacity="1" />
          <stop offset="65%" stopColor="#C0C0C0" stopOpacity="1" />
          <stop offset="100%" stopColor="#909090" stopOpacity="1" />
        </linearGradient>

        {/* Highlight effect for liquid metal shine */}
        <radialGradient id="highlight1" cx="30%" cy="25%" r="40%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#F5F5F5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>

        {/* Filter for subtle glow */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Animation */}
        {animated && (
          <>
            <animate
              id="drop1Animation"
              attributeName="opacity"
              values="0;1;1;0"
              dur="3s"
              repeatCount="indefinite"
              begin="0s"
            />
            <animate
              id="drop2Animation"
              attributeName="opacity"
              values="0;1;1;0"
              dur="3s"
              repeatCount="indefinite"
              begin="0.3s"
            />
            <animate
              id="drop3Animation"
              attributeName="opacity"
              values="0;1;1;0"
              dur="3s"
              repeatCount="indefinite"
              begin="0.6s"
            />
          </>
        )}
      </defs>

      {/* Drop 1 - Top Left */}
      <g opacity={animated ? undefined : "1"} filter="url(#glow)">
        {animated && <use href="#drop1Animation" />}
        <path
          d="M 30 25
             C 30 20, 35 15, 35 10
             C 35 15, 40 20, 40 25
             C 40 32, 35 37, 30 37
             C 25 37, 20 32, 20 25
             C 20 20, 25 15, 30 10
             C 30 15, 30 20, 30 25 Z"
          fill="url(#mercuryGradient1)"
          stroke="#F5F5F5"
          strokeWidth="0.5"
        />
        {/* Highlight */}
        <ellipse cx="32" cy="20" rx="8" ry="10" fill="url(#highlight1)" opacity="0.7" />
        {animated && <animateTransform
          attributeName="transform"
          type="translate"
          values="0,-5;0,0;0,0;0,-5"
          dur="3s"
          repeatCount="indefinite"
          begin="0s"
        />}
      </g>

      {/* Drop 2 - Top Right */}
      <g opacity={animated ? undefined : "1"} filter="url(#glow)">
        {animated && <use href="#drop2Animation" />}
        <path
          d="M 70 25
             C 70 20, 75 15, 75 10
             C 75 15, 80 20, 80 25
             C 80 32, 75 37, 70 37
             C 65 37, 60 32, 60 25
             C 60 20, 65 15, 70 10
             C 70 15, 70 20, 70 25 Z"
          fill="url(#mercuryGradient2)"
          stroke="#E8E8E8"
          strokeWidth="0.5"
        />
        {/* Highlight */}
        <ellipse cx="72" cy="20" rx="8" ry="10" fill="url(#highlight1)" opacity="0.6" />
        {animated && <animateTransform
          attributeName="transform"
          type="translate"
          values="0,-5;0,0;0,0;0,-5"
          dur="3s"
          repeatCount="indefinite"
          begin="0.3s"
        />}
      </g>

      {/* Drop 3 - Bottom Center */}
      <g opacity={animated ? undefined : "1"} filter="url(#glow)">
        {animated && <use href="#drop3Animation" />}
        <path
          d="M 50 65
             C 50 58, 55 53, 55 45
             C 55 53, 60 58, 60 65
             C 60 75, 55 82, 50 82
             C 45 82, 40 75, 40 65
             C 40 58, 45 53, 50 45
             C 50 53, 50 58, 50 65 Z"
          fill="url(#mercuryGradient3)"
          stroke="#D4D4D4"
          strokeWidth="0.5"
        />
        {/* Highlight */}
        <ellipse cx="52" cy="58" rx="9" ry="12" fill="url(#highlight1)" opacity="0.65" />
        {animated && <animateTransform
          attributeName="transform"
          type="translate"
          values="0,-8;0,0;0,0;0,-8"
          dur="3s"
          repeatCount="indefinite"
          begin="0.6s"
        />}
      </g>
    </svg>
  )
}
