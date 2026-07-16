'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

function ResetInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const token = sp.get('token')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (pw !== pw2) { toast.error('Passwords do not match'); return }
    if (pw.length < 6) { toast.error('Minimum 6 characters'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/admin/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: pw }) })
      const d = await r.json()
      if (r.ok) { setDone(true); setTimeout(() => router.push('/admin/login'), 3000) }
      else toast.error(d.error || 'Reset failed')
    } catch { toast.error('Something went wrong') }
    setLoading(false)
  }

  if (!token) return <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-[#faf7f2] p-6"><div className="text-center"><h1 className="font-display text-3xl mb-4">Invalid reset link</h1><Link href="/admin/forgot-password" className="text-[#b8935a] hover:underline text-sm">Request a new one</Link></div></div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1680835099030-9c7532f744f1?w=1920&q=60')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a]/90 to-[#1a1a1a]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <img src="/elira-logo.png" alt="Elira Atelier" className="h-16 w-auto mx-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          <div className="mt-8 text-[11px] tracking-luxury text-[#d4b483]">— ADMIN PORTAL —</div>
        </div>
        {done ? (
          <div className="bg-[#faf7f2] p-10 shadow-2xl text-center">
            <div className="w-16 h-16 bg-[#b8935a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#b8935a]" strokeWidth={1} />
            </div>
            <h1 className="font-display text-3xl mb-3">Password updated</h1>
            <p className="text-sm text-[#1a1a1a]/60 mb-6">Redirecting to admin login...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="bg-[#faf7f2] p-10 shadow-2xl">
            <h1 className="font-display text-3xl mb-2">New admin password</h1>
            <p className="text-sm text-[#1a1a1a]/60 mb-8">Set a strong password (min 6 characters).</p>
            <div className="space-y-5">
              <div><label className="text-[10px] tracking-luxury text-[#1a1a1a]/60">NEW PASSWORD</label>
                <div className="flex items-center gap-3 border-b border-[#1a1a1a]/30 focus-within:border-[#b8935a] mt-2">
                  <Lock className="w-4 h-4 text-[#b8935a]" />
                  <input required type="password" value={pw} onChange={e => setPw(e.target.value)} className="flex-1 bg-transparent py-2 outline-none text-sm" />
                </div>
              </div>
              <div><label className="text-[10px] tracking-luxury text-[#1a1a1a]/60">CONFIRM PASSWORD</label>
                <div className="flex items-center gap-3 border-b border-[#1a1a1a]/30 focus-within:border-[#b8935a] mt-2">
                  <Lock className="w-4 h-4 text-[#b8935a]" />
                  <input required type="password" value={pw2} onChange={e => setPw2(e.target.value)} className="flex-1 bg-transparent py-2 outline-none text-sm" />
                </div>
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full mt-8 bg-[#1a1a1a] text-[#faf7f2] py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? 'UPDATING...' : 'UPDATE PASSWORD'} <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default function AdminReset() {
  return <Suspense fallback={<div className="min-h-screen" />}><ResetInner /></Suspense>
}
