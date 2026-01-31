import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        style: {
          background: 'rgb(20, 20, 20)',
          border: '2px solid rgba(192, 192, 192, 0.5)',
          color: 'rgb(232, 232, 232)',
          fontFamily: 'monospace',
          boxShadow: '0 0 20px rgba(192, 192, 192, 0.3)',
        },
        className: 'font-mono',
      }}
      richColors
    />
  )
}