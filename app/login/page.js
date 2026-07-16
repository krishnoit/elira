'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, User } from 'lucide-react'
import { toast } from 'sonner'

function LoginInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const returnTo = sp.get('returnTo') || '/account'
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sp.get('error')) toast.error('Sign-in failed. Please try again.')
  }, [sp])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await r.json()
      if (r.ok) {
        toast.success(mode === 'login' ? `Welcome back, ${data.user.name}` : `Welcome to Elira, ${data.user.name}`)
        // Sync local cart to server
        try {
          const local = JSON.parse(localStorage.getItem('elira_cart') || '[]')
          if (local.length) await fetch('/api/user/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: local }) })
        } catch {}
        router.push(returnTo)
      } else toast.error(data.error || 'Failed')
    } catch { toast.error('Connection error') }
    setLoading(false)
  }

  const google = () => {
    window.location.href = `/api/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`
  }

  return (
    <div className="min-h-screen flex bg-[#faf7f2]">
      <div className="hidden lg:block flex-1 relative bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574015974293-817f0ebebb74?w=1200&q=80')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-[#faf7f2]">
          <Link href="/" className="self-start">
            <img src="/elira-logo.png" alt="Elira Atelier" className="h-16 md:h-20 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          </Link>
          <div className="max-w-md">
            <div className="text-[10px] tracking-luxury text-[#d4b483] mb-4">— THE HOUSE OF ELIRA</div>
            <h1 className="font-display text-5xl md:text-6xl leading-tight mb-4">Enter your <span className="italic">private</span> world.</h1>
            <p className="text-white/70">Wishlist, seamless checkout, order tracking, and members-only editorial — all reserved for you.</p>
          </div>
          <div className="text-[10px] tracking-luxury text-white/40">© 2026 ELIRA ATELIER</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/"><img src="/elira-logo.png" alt="Elira Atelier" className="h-12 w-auto object-contain mx-auto" /></Link>
          </div>
          <div className="text-[10px] tracking-luxury text-[#b8935a] mb-3">— {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'} —</div>
          <h2 className="font-display text-4xl md:text-5xl mb-2">{mode === 'login' ? 'Sign in' : 'Register'}</h2>
          <p className="text-[#1a1a1a]/60 mb-8">{mode === 'login' ? 'Access your bag, wishlist and orders.' : 'Begin your journey with the atelier.'}</p>

          <button onClick={google} className="w-full flex items-center justify-center gap-3 border border-[#1a1a1a] py-4 text-sm hover:bg-[#1a1a1a] hover:text-white transition-colors mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8.2z"/><path fill="currentColor" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8C3.9 20.4 7.7 23 12 23z"/><path fill="currentColor" d="M5.7 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V7H2.1C1.4 8.5 1 10.2 1 12s.4 3.5 1.1 5l3.6-2.9z"/><path fill="currentColor" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.1-3.1C17.5 2.1 15 1 12 1 7.7 1 3.9 3.6 2.1 7l3.6 2.8c.9-2.6 3.4-4.4 6.3-4.4z"/></svg>
            CONTINUE WITH GOOGLE
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#e6dfd0]" /><span className="text-[10px] tracking-luxury text-[#1a1a1a]/40">OR</span><div className="flex-1 h-px bg-[#e6dfd0]" />
          </div>

          <form onSubmit={submit} className="space-y-5">
            {mode === 'register' && (
              <div><label className="text-[10px] tracking-luxury text-[#1a1a1a]/60">FULL NAME</label>
                <div className="flex items-center gap-3 border-b border-[#1a1a1a]/30 focus-within:border-[#b8935a] mt-2">
                  <User className="w-4 h-4 text-[#b8935a]" />
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="flex-1 bg-transparent py-2 outline-none text-sm" />
                </div>
              </div>
            )}
            <div><label className="text-[10px] tracking-luxury text-[#1a1a1a]/60">EMAIL</label>
              <div className="flex items-center gap-3 border-b border-[#1a1a1a]/30 focus-within:border-[#b8935a] mt-2">
                <Mail className="w-4 h-4 text-[#b8935a]" />
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="flex-1 bg-transparent py-2 outline-none text-sm" />
              </div>
            </div>
            <div><label className="text-[10px] tracking-luxury text-[#1a1a1a]/60">PASSWORD</label>
              <div className="flex items-center gap-3 border-b border-[#1a1a1a]/30 focus-within:border-[#b8935a] mt-2">
                <Lock className="w-4 h-4 text-[#b8935a]" />
                <input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="flex-1 bg-transparent py-2 outline-none text-sm" placeholder={mode === 'register' ? 'Minimum 6 characters' : ''} />
              </div>
              {mode === 'login' && (
                <div className="text-right mt-2">
                  <Link href="/forgot-password" className="text-[10px] tracking-luxury text-[#b8935a] hover:underline">FORGOT PASSWORD?</Link>
                </div>
              )}
            </div>
            <button disabled={loading} type="submit" className="w-full bg-[#1a1a1a] text-[#faf7f2] py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? 'PLEASE WAIT...' : (mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT')} <ArrowRight className="w-3 h-3" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#1a1a1a]/60">
            {mode === 'login' ? 'New to Elira?' : 'Already have an account?'}{' '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-[#b8935a] hover:underline">
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </div>
          <div className="mt-4 text-center">
            <Link href="/" className="text-[10px] tracking-luxury text-[#1a1a1a]/40 hover:text-[#b8935a]">← BACK TO STORE</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen" />}><LoginInner /></Suspense>
}
