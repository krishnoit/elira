'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await r.json()
      if (r.ok && data.token) {
        localStorage.setItem('elira_admin_token', data.token)
        localStorage.setItem('elira_admin_user', data.user)
        toast.success('Welcome back')
        router.push('/admin')
      } else {
        toast.error(data.error || 'Invalid credentials')
      }
    } catch (err) {
      toast.error('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1680835099030-9c7532f744f1?w=1920&q=60')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a]/90 to-[#1a1a1a]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <img src="/elira-logo.png" alt="Elira Atelier" className="h-16 md:h-20 w-auto mx-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          <div className="mt-8 text-[11px] tracking-luxury text-[#d4b483]">— ADMINISTRATOR PORTAL —</div>
        </div>
        <form onSubmit={submit} className="bg-[#faf7f2] p-8 md:p-10 shadow-2xl">
          <h1 className="font-serif text-3xl mb-2" style={{fontFamily:'var(--font-cormorant), serif'}}>Sign in</h1>
          <p className="text-sm text-[#1a1a1a]/60 mb-8">Access the atelier command center</p>
          <div className="space-y-5">
            <div>
              <label className="text-[10px] tracking-luxury text-[#1a1a1a]/60">EMAIL</label>
              <div className="flex items-center gap-3 border-b border-[#1a1a1a]/30 focus-within:border-[#b8935a] transition-colors mt-2">
                <Mail className="w-4 h-4 text-[#b8935a]" />
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="flex-1 bg-transparent py-2 outline-none text-sm" placeholder="admin@example.com" />
              </div>
            </div>
            <div>
              <label className="text-[10px] tracking-luxury text-[#1a1a1a]/60">PASSWORD</label>
              <div className="flex items-center gap-3 border-b border-[#1a1a1a]/30 focus-within:border-[#b8935a] transition-colors mt-2">
                <Lock className="w-4 h-4 text-[#b8935a]" />
                <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="flex-1 bg-transparent py-2 outline-none text-sm" placeholder="••••••••" />
              </div>
              <div className="text-right mt-2">
                <Link href="/admin/forgot-password" className="text-[10px] tracking-luxury text-[#b8935a] hover:underline">FORGOT PASSWORD?</Link>
              </div>
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full mt-10 bg-[#1a1a1a] text-[#faf7f2] py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors flex items-center justify-center gap-3 disabled:opacity-50">
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'} <ArrowRight className="w-3 h-3" />
          </button>
        </form>
        <div className="text-center mt-6">
          <a href="/" className="text-[10px] tracking-luxury text-white/50 hover:text-[#b8935a]">← BACK TO STORE</a>
        </div>
      </motion.div>
    </div>
  )
}
