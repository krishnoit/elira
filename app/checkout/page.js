'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle2, MapPin, User, Mail, Phone, ArrowRight, Lock } from 'lucide-react'
import { getCart, cartTotals, clearCart } from '@/lib/cart'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(null)
  const [step, setStep] = useState(1) // 1 = auth, 2 = address, 3 = payment
  const [placing, setPlacing] = useState(false)
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'',
    address:'', city:'', state:'', pincode:'', country:'India',
    payment:'cod', notes:''
  })

  useEffect(() => {
    setMounted(true)
    const c = getCart()
    if (c.length === 0) { router.push('/cart'); return }
    setItems(c)
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) {
        setUser(d.user)
        setForm(f => ({ ...f, email: d.user.email, firstName: d.user.name?.split(' ')[0] || '', lastName: d.user.name?.split(' ').slice(1).join(' ') || '' }))
        setStep(2)
      } else {
        setStep(1)
      }
    })
  }, [router])

  const totals = cartTotals(items)
  const canProceedAddress = form.firstName && form.lastName && form.email && form.phone && form.address && form.city && form.state && form.pincode

  const placeOrder = async () => {
    if (!canProceedAddress) { toast.error('Please complete all details'); return }
    setPlacing(true)
    try {
      const orderData = {
        items, totals,
        customer: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
        shipping: { address: form.address, city: form.city, state: form.state, pincode: form.pincode, country: form.country },
        payment: form.payment,
        notes: form.notes,
      }
      const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) })
      const data = await r.json()
      if (!r.ok || !data.success) throw new Error(data.error || 'Failed')

      if (form.payment === 'cod') {
        clearCart()
        router.push(`/order-success?id=${data.orderId}`)
      } else {
        // Razorpay flow
        const ro = await fetch('/api/payments/razorpay/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totals.total, orderDbId: data.orderId }),
        })
        const rzOrder = await ro.json()
        if (!ro.ok) throw new Error(rzOrder.error || 'Razorpay order failed')

        const opts = {
          key: rzOrder.keyId,
          amount: rzOrder.amount,
          currency: rzOrder.currency,
          name: 'Elira Atelier',
          description: `Order #${data.orderNumber}`,
          order_id: rzOrder.orderId,
          prefill: { name: `${form.firstName} ${form.lastName}`, email: form.email, contact: form.phone },
          theme: { color: '#b8935a' },
          handler: async (response) => {
            const v = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, orderDbId: data.orderId }),
            })
            const vd = await v.json()
            if (vd.ok) {
              clearCart()
              toast.success('Payment successful')
              router.push(`/account?orderPlaced=${data.orderId}`)
            } else {
              toast.error('Payment verification failed')
            }
          },
          modal: {
            ondismiss: () => { setPlacing(false); toast.error('Payment cancelled') }
          }
        }
        const rzp = new window.Razorpay(opts)
        rzp.open()
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setPlacing(false)
    }
  }

  if (!mounted) return <div className="min-h-screen" />

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <header className="border-b border-[#e6dfd0] py-6 px-6 md:px-16 lg:px-24">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-2 text-[10px] md:text-[11px] tracking-luxury hover:text-[#b8935a]"><ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">BACK TO BAG</span></Link>
          <Link href="/" className="flex-shrink-0">
            <img src="/elira-logo.jpg" alt="Elira Atelier" className="h-10 md:h-12 w-auto object-contain" />
          </Link>
          <div className="text-[10px] md:text-[11px] tracking-luxury flex items-center gap-2"><Shield className="w-3 h-3" /> <span className="hidden sm:inline">SECURE CHECKOUT</span></div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-16 py-16 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-light text-5xl md:text-6xl mb-4">Check<span className="italic">out.</span></motion.h1>
          <p className="text-[#1a1a1a]/60 mb-10">Complete your journey with Elira.</p>

          <Steps step={step} loggedIn={!!user} />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section key="auth" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-10">
                <div className="bg-white border border-[#e6dfd0] p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-6 h-6 text-[#b8935a]" />
                    <h2 className="font-display text-3xl">Sign in to continue</h2>
                  </div>
                  <p className="text-[#1a1a1a]/70 mb-8">Your cart will remain intact. Sign in or create an account to complete your order, track deliveries and access members-only editorial.</p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={`/login?returnTo=/checkout`} className="flex-1 inline-flex items-center justify-center gap-3 bg-[#1a1a1a] text-[#faf7f2] px-8 py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors">
                      SIGN IN / REGISTER <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button onClick={() => { window.location.href = `/api/auth/google/start?returnTo=/checkout` }} className="flex-1 inline-flex items-center justify-center gap-3 border border-[#1a1a1a] px-8 py-4 text-[11px] tracking-luxury hover:bg-[#1a1a1a] hover:text-white transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8.2z"/><path fill="currentColor" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8C3.9 20.4 7.7 23 12 23z"/><path fill="currentColor" d="M5.7 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V7H2.1C1.4 8.5 1 10.2 1 12s.4 3.5 1.1 5l3.6-2.9z"/><path fill="currentColor" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.1-3.1C17.5 2.1 15 1 12 1 7.7 1 3.9 3.6 2.1 7l3.6 2.8c.9-2.6 3.4-4.4 6.3-4.4z"/></svg>
                      CONTINUE WITH GOOGLE
                    </button>
                  </div>
                  <div className="text-center text-[10px] text-[#1a1a1a]/40 mt-6">By continuing you agree to our Terms & Privacy Policy</div>
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section key="address" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-10 space-y-10">
                <div>
                  <h2 className="font-display text-2xl mb-6">Contact & Delivery Details</h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="FIRST NAME" icon={User}><input required value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} className="input" /></Field>
                    <Field label="LAST NAME"><input required value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} className="input" /></Field>
                    <Field label="EMAIL" icon={Mail}><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="input" /></Field>
                    <Field label="PHONE" icon={Phone}><input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="input" /></Field>
                  </div>
                  <div className="mt-5">
                    <Field label="STREET ADDRESS" icon={MapPin}><input required value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className="input" placeholder="House / Flat, Street, Locality" /></Field>
                  </div>
                  <div className="grid md:grid-cols-3 gap-5 mt-5">
                    <Field label="CITY"><input required value={form.city} onChange={e=>setForm({...form,city:e.target.value})} className="input" /></Field>
                    <Field label="STATE"><input required value={form.state} onChange={e=>setForm({...form,state:e.target.value})} className="input" /></Field>
                    <Field label="PINCODE"><input required value={form.pincode} onChange={e=>setForm({...form,pincode:e.target.value})} className="input" /></Field>
                  </div>
                  <div className="mt-5">
                    <Field label="ORDER NOTES (optional)"><textarea rows={2} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="input resize-none" placeholder="Gift wrap, delivery instructions..." /></Field>
                  </div>
                  <button onClick={() => { if (canProceedAddress) setStep(3); else toast.error('Please complete all fields') }} className="mt-8 w-full md:w-auto bg-[#1a1a1a] text-[#faf7f2] px-10 py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors inline-flex items-center gap-3">CONTINUE TO PAYMENT <ArrowRight className="w-3 h-3" /></button>
                </div>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section key="pay" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-10">
                <h2 className="font-display text-2xl mb-6">Choose Payment Method</h2>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 border p-5 cursor-pointer transition-all ${form.payment==='razorpay'?'border-[#b8935a] bg-[#b8935a]/5':'border-[#e6dfd0] hover:border-[#b8935a]/50'}`}>
                    <input type="radio" checked={form.payment==='razorpay'} onChange={()=>setForm({...form,payment:'razorpay'})} className="accent-[#b8935a]" />
                    <CreditCard className="w-5 h-5 text-[#b8935a]" />
                    <div className="flex-1">
                      <div className="font-display text-lg">Pay Online <span className="text-[9px] tracking-luxury text-[#b8935a] ml-2">RECOMMENDED</span></div>
                      <div className="text-xs text-[#1a1a1a]/60">Credit / Debit card, UPI, netbanking, wallets — via Razorpay (test mode).</div>
                    </div>
                  </label>
                  <label className={`flex items-center gap-4 border p-5 cursor-pointer transition-all ${form.payment==='cod'?'border-[#b8935a] bg-[#b8935a]/5':'border-[#e6dfd0] hover:border-[#b8935a]/50'}`}>
                    <input type="radio" checked={form.payment==='cod'} onChange={()=>setForm({...form,payment:'cod'})} className="accent-[#b8935a]" />
                    <Truck className="w-5 h-5 text-[#b8935a]" />
                    <div className="flex-1">
                      <div className="font-display text-lg">Cash on Delivery</div>
                      <div className="text-xs text-[#1a1a1a]/60">Pay in cash when your order arrives at your doorstep.</div>
                    </div>
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button onClick={()=>setStep(2)} className="border border-[#1a1a1a] px-8 py-4 text-[11px] tracking-luxury hover:bg-[#1a1a1a] hover:text-white transition-colors">← EDIT ADDRESS</button>
                  <button onClick={placeOrder} disabled={placing} className="flex-1 bg-[#1a1a1a] text-[#faf7f2] py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-3">
                    {placing ? 'PROCESSING...' : (form.payment === 'razorpay' ? `PAY ₹${totals.total.toLocaleString('en-IN')} NOW` : 'PLACE ORDER')} <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-[#f0ebe1] p-8 sticky top-6">
            {user && (
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#1a1a1a]/10">
                {user.picture ? <img src={user.picture} alt="" className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 rounded-full bg-[#b8935a] text-white flex items-center justify-center text-sm">{user.name?.[0]?.toUpperCase()}</div>}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{user.name}</div>
                  <div className="text-[10px] text-[#1a1a1a]/60 truncate">{user.email}</div>
                </div>
              </div>
            )}
            <h2 className="font-display text-2xl mb-6 pb-4 border-b border-[#1a1a1a]/10">Your Order</h2>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map(i => {
                const unit = Math.round(i.price * (1 - i.discount/100))
                return (
                  <div key={i.key} className="flex gap-3">
                    <div className="w-14 h-16 bg-white flex-shrink-0 overflow-hidden relative">
                      <img src={i.image} alt="" className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#1a1a1a] text-white text-[10px] rounded-full flex items-center justify-center">{i.qty}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-display truncate">{i.name}</div>
                      <div className="text-[10px] text-[#1a1a1a]/50">{i.size} · {i.color}</div>
                    </div>
                    <div className="text-xs font-display">₹{(unit*i.qty).toLocaleString('en-IN')}</div>
                  </div>
                )
              })}
            </div>
            <div className="space-y-2 text-sm border-t border-[#1a1a1a]/10 pt-4">
              <div className="flex justify-between"><span className="text-[#1a1a1a]/70">Subtotal</span><span>₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-[#1a1a1a]/70">Shipping</span><span>{totals.shipping===0?<span className="text-[#b8935a]">FREE</span>:`₹${totals.shipping}`}</span></div>
            </div>
            <div className="pt-4 mt-4 border-t border-[#1a1a1a]/10 flex justify-between items-end">
              <span className="text-[11px] tracking-luxury">TOTAL</span>
              <span className="font-display text-3xl">₹{totals.total.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#1a1a1a]/50 mt-4 justify-center"><Shield className="w-3 h-3" /> Encrypted · Secure · Free returns</div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .input { width:100%; background:transparent; border:0; border-bottom:1px solid rgba(26,26,26,0.2); padding:8px 0; outline:none; font-size:14px; }
        .input:focus { border-color: #b8935a; }
      `}</style>
    </div>
  )
}

function Steps({ step, loggedIn }) {
  const steps = loggedIn
    ? [{ n: 1, label: 'Delivery' }, { n: 2, label: 'Payment' }]
    : [{ n: 1, label: 'Sign in' }, { n: 2, label: 'Delivery' }, { n: 3, label: 'Payment' }]
  const cur = loggedIn ? step - 1 : step
  return (
    <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-none">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <div className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-xs flex-shrink-0 ${cur >= s.n ? 'bg-[#1a1a1a] text-[#faf7f2]' : 'bg-[#e6dfd0] text-[#1a1a1a]/60'}`}>{s.n}</div>
          <span className={`text-[10px] md:text-[11px] tracking-luxury whitespace-nowrap ${cur >= s.n ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/40'}`}>{s.label.toUpperCase()}</span>
          {i < steps.length - 1 && <div className={`w-6 md:w-12 h-px ${cur > s.n ? 'bg-[#b8935a]' : 'bg-[#e6dfd0]'}`} />}
        </div>
      ))}
    </div>
  )
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mb-1 flex items-center gap-2">{Icon && <Icon className="w-3 h-3 text-[#b8935a]" />}{label}</div>
      {children}
    </div>
  )
}
