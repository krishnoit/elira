'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ChevronRight, ShoppingBag, Heart, Search, Menu, X, Star, Play, MapPin, Phone, Mail, Instagram, Facebook, Twitter, ArrowUpRight, Sparkles, Award, Leaf, Users, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { addToCart, getCart, cartTotals } from '@/lib/cart'

const HERO_SLIDES = [
  { image: 'https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=1920&q=90', tag: 'AUTUMN / WINTER 2025' },
  { image: 'https://images.unsplash.com/photo-1574015974293-817f0ebebb74?w=1920&q=90', tag: 'THE ATELIER EDIT' },
  { image: 'https://images.pexels.com/photos/1066171/pexels-photo-1066171.jpeg?w=1920', tag: 'HERITAGE COLLECTION' },
]

const COLLECTIONS = [
  { name: "Women's Wear", desc: 'Timeless silhouettes for the modern woman', image: 'https://images.unsplash.com/photo-1568251188392-ae32f898cb3b?w=800&q=80' },
  { name: "Men's Wear", desc: 'Sartorial excellence, redefined', image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?w=800' },
  { name: 'Ethnic', desc: 'Heritage craftsmanship, contemporary spirit', image: 'https://images.unsplash.com/photo-1589212987511-4a924cb9d8ac?w=800&q=80' },
  { name: 'Western', desc: 'Refined elegance for every occasion', image: 'https://images.unsplash.com/photo-1762395500105-988d1860c152?w=800&q=80' },
  { name: 'Custom Printing', desc: 'Bring your vision to life', image: 'https://images.unsplash.com/photo-1673201229733-69d19c5c4a87?w=800&q=80' },
  { name: 'Corporate Uniforms', desc: 'Bespoke tailoring for enterprises', image: 'https://images.unsplash.com/photo-1673201230274-c4dbd20c3f79?w=800&q=80' },
  { name: 'Kids', desc: 'Little icons, dressed with love', image: 'https://images.pexels.com/photos/34171256/pexels-photo-34171256.jpeg?w=800' },
  { name: 'Accessories', desc: 'The finishing touch of luxury', image: 'https://images.pexels.com/photos/20858959/pexels-photo-20858959.jpeg?w=800' },
]

const PHILOSOPHY = [
  { icon: Leaf, title: 'Sustainable', desc: 'Materials chosen with care for our planet.' },
  { icon: Award, title: 'Ethical', desc: 'Every stitch tells a story of integrity.' },
  { icon: Sparkles, title: 'Beautiful', desc: 'Where art meets everyday elegance.' },
  { icon: Users, title: 'Fair Labor', desc: 'Artisans honored, craftsmanship celebrated.' },
]

const TESTIMONIALS = [
  { name: 'Anaïs Kapoor', role: 'Creative Director, Mumbai', quote: 'Elira Atelier crafted a gown that felt as if it were made for my soul. Impeccable.', image: 'https://images.unsplash.com/photo-1606143412458-acc5f86de897?w=200&q=80', rating: 5 },
  { name: 'Vikram Shroff', role: 'Entrepreneur, London', quote: 'The finest tailoring outside Savile Row. A house of true artistry.', image: 'https://images.unsplash.com/photo-1603775020644-eb8decd79994?w=200&q=80', rating: 5 },
  { name: 'Isabella Moreau', role: 'Editor, Vogue Paris', quote: 'A quiet revolution in couture. Elira redefines what luxury feels like.', image: 'https://images.pexels.com/photos/31850380/pexels-photo-31850380.jpeg?w=200', rating: 5 },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState(null)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    const updateCount = () => setCartCount(cartTotals(getCart()).count)
    updateCount()
    window.addEventListener('elira-cart-update', updateCount)
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => { })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('elira-cart-update', updateCount)
    }
  }, [])
  const links = ['Home', 'Collections', 'Gallery', 'About', 'Contact']
  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50  z-[9999] bg-[#1a1a1a] text-[#faf7f2] text-[10px] md:text-[11px] tracking-luxury py-2 text-center overflow-hidden transition-transform duration-500 ${scrolled ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0">
              <span className="px-8">COMPLIMENTARY SHIPPING WORLDWIDE</span>
              <span className="px-8 text-[#b8935a]">◆</span>
              <span className="px-8">BESPOKE ATELIER SERVICE AVAILABLE</span>
              <span className="px-8 text-[#b8935a]">◆</span>
              <span className="px-8">NEW ARRIVALS · AUTUMN WINTER 2025</span>
              <span className="px-8 text-[#b8935a]">◆</span>
            </div>
          ))}
        </div>
      </div>
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${scrolled
            ? "top-0 bg-[#faf7f2]/95 backdrop-blur-md py-1.5 shadow-sm"
            : "top-4 md:top-5 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm py-1.5 md:py-2"
          }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 flex items-center justify-between">
          <div className={`hidden md:flex items-center gap-6 lg:gap-8 text-[12px] tracking-refined uppercase ${scrolled ? 'text-[#1a1a1a]' : 'text-[#faf7f2]'}`}>
            {links.slice(0, 3).map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="luxury-underline hover:text-[#b8935a] transition-colors">{l}</a>
            ))}
          </div>
          <a href="#home" className="flex-1 md:flex-none flex justify-center md:justify-start items-center">
            <img src="/elira-logo.png" alt="Elira Atelier" className={`h-16 md:h-20 lg:h-24 w-auto object-contain transition-all duration-500`} style={scrolled ? {} : { filter: 'brightness(0) invert(1)' }} />
          </a>
          <div className={`hidden md:flex items-center gap-4 lg:gap-6 text-[12px] tracking-refined uppercase ${scrolled ? 'text-[#1a1a1a]' : 'text-[#faf7f2]'}`}>
            {links.slice(3).map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="luxury-underline hover:text-[#b8935a] transition-colors">{l}</a>
            ))}
            <div className="flex items-center gap-3 lg:gap-4 ml-2 lg:ml-4">
              <Search className="w-4 h-4 cursor-pointer hover:text-[#b8935a]" />
              {user ? (
                <Link href="/account" className="flex items-center gap-2 hover:text-[#b8935a]" title={user.name}>
                  {user.picture ? <img src={user.picture} alt="" className="w-6 h-6 rounded-full border border-[#b8935a]" /> : <div className="w-6 h-6 rounded-full bg-[#b8935a] text-white text-[10px] flex items-center justify-center">{user.name?.[0]?.toUpperCase()}</div>}
                </Link>
              ) : (
                <Link href="/login" className="text-[11px] tracking-luxury hover:text-[#b8935a]">SIGN IN</Link>
              )}
              <Heart className="w-4 h-4 cursor-pointer hover:text-[#b8935a]" />
              <div className="relative cursor-pointer">
                <Link href="/cart"><ShoppingBag className="w-4 h-4 hover:text-[#b8935a]" /></Link>
                <span className="absolute -top-2 -right-2 bg-[#b8935a] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">{cartCount}</span>
              </div>
            </div>
          </div>
          <div className="md:hidden flex items-center gap-4">
            <div className="relative">
              <Link href="/cart"><ShoppingBag className={`w-5 h-5 ${scrolled ? 'text-[#1a1a1a]' : 'text-[#faf7f2]'}`} /></Link>
              <span className="absolute -top-2 -right-2 bg-[#b8935a] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">{cartCount}</span>
            </div>
            <button onClick={() => setOpen(!open)} className={scrolled ? 'text-[#1a1a1a]' : 'text-[#faf7f2]'}>{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-[#faf7f2] border-t border-[#e6dfd0]">
              <div className="px-6 py-6 flex flex-col gap-4 text-sm tracking-refined uppercase text-[#1a1a1a]">
                {links.map(l => <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} className="border-b border-[#e6dfd0] pb-3">{l}</a>)}
                {user ? (
                  <Link href="/account" onClick={() => setOpen(false)} className="border-b border-[#e6dfd0] pb-3 flex items-center gap-3">
                    {user.picture ? <img src={user.picture} alt="" className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-[#b8935a] text-white text-[10px] flex items-center justify-center">{user.name?.[0]?.toUpperCase()}</div>}
                    MY ACCOUNT
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)} className="border-b border-[#e6dfd0] pb-3">SIGN IN</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}

function Hero() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [])
  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center animate-kenburns" style={{ backgroundImage: `url(${HERO_SLIDES[idx].image})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 text-[#faf7f2] max-w-[1600px] mx-auto pt-32 md:pt-40 pb-32 md:pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}>
          <div className="flex items-center gap-4 text-[10px] md:text-[11px] tracking-luxury mb-6 md:mb-8">
            <div className="h-px w-12 md:w-16 bg-[#b8935a]" />
            <span className="text-[#d4b483]">{HERO_SLIDES[idx].tag}</span>
          </div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="font-display font-light text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9rem] leading-[0.95] max-w-5xl">
          Tailored<br /><span className="italic text-[#f5e6c8]">Elegance</span><br />Redefined.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 1 }} className="mt-6 md:mt-8 max-w-xl text-base md:text-lg lg:text-xl text-[#faf7f2]/85 font-light leading-relaxed">
          Discover timeless fashion designed for every occasion — where heritage craftsmanship meets contemporary vision.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 1 }} className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <a href="#collections" className="group inline-flex items-center justify-center gap-3 bg-[#faf7f2] text-[#1a1a1a] px-8 md:px-10 py-3.5 md:py-4 text-[11px] md:text-[12px] tracking-luxury hover:bg-[#b8935a] hover:text-[#faf7f2] transition-all duration-500">
            EXPLORE COLLECTION
            <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </a>
          <a href="#contact" className="group inline-flex items-center justify-center gap-3 border border-[#faf7f2]/60 text-[#faf7f2] px-8 md:px-10 py-3.5 md:py-4 text-[11px] md:text-[12px] tracking-luxury hover:bg-[#faf7f2] hover:text-[#1a1a1a] transition-all duration-500">
            CONTACT US
          </a>
        </motion.div>

        <div className="absolute bottom-6 md:bottom-10 left-6 md:left-16 lg:left-24 flex items-center gap-3">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`h-px transition-all duration-500 ${i === idx ? 'w-12 md:w-16 bg-[#b8935a]' : 'w-6 md:w-8 bg-white/40'}`} />
          ))}
        </div>
        <div className="hidden md:block absolute bottom-10 right-6 md:right-16 lg:right-24 text-[10px] tracking-luxury text-[#faf7f2]/60">
          SCROLL TO DISCOVER
        </div>
      </div>
    </section>
  )
}

function Counter({ end, label, suffix = '' }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0
        const step = end / 60
        const t = setInterval(() => {
          start += step
          if (start >= end) { setN(end); clearInterval(t) } else setN(Math.floor(start))
        }, 25)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end])
  return (
    <div ref={ref} className="text-center">
      <div className="font-display font-light text-5xl md:text-6xl text-[#b8935a]">{n}{suffix}</div>
      <div className="text-[11px] tracking-luxury mt-2 text-[#1a1a1a]/70">{label}</div>
    </div>
  )
}

function About() {
  return (
    <section id="about" className="py-24 md:py-40 px-6 md:px-16 lg:px-24 max-w-[1600px] mx-auto">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="relative aspect-[3/4] overflow-hidden">
          <img src="https://images.unsplash.com/photo-1680835099030-9c7532f744f1?w=1000&q=80" alt="Atelier" className="w-full h-full object-cover" />
          <div className="absolute bottom-6 left-6 bg-[#faf7f2] px-6 py-4">
            <div className="font-display italic text-2xl">Est. <span className="text-[#b8935a]">2018</span></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
          <div className="flex items-center gap-4 text-[11px] tracking-luxury mb-6 text-[#b8935a]">
            <div className="h-px w-12 bg-[#b8935a]" />
            <span>THE HOUSE</span>
          </div>
          <h2 className="font-display font-light text-5xl md:text-6xl leading-[1.05] mb-8">
            Where Style Meets <span className="italic">Creativity.</span>
          </h2>
          <div className="space-y-5 text-[#1a1a1a]/75 text-lg leading-relaxed font-light">
            <p>At Elira Atelier, we believe fashion should be as unique as you are. We offer premium-quality clothing crafted with attention to detail, elegant designs, and lasting comfort.</p>
            <p>Bring your ideas to life with our custom design and printing services — every piece a testament to the artisan's hand.</p>
          </div>
          <button className="mt-10 group inline-flex items-center gap-3 text-[12px] tracking-luxury border-b border-[#1a1a1a] pb-1 hover:border-[#b8935a] hover:text-[#b8935a] transition-colors">
            READ THE FULL STORY
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-[#e6dfd0]">
            <Counter end={12} label="YEARS OF CRAFT" suffix="+" />
            <Counter end={2400} label="CLIENTS WORLDWIDE" suffix="+" />
            <Counter end={48} label="MASTER ARTISANS" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Philosophy() {
  return (
    <section className="py-24 md:py-40 bg-[#1a1a1a] text-[#faf7f2] px-6 md:px-16 lg:px-24">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="text-center mb-20">
          <div className="flex items-center gap-4 text-[11px] tracking-luxury mb-6 justify-center text-[#d4b483]">
            <div className="h-px w-12 bg-[#b8935a]" />
            <span>OUR PHILOSOPHY</span>
            <div className="h-px w-12 bg-[#b8935a]" />
          </div>
          <h2 className="font-display font-light text-5xl md:text-7xl leading-[1.05] max-w-4xl mx-auto">
            Fashion should be as <span className="italic text-shine">meaningful</span> as it is beautiful.
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PHILOSOPHY.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }} className="group relative p-10 border border-[#faf7f2]/10 hover:border-[#b8935a]/60 transition-all duration-500 hover-lift">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#b8935a]/0 to-[#b8935a]/0 group-hover:from-[#b8935a]/5 group-hover:to-transparent transition-all duration-700" />
              <p.icon className="w-8 h-8 text-[#b8935a] mb-6" strokeWidth={1} />
              <h3 className="font-display text-2xl mb-3">{p.title}</h3>
              <p className="text-sm text-[#faf7f2]/60 font-light leading-relaxed">{p.desc}</p>
              <div className="mt-6 text-[10px] tracking-luxury text-[#b8935a] opacity-0 group-hover:opacity-100 transition-opacity">— 0{i + 1}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Collections() {
  return (
    <section id="collections" className="py-24 md:py-40 px-6 md:px-16 lg:px-24 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
        <div>
          <div className="flex items-center gap-4 text-[11px] tracking-luxury mb-6 text-[#b8935a]">
            <div className="h-px w-12 bg-[#b8935a]" />
            <span>THE COLLECTIONS</span>
          </div>
          <h2 className="font-display font-light text-5xl md:text-7xl leading-[1.05]">
            Curated <span className="italic">Wardrobes.</span>
          </h2>
        </div>
        <p className="max-w-md text-[#1a1a1a]/70 font-light">Eight signature edits, each a study in silhouette, fabric, and the quiet confidence of considered design.</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {COLLECTIONS.map((c, i) => (
          <motion.a key={c.name} href="#" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.05 }} className="group relative aspect-[3/4] overflow-hidden bg-[#e6dfd0]">
            <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 p-5 md:p-7 flex flex-col justify-end text-[#faf7f2]">
              <div className="text-[9px] md:text-[10px] tracking-luxury text-[#d4b483] mb-2">0{i + 1}</div>
              <h3 className="font-display text-xl md:text-2xl mb-1">{c.name}</h3>
              <p className="text-[11px] md:text-xs opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-white/80 font-light hidden md:block">{c.desc}</p>
              <div className="mt-3 inline-flex items-center gap-2 text-[10px] tracking-luxury opacity-0 group-hover:opacity-100 transition-opacity duration-500">EXPLORE <ArrowUpRight className="w-3 h-3" /></div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

function Featured() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    fetch('/api/products?featured=true').then(r => r.json()).then(d => setProducts(d.products || []))
  }, [])
  return (
    <section className="py-24 md:py-40 bg-[#f0ebe1] px-6 md:px-16 lg:px-24">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="text-center mb-20">
          <div className="flex items-center gap-4 text-[11px] tracking-luxury mb-6 justify-center text-[#b8935a]">
            <div className="h-px w-12 bg-[#b8935a]" />
            <span>FEATURED</span>
            <div className="h-px w-12 bg-[#b8935a]" />
          </div>
          <h2 className="font-display font-light text-5xl md:text-7xl leading-[1.05]">Signature <span className="italic">Pieces.</span></h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.05 }} className="group">
              <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-white">
                <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:opacity-0" />
                <img src={p.hoverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-105" />
                {p.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-[#1a1a1a] text-[#faf7f2] text-[10px] tracking-luxury px-3 py-1">-{p.discount}%</div>
                )}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                  <button className="w-10 h-10 bg-white flex items-center justify-center hover:bg-[#b8935a] hover:text-white transition-colors"><Heart className="w-4 h-4" /></button>
                  {/* <button className="w-10 h-10 bg-white flex items-center justify-center hover:bg-[#b8935a] hover:text-white transition-colors"><Search className="w-4 h-4" /></button> */}
                </div>
                <button onClick={() => { addToCart(p); toast.success(`${p.name} added to bag`) }} className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] text-[#faf7f2] py-3 text-[11px] tracking-luxury translate-y-full group-hover:translate-y-0 transition-transform duration-500">ADD TO BAG</button>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] tracking-luxury text-[#b8935a] mb-1">{p.category.toUpperCase()}</div>
                  <h3 className="font-display text-lg md:text-xl leading-tight">{p.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`w-3 h-3 ${s < Math.round(p.rating) ? 'fill-[#b8935a] text-[#b8935a]' : 'text-[#e6dfd0]'}`} />)}
                    <span className="text-[10px] text-[#1a1a1a]/60 ml-1">{p.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  {p.discount > 0 ? (
                    <>
                      <div className="font-display text-lg">₹{Math.round(p.price * (1 - p.discount / 100)).toLocaleString('en-IN')}</div>
                      <div className="text-xs line-through text-[#1a1a1a]/40">₹{p.price.toLocaleString('en-IN')}</div>
                    </>
                  ) : (
                    <div className="font-display text-lg">₹{p.price.toLocaleString('en-IN')}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Gallery() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [lightbox, setLightbox] = useState(null)
  useEffect(() => {
    fetch(`/api/gallery${filter !== 'all' ? '?category=' + filter : ''}`).then(r => r.json()).then(d => setItems(d.gallery || []))
  }, [filter])
  const filters = ['all', 'newest', 'popular', 'collection', 'editorial']
  return (
    <section id="gallery" className="py-24 md:py-40 px-6 md:px-16 lg:px-24 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="text-center mb-12">
        <div className="flex items-center gap-4 text-[11px] tracking-luxury mb-6 justify-center text-[#b8935a]">
          <div className="h-px w-12 bg-[#b8935a]" /><span>THE JOURNAL</span><div className="h-px w-12 bg-[#b8935a]" />
        </div>
        <h2 className="font-display font-light text-5xl md:text-7xl leading-[1.05]">Editorial <span className="italic">Moments.</span></h2>
      </motion.div>
      <div className="flex justify-center gap-2 md:gap-6 mb-12 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-[11px] tracking-luxury uppercase px-4 py-2 transition-all ${filter === f ? 'text-[#b8935a] border-b border-[#b8935a]' : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'}`}>{f}</button>
        ))}
      </div>
      <div className="columns-2 md:columns-3 lg:columns-4 masonry">
        {items.map((it, i) => (
          <motion.div key={it.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: (i % 4) * 0.05 }} onClick={() => setLightbox(it)} className="relative overflow-hidden cursor-pointer group">
            <img src={it.url} alt="" className="w-full h-auto transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
              <Search className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6">
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 text-white"><X className="w-8 h-8" /></button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={lightbox.url} className="max-w-full max-h-full object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function Testimonials() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % TESTIMONIALS.length), 6000)
    return () => clearInterval(t)
  }, [])
  return (
    <section className="py-24 md:py-40 bg-[#1a1a1a] text-[#faf7f2] px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center gap-4 text-[11px] tracking-luxury mb-6 justify-center text-[#d4b483]">
          <div className="h-px w-12 bg-[#b8935a]" /><span>KIND WORDS</span><div className="h-px w-12 bg-[#b8935a]" />
        </div>
        <div className="text-[#b8935a] text-6xl font-display leading-none mb-6">“</div>
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8 }}>
            <p className="font-display italic text-3xl md:text-5xl leading-tight font-light mb-10">{TESTIMONIALS[i].quote}</p>
            <div className="flex items-center justify-center gap-4">
              <img src={TESTIMONIALS[i].image} alt={TESTIMONIALS[i].name} className="w-14 h-14 rounded-full object-cover border-2 border-[#b8935a]" />
              <div className="text-left">
                <div className="font-display text-xl">{TESTIMONIALS[i].name}</div>
                <div className="text-[10px] tracking-luxury text-[#d4b483]">{TESTIMONIALS[i].role}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-2 mt-10">
          {TESTIMONIALS.map((_, k) => (
            <button key={k} onClick={() => setI(k)} className={`h-px transition-all duration-500 ${k === i ? 'w-12 bg-[#b8935a]' : 'w-6 bg-white/30'}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSending(false)
    if (r.ok) { toast.success('Message received. We shall be in touch.'); setForm({ name: '', email: '', message: '' }) }
    else toast.error('Something went wrong')
  }
  return (
    <section id="contact" className="py-24 md:py-40 px-6 md:px-16 lg:px-24 max-w-[1600px] mx-auto">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20">
        <div>
          <div className="flex items-center gap-4 text-[11px] tracking-luxury mb-6 text-[#b8935a]">
            <div className="h-px w-12 bg-[#b8935a]" /><span>VISIT US</span>
          </div>
          <h2 className="font-display font-light text-5xl md:text-7xl leading-[1.05] mb-6">Better yet, <span className="italic">see us in person!</span></h2>
          <p className="text-[#1a1a1a]/70 font-light text-lg mb-12">We love our clients — visit our atelier during business hours for a private consultation.</p>
          <div className="space-y-6 text-sm">
            <div className="flex items-start gap-4"><MapPin className="w-4 h-4 mt-1 text-[#b8935a]" /><div><div className="font-display text-lg">Elira Atelier</div><div className="text-[#1a1a1a]/70">Indirapuram gzb</div></div></div>
            <div className="flex items-start gap-4"><Phone className="w-4 h-4 mt-1 text-[#b8935a]" /><div><a href="tel:+918384041358" className="font-display text-lg luxury-underline">+91 83840 41358</a></div></div>
            <div className="flex items-start gap-4"><Mail className="w-4 h-4 mt-1 text-[#b8935a]" /><div><a href="mailto:support@eliraatelier.com" className="block luxury-underline">support@eliraatelier.com</a>&nbsp;&nbsp;<a href="mailto:info@eliraatelier.com" className="block luxury-underline">info@eliraatelier.com</a></div></div>
            <div className="pt-6 border-t border-[#e6dfd0]">
              <div className="text-[11px] tracking-luxury text-[#b8935a] mb-3">BUSINESS HOURS</div>
              <div className="flex justify-between"><span>Monday – Friday</span><span>09:00 – 17:00</span></div>
              <div className="flex justify-between text-[#1a1a1a]/50"><span>Saturday</span><span>Closed</span></div>
              <div className="flex justify-between text-[#1a1a1a]/50"><span>Sunday</span><span>Closed</span></div>
            </div>
          </div>
          <div className="flex gap-3 mt-10">
            <a href="https://wa.me/918384041358" className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 text-[11px] tracking-luxury hover:opacity-90">WHATSAPP</a>
            <a href="tel:+918384041358" className="flex items-center gap-2 border border-[#1a1a1a] px-5 py-3 text-[11px] tracking-luxury hover:bg-[#1a1a1a] hover:text-white transition-colors">CALL NOW</a>
          </div>
        </div>
        <form onSubmit={submit} className="bg-[#f0ebe1] p-8 md:p-12 space-y-6">
          <h3 className="font-display text-3xl mb-2">Send a message</h3>
          <p className="text-sm text-[#1a1a1a]/60 mb-6">A concierge will reply within 24 hours.</p>
          <div><label className="text-[10px] tracking-luxury">FULL NAME</label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-2 bg-transparent border-0 border-b border-[#1a1a1a]/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#b8935a]" /></div>
          <div><label className="text-[10px] tracking-luxury">EMAIL</label><Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-2 bg-transparent border-0 border-b border-[#1a1a1a]/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#b8935a]" /></div>
          <div><label className="text-[10px] tracking-luxury">MESSAGE</label><Textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-2 bg-transparent border-0 border-b border-[#1a1a1a]/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-[#b8935a] resize-none" /></div>
          <button type="submit" disabled={sending} className="w-full bg-[#1a1a1a] text-[#faf7f2] py-4 text-[11px] tracking-luxury hover:bg-[#b8935a] transition-colors flex items-center justify-center gap-3">{sending ? 'SENDING...' : 'SEND MESSAGE'} <Send className="w-3 h-3" /></button>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  const [email, setEmail] = useState('')
  const sub = async (e) => {
    e.preventDefault()
    await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    toast.success('Welcome to the atelier.')
    setEmail('')
  }
  return (
    <footer className="bg-[#1a1a1a] text-[#faf7f2] pt-24 pb-8 px-6 md:px-16 lg:px-24">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid md:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          <div className="md:col-span-2">
            <div className="font-display font-light text-4xl tracking-refined">ELIRA</div>
            <div className="text-[10px] tracking-luxury text-[#b8935a] -mt-1 mb-6">ATELIER</div>
            <p className="text-white/60 font-light max-w-md leading-relaxed mb-8">A house of contemporary craft, honoring the artisan's hand and the wearer's spirit.</p>
            <form onSubmit={sub} className="flex border border-white/20 max-w-md">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/40" />
              <button className="bg-[#b8935a] px-6 text-[10px] tracking-luxury hover:bg-[#d4b483] transition-colors">SUBSCRIBE</button>
            </form>
          </div>
          <div>
            <div className="text-[10px] tracking-luxury text-[#b8935a] mb-4">EXPLORE</div>
            <ul className="space-y-3 text-sm text-white/70">
              {['Collections', 'Gallery', 'About', 'Journal', 'Contact'].map(l => <li key={l}><a href="#" className="luxury-underline hover:text-white">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <div className="text-[10px] tracking-luxury text-[#b8935a] mb-4">CLIENT SERVICES</div>
            <ul className="space-y-3 text-sm text-white/70">
              {['Bespoke Service', 'Shipping', 'Returns', 'Privacy', 'Terms'].map(l => <li key={l}><a href="#" className="luxury-underline hover:text-white">{l}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">
          <div className="text-xs text-white/50 tracking-refined">© 2026 ELIRA ATELIER. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-5 text-white/60">
            <Instagram className="w-4 h-4 hover:text-[#b8935a] cursor-pointer" />
            <Facebook className="w-4 h-4 hover:text-[#b8935a] cursor-pointer" />
            <Twitter className="w-4 h-4 hover:text-[#b8935a] cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  )
}

function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 800)
    window.addEventListener('scroll', on)
    return () => window.removeEventListener('scroll', on)
  }, [])
  if (!show) return null
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#1a1a1a] text-[#faf7f2] flex items-center justify-center hover:bg-[#b8935a] transition-colors">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </button>
  )
}

function App() {
  return (
    <div className="bg-[#faf7f2] text-[#1a1a1a] font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <About />
      <Philosophy />
      <Collections />
      <Featured />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />
      <BackToTop />
    </div>
  )
}

export default App
