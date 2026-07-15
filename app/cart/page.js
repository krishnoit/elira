'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { getCart, updateQty, removeFromCart, cartTotals } from '@/lib/cart'
import { toast } from 'sonner'

export default function CartPage() {
  const [items, setItems] = useState([])
  const [mounted, setMounted] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(0)

  useEffect(() => {
    setMounted(true)
    setItems(getCart())
    const on = () => setItems(getCart())
    window.addEventListener('elira-cart-update', on)
    return () => window.removeEventListener('elira-cart-update', on)
  }, [])

  const totals = cartTotals(items)
  const discountAmount = Math.round(totals.subtotal * couponApplied / 100)
  const finalTotal = totals.total - discountAmount

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase()
    const codes = { 'ELIRA10': 10, 'WELCOME15': 15, 'ATELIER20': 20 }
    if (codes[code]) {
      setCouponApplied(codes[code])
      toast.success(`${code} applied — ${codes[code]}% off`)
    } else {
      toast.error('Invalid code. Try ELIRA10, WELCOME15, or ATELIER20')
    }
  }

  if (!mounted) return <div className="min-h-screen" />

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <div className="bg-[#1a1a1a] text-[#faf7f2] text-[11px] tracking-luxury py-3 text-center">COMPLIMENTARY SHIPPING ON ORDERS ABOVE ₹5,000</div>
      <header className="border-b border-[#e6dfd0] py-6 px-6 md:px-16 lg:px-24">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[11px] tracking-luxury hover:text-[#b8935a]">
            <ArrowLeft className="w-4 h-4" /> CONTINUE SHOPPING
          </Link>
          <Link href="/" className="text-center">
            <div className="font-display font-light text-2xl tracking-refined">ELIRA</div>
            <div className="text-[9px] tracking-luxury text-[#b8935a] -mt-1">ATELIER</div>
          </Link>
          <div className="text-[11px] tracking-luxury">CART ({totals.count})</div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-16 py-16">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-light text-5xl md:text-7xl mb-4">Your <span className="italic">bag.</span></motion.h1>
        <p className="text-[#1a1a1a]/60 mb-12">{items.length === 0 ? 'Your bag awaits its first treasure.' : `${totals.count} exquisite ${totals.count === 1 ? 'piece' : 'pieces'} chosen with care.`}</p>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <ShoppingBag className="w-20 h-20 mx-auto text-[#b8935a] mb-8" strokeWidth={0.5} />
            <h2 className="font-display text-3xl mb-4">Your bag is empty</h2>
            <p className="text-[#1a1a1a]/60 mb-8">Discover our signature pieces and begin your collection.</p>
            <Link href="/#collections" className="inline-flex items-center gap-3 bg-[#1a1a1a] text-[#faf7f2] px-10 py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors">EXPLORE COLLECTIONS <ArrowRight className="w-3 h-3" /></Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {items.map(item => {
                  const unit = Math.round(item.price * (1 - item.discount/100))
                  return (
                    <motion.div key={item.key} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex gap-6 pb-6 border-b border-[#e6dfd0]">
                      <div className="w-24 md:w-32 aspect-[3/4] bg-white flex-shrink-0 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col md:flex-row md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-[10px] tracking-luxury text-[#b8935a] mb-1">{item.category?.toUpperCase()}</div>
                          <h3 className="font-display text-xl md:text-2xl mb-2">{item.name}</h3>
                          <div className="flex flex-wrap gap-4 text-xs text-[#1a1a1a]/60">
                            <span>Size: <span className="text-[#1a1a1a]">{item.size}</span></span>
                            <span>Color: <span className="text-[#1a1a1a]">{item.color}</span></span>
                          </div>
                          <div className="flex items-center gap-3 mt-4">
                            <button onClick={() => setItems(updateQty(item.key, item.qty - 1))} className="w-8 h-8 border border-[#1a1a1a]/30 hover:border-[#b8935a] flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                            <span className="w-8 text-center font-display text-lg">{item.qty}</span>
                            <button onClick={() => setItems(updateQty(item.key, item.qty + 1))} className="w-8 h-8 border border-[#1a1a1a]/30 hover:border-[#b8935a] flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                            <button onClick={() => { setItems(removeFromCart(item.key)); toast.success('Removed') }} className="ml-4 text-[#1a1a1a]/50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-2xl">₹{(unit * item.qty).toLocaleString('en-IN')}</div>
                          {item.discount > 0 && <div className="text-xs line-through text-[#1a1a1a]/40">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>}
                          <div className="text-[10px] text-[#1a1a1a]/50 mt-1">₹{unit.toLocaleString('en-IN')} each</div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#f0ebe1] p-8 sticky top-6">
                <h2 className="font-display text-2xl mb-6 pb-4 border-b border-[#1a1a1a]/10">Order Summary</h2>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-[#1a1a1a]/70">Subtotal</span><span>₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-[#1a1a1a]/70">Shipping</span><span>{totals.shipping === 0 ? <span className="text-[#b8935a]">FREE</span> : `₹${totals.shipping}`}</span></div>
                  {couponApplied > 0 && <div className="flex justify-between text-[#b8935a]"><span>Coupon ({couponApplied}%)</span><span>–₹{discountAmount.toLocaleString('en-IN')}</span></div>}
                </div>
                <div className="pt-4 border-t border-[#1a1a1a]/10 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] tracking-luxury">TOTAL</span>
                    <span className="font-display text-3xl">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mb-2">HAVE A CODE?</div>
                  <div className="flex">
                    <input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="COUPON CODE" className="flex-1 bg-white border border-[#1a1a1a]/20 px-3 py-2 text-xs outline-none focus:border-[#b8935a]" />
                    <button onClick={applyCoupon} className="bg-[#1a1a1a] text-white px-4 text-[10px] tracking-luxury hover:bg-[#b8935a]"><Tag className="w-4 h-4" /></button>
                  </div>
                  <div className="text-[9px] text-[#1a1a1a]/40 mt-1">Try: ELIRA10, WELCOME15, ATELIER20</div>
                </div>
                <Link href="/checkout" className="w-full bg-[#1a1a1a] text-[#faf7f2] py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors flex items-center justify-center gap-3">PROCEED TO CHECKOUT <ArrowRight className="w-3 h-3" /></Link>
                <div className="text-center text-[10px] text-[#1a1a1a]/50 mt-4">Secure checkout · Free returns within 7 days</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
