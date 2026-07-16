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
    if (pw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const r = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pw }),
      })
      const d = await r.json()
      if (r.ok) {
        setDone(true)
        setTimeout(() => router.push('/login'), 3000)
      } else toast.error(d.error || 'Reset failed')
    } catch { toast.error('Something went wrong') }
    setLoading(false)
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf7f2] p-6">
      <div className="text-center">
        <h1 className="font-display text-3xl mb-4">Invalid reset link</h1>
        <Link href="/forgot-password" className="text-[#b8935a] hover:underline text-sm">Request a new one</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf7f2] p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><img src="/elira-logo.png" alt="Elira Atelier" className="h-16 w-auto object-contain mx-auto" /></Link>
        </div>
        {done ? (
          <div className="bg-white border border-[#e6dfd0] p-10 text-center">
            <div className="w-16 h-16 bg-[#b8935a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#b8935a]" strokeWidth={1} />
            </div>
            <h1 className="font-display text-3xl mb-3">Password updated</h1>
            <p className="text-sm text-[#1a1a1a]/60 mb-6">Redirecting to sign in...</p>
            <Link href="/login" className="text-[11px] tracking-luxury text-[#b8935a]">SIGN IN NOW →</Link>
          </div>
        ) : (
          <div className="bg-white border border-[#e6dfd0] p-10">
            <div className="text-[10px] tracking-luxury text-[#b8935a] mb-3">— NEW PASSWORD</div>
            <h1 className="font-display text-4xl mb-2">Set a new password.</h1>
            <p className="text-sm text-[#1a1a1a]/60 mb-8">Choose a password with at least 6 characters.</p>
            <form onSubmit={submit} className="space-y-5">
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
              <button disabled={loading} type="submit" className="w-full bg-[#1a1a1a] text-[#faf7f2] py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? 'UPDATING...' : 'UPDATE PASSWORD'} <ArrowRight className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function ResetPassword() {
  return <Suspense fallback={<div className="min-h-screen" />}><ResetInner /></Suspense>
}
