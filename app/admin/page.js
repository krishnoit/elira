'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Package, Image as ImageIcon, LogOut, Plus, Trash2, Edit3, Star, X, Upload, Sparkles, TrendingUp, MessageSquare, Mail, Search, ShoppingCart, Users, Tag, Truck, Printer, CheckCircle2, Circle, AlertCircle, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

const CATS = ['women','men','ethnic','western','kids','accessories','custom','corporate']
const GAL_CATS = ['newest','popular','collection','editorial']
const STATUSES = ['pending','packed','shipped','delivered','cancelled']
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  packed: 'bg-blue-100 text-blue-800 border-blue-300',
  shipped: 'bg-purple-100 text-purple-800 border-purple-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
}

function useAuth() {
  const router = useRouter()
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  useEffect(() => {
    const t = localStorage.getItem('elira_admin_token')
    const u = localStorage.getItem('elira_admin_user')
    if (!t) { router.push('/admin/login'); return }
    fetch('/api/admin/verify', { headers: { Authorization: 'Bearer ' + t } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => { setToken(t); setUser(u) })
      .catch(() => { localStorage.removeItem('elira_admin_token'); router.push('/admin/login') })
  }, [router])
  return { token, user }
}

function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(fr.result)
    fr.onerror = rej
    fr.readAsDataURL(file)
  })
}

function Dropzone({ onFiles, multiple = false, label = 'Drop image here or click to upload' }) {
  const [drag, setDrag] = useState(false)
  const handleFiles = async (files) => {
    if (!files || !files.length) return
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) { toast.error('Only images'); return }
    const urls = await Promise.all(arr.map(fileToDataUrl))
    onFiles(multiple ? urls : urls[0])
  }
  return (
    <label onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
      className={`block border-2 border-dashed p-8 text-center cursor-pointer transition-all ${drag ? 'border-[#b8935a] bg-[#b8935a]/10' : 'border-[#1a1a1a]/20 hover:border-[#b8935a]/60 bg-[#faf7f2]'}`}>
      <input type="file" accept="image/*" multiple={multiple} className="hidden" onChange={e => handleFiles(e.target.files)} />
      <Upload className="w-8 h-8 mx-auto mb-3 text-[#b8935a]" strokeWidth={1} />
      <div className="text-sm font-medium">{label}</div>
      <div className="text-[10px] tracking-refined text-[#1a1a1a]/50 mt-1">PNG, JPG, WEBP · Max 10MB</div>
    </label>
  )
}

function StatCard({ icon: Icon, label, value, accent, subtitle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 border border-[#e6dfd0]">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 flex items-center justify-center ${accent}`}><Icon className="w-5 h-5" strokeWidth={1.5} /></div>
        <div className="text-[9px] tracking-luxury text-[#1a1a1a]/40">{subtitle || 'TOTAL'}</div>
      </div>
      <div className="font-serif text-3xl md:text-4xl" style={{fontFamily:'var(--font-cormorant), serif'}}>{value}</div>
      <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mt-1">{label}</div>
    </motion.div>
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
      <div><h1>ELIRA</h1><div class="small gold">ATELIER — TAX INVOICE</div></div>
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
      <div class="small" style="margin-top:8px">Payment: ${order.payment?.toUpperCase()} · ${order.paymentStatus?.toUpperCase() || 'PENDING'}</div>
      ${order.trackingNumber ? `<div class="small" style="margin-top:4px">Tracking: ${order.trackingNumber}</div>` : ''}
    </div>
    <div style="margin-top:60px;text-align:center;color:#888;font-size:12px;letter-spacing:2px">THANK YOU FOR YOUR PATRONAGE — ELIRA ATELIER</div>
    <div style="text-align:center;margin-top:20px"><button onclick="window.print()" style="padding:12px 32px;background:#1a1a1a;color:#faf7f2;border:0;letter-spacing:2px;cursor:pointer">PRINT / SAVE AS PDF</button></div>
  </body></html>`)
  w.document.close()
}

// =============== DASHBOARD TAB ===============
function Dashboard({ token }) {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: 'Bearer '+token } }).then(r=>r.json()).then(setStats)
  }, [token])
  return (
    <div>
      <h2 className="font-serif text-3xl md:text-4xl mb-6" style={{fontFamily:'var(--font-cormorant), serif'}}>Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard icon={DollarSign} label="REVENUE" value={stats ? `₹${(stats.revenue/1000).toFixed(1)}K` : '—'} accent="bg-[#b8935a] text-white" subtitle="LIFETIME" />
        <StatCard icon={ShoppingCart} label="ORDERS" value={stats?.orders ?? '—'} accent="bg-[#b8935a]/10 text-[#b8935a]" />
        <StatCard icon={AlertCircle} label="PENDING" value={stats?.pendingOrders ?? '—'} accent="bg-amber-100 text-amber-700" subtitle="NEEDS ACTION" />
        <StatCard icon={Users} label="CUSTOMERS" value={stats?.users ?? '—'} accent="bg-[#b8935a]/10 text-[#b8935a]" />
        <StatCard icon={Package} label="PRODUCTS" value={stats?.products ?? '—'} accent="bg-[#b8935a]/10 text-[#b8935a]" />
        <StatCard icon={ImageIcon} label="GALLERY" value={stats?.gallery ?? '—'} accent="bg-[#b8935a]/10 text-[#b8935a]" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white border border-[#e6dfd0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl" style={{fontFamily:'var(--font-cormorant), serif'}}>Recent Orders</h3>
            <div className="text-[10px] tracking-luxury text-[#b8935a]">LAST 5</div>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders?.length ? stats.recentOrders.map(o => (
              <div key={o.id} className="flex items-center gap-3 pb-3 border-b border-[#e6dfd0] last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] tracking-luxury text-[#b8935a]">#{o.orderNumber}</div>
                  <div className="font-medium text-sm truncate">{o.customer?.firstName} {o.customer?.lastName}</div>
                  <div className="text-[10px] text-[#1a1a1a]/60">{new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                </div>
                <div className={`text-[9px] tracking-luxury px-2 py-1 border ${STATUS_COLORS[o.status]}`}>{o.status?.toUpperCase()}</div>
                <div className="font-serif text-lg" style={{fontFamily:'var(--font-cormorant), serif'}}>₹{o.totals?.total?.toLocaleString('en-IN')}</div>
              </div>
            )) : <div className="text-sm text-[#1a1a1a]/50 py-6 text-center">No orders yet</div>}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white p-6 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#b8935a]/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="text-[10px] tracking-luxury text-[#d4b483] mb-3">TOP CUSTOMERS</div>
            <div className="space-y-3">
              {stats?.topCustomers?.length ? stats.topCustomers.map((c, i) => (
                <div key={c._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#b8935a] text-white flex items-center justify-center text-sm">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{c.name}</div>
                    <div className="text-[10px] text-white/60">{c.orderCount} orders</div>
                  </div>
                  <div className="font-serif text-base" style={{fontFamily:'var(--font-cormorant), serif'}}>₹{c.totalSpent?.toLocaleString('en-IN')}</div>
                </div>
              )) : <div className="text-sm text-white/50 py-6 text-center">No customers yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============== ORDERS TAB ===============
function OrdersTab({ token }) {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/orders', { headers: { Authorization: 'Bearer '+token } })
    const d = await r.json()
    setOrders(d.orders || [])
  }, [token])

  useEffect(() => { load() }, [load])

  const updateOrder = async (id, patch) => {
    const r = await fetch(`/api/admin/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify(patch) })
    if (r.ok) {
      const d = await r.json()
      setSelected(d.order)
      toast.success('Order updated')
      load()
    } else toast.error('Update failed')
  }

  const filtered = orders.filter(o => (filter === 'all' || o.status === filter) && (!q || o.orderNumber.includes(q) || `${o.customer?.firstName} ${o.customer?.lastName}`.toLowerCase().includes(q.toLowerCase()) || o.customer?.email?.toLowerCase().includes(q.toLowerCase())))

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl" style={{fontFamily:'var(--font-cormorant), serif'}}>Orders</h2>
          <p className="text-sm text-[#1a1a1a]/60">{orders.length} total orders</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={()=>setFilter(s)} className={`text-[10px] tracking-luxury px-3 py-1.5 border transition-all ${filter===s ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-[#e6dfd0] hover:border-[#b8935a]'}`}>
            {s.toUpperCase()} {s !== 'all' && `(${orders.filter(o=>o.status===s).length})`}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/40" />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by order number, name or email..." className="w-full bg-white border border-[#e6dfd0] pl-10 pr-4 py-3 outline-none focus:border-[#b8935a]" />
      </div>

      <div className="bg-white border border-[#e6dfd0] overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-[#f0ebe1] text-[10px] tracking-luxury text-[#1a1a1a]/60">
              <th className="text-left px-4 py-3">ORDER</th>
              <th className="text-left px-4 py-3">CUSTOMER</th>
              <th className="text-left px-4 py-3">ITEMS</th>
              <th className="text-left px-4 py-3">DATE</th>
              <th className="text-left px-4 py-3">PAYMENT</th>
              <th className="text-left px-4 py-3">STATUS</th>
              <th className="text-right px-4 py-3">TOTAL</th>
              <th className="text-right px-4 py-3">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t border-[#e6dfd0] hover:bg-[#faf7f2]">
                <td className="px-4 py-3"><span className="text-[10px] tracking-luxury text-[#b8935a]">#{o.orderNumber}</span></td>
                <td className="px-4 py-3">
                  <div className="font-medium">{o.customer?.firstName} {o.customer?.lastName}</div>
                  <div className="text-[10px] text-[#1a1a1a]/60">{o.customer?.email}</div>
                </td>
                <td className="px-4 py-3">{o.items?.length}</td>
                <td className="px-4 py-3 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                <td className="px-4 py-3 text-xs uppercase">{o.payment}<br/><span className={`text-[9px] ${o.paymentStatus === 'paid' ? 'text-green-700' : 'text-[#1a1a1a]/50'}`}>{o.paymentStatus}</span></td>
                <td className="px-4 py-3"><span className={`text-[9px] tracking-luxury px-2 py-1 border ${STATUS_COLORS[o.status]}`}>{o.status?.toUpperCase()}</span></td>
                <td className="px-4 py-3 text-right font-serif text-lg" style={{fontFamily:'var(--font-cormorant), serif'}}>₹{o.totals?.total?.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>setSelected(o)} className="text-[10px] tracking-luxury border border-[#1a1a1a] px-3 py-1 hover:bg-[#1a1a1a] hover:text-white">MANAGE</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-[#1a1a1a]/50">No orders match your filters</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && <OrderModal token={token} order={selected} onClose={()=>setSelected(null)} onUpdate={updateOrder} />}
      </AnimatePresence>
    </div>
  )
}

function OrderModal({ order, onClose, onUpdate }) {
  const [tracking, setTracking] = useState(order.trackingNumber || '')
  const [note, setNote] = useState('')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ y: 20 }} animate={{ y: 0 }} onClick={e => e.stopPropagation()} className="bg-[#faf7f2] max-w-3xl w-full my-8 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1a1a] text-[#faf7f2] px-6 md:px-8 py-5 flex items-center justify-between z-10">
          <div>
            <div className="text-[10px] tracking-luxury text-[#b8935a]">ORDER #{order.orderNumber}</div>
            <div className="font-serif text-xl md:text-2xl" style={{fontFamily:'var(--font-cormorant), serif'}}>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 md:p-8 space-y-8">
          {/* Status update */}
          <section>
            <h3 className="font-serif text-xl mb-4" style={{fontFamily:'var(--font-cormorant), serif'}}>Update Status</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {STATUSES.map(s => (
                <button key={s} onClick={()=>onUpdate(order.id, { status: s, note: note || undefined })} className={`text-[10px] tracking-luxury px-3 py-2 border transition-all ${order.status === s ? 'bg-[#b8935a] text-white border-[#b8935a]' : 'border-[#e6dfd0] hover:border-[#b8935a]'}`}>
                  {order.status === s && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional status note (e.g. 'Hand-pressed with love')" className="w-full bg-white border border-[#e6dfd0] px-3 py-2 text-sm outline-none focus:border-[#b8935a]" />
          </section>

          {/* Tracking */}
          <section>
            <h3 className="font-serif text-xl mb-4" style={{fontFamily:'var(--font-cormorant), serif'}}>Tracking Number</h3>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white border border-[#e6dfd0] px-3">
                <Truck className="w-4 h-4 text-[#b8935a]" />
                <input value={tracking} onChange={e=>setTracking(e.target.value)} placeholder="e.g. BLUEDART-834521098" className="flex-1 py-2 text-sm outline-none" />
              </div>
              <button onClick={()=>onUpdate(order.id, { trackingNumber: tracking })} className="bg-[#1a1a1a] text-white px-6 text-[10px] tracking-luxury hover:bg-[#b8935a]">SAVE</button>
            </div>
          </section>

          {/* Customer */}
          <section>
            <h3 className="font-serif text-xl mb-4" style={{fontFamily:'var(--font-cormorant), serif'}}>Customer Details</h3>
            <div className="bg-white p-5 border border-[#e6dfd0] grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60">NAME</div>
                <div className="mt-1">{order.customer?.firstName} {order.customer?.lastName}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60">EMAIL</div>
                <div className="mt-1">{order.customer?.email}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60">PHONE</div>
                <div className="mt-1">{order.customer?.phone}</div>
              </div>
              <div>
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60">ADDRESS</div>
                <div className="mt-1">{order.shipping?.address}, {order.shipping?.city}, {order.shipping?.state} – {order.shipping?.pincode}</div>
              </div>
              {order.notes && <div className="md:col-span-2">
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60">CUSTOMER NOTE</div>
                <div className="mt-1 italic">“{order.notes}”</div>
              </div>}
            </div>
          </section>

          {/* Items */}
          <section>
            <h3 className="font-serif text-xl mb-4" style={{fontFamily:'var(--font-cormorant), serif'}}>Items</h3>
            <div className="space-y-3">
              {order.items?.map(i => {
                const unit = Math.round(i.price * (1 - i.discount/100))
                return (
                  <div key={i.key} className="flex gap-4 items-center bg-white p-3 border border-[#e6dfd0]">
                    <img src={i.image} alt="" className="w-14 h-16 object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{i.name}</div>
                      <div className="text-[10px] text-[#1a1a1a]/60">{i.size} · {i.color} · Qty {i.qty}</div>
                    </div>
                    <div className="font-serif text-lg" style={{fontFamily:'var(--font-cormorant), serif'}}>₹{(unit*i.qty).toLocaleString('en-IN')}</div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Totals & Actions */}
          <section className="pt-6 border-t border-[#e6dfd0] space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60">TOTAL</div>
                <div className="font-serif text-3xl md:text-4xl" style={{fontFamily:'var(--font-cormorant), serif'}}>₹{order.totals?.total?.toLocaleString('en-IN')}</div>
                <div className="text-[10px] tracking-luxury text-[#b8935a]">{order.payment?.toUpperCase()} · {order.paymentStatus?.toUpperCase() || 'PENDING'}</div>
              </div>
              <button onClick={()=>downloadInvoice(order)} className="flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 text-[11px] tracking-luxury hover:bg-[#b8935a]">
                <Printer className="w-4 h-4" /> PRINT INVOICE
              </button>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}

// =============== CUSTOMERS TAB ===============
function CustomersTab({ token }) {
  const [customers, setCustomers] = useState([])
  const [selected, setSelected] = useState(null)
  const [orders, setOrders] = useState([])
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/admin/customers', { headers: { Authorization: 'Bearer '+token } }).then(r=>r.json()).then(d => setCustomers(d.customers || []))
  }, [token])

  const openCustomer = async (c) => {
    setSelected(c)
    const r = await fetch(`/api/admin/customers/${c.id}`, { headers: { Authorization: 'Bearer '+token } })
    const d = await r.json()
    setOrders(d.orders || [])
  }

  const filtered = customers.filter(c => !q || c.name?.toLowerCase().includes(q.toLowerCase()) || c.email?.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-3xl md:text-4xl" style={{fontFamily:'var(--font-cormorant), serif'}}>Customers</h2>
        <p className="text-sm text-[#1a1a1a]/60">{customers.length} registered clients</p>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/40" />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or email..." className="w-full bg-white border border-[#e6dfd0] pl-10 pr-4 py-3 outline-none focus:border-[#b8935a]" />
      </div>
      <div className="bg-white border border-[#e6dfd0] overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-[#f0ebe1] text-[10px] tracking-luxury text-[#1a1a1a]/60">
              <th className="text-left px-4 py-3">CUSTOMER</th>
              <th className="text-left px-4 py-3">EMAIL</th>
              <th className="text-left px-4 py-3">PROVIDER</th>
              <th className="text-center px-4 py-3">ORDERS</th>
              <th className="text-right px-4 py-3">TOTAL SPENT</th>
              <th className="text-right px-4 py-3">JOINED</th>
              <th className="text-right px-4 py-3">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t border-[#e6dfd0] hover:bg-[#faf7f2]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {c.picture ? <img src={c.picture} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-[#b8935a] text-white flex items-center justify-center text-xs">{c.name?.[0]?.toUpperCase()}</div>}
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{c.email}</td>
                <td className="px-4 py-3 text-[10px] tracking-luxury">{c.provider?.toUpperCase() || 'EMAIL'}</td>
                <td className="px-4 py-3 text-center">{c.orderCount}</td>
                <td className="px-4 py-3 text-right font-serif text-lg" style={{fontFamily:'var(--font-cormorant), serif'}}>₹{c.totalSpent?.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>openCustomer(c)} className="text-[10px] tracking-luxury border border-[#1a1a1a] px-3 py-1 hover:bg-[#1a1a1a] hover:text-white">VIEW</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-[#1a1a1a]/50">No customers</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={()=>setSelected(null)} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} onClick={e => e.stopPropagation()} className="bg-[#faf7f2] max-w-2xl w-full my-8 max-h-[92vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#1a1a1a] text-[#faf7f2] px-6 py-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  {selected.picture ? <img src={selected.picture} alt="" className="w-12 h-12 rounded-full" /> : <div className="w-12 h-12 rounded-full bg-[#b8935a] flex items-center justify-center text-xl">{selected.name?.[0]?.toUpperCase()}</div>}
                  <div>
                    <div className="font-serif text-xl md:text-2xl" style={{fontFamily:'var(--font-cormorant), serif'}}>{selected.name}</div>
                    <div className="text-[10px] tracking-luxury text-[#b8935a]">{selected.email}</div>
                  </div>
                </div>
                <button onClick={()=>setSelected(null)}><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white border border-[#e6dfd0] p-4">
                    <div className="text-[10px] tracking-luxury text-[#b8935a]">ORDERS</div>
                    <div className="font-serif text-2xl mt-1" style={{fontFamily:'var(--font-cormorant), serif'}}>{selected.orderCount}</div>
                  </div>
                  <div className="bg-white border border-[#e6dfd0] p-4">
                    <div className="text-[10px] tracking-luxury text-[#b8935a]">SPENT</div>
                    <div className="font-serif text-2xl mt-1" style={{fontFamily:'var(--font-cormorant), serif'}}>₹{selected.totalSpent?.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white border border-[#e6dfd0] p-4">
                    <div className="text-[10px] tracking-luxury text-[#b8935a]">JOINED</div>
                    <div className="text-sm mt-1">{new Date(selected.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-serif text-lg mb-3" style={{fontFamily:'var(--font-cormorant), serif'}}>Order History ({orders.length})</h4>
                  <div className="space-y-2">
                    {orders.map(o => (
                      <div key={o.id} className="bg-white border border-[#e6dfd0] p-4 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] tracking-luxury text-[#b8935a]">#{o.orderNumber}</div>
                          <div className="text-xs text-[#1a1a1a]/60">{new Date(o.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · {o.items?.length} items</div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block text-[9px] tracking-luxury px-2 py-0.5 border ${STATUS_COLORS[o.status]}`}>{o.status?.toUpperCase()}</div>
                          <div className="font-serif text-lg mt-1" style={{fontFamily:'var(--font-cormorant), serif'}}>₹{o.totals?.total?.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && <div className="text-sm text-[#1a1a1a]/50 py-4 text-center">No orders yet</div>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============== COUPONS TAB ===============
function CouponsTab({ token }) {
  const [coupons, setCoupons] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code:'', discount:10, description:'', minOrder:0 })

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/coupons', { headers: { Authorization: 'Bearer '+token } })
    const d = await r.json()
    setCoupons(d.coupons || [])
  }, [token])

  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!form.code) { toast.error('Code required'); return }
    const r = await fetch('/api/admin/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify(form) })
    const d = await r.json()
    if (r.ok) { toast.success(`${d.coupon.code} created`); setForm({ code:'', discount:10, description:'', minOrder:0 }); setShowForm(false); load() }
    else toast.error(d.error || 'Failed')
  }

  const del = async (id) => {
    if (!confirm('Delete this coupon?')) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer '+token } })
    toast.success('Deleted')
    load()
  }

  const toggle = async (c) => {
    await fetch(`/api/admin/coupons/${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify({ active: !c.active }) })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl" style={{fontFamily:'var(--font-cormorant), serif'}}>Promo Codes</h2>
          <p className="text-sm text-[#1a1a1a]/60">{coupons.length} codes · only codes created here work on checkout</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)} className="bg-[#1a1a1a] text-white px-6 py-3 text-[11px] tracking-luxury hover:bg-[#b8935a] flex items-center gap-2">
          <Plus className="w-4 h-4" /> NEW CODE
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white border border-[#e6dfd0] p-6 mb-6 overflow-hidden">
            <h3 className="font-serif text-xl mb-4" style={{fontFamily:'var(--font-cormorant), serif'}}>Create Promo Code</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mb-1">CODE</div>
                <input value={form.code} onChange={e=>setForm({...form, code: e.target.value.toUpperCase()})} placeholder="WELCOME10" className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a] uppercase" />
              </div>
              <div>
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mb-1">DISCOUNT %</div>
                <input type="number" value={form.discount} onChange={e=>setForm({...form, discount: e.target.value})} className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a]" />
              </div>
              <div>
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mb-1">MIN ORDER ₹</div>
                <input type="number" value={form.minOrder} onChange={e=>setForm({...form, minOrder: e.target.value})} placeholder="0" className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a]" />
              </div>
              <div>
                <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mb-1">DESCRIPTION</div>
                <input value={form.description} onChange={e=>setForm({...form, description: e.target.value})} placeholder="Welcome offer" className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a]" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={create} className="bg-[#1a1a1a] text-white px-6 py-2 text-[11px] tracking-luxury hover:bg-[#b8935a]">CREATE</button>
              <button onClick={()=>setShowForm(false)} className="border border-[#1a1a1a] px-6 py-2 text-[11px] tracking-luxury hover:bg-[#1a1a1a] hover:text-white">CANCEL</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {coupons.length === 0 ? (
        <div className="bg-white border border-[#e6dfd0] py-16 text-center">
          <Tag className="w-12 h-12 mx-auto text-[#b8935a] mb-4" strokeWidth={1} />
          <div className="font-serif text-2xl" style={{fontFamily:'var(--font-cormorant), serif'}}>No promo codes yet</div>
          <p className="text-sm text-[#1a1a1a]/60 mt-2">Create your first offer to reward customers.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c => (
            <div key={c.id} className={`relative bg-white border-2 border-dashed p-6 ${c.active ? 'border-[#b8935a]' : 'border-[#e6dfd0] opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-serif text-2xl tracking-wider" style={{fontFamily:'var(--font-cormorant), serif'}}>{c.code}</div>
                  <div className="text-[10px] tracking-luxury text-[#b8935a] mt-1">{c.discount}% OFF</div>
                </div>
                <button onClick={()=>toggle(c)} className={`text-[9px] tracking-luxury px-2 py-1 border ${c.active ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}>{c.active ? 'ACTIVE' : 'INACTIVE'}</button>
              </div>
              {c.description && <div className="text-xs text-[#1a1a1a]/70 italic mb-2">{c.description}</div>}
              <div className="text-[10px] text-[#1a1a1a]/50 mb-3">{c.minOrder > 0 ? `Min order ₹${c.minOrder}` : 'No minimum'} · Used {c.usageCount || 0}x</div>
              <button onClick={()=>del(c.id)} className="text-[10px] tracking-luxury text-red-600 hover:underline"><Trash2 className="w-3 h-3 inline mr-1" />DELETE</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// =============== PRODUCT FORM (unchanged) ===============
function ProductForm({ token, initial, onDone, onClose }) {
  const [form, setForm] = useState(initial || { name:'', category:'women', price:0, discount:0, image:'', hoverImage:'', description:'', sizes:['S','M','L'], colors:['Default'], stock:10, featured:false, rating:4.8 })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name || !form.image) { toast.error('Name and image required'); return }
    setSaving(true)
    const isEdit = !!initial?.id
    const url = isEdit ? `/api/admin/products/${initial.id}` : '/api/admin/products'
    const method = isEdit ? 'PUT' : 'POST'
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        ...form,
        sizes: typeof form.sizes === 'string' ? form.sizes.split(',').map(s => s.trim()) : form.sizes,
        colors: typeof form.colors === 'string' ? form.colors.split(',').map(s => s.trim()) : form.colors,
      }),
    })
    setSaving(false)
    if (r.ok) { toast.success(isEdit ? 'Product updated' : 'Product created'); onDone() }
    else toast.error('Failed')
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#faf7f2] max-w-3xl w-full my-8 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1a1a] text-[#faf7f2] px-6 md:px-8 py-5 flex items-center justify-between z-10">
          <div>
            <div className="text-[10px] tracking-luxury text-[#b8935a]">{initial ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</div>
            <div className="font-serif text-xl md:text-2xl" style={{fontFamily:'var(--font-cormorant), serif'}}>{initial?.name || 'Untitled piece'}</div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mb-2">MAIN IMAGE</div>
              {form.image ? (
                <div className="relative aspect-[3/4] bg-white group">
                  <img src={form.image} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setForm({...form, image:''})} className="absolute top-2 right-2 bg-black/70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <Dropzone label="Main image" onFiles={url => setForm({...form, image: url})} />
              )}
            </div>
            <div>
              <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mb-2">HOVER IMAGE</div>
              {form.hoverImage ? (
                <div className="relative aspect-[3/4] bg-white group">
                  <img src={form.hoverImage} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setForm({...form, hoverImage:''})} className="absolute top-2 right-2 bg-black/70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <Dropzone label="Hover image" onFiles={url => setForm({...form, hoverImage: url})} />
              )}
            </div>
          </div>

          <Field label="NAME"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a]" placeholder="Ivory Silk Kaftan" /></Field>
          <Field label="DESCRIPTION"><textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a] resize-none" /></Field>

          <div className="grid md:grid-cols-4 gap-4">
            <Field label="CATEGORY"><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a]">
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select></Field>
            <Field label="PRICE (₹)"><input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a]" /></Field>
            <Field label="DISCOUNT %"><input type="number" value={form.discount} onChange={e=>setForm({...form,discount:e.target.value})} className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a]" /></Field>
            <Field label="STOCK"><input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a]" /></Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="SIZES (comma separated)"><input value={Array.isArray(form.sizes) ? form.sizes.join(', ') : form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})} className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a]" placeholder="XS, S, M, L" /></Field>
            <Field label="COLORS (comma separated)"><input value={Array.isArray(form.colors) ? form.colors.join(', ') : form.colors} onChange={e=>setForm({...form,colors:e.target.value})} className="w-full bg-transparent border-b border-[#1a1a1a]/20 py-2 outline-none focus:border-[#b8935a]" placeholder="Ivory, Champagne" /></Field>
          </div>

          <label className="flex items-center gap-3 pt-4">
            <input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})} className="w-4 h-4 accent-[#b8935a]" />
            <span className="text-sm">Feature this piece on the homepage</span>
          </label>

          <div className="flex gap-3 pt-6 border-t border-[#e6dfd0]">
            <button onClick={onClose} className="flex-1 border border-[#1a1a1a] py-3 text-[11px] tracking-luxury hover:bg-[#1a1a1a] hover:text-white transition-colors">CANCEL</button>
            <button disabled={saving} onClick={save} className="flex-1 bg-[#1a1a1a] text-[#faf7f2] py-3 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors disabled:opacity-50">{saving ? 'SAVING...' : 'SAVE PRODUCT'}</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Field({ label, children }) {
  return <div><div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mb-1">{label}</div>{children}</div>
}

function ProductsTab({ token }) {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    const r = await fetch('/api/products')
    const d = await r.json()
    setItems(d.products || [])
  }, [])

  useEffect(() => { load() }, [load])

  const del = async (id) => {
    if (!confirm('Delete this piece?')) return
    const r = await fetch(`/api/admin/products/${id}`, { method:'DELETE', headers:{ Authorization:'Bearer '+token } })
    if (r.ok) { toast.success('Deleted'); load() }
  }

  const toggleFeatured = async (p) => {
    const r = await fetch(`/api/admin/products/${p.id}`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+token }, body: JSON.stringify({ ...p, featured: !p.featured }) })
    if (r.ok) load()
  }

  const filtered = items.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl" style={{fontFamily:'var(--font-cormorant), serif'}}>Products</h2>
          <p className="text-sm text-[#1a1a1a]/60">{items.length} pieces</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="bg-[#1a1a1a] text-[#faf7f2] px-6 py-3 text-[11px] tracking-luxury hover:bg-[#b8935a] flex items-center gap-2">
          <Plus className="w-4 h-4" /> NEW PRODUCT
        </button>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/40" />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products..." className="w-full bg-white border border-[#e6dfd0] pl-10 pr-4 py-3 outline-none focus:border-[#b8935a]" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(p => (
          <motion.div key={p.id} layout className="bg-white border border-[#e6dfd0] group">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#f0ebe1]">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              {p.featured && <div className="absolute top-3 left-3 bg-[#b8935a] text-white text-[9px] tracking-luxury px-2 py-1">FEATURED</div>}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={()=>{ setEditing(p); setShowForm(true) }} className="w-10 h-10 bg-white flex items-center justify-center hover:bg-[#b8935a] hover:text-white"><Edit3 className="w-4 h-4" /></button>
                <button onClick={()=>toggleFeatured(p)} className="w-10 h-10 bg-white flex items-center justify-center hover:bg-[#b8935a] hover:text-white"><Star className={`w-4 h-4 ${p.featured?'fill-current':''}`} /></button>
                <button onClick={()=>del(p.id)} className="w-10 h-10 bg-white flex items-center justify-center hover:bg-red-600 hover:text-white"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-4">
              <div className="text-[9px] tracking-luxury text-[#b8935a]">{p.category?.toUpperCase()}</div>
              <div className="font-serif text-lg mt-1 truncate" style={{fontFamily:'var(--font-cormorant), serif'}}>{p.name}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm">₹{Number(p.price).toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-[#1a1a1a]/60">Stock: {p.stock}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {showForm && <ProductForm token={token} initial={editing} onClose={()=>setShowForm(false)} onDone={()=>{ setShowForm(false); load() }} />}
      </AnimatePresence>
    </div>
  )
}

function GalleryTab({ token }) {
  const [items, setItems] = useState([])
  const [uploading, setUploading] = useState(false)
  const [cat, setCat] = useState('newest')

  const load = useCallback(async () => {
    const r = await fetch('/api/gallery')
    const d = await r.json()
    setItems(d.gallery || [])
  }, [])

  useEffect(() => { load() }, [load])

  const upload = async (urls) => {
    const arr = Array.isArray(urls) ? urls : [urls]
    setUploading(true)
    for (const url of arr) {
      await fetch('/api/admin/gallery', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+token }, body: JSON.stringify({ url, category: cat }) })
    }
    setUploading(false)
    toast.success(`${arr.length} image${arr.length>1?'s':''} added`)
    load()
  }

  const del = async (id) => {
    if (!confirm('Delete this image?')) return
    const r = await fetch(`/api/admin/gallery/${id}`, { method:'DELETE', headers:{ Authorization:'Bearer '+token } })
    if (r.ok) { toast.success('Deleted'); load() }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-3xl md:text-4xl" style={{fontFamily:'var(--font-cormorant), serif'}}>Gallery</h2>
        <p className="text-sm text-[#1a1a1a]/60">{items.length} editorial pieces</p>
      </div>
      <div className="bg-white border border-[#e6dfd0] p-6 mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60">UPLOAD TO:</div>
          {GAL_CATS.map(c => (
            <button key={c} onClick={()=>setCat(c)} className={`text-[10px] tracking-luxury px-3 py-1 border ${cat===c?'bg-[#1a1a1a] text-white border-[#1a1a1a]':'border-[#e6dfd0] hover:border-[#b8935a]'}`}>{c.toUpperCase()}</button>
          ))}
        </div>
        <Dropzone multiple label="Drop images here or click to upload (multiple allowed)" onFiles={upload} />
        {uploading && <div className="mt-4 text-sm text-[#b8935a]">Uploading...</div>}
      </div>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {items.map(it => (
          <div key={it.id} className="relative group mb-4 break-inside-avoid">
            <img src={it.url} alt="" className="w-full h-auto" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button onClick={()=>del(it.id)} className="w-10 h-10 bg-white flex items-center justify-center hover:bg-red-600 hover:text-white"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] tracking-luxury px-2 py-1 opacity-80">{it.category?.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============== MAIN ===============
export default function AdminPage() {
  const router = useRouter()
  const { token, user } = useAuth()
  const [tab, setTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!token) return <div className="min-h-screen flex items-center justify-center text-[#b8935a]">Loading...</div>

  const logout = () => {
    localStorage.removeItem('elira_admin_token')
    localStorage.removeItem('elira_admin_user')
    router.push('/admin/login')
  }

  const tabs = [
    { id:'dashboard', label:'Dashboard', icon: LayoutDashboard },
    { id:'orders', label:'Orders', icon: ShoppingCart },
    { id:'products', label:'Products', icon: Package },
    { id:'customers', label:'Customers', icon: Users },
    { id:'gallery', label:'Gallery', icon: ImageIcon },
    { id:'coupons', label:'Promo Codes', icon: Tag },
  ]

  return (
    <div className="min-h-screen bg-[#faf7f2] flex">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#1a1a1a] text-[#faf7f2] px-4 py-3 flex items-center justify-between z-40">
        <button onClick={()=>setSidebarOpen(!sidebarOpen)}><LayoutDashboard className="w-5 h-5" /></button>
        <div className="font-serif text-lg" style={{fontFamily:'var(--font-cormorant), serif'}}>ELIRA <span className="text-[9px] tracking-luxury text-[#b8935a]">ADMIN</span></div>
        <button onClick={logout}><LogOut className="w-5 h-5" /></button>
      </div>

      {/* Sidebar */}
      <aside className={`bg-[#1a1a1a] text-[#faf7f2] p-6 flex flex-col fixed h-screen w-64 z-50 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="font-serif font-light text-3xl" style={{fontFamily:'var(--font-cormorant), serif'}}>ELIRA</div>
            <div className="text-[9px] tracking-luxury text-[#b8935a] -mt-1">ATELIER · ADMIN</div>
          </div>
          <button onClick={()=>setSidebarOpen(false)} className="lg:hidden text-white/70"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={()=>{ setTab(t.id); setSidebarOpen(false) }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm tracking-refined transition-all ${tab===t.id?'bg-[#b8935a] text-white':'text-white/70 hover:bg-white/5'}`}>
              <t.icon className="w-4 h-4" strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="text-[10px] tracking-luxury text-[#b8935a] mb-1">SIGNED IN AS</div>
          <div className="text-sm mb-4">{user}</div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/5"><LogOut className="w-4 h-4" /> Log out</button>
          <a href="/" className="block mt-2 text-center text-[10px] tracking-luxury text-white/40 hover:text-[#b8935a]">VIEW STORE →</a>
        </div>
      </aside>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={()=>setSidebarOpen(false)} />}

      <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-10 pt-16 lg:pt-10 w-full min-w-0">
        <div className="mb-6 hidden lg:block">
          <div className="text-[10px] tracking-luxury text-[#b8935a]">— ATELIER COMMAND CENTER —</div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {tab === 'dashboard' && <Dashboard token={token} />}
            {tab === 'orders' && <OrdersTab token={token} />}
            {tab === 'products' && <ProductsTab token={token} />}
            {tab === 'customers' && <CustomersTab token={token} />}
            {tab === 'gallery' && <GalleryTab token={token} />}
            {tab === 'coupons' && <CouponsTab token={token} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
