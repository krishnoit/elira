'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Package, Heart, User, MapPin, ArrowLeft, Download, CheckCircle2, Circle, Truck, ShoppingBag, ArrowRight, Search, X } from 'lucide-react'
import { toast } from 'sonner'

const STATUSES = ['pending', 'packed', 'shipped', 'delivered']
const STATUS_LABELS = { pending: 'Order Placed', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }

function Timeline({ order }) {
  const cur = STATUSES.indexOf(order.status)
  const cancelled = order.status === 'cancelled'
  return (
    <div className="space-y-0">
      {STATUSES.map((s, i) => {
        const done = !cancelled && i <= cur
        const active = !cancelled && i === cur
        const evt = order.statusHistory?.find(h => h.status === s)
        return (
          <div key={s} className="flex gap-4 pb-6 last:pb-0 relative">
            {i < STATUSES.length - 1 && <div className={`absolute left-3 top-6 bottom-0 w-px ${done && i < cur ? 'bg-[#b8935a]' : 'bg-[#e6dfd0]'}`} />}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-[#b8935a] text-white' : 'bg-[#e6dfd0]'}`}>
              {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${done ? '' : 'text-[#1a1a1a]/40'}`}>{STATUS_LABELS[s]}</div>
              {evt && <div className="text-xs text-[#1a1a1a]/60 mt-0.5">{new Date(evt.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · {evt.note}</div>}
              {active && <div className="text-[10px] tracking-luxury text-[#b8935a] mt-1">CURRENT STATUS</div>}
            </div>
          </div>
        )
      })}
      {cancelled && <div className="text-red-600 text-sm mt-2">Order was cancelled</div>}
    </div>
  )
}

function downloadInvoice(order) {
  const w = window.open('', '_blank')
  const rows = order.items.map(i => {
    const unit = Math.round(i.price * (1 - i.discount/100))
    return `<tr><td style="padding:12px;border-bottom:1px solid #eee">${i.name}<br><span style="color:#888;font-size:12px">${i.size} · ${i.color}</span></td><td style="padding:12px;text-align:center;border-bottom:1px solid #eee">${i.qty}</td><td style="padding:12px;text-align:right;border-bottom:1px solid #eee">₹${unit.toLocaleString('en-IN')}</td><td style="padding:12px;text-align:right;border-bottom:1px solid #eee">₹${(unit*i.qty).toLocaleString('en-IN')}</td></tr>`
  }).join('')
  w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${order.orderNumber}</title>
    <style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:40px;color:#1a1a1a}h1{font-weight:300;font-size:48px;margin:0;letter-spacing:2px}.gold{color:#b8935a}.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #b8935a;padding-bottom:20px;margin-bottom:30px}.small{font-size:11px;letter-spacing:2px;color:#888}table{width:100%;border-collapse:collapse;margin:20px 0}th{text-align:left;padding:12px;background:#faf7f2;font-size:12px;letter-spacing:1px}.right{text-align:right}.total{font-size:24px;font-weight:300}@media print{body{margin:0}}</style></head><body>
    <div class="header">
      <div><h1>ELIRA</h1><div class="small gold">ATELIER — INVOICE</div></div>
      <div style="text-align:right"><div class="small">INVOICE #</div><div style="font-size:24px">${order.orderNumber}</div><div class="small" style="margin-top:8px">${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div></div>
    </div>
    <div style="display:flex;gap:40px;margin-bottom:30px">
      <div style="flex:1"><div class="small gold">BILLED TO</div><div style="margin-top:8px"><strong>${order.customer.firstName} ${order.customer.lastName}</strong><br>${order.customer.email}<br>${order.customer.phone}</div></div>
      <div style="flex:1"><div class="small gold">SHIP TO</div><div style="margin-top:8px">${order.shipping.address}<br>${order.shipping.city}, ${order.shipping.state} ${order.shipping.pincode}<br>${order.shipping.country}</div></div>
    </div>
    <table><thead><tr><th>ITEM</th><th class="right">QTY</th><th class="right">UNIT</th><th class="right">TOTAL</th></tr></thead><tbody>${rows}</tbody></table>
    <div style="margin-top:30px;text-align:right">
      <div>Subtotal: ₹${order.totals.subtotal?.toLocaleString('en-IN')}</div>
      <div>Shipping: ${order.totals.shipping === 0 ? 'FREE' : '₹'+order.totals.shipping}</div>
      <div class="total" style="margin-top:12px;padding-top:12px;border-top:2px solid #b8935a">TOTAL: <span class="gold">₹${order.totals.total?.toLocaleString('en-IN')}</span></div>
      <div class="small" style="margin-top:8px">Payment: ${order.payment?.toUpperCase()} · ${order.paymentStatus?.toUpperCase()}</div>
    </div>
    <div style="margin-top:60px;text-align:center;color:#888;font-size:12px;letter-spacing:2px">THANK YOU FOR YOUR PATRONAGE — ELIRA ATELIER</div>
    <div style="text-align:center;margin-top:20px"><button onclick="window.print()" style="padding:12px 32px;background:#1a1a1a;color:#faf7f2;border:0;letter-spacing:2px;cursor:pointer">PRINT / SAVE AS PDF</button></div>
  </body></html>`)
  w.document.close()
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login?returnTo=/account'); return }
      setUser(d.user)
    })
  }, [router])

  useEffect(() => {
    if (!user) return
    fetch('/api/user/orders').then(r => r.json()).then(d => setOrders(d.orders || []))
    fetch('/api/user/wishlist').then(r => r.json()).then(d => setWishlist(d.products || []))
  }, [user])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('elira_cart')
    window.dispatchEvent(new Event('elira-cart-update'))
    toast.success('Signed out')
    router.push('/')
  }

  const removeWish = async (id) => {
    await fetch('/api/user/wishlist/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id }) })
    setWishlist(wishlist.filter(w => w.id !== id))
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center text-[#b8935a]">Loading...</div>

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <header className="border-b border-[#e6dfd0] py-6 px-6 md:px-16 lg:px-24">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[10px] md:text-[11px] tracking-luxury hover:text-[#b8935a]"><ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">CONTINUE SHOPPING</span></Link>
          <Link href="/" className="flex-shrink-0">
            <img src="/elira-logo.png" alt="Elira Atelier" className="h-16 md:h-22 w-auto object-contain" />
          </Link>
          <button onClick={logout} className="flex items-center gap-2 text-[10px] md:text-[11px] tracking-luxury hover:text-[#b8935a]"><LogOut className="w-4 h-4" /> <span className="hidden sm:inline">SIGN OUT</span></button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-16 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="text-[11px] tracking-luxury text-[#b8935a] mb-2">— MY ACCOUNT</div>
          <h1 className="font-display font-light text-5xl md:text-7xl">Welcome, <span className="italic">{user.name?.split(' ')[0]}.</span></h1>
          <p className="text-[#1a1a1a]/60 mt-2">{user.email}</p>
        </motion.div>

        <div className="flex flex-wrap gap-3 md:gap-8 border-b border-[#e6dfd0] mb-8 md:mb-12">
          {[
            { id: 'orders', label: 'Orders', icon: Package, count: orders.length },
            { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 md:gap-3 pb-4 text-[10px] md:text-[11px] tracking-luxury border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-[#b8935a] text-[#b8935a]' : 'border-transparent text-[#1a1a1a]/60 hover:text-[#1a1a1a]'}`}>
              <t.icon className="w-4 h-4" /> {t.label.toUpperCase()} {t.count !== undefined && <span className="text-[#1a1a1a]/40">({t.count})</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {tab === 'orders' && (
              orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 mx-auto text-[#b8935a] mb-6" strokeWidth={0.5} />
                  <h3 className="font-display text-2xl mb-4">No orders yet</h3>
                  <Link href="/#collections" className="inline-flex items-center gap-3 bg-[#1a1a1a] text-[#faf7f2] px-8 py-3 text-[11px] tracking-luxury hover:bg-[#b8935a]">EXPLORE COLLECTIONS <ArrowRight className="w-3 h-3" /></Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(o => (
                    <div key={o.id} className="bg-white border border-[#e6dfd0] p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="text-[10px] tracking-luxury text-[#b8935a]">ORDER #{o.orderNumber}</div>
                          <div className="text-sm text-[#1a1a1a]/60 mt-1">{new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-2xl">₹{o.totals?.total?.toLocaleString('en-IN')}</div>
                          <div className={`inline-block mt-1 text-[10px] tracking-luxury px-3 py-1 ${o.status === 'delivered' ? 'bg-green-100 text-green-800' : o.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-[#b8935a]/10 text-[#b8935a]'}`}>{STATUS_LABELS[o.status]?.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="flex gap-3 mb-4 overflow-x-auto">
                        {o.items?.slice(0, 5).map(i => (
                          <img key={i.key} src={i.image} alt={i.name} className="w-16 h-20 object-cover flex-shrink-0" />
                        ))}
                        {o.items?.length > 5 && <div className="w-16 h-20 bg-[#f0ebe1] flex items-center justify-center text-xs">+{o.items.length - 5}</div>}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setSelectedOrder(o)} className="text-[11px] tracking-luxury border border-[#1a1a1a] px-4 py-2 hover:bg-[#1a1a1a] hover:text-white">VIEW DETAILS</button>
                        <button onClick={() => downloadInvoice(o)} className="text-[11px] tracking-luxury flex items-center gap-2 border border-[#b8935a] text-[#b8935a] px-4 py-2 hover:bg-[#b8935a] hover:text-white"><Download className="w-3 h-3" /> INVOICE</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === 'wishlist' && (
              wishlist.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 mx-auto text-[#b8935a] mb-6" strokeWidth={0.5} />
                  <h3 className="font-display text-2xl mb-4">No favorites yet</h3>
                  <Link href="/#collections" className="inline-flex items-center gap-3 bg-[#1a1a1a] text-[#faf7f2] px-8 py-3 text-[11px] tracking-luxury hover:bg-[#b8935a]">DISCOVER PIECES <ArrowRight className="w-3 h-3" /></Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {wishlist.map(p => (
                    <div key={p.id} className="group">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        <button onClick={() => removeWish(p.id)} className="absolute top-3 right-3 w-9 h-9 bg-white hover:bg-red-600 hover:text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="mt-3">
                        <div className="text-[10px] tracking-luxury text-[#b8935a]">{p.category?.toUpperCase()}</div>
                        <div className="font-display text-lg">{p.name}</div>
                        <div className="font-display text-sm mt-1">₹{Math.round(p.price * (1 - p.discount/100)).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === 'profile' && (
              <div className="max-w-xl bg-white border border-[#e6dfd0] p-8">
                <div className="flex items-center gap-6 mb-8">
                  {user.picture ? <img src={user.picture} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-[#b8935a]" /> : <div className="w-20 h-20 rounded-full bg-[#b8935a] text-white flex items-center justify-center font-display text-3xl">{user.name?.[0]?.toUpperCase()}</div>}
                  <div>
                    <div className="font-display text-2xl">{user.name}</div>
                    <div className="text-sm text-[#1a1a1a]/60">{user.email}</div>
                    <div className="text-[10px] tracking-luxury text-[#b8935a] mt-1">SIGNED IN VIA {user.provider?.toUpperCase() || 'EMAIL'}</div>
                  </div>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-[#e6dfd0] py-3"><span className="text-[#1a1a1a]/60">Member since</span><span>{new Date(user.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span></div>
                  <div className="flex justify-between border-b border-[#e6dfd0] py-3"><span className="text-[#1a1a1a]/60">Total orders</span><span>{orders.length}</span></div>
                  <div className="flex justify-between border-b border-[#e6dfd0] py-3"><span className="text-[#1a1a1a]/60">Wishlist items</span><span>{wishlist.length}</span></div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} onClick={e => e.stopPropagation()} className="bg-[#faf7f2] max-w-2xl w-full my-8 max-h-[92vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#1a1a1a] text-[#faf7f2] px-8 py-5 flex items-center justify-between z-10">
                <div>
                  <div className="text-[10px] tracking-luxury text-[#b8935a]">ORDER #{selectedOrder.orderNumber}</div>
                  <div className="font-display text-2xl">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
                </div>
                <button onClick={() => setSelectedOrder(null)}><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="font-display text-xl mb-4">Tracking</h3>
                  <Timeline order={selectedOrder} />
                  {selectedOrder.trackingNumber && (
                    <div className="mt-4 p-4 bg-[#f0ebe1]">
                      <div className="text-[10px] tracking-luxury text-[#b8935a]">TRACKING NUMBER</div>
                      <div className="font-display text-lg">{selectedOrder.trackingNumber}</div>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-xl mb-4">Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map(i => (
                      <div key={i.key} className="flex gap-4">
                        <img src={i.image} alt="" className="w-16 h-20 object-cover" />
                        <div className="flex-1">
                          <div className="font-display">{i.name}</div>
                          <div className="text-xs text-[#1a1a1a]/60">{i.size} · {i.color} · Qty {i.qty}</div>
                        </div>
                        <div className="font-display">₹{(Math.round(i.price*(1-i.discount/100))*i.qty).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl mb-4">Delivery</h3>
                  <div className="text-sm text-[#1a1a1a]/80">
                    {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}<br />
                    {selectedOrder.shipping?.address}<br />
                    {selectedOrder.shipping?.city}, {selectedOrder.shipping?.state} – {selectedOrder.shipping?.pincode}<br />
                    {selectedOrder.customer?.phone}
                  </div>
                </div>
                <div className="pt-6 border-t border-[#e6dfd0] flex justify-between items-end">
                  <div><div className="text-[10px] tracking-luxury">TOTAL</div><div className="font-display text-3xl">₹{selectedOrder.totals?.total?.toLocaleString('en-IN')}</div></div>
                  <button onClick={() => downloadInvoice(selectedOrder)} className="flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-[11px] tracking-luxury hover:bg-[#b8935a]"><Download className="w-3 h-3" /> INVOICE</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
