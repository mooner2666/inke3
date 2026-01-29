/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				// Silver Mercury Theme Colors
				'silver-bright': '#F5F5F5',
				'silver-light': '#E8E8E8',
				'silver-main': '#C0C0C0',
				'silver-medium': '#A8A8A8',
				'silver-dark': '#808080',
				'mercury-glow': '#D4D4D4',
				'metallic-shine': '#BEBEBE',
				'warning-red': '#FF3366',

				// Dark Backgrounds
				'deep-black': '#0A0A0A',
				'charcoal-dark': '#1A1A1A',
				'grid-gray': '#2A2A2A',
				'surface-dark': '#1E1E1E',

				// Overrides (keeping silver theme)
				border: '#C0C0C0',
				input: 'hsl(var(--input))',
				ring: '#C0C0C0',
				background: '#0A0A0A',
				foreground: '#F5F5F5',
				primary: {
					DEFAULT: '#C0C0C0',
					foreground: '#0A0A0A',
				},
				secondary: {
					DEFAULT: '#E8E8E8',
					foreground: '#0A0A0A',
				},
				accent: {
					DEFAULT: '#F5F5F5',
					foreground: '#0A0A0A',
				},
				destructive: {
					DEFAULT: '#FF3366',
					foreground: '#FFFFFF',
				},
				muted: {
					DEFAULT: '#2A2A2A',
					foreground: '#A8A8A8',
				},
				popover: {
					DEFAULT: '#1E1E1E',
					foreground: '#F5F5F5',
				},
				card: {
					DEFAULT: '#1E1E1E',
					foreground: '#F5F5F5',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 5px #C0C0C0, 0 0 10px #C0C0C0',
					},
					'50%': {
						boxShadow: '0 0 20px #F5F5F5, 0 0 30px #E8E8E8',
					},
				},
				'silver-flicker': {
					'0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
						textShadow: '0 0 10px #C0C0C0, 0 0 20px #E8E8E8, 0 0 30px #F5F5F5',
					},
					'20%, 24%, 55%': {
						textShadow: 'none',
					},
				},
				'scan-line': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100%)' },
				},
				'mercury-drip': {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'50%': { opacity: '1' },
					'100%': { transform: 'translateY(10px)', opacity: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'silver-flicker': 'silver-flicker 3s linear infinite',
				'scan-line': 'scan-line 6s linear infinite',
				'mercury-drip': 'mercury-drip 2s ease-in-out infinite',
			},
			fontFamily: {
				'serif': ['Noto Serif SC', 'serif'],
				'title': ['Noto Serif SC', 'serif'],
				'cyber': ['Orbitron', 'Rajdhani', 'Inter', 'sans-serif'],
				'sans': ['Inter', 'Noto Sans SC', 'sans-serif'],
				'mono': ['Fira Code', 'JetBrains Mono', 'monospace'],
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
