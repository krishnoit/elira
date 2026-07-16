'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminForgot() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/admin/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      setSent(true)
    } catch { toast.error('Something went wrong') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1680835099030-9c7532f744f1?w=1920&q=60')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a]/90 to-[#1a1a1a]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <img src="/elira-logo.png" alt="Elira Atelier" className="h-16 w-auto mx-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          <div className="mt-8 text-[11px] tracking-luxury text-[#d4b483]">— ADMIN PORTAL —</div>
        </div>
        {sent ? (
          <div className="bg-[#faf7f2] p-10 shadow-2xl text-center">
            <div className="w-16 h-16 bg-[#b8935a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#b8935a]" strokeWidth={1} />
            </div>
            <h1 className="font-display text-3xl mb-3">Check your inbox</h1>
            <p className="text-sm text-[#1a1a1a]/60 mb-8">If <strong>{email}</strong> is a registered admin, a reset link has been sent. Link valid for 60 minutes.</p>
            <Link href="/admin/login" className="text-[11px] tracking-luxury text-[#b8935a]">← BACK TO LOGIN</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-[#faf7f2] p-10 shadow-2xl">
            <h1 className="font-display text-3xl mb-2">Forgot password?</h1>
            <p className="text-sm text-[#1a1a1a]/60 mb-8">Enter your admin email and we'll send a reset link.</p>
            <div>
              <label className="text-[10px] tracking-luxury text-[#1a1a1a]/60">ADMIN EMAIL</label>
              <div className="flex items-center gap-3 border-b border-[#1a1a1a]/30 focus-within:border-[#b8935a] mt-2">
                <Mail className="w-4 h-4 text-[#b8935a]" />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 bg-transparent py-2 outline-none text-sm" />
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full mt-8 bg-[#1a1a1a] text-[#faf7f2] py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? 'SENDING...' : 'SEND RESET LINK'} <ArrowRight className="w-3 h-3" />
            </button>
            <div className="mt-6 text-center">
              <Link href="/admin/login" className="inline-flex items-center gap-2 text-[10px] tracking-luxury text-[#1a1a1a]/50 hover:text-[#b8935a]"><ArrowLeft className="w-3 h-3" /> BACK TO LOGIN</Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
