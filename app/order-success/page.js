'use client'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, ArrowRight, Copy } from 'lucide-react'
import { toast } from 'sonner'

function OrderSuccessInner() {
  const sp = useSearchParams()
  const id = sp.get('id')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/orders/${id}`).then(r => r.json()).then(d => setOrder(d.order))
  }, [id])

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl w-full text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }} className="w-24 h-24 bg-[#b8935a]/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12 text-[#b8935a]" strokeWidth={1} />
        </motion.div>
        <div className="text-[11px] tracking-luxury text-[#b8935a] mb-4">ORDER CONFIRMED</div>
        <h1 className="font-display font-light text-5xl md:text-7xl mb-6">Thank <span className="italic">you.</span></h1>
        <p className="text-[#1a1a1a]/70 text-lg mb-10 max-w-md mx-auto">Your order has been received. Our atelier will begin preparing your pieces with the utmost care.</p>

        {order && (
          <div className="bg-white border border-[#e6dfd0] p-8 mb-8 text-left">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e6dfd0]">
              <div>
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60">ORDER NUMBER</div>
                <div className="font-display text-2xl flex items-center gap-3">
                  #{order.orderNumber}
                  <button onClick={() => { navigator.clipboard.writeText(order.orderNumber); toast.success('Copied') }}><Copy className="w-4 h-4 text-[#b8935a]" /></button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60">TOTAL</div>
                <div className="font-display text-2xl">₹{order.totals?.total?.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="space-y-3">
              {order.items?.map(i => (
                <div key={i.key} className="flex gap-4 items-center">
                  <img src={i.image} alt="" className="w-12 h-16 object-cover" />
                  <div className="flex-1">
                    <div className="font-display text-sm">{i.name}</div>
                    <div className="text-[10px] text-[#1a1a1a]/50">{i.size} · {i.color} · Qty {i.qty}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-[#e6dfd0] text-sm text-[#1a1a1a]/70">
              <div className="flex items-start gap-3">
                <Package className="w-4 h-4 text-[#b8935a] mt-1" />
                <div>
                  <div className="font-medium text-[#1a1a1a]">Delivery to {order.customer?.firstName} {order.customer?.lastName}</div>
                  <div>{order.shipping?.address}, {order.shipping?.city}, {order.shipping?.state} – {order.shipping?.pincode}</div>
                  <div className="mt-2 text-[10px] tracking-luxury text-[#b8935a]">STATUS: {order.status?.toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="inline-flex items-center justify-center gap-3 bg-[#1a1a1a] text-[#faf7f2] px-10 py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors">CONTINUE SHOPPING <ArrowRight className="w-3 h-3" /></Link>
          <Link href="/" className="inline-flex items-center justify-center gap-3 border border-[#1a1a1a] px-10 py-4 text-[11px] tracking-luxury hover:bg-[#1a1a1a] hover:text-white transition-colors">TRACK MY ORDER</Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return <Suspense fallback={<div className="min-h-screen" />}><OrderSuccessInner /></Suspense>
}
