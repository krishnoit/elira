'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle2, MapPin, User, Mail, Phone } from 'lucide-react'
import { getCart, cartTotals, clearCart } from '@/lib/cart'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [placing, setPlacing] = useState(false)
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'',
    address:'', city:'', state:'', pincode:'', country:'India',
    payment:'cod', notes:''
  })

  useEffect(() => {
    setMounted(true)
    const c = getCart()
    if (c.length === 0) router.push('/cart')
    setItems(c)
  }, [router])

  const totals = cartTotals(items)
  const canProceed = form.firstName && form.lastName && form.email && form.phone && form.address && form.city && form.state && form.pincode

  const placeOrder = async () => {
    if (!canProceed) { toast.error('Please complete all details'); return }
    setPlacing(true)
    try {
      const orderData = {
        items,
        totals,
        customer: {
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, phone: form.phone,
        },
        shipping: {
          address: form.address, city: form.city, state: form.state,
          pincode: form.pincode, country: form.country,
        },
        payment: form.payment,
        notes: form.notes,
      }
      const r = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
      const data = await r.json()
      if (r.ok && data.success) {
        clearCart()
        router.push(`/order-success?id=${data.orderId}`)
      } else {
        toast.error(data.error || 'Failed to place order')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setPlacing(false)
    }
  }

  if (!mounted) return <div className="min-h-screen" />

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <header className="border-b border-[#e6dfd0] py-6 px-6 md:px-16 lg:px-24">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-2 text-[11px] tracking-luxury hover:text-[#b8935a]"><ArrowLeft className="w-4 h-4" /> BACK TO BAG</Link>
          <Link href="/" className="text-center">
            <div className="font-display font-light text-2xl tracking-refined">ELIRA</div>
            <div className="text-[9px] tracking-luxury text-[#b8935a] -mt-1">ATELIER</div>
          </Link>
          <div className="text-[11px] tracking-luxury flex items-center gap-2"><Shield className="w-3 h-3" /> SECURE CHECKOUT</div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-16 py-16 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-light text-5xl md:text-6xl mb-4">Check<span className="italic">out.</span></motion.h1>
          <p className="text-[#1a1a1a]/60 mb-12">Complete your journey with Elira.</p>

          <div className="space-y-10">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#1a1a1a] text-[#faf7f2] flex items-center justify-center text-xs">1</div>
                <h2 className="font-display text-2xl">Contact & Delivery</h2>
              </div>
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
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-[#1a1a1a] text-[#faf7f2] flex items-center justify-center text-xs">2</div>
                <h2 className="font-display text-2xl">Payment</h2>
              </div>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 border p-5 cursor-pointer transition-all ${form.payment==='cod'?'border-[#b8935a] bg-[#b8935a]/5':'border-[#e6dfd0] hover:border-[#b8935a]/50'}`}>
                  <input type="radio" checked={form.payment==='cod'} onChange={()=>setForm({...form,payment:'cod'})} className="accent-[#b8935a]" />
                  <Truck className="w-5 h-5 text-[#b8935a]" />
                  <div className="flex-1">
                    <div className="font-display text-lg">Cash on Delivery</div>
                    <div className="text-xs text-[#1a1a1a]/60">Pay in cash when your order arrives.</div>
                  </div>
                </label>
                <label className={`flex items-center gap-4 border p-5 cursor-pointer transition-all opacity-50 ${form.payment==='razorpay'?'border-[#b8935a] bg-[#b8935a]/5':'border-[#e6dfd0]'}`}>
                  <input type="radio" disabled checked={form.payment==='razorpay'} onChange={()=>setForm({...form,payment:'razorpay'})} className="accent-[#b8935a]" />
                  <CreditCard className="w-5 h-5 text-[#b8935a]" />
                  <div className="flex-1">
                    <div className="font-display text-lg">Razorpay <span className="text-[9px] tracking-luxury text-[#b8935a] ml-2">COMING SOON</span></div>
                    <div className="text-xs text-[#1a1a1a]/60">Cards, UPI, netbanking, wallets. Awaiting API keys.</div>
                  </div>
                </label>
              </div>
            </section>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-[#f0ebe1] p-8 sticky top-6">
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
            <div className="pt-4 mt-4 border-t border-[#1a1a1a]/10 flex justify-between items-end mb-6">
              <span className="text-[11px] tracking-luxury">TOTAL</span>
              <span className="font-display text-3xl">₹{totals.total.toLocaleString('en-IN')}</span>
            </div>
            <button onClick={placeOrder} disabled={placing || !canProceed} className="w-full bg-[#1a1a1a] text-[#faf7f2] py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors flex items-center justify-center gap-3 disabled:opacity-50">
              {placing ? 'PLACING ORDER...' : 'PLACE ORDER'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
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

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mb-1 flex items-center gap-2">{Icon && <Icon className="w-3 h-3 text-[#b8935a]" />}{label}</div>
      {children}
    </div>
  )
}
