'use client'
import { Toaster } from 'sonner'

export function Providers({ children }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a1a', color: '#faf7f2', border: '1px solid #b8935a' } }} />
    </>
  )
}
