'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, User, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
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
        toast.success('Welcome back, ' + data.user)
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
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1680835099030-9c7532f744f1?w=1920&q=60')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a]/90 to-[#1a1a1a]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="font-serif font-light text-5xl text-[#faf7f2] tracking-refined" style={{fontFamily:'var(--font-cormorant), serif'}}>ELIRA</div>
          <div className="text-[10px] tracking-luxury text-[#b8935a] -mt-1">ATELIER</div>
          <div className="mt-8 text-[11px] tracking-luxury text-[#d4b483]">— ADMINISTRATOR PORTAL —</div>
        </div>
        <form onSubmit={submit} className="bg-[#faf7f2] p-10 shadow-2xl">
          <h1 className="font-serif text-3xl mb-2" style={{fontFamily:'var(--font-cormorant), serif'}}>Sign in</h1>
          <p className="text-sm text-[#1a1a1a]/60 mb-8">Access the atelier command center</p>
          <div className="space-y-5">
            <div>
              <label className="text-[10px] tracking-luxury text-[#1a1a1a]/60">USERNAME</label>
              <div className="flex items-center gap-3 border-b border-[#1a1a1a]/30 focus-within:border-[#b8935a] transition-colors mt-2">
                <User className="w-4 h-4 text-[#b8935a]" />
                <input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="flex-1 bg-transparent py-2 outline-none text-sm" placeholder="admin" />
              </div>
            </div>
            <div>
              <label className="text-[10px] tracking-luxury text-[#1a1a1a]/60">PASSWORD</label>
              <div className="flex items-center gap-3 border-b border-[#1a1a1a]/30 focus-within:border-[#b8935a] transition-colors mt-2">
                <Lock className="w-4 h-4 text-[#b8935a]" />
                <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="flex-1 bg-transparent py-2 outline-none text-sm" placeholder="••••••••" />
              </div>
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full mt-10 bg-[#1a1a1a] text-[#faf7f2] py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors flex items-center justify-center gap-3 disabled:opacity-50">
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'} <ArrowRight className="w-3 h-3" />
          </button>
          <div className="mt-6 text-center text-[10px] tracking-refined text-[#1a1a1a]/40">
            Default: <span className="text-[#b8935a]">admin</span> / <span className="text-[#b8935a]">elira2025</span>
          </div>
        </form>
        <div className="text-center mt-6">
          <a href="/" className="text-[10px] tracking-luxury text-white/50 hover:text-[#b8935a]">← BACK TO STORE</a>
        </div>
      </motion.div>
    </div>
  )
}
