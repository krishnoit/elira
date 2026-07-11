'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Package, Image as ImageIcon, LogOut, Plus, Trash2, Edit3, Star, X, Upload, Sparkles, TrendingUp, MessageSquare, Mail, Search } from 'lucide-react'
import { toast } from 'sonner'

const CATS = ['women','men','ethnic','western','kids','accessories','custom','corporate']
const GAL_CATS = ['newest','popular','collection','editorial']

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
    <label
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
      className={`block border-2 border-dashed p-8 text-center cursor-pointer transition-all ${drag ? 'border-[#b8935a] bg-[#b8935a]/10' : 'border-[#1a1a1a]/20 hover:border-[#b8935a]/60 bg-[#faf7f2]'}`}
    >
      <input type="file" accept="image/*" multiple={multiple} className="hidden" onChange={e => handleFiles(e.target.files)} />
      <Upload className="w-8 h-8 mx-auto mb-3 text-[#b8935a]" strokeWidth={1} />
      <div className="text-sm font-medium">{label}</div>
      <div className="text-[10px] tracking-refined text-[#1a1a1a]/50 mt-1">PNG, JPG, WEBP · Max 10MB</div>
    </label>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 border border-[#e6dfd0]">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 flex items-center justify-center ${accent}`}><Icon className="w-5 h-5" strokeWidth={1.5} /></div>
        <div className="text-[9px] tracking-luxury text-[#1a1a1a]/40">TOTAL</div>
      </div>
      <div className="font-serif text-4xl" style={{fontFamily:'var(--font-cormorant), serif'}}>{value}</div>
      <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60 mt-1">{label}</div>
    </motion.div>
  )
}

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
        <div className="sticky top-0 bg-[#1a1a1a] text-[#faf7f2] px-8 py-5 flex items-center justify-between z-10">
          <div>
            <div className="text-[10px] tracking-luxury text-[#b8935a]">{initial ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</div>
            <div className="font-serif text-2xl" style={{fontFamily:'var(--font-cormorant), serif'}}>{initial?.name || 'Untitled piece'}</div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 space-y-6">
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-3xl" style={{fontFamily:'var(--font-cormorant), serif'}}>Products</h2>
          <p className="text-sm text-[#1a1a1a]/60">{items.length} pieces in the atelier</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="bg-[#1a1a1a] text-[#faf7f2] px-6 py-3 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> NEW PRODUCT
        </button>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/40" />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products..." className="w-full bg-white border border-[#e6dfd0] pl-10 pr-4 py-3 outline-none focus:border-[#b8935a]" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-3xl" style={{fontFamily:'var(--font-cormorant), serif'}}>Gallery</h2>
          <p className="text-sm text-[#1a1a1a]/60">{items.length} editorial pieces</p>
        </div>
      </div>
      <div className="bg-white border border-[#e6dfd0] p-6 mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="text-[10px] tracking-luxury text-[#1a1a1a]/60">UPLOAD TO CATEGORY:</div>
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

function Dashboard({ token }) {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: 'Bearer '+token } }).then(r=>r.json()).then(setStats)
  }, [token])
  return (
    <div>
      <h2 className="font-serif text-3xl mb-6" style={{fontFamily:'var(--font-cormorant), serif'}}>Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={Package} label="PRODUCTS" value={stats?.products ?? '—'} accent="bg-[#b8935a]/10 text-[#b8935a]" />
        <StatCard icon={Sparkles} label="FEATURED" value={stats?.featured ?? '—'} accent="bg-[#1a1a1a] text-[#b8935a]" />
        <StatCard icon={ImageIcon} label="GALLERY" value={stats?.gallery ?? '—'} accent="bg-[#b8935a]/10 text-[#b8935a]" />
        <StatCard icon={MessageSquare} label="MESSAGES" value={stats?.messages ?? '—'} accent="bg-[#b8935a]/10 text-[#b8935a]" />
        <StatCard icon={Mail} label="SUBSCRIBERS" value={stats?.subscribers ?? '—'} accent="bg-[#b8935a]/10 text-[#b8935a]" />
      </div>
      <div className="mt-10 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white p-10 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#b8935a]/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="text-[10px] tracking-luxury text-[#d4b483] mb-3">WELCOME BACK</div>
          <h3 className="font-serif text-4xl mb-3" style={{fontFamily:'var(--font-cormorant), serif'}}>Your atelier awaits.</h3>
          <p className="text-white/70 max-w-xl">Manage products, curate the editorial gallery, and shape the Elira experience — all from one refined command center.</p>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const { token, user } = useAuth()
  const [tab, setTab] = useState('dashboard')

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center text-[#b8935a]">Loading...</div>
  }

  const logout = () => {
    localStorage.removeItem('elira_admin_token')
    localStorage.removeItem('elira_admin_user')
    router.push('/admin/login')
  }

  const tabs = [
    { id:'dashboard', label:'Dashboard', icon: LayoutDashboard },
    { id:'products', label:'Products', icon: Package },
    { id:'gallery', label:'Gallery', icon: ImageIcon },
  ]

  return (
    <div className="min-h-screen bg-[#faf7f2] flex">
      <aside className="w-64 bg-[#1a1a1a] text-[#faf7f2] p-6 flex flex-col fixed h-screen">
        <div className="mb-10">
          <div className="font-serif font-light text-3xl" style={{fontFamily:'var(--font-cormorant), serif'}}>ELIRA</div>
          <div className="text-[9px] tracking-luxury text-[#b8935a] -mt-1">ATELIER · ADMIN</div>
        </div>
        <nav className="flex-1 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm tracking-refined transition-all ${tab===t.id?'bg-[#b8935a] text-white':'text-white/70 hover:bg-white/5'}`}>
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
      <main className="flex-1 ml-64 p-10">
        <div className="mb-8">
          <div className="text-[10px] tracking-luxury text-[#b8935a]">— ATELIER COMMAND CENTER —</div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {tab === 'dashboard' && <Dashboard token={token} />}
            {tab === 'products' && <ProductsTab token={token} />}
            {tab === 'gallery' && <GalleryTab token={token} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
