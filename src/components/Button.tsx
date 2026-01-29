import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'font-cyber font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group'

    const variants = {
      primary: 'bg-transparent border-2 border-silver-main text-silver-main hover:bg-silver-main hover:text-deep-black hover:shadow-[0_0_20px_rgba(192,192,192,0.8)]',
      secondary: 'bg-transparent border-2 border-silver-light text-silver-light hover:bg-silver-light hover:text-deep-black hover:shadow-[0_0_20px_rgba(232,232,232,0.8)]',
      accent: 'bg-transparent border-2 border-silver-bright text-silver-bright hover:bg-silver-bright hover:text-deep-black hover:shadow-[0_0_20px_rgba(245,245,245,0.8)]',
      ghost: 'bg-transparent text-white hover:text-silver-bright hover:bg-surface-dark',
      destructive: 'bg-transparent border-2 border-warning-red text-warning-red hover:bg-warning-red hover:text-white hover:shadow-[0_0_20px_#FF3366]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded',
      md: 'px-6 py-3 text-base rounded-md',
      lg: 'px-8 py-4 text-lg rounded-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
