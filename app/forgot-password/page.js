'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch { toast.error('Something went wrong') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf7f2] p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><img src="/elira-logo.png" alt="Elira Atelier" className="h-16 w-auto object-contain mx-auto" /></Link>
        </div>

        {sent ? (
          <div className="bg-white border border-[#e6dfd0] p-10 text-center">
            <div className="w-16 h-16 bg-[#b8935a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#b8935a]" strokeWidth={1} />
            </div>
            <div className="text-[10px] tracking-luxury text-[#b8935a] mb-2">EMAIL SENT</div>
            <h1 className="font-display text-3xl mb-4">Check your inbox</h1>
            <p className="text-[#1a1a1a]/70 text-sm mb-8">If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. The link is valid for 60 minutes.</p>
            <Link href="/login" className="inline-flex items-center gap-2 text-[11px] tracking-luxury hover:text-[#b8935a]"><ArrowLeft className="w-4 h-4" /> BACK TO SIGN IN</Link>
          </div>
        ) : (
          <div className="bg-white border border-[#e6dfd0] p-10">
            <div className="text-[10px] tracking-luxury text-[#b8935a] mb-3">— FORGOT PASSWORD</div>
            <h1 className="font-display text-4xl mb-2">Reset your password.</h1>
            <p className="text-sm text-[#1a1a1a]/60 mb-8">Enter the email associated with your account and we'll send a secure link.</p>
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="text-[10px] tracking-luxury text-[#1a1a1a]/60">EMAIL</label>
                <div className="flex items-center gap-3 border-b border-[#1a1a1a]/30 focus-within:border-[#b8935a] mt-2">
                  <Mail className="w-4 h-4 text-[#b8935a]" />
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 bg-transparent py-2 outline-none text-sm" />
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-[#1a1a1a] text-[#faf7f2] py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? 'SENDING...' : 'SEND RESET LINK'} <ArrowRight className="w-3 h-3" />
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-[11px] tracking-luxury text-[#1a1a1a]/50 hover:text-[#b8935a]"><ArrowLeft className="w-4 h-4" /> BACK TO SIGN IN</Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
