import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Razorpay from 'razorpay'

export const runtime = 'nodejs'

const uri = process.env.MONGO_URL
const dbName = process.env.DB_NAME || 'elira_atelier'
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'elira2025'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'elira-atelier-secret-2026'
const JWT_SECRET = process.env.JWT_SECRET || 'elira-jwt-secret'
const APP_URL = process.env.NEXT_PUBLIC_BASE_URL
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

let cachedClient = null
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri)
    await cachedClient.connect()
  }
  return cachedClient.db(dbName)
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }) }

// ---------- Admin token (HMAC) ----------
function signAdmin(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}
function verifyAdmin(token) {
  if (!token) return null
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url')
  if (sig !== expected) return null
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())
    if (payload.exp && payload.exp < Date.now()) return null
    return payload
  } catch { return null }
}
function requireAdmin(request) {
  const auth = request.headers.get('authorization') || ''
  return verifyAdmin(auth.replace(/^Bearer\s+/i, ''))
}

// ---------- Customer JWT ----------
function signUser(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
}
function verifyUser(token) {
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}
function getUserFromRequest(request) {
  const cookie = request.cookies.get('elira_session')?.value
  return verifyUser(cookie)
}

// ---------- Seed ----------
const SEED_PRODUCTS = [
  { id: 'p1', name: 'Ivory Silk Kaftan', category: 'women', price: 24500, discount: 15, rating: 4.9, image: 'https://images.unsplash.com/photo-1568251188392-ae32f898cb3b?w=800&q=80', hoverImage: 'https://images.unsplash.com/photo-1589212987511-4a924cb9d8ac?w=800&q=80', description: 'Hand-embroidered silk kaftan with gold thread work.', sizes: ['XS','S','M','L','XL'], colors: ['Ivory','Champagne','Blush'], stock: 12, featured: true },
  { id: 'p2', name: 'Onyx Tailored Suit', category: 'men', price: 38900, discount: 0, rating: 4.8, image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?w=800', hoverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80', description: 'Bespoke wool suit tailored to perfection.', sizes: ['38','40','42','44'], colors: ['Onyx','Charcoal'], stock: 8, featured: true },
  { id: 'p3', name: 'Saffron Ethnic Lehenga', category: 'ethnic', price: 45200, discount: 20, rating: 5.0, image: 'https://images.unsplash.com/photo-1589212987511-4a924cb9d8ac?w=800&q=80', hoverImage: 'https://images.unsplash.com/photo-1568251188392-ae32f898cb3b?w=800&q=80', description: 'Hand-crafted lehenga with intricate zardozi work.', sizes: ['S','M','L'], colors: ['Saffron','Emerald','Ruby'], stock: 5, featured: true },
  { id: 'p4', name: 'Champagne Evening Gown', category: 'western', price: 32800, discount: 10, rating: 4.9, image: 'https://images.unsplash.com/photo-1762395500105-988d1860c152?w=800&q=80', hoverImage: 'https://images.pexels.com/photos/34171256/pexels-photo-34171256.jpeg?w=800', description: 'Floor-length gown for gala evenings.', sizes: ['XS','S','M','L'], colors: ['Champagne','Ivory'], stock: 6, featured: true },
  { id: 'p5', name: 'Golden Hour Clutch', category: 'accessories', price: 8900, discount: 0, rating: 4.7, image: 'https://images.pexels.com/photos/20858959/pexels-photo-20858959.jpeg?w=800', hoverImage: 'https://images.pexels.com/photos/12901715/pexels-photo-12901715.jpeg?w=800', description: 'Handcrafted evening clutch with gold detailing.', sizes: ['One Size'], colors: ['Gold','Rose Gold'], stock: 20, featured: true },
  { id: 'p6', name: 'Ivory Bespoke Blazer', category: 'women', price: 21500, discount: 0, rating: 4.8, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80', hoverImage: 'https://images.pexels.com/photos/8306370/pexels-photo-8306370.jpeg?w=800', description: 'Modern tailored blazer in silk-wool blend.', sizes: ['XS','S','M','L'], colors: ['Ivory','Camel'], stock: 10, featured: true },
]
const SEED_GALLERY = [
  { id: 'g1', url: 'https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=1000&q=80', category: 'editorial' },
  { id: 'g2', url: 'https://images.unsplash.com/photo-1574015974293-817f0ebebb74?w=1000&q=80', category: 'newest' },
  { id: 'g3', url: 'https://images.unsplash.com/photo-1562151270-c7d22ceb586a?w=1000&q=80', category: 'popular' },
  { id: 'g4', url: 'https://images.pexels.com/photos/1066171/pexels-photo-1066171.jpeg?w=1000', category: 'editorial' },
  { id: 'g5', url: 'https://images.unsplash.com/photo-1568251188392-ae32f898cb3b?w=1000&q=80', category: 'collection' },
  { id: 'g6', url: 'https://images.unsplash.com/photo-1762395500105-988d1860c152?w=1000&q=80', category: 'newest' },
  { id: 'g7', url: 'https://images.pexels.com/photos/34171256/pexels-photo-34171256.jpeg?w=1000', category: 'popular' },
  { id: 'g8', url: 'https://images.unsplash.com/photo-1606143412458-acc5f86de897?w=1000&q=80', category: 'editorial' },
  { id: 'g9', url: 'https://images.unsplash.com/photo-1603775020644-eb8decd79994?w=1000&q=80', category: 'collection' },
  { id: 'g10', url: 'https://images.pexels.com/photos/31850380/pexels-photo-31850380.jpeg?w=1000', category: 'newest' },
  { id: 'g11', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1000&q=80', category: 'popular' },
  { id: 'g12', url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&q=80', category: 'collection' },
]
async function ensureSeed(db) {
  const c = await db.collection('products').countDocuments()
  if (c === 0) await db.collection('products').insertMany(SEED_PRODUCTS)
  const g = await db.collection('gallery').countDocuments()
  if (g === 0) await db.collection('gallery').insertMany(SEED_GALLERY)
}

// =========================================================
// GET
// =========================================================
export async function GET(request, { params }) {
  try {
    const pathArr = (await params).path || []
    const route = pathArr.join('/')
    const db = await getDb()
    await ensureSeed(db)

    if (!route) return NextResponse.json({ message: 'Elira Atelier API', status: 'ok' }, { headers: cors })

    // ---- Products / Gallery ----
    if (route === 'products') {
      const url = new URL(request.url)
      const q = {}
      if (url.searchParams.get('category') && url.searchParams.get('category') !== 'all') q.category = url.searchParams.get('category')
      if (url.searchParams.get('featured')) q.featured = true
      const items = await db.collection('products').find(q, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ products: items }, { headers: cors })
    }
    if (route.startsWith('products/')) {
      const id = route.split('/')[1]
      const item = await db.collection('products').findOne({ id }, { projection: { _id: 0 } })
      return NextResponse.json({ product: item }, { headers: cors })
    }
    if (route === 'gallery') {
      const url = new URL(request.url)
      const q = {}
      if (url.searchParams.get('category') && url.searchParams.get('category') !== 'all') q.category = url.searchParams.get('category')
      const items = await db.collection('gallery').find(q, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ gallery: items }, { headers: cors })
    }

    // ---- Auth ----
    if (route === 'auth/me') {
      const u = getUserFromRequest(request)
      if (!u) return NextResponse.json({ user: null }, { headers: cors })
      const user = await db.collection('users').findOne({ id: u.id }, { projection: { _id: 0, passwordHash: 0 } })
      return NextResponse.json({ user }, { headers: cors })
    }

    if (route === 'auth/google/start') {
      const state = crypto.randomBytes(16).toString('hex')
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      const returnTo = new URL(request.url).searchParams.get('returnTo') || '/account'
      url.search = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        state: state + '|' + returnTo,
        prompt: 'select_account',
      }).toString()
      const res = NextResponse.redirect(url)
      res.cookies.set('google_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 })
      return res
    }

    if (route === 'auth/google/callback') {
      const url = new URL(request.url)
      const code = url.searchParams.get('code')
      const stateFull = url.searchParams.get('state') || ''
      const [state, returnTo = '/account'] = stateFull.split('|')
      const stateCookie = request.cookies.get('google_oauth_state')?.value
      if (!code || !state || state !== stateCookie) {
        return NextResponse.redirect(new URL('/login?error=state', APP_URL))
      }
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      })
      if (!tokenRes.ok) return NextResponse.redirect(new URL('/login?error=token', APP_URL))
      const tokens = await tokenRes.json()
      const profRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      if (!profRes.ok) return NextResponse.redirect(new URL('/login?error=profile', APP_URL))
      const p = await profRes.json()

      let user = await db.collection('users').findOne({ email: p.email })
      if (!user) {
        user = {
          id: uuidv4(),
          email: p.email,
          name: p.name,
          picture: p.picture,
          googleId: p.sub,
          provider: 'google',
          createdAt: new Date(),
        }
        await db.collection('users').insertOne(user)
      } else if (!user.googleId) {
        await db.collection('users').updateOne({ id: user.id }, { $set: { googleId: p.sub, picture: p.picture, provider: user.provider || 'google' } })
      }

      const token = signUser(user)
      const res = NextResponse.redirect(new URL(returnTo, APP_URL))
      res.cookies.set('elira_session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 })
      res.cookies.delete('google_oauth_state')
      return res
    }

    // ---- Customer cart ----
    if (route === 'user/cart') {
      const u = getUserFromRequest(request)
      if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
      const cart = await db.collection('carts').findOne({ userId: u.id }, { projection: { _id: 0 } })
      return NextResponse.json({ items: cart?.items || [] }, { headers: cors })
    }

    // ---- Customer wishlist ----
    if (route === 'user/wishlist') {
      const u = getUserFromRequest(request)
      if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
      const w = await db.collection('wishlists').findOne({ userId: u.id }, { projection: { _id: 0 } })
      const productIds = w?.productIds || []
      const products = productIds.length ? await db.collection('products').find({ id: { $in: productIds } }, { projection: { _id: 0 } }).toArray() : []
      return NextResponse.json({ products }, { headers: cors })
    }

    // ---- Customer orders ----
    if (route === 'user/orders') {
      const u = getUserFromRequest(request)
      if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
      const orders = await db.collection('orders').find({ userId: u.id }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ orders }, { headers: cors })
    }

    if (route.startsWith('orders/')) {
      const id = route.split('/')[1]
      const item = await db.collection('orders').findOne({ id }, { projection: { _id: 0 } })
      return NextResponse.json({ order: item }, { headers: cors })
    }

    // ---- Admin ----
    if (route === 'admin/verify') {
      const u = requireAdmin(request)
      if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
      return NextResponse.json({ user: u.user }, { headers: cors })
    }
    if (route === 'admin/stats') {
      if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
      const products = await db.collection('products').countDocuments()
      const gallery = await db.collection('gallery').countDocuments()
      const messages = await db.collection('contact_messages').countDocuments()
      const subscribers = await db.collection('newsletter').countDocuments()
      const featured = await db.collection('products').countDocuments({ featured: true })
      const orders = await db.collection('orders').countDocuments()
      const users = await db.collection('users').countDocuments()
      return NextResponse.json({ products, gallery, messages, subscribers, featured, orders, users }, { headers: cors })
    }
    if (route === 'admin/orders') {
      if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
      const items = await db.collection('orders').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ orders: items }, { headers: cors })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors })
  } catch (e) {
    console.error('GET error:', e)
    return NextResponse.json({ error: e.message }, { status: 500, headers: cors })
  }
}

// =========================================================
// POST
// =========================================================
export async function POST(request, { params }) {
  try {
    const pathArr = (await params).path || []
    const route = pathArr.join('/')
    const db = await getDb()

    // ---- Admin login (special: no body parse issue) ----
    if (route === 'admin/login') {
      const body = await request.json().catch(() => ({}))
      if (body.username === ADMIN_USER && body.password === ADMIN_PASS) {
        const token = signAdmin({ user: body.username, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
        return NextResponse.json({ success: true, token, user: body.username }, { headers: cors })
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: cors })
    }

    const body = await request.json().catch(() => ({}))

    // ---- Customer auth (email/password) ----
    if (route === 'auth/register') {
      const { email, password, name } = body
      if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400, headers: cors })
      if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400, headers: cors })
      const existing = await db.collection('users').findOne({ email: email.toLowerCase() })
      if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409, headers: cors })
      const passwordHash = await bcrypt.hash(password, 10)
      const user = { id: uuidv4(), email: email.toLowerCase(), name: name || email.split('@')[0], passwordHash, provider: 'email', createdAt: new Date() }
      await db.collection('users').insertOne(user)
      const token = signUser(user)
      const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } }, { headers: cors })
      res.cookies.set('elira_session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 })
      return res
    }

    if (route === 'auth/login') {
      const { email, password } = body
      const user = await db.collection('users').findOne({ email: (email || '').toLowerCase() })
      if (!user || !user.passwordHash) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: cors })
      const ok = await bcrypt.compare(password, user.passwordHash)
      if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: cors })
      const token = signUser(user)
      const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, picture: user.picture } }, { headers: cors })
      res.cookies.set('elira_session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 })
      return res
    }

    if (route === 'auth/logout') {
      const res = NextResponse.json({ success: true }, { headers: cors })
      res.cookies.set('elira_session', '', { path: '/', maxAge: 0 })
      return res
    }

    // ---- Cart sync ----
    if (route === 'user/cart') {
      const u = getUserFromRequest(request)
      if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
      await db.collection('carts').updateOne(
        { userId: u.id },
        { $set: { userId: u.id, items: body.items || [], updatedAt: new Date() } },
        { upsert: true }
      )
      return NextResponse.json({ success: true }, { headers: cors })
    }

    // ---- Wishlist toggle ----
    if (route === 'user/wishlist/toggle') {
      const u = getUserFromRequest(request)
      if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
      const pid = body.productId
      const cur = await db.collection('wishlists').findOne({ userId: u.id })
      const ids = new Set(cur?.productIds || [])
      const added = !ids.has(pid)
      if (added) ids.add(pid); else ids.delete(pid)
      await db.collection('wishlists').updateOne({ userId: u.id }, { $set: { userId: u.id, productIds: [...ids] } }, { upsert: true })
      return NextResponse.json({ success: true, added, productIds: [...ids] }, { headers: cors })
    }

    // ---- Contact / Newsletter ----
    if (route === 'contact') {
      const doc = { id: uuidv4(), ...body, createdAt: new Date() }
      await db.collection('contact_messages').insertOne(doc)
      return NextResponse.json({ success: true, id: doc.id }, { headers: cors })
    }
    if (route === 'newsletter') {
      const doc = { id: uuidv4(), email: body.email, createdAt: new Date() }
      await db.collection('newsletter').insertOne(doc)
      return NextResponse.json({ success: true }, { headers: cors })
    }

    // ---- Orders ----
    if (route === 'orders') {
      const u = getUserFromRequest(request)
      const orderNumber = 'EA' + Date.now().toString().slice(-8)
      const doc = {
        id: uuidv4(),
        orderNumber,
        userId: u?.id || null,
        userEmail: u?.email || body.customer?.email,
        items: body.items || [],
        totals: body.totals || {},
        customer: body.customer || {},
        shipping: body.shipping || {},
        payment: body.payment || 'cod',
        paymentStatus: body.payment === 'razorpay' ? 'created' : 'pending',
        razorpayOrderId: null,
        razorpayPaymentId: null,
        notes: body.notes || '',
        status: 'pending',
        trackingNumber: '',
        statusHistory: [{ status: 'pending', at: new Date(), note: 'Order received' }],
        createdAt: new Date(),
      }
      await db.collection('orders').insertOne(doc)
      return NextResponse.json({ success: true, orderId: doc.id, orderNumber }, { headers: cors })
    }

    // ---- Razorpay ----
    if (route === 'payments/razorpay/order') {
      const u = getUserFromRequest(request)
      const { amount, orderDbId } = body
      const amountInPaise = Math.round(Number(amount) * 100)
      if (!amountInPaise || amountInPaise <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400, headers: cors })
      const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
      const rzpOrder = await rzp.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: { userId: u?.id || 'guest', orderDbId: orderDbId || '' },
      })
      if (orderDbId) {
        await db.collection('orders').updateOne({ id: orderDbId }, { $set: { razorpayOrderId: rzpOrder.id } })
      }
      return NextResponse.json({ orderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID }, { headers: cors })
    }

    if (route === 'payments/razorpay/verify') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDbId } = body
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')
      if (expected !== razorpay_signature) {
        if (orderDbId) await db.collection('orders').updateOne({ id: orderDbId }, { $set: { paymentStatus: 'failed' } })
        return NextResponse.json({ ok: false, error: 'Signature verification failed' }, { status: 400, headers: cors })
      }
      if (orderDbId) {
        await db.collection('orders').updateOne({ id: orderDbId }, {
          $set: { paymentStatus: 'paid', razorpayPaymentId: razorpay_payment_id },
          $push: { statusHistory: { status: 'pending', at: new Date(), note: 'Payment received via Razorpay' } },
        })
      }
      return NextResponse.json({ ok: true }, { headers: cors })
    }

    // ---- ADMIN-ONLY ----
    if (route.startsWith('admin/')) {
      if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
    }
    if (route === 'admin/products') {
      const doc = {
        id: uuidv4(),
        name: body.name || 'Untitled', category: body.category || 'women',
        price: Number(body.price) || 0, discount: Number(body.discount) || 0,
        rating: Number(body.rating) || 4.8, image: body.image || '',
        hoverImage: body.hoverImage || body.image || '', description: body.description || '',
        sizes: body.sizes || ['S','M','L'], colors: body.colors || ['Default'],
        stock: Number(body.stock) || 0, featured: !!body.featured, createdAt: new Date(),
      }
      await db.collection('products').insertOne(doc)
      const { _id, ...rest } = doc
      return NextResponse.json({ success: true, product: rest }, { headers: cors })
    }
    if (route === 'admin/gallery') {
      const doc = { id: uuidv4(), url: body.url || '', category: body.category || 'newest', createdAt: new Date() }
      await db.collection('gallery').insertOne(doc)
      const { _id, ...rest } = doc
      return NextResponse.json({ success: true, item: rest }, { headers: cors })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors })
  } catch (e) {
    console.error('POST error:', e)
    return NextResponse.json({ error: e.message }, { status: 500, headers: cors })
  }
}

// =========================================================
// PUT
// =========================================================
export async function PUT(request, { params }) {
  try {
    const pathArr = (await params).path || []
    const route = pathArr.join('/')
    const db = await getDb()
    const body = await request.json().catch(() => ({}))

    if (route.startsWith('admin/')) {
      if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
    }

    if (route.startsWith('admin/products/')) {
      const id = route.split('/')[2]
      const { _id, id: _ignore, createdAt, ...update } = body
      if (update.price !== undefined) update.price = Number(update.price)
      if (update.discount !== undefined) update.discount = Number(update.discount)
      if (update.stock !== undefined) update.stock = Number(update.stock)
      await db.collection('products').updateOne({ id }, { $set: update })
      const item = await db.collection('products').findOne({ id }, { projection: { _id: 0 } })
      return NextResponse.json({ success: true, product: item }, { headers: cors })
    }

    if (route.startsWith('admin/orders/')) {
      const id = route.split('/')[2]
      const update = {}
      if (body.status) update.status = body.status
      if (body.trackingNumber !== undefined) update.trackingNumber = body.trackingNumber
      if (body.paymentStatus) update.paymentStatus = body.paymentStatus
      const push = body.status ? { statusHistory: { status: body.status, at: new Date(), note: body.note || `Marked ${body.status}` } } : null
      const upd = { $set: update }
      if (push) upd.$push = push
      await db.collection('orders').updateOne({ id }, upd)
      const item = await db.collection('orders').findOne({ id }, { projection: { _id: 0 } })
      return NextResponse.json({ success: true, order: item }, { headers: cors })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: cors })
  }
}

// =========================================================
// DELETE
// =========================================================
export async function DELETE(request, { params }) {
  try {
    const pathArr = (await params).path || []
    const route = pathArr.join('/')
    const db = await getDb()
    if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })

    if (route.startsWith('admin/products/')) {
      const id = route.split('/')[2]
      await db.collection('products').deleteOne({ id })
      return NextResponse.json({ success: true }, { headers: cors })
    }
    if (route.startsWith('admin/gallery/')) {
      const id = route.split('/')[2]
      await db.collection('gallery').deleteOne({ id })
      return NextResponse.json({ success: true }, { headers: cors })
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: cors })
  }
}
