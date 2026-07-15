import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

const uri = process.env.MONGO_URL
const dbName = process.env.DB_NAME || 'elira_atelier'
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'elira2025'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'elira-atelier-secret-2026'

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

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}
function verify(token) {
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
  const token = auth.replace(/^Bearer\s+/i, '')
  return verify(token)
}

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
  const count = await db.collection('products').countDocuments()
  if (count === 0) await db.collection('products').insertMany(SEED_PRODUCTS)
  const gcount = await db.collection('gallery').countDocuments()
  if (gcount === 0) await db.collection('gallery').insertMany(SEED_GALLERY)
}

export async function GET(request, { params }) {
  try {
    const pathArr = (await params).path || []
    const route = pathArr.join('/')
    const db = await getDb()
    await ensureSeed(db)

    if (!route) return NextResponse.json({ message: 'Elira Atelier API', status: 'ok' }, { headers: cors })

    if (route === 'products') {
      const url = new URL(request.url)
      const category = url.searchParams.get('category')
      const featured = url.searchParams.get('featured')
      const q = {}
      if (category && category !== 'all') q.category = category
      if (featured) q.featured = true
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
      const category = url.searchParams.get('category')
      const q = {}
      if (category && category !== 'all') q.category = category
      const items = await db.collection('gallery').find(q, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ gallery: items }, { headers: cors })
    }

    if (route === 'admin/stats') {
      if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
      const products = await db.collection('products').countDocuments()
      const gallery = await db.collection('gallery').countDocuments()
      const messages = await db.collection('contact_messages').countDocuments()
      const subscribers = await db.collection('newsletter').countDocuments()
      const featured = await db.collection('products').countDocuments({ featured: true })
      return NextResponse.json({ products, gallery, messages, subscribers, featured }, { headers: cors })
    }

    if (route === 'admin/verify') {
      const u = requireAdmin(request)
      if (!u) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
      return NextResponse.json({ user: u.user }, { headers: cors })
    }

    if (route.startsWith('orders/')) {
      const id = route.split('/')[1]
      const item = await db.collection('orders').findOne({ id }, { projection: { _id: 0 } })
      return NextResponse.json({ order: item }, { headers: cors })
    }

    if (route === 'admin/orders') {
      if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
      const items = await db.collection('orders').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray()
      return NextResponse.json({ orders: items }, { headers: cors })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500, headers: cors })
  }
}

export async function POST(request, { params }) {
  try {
    const pathArr = (await params).path || []
    const route = pathArr.join('/')
    const db = await getDb()

    if (route === 'admin/login') {
      const body = await request.json().catch(() => ({}))
      if (body.username === ADMIN_USER && body.password === ADMIN_PASS) {
        const token = sign({ user: body.username, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
        return NextResponse.json({ success: true, token, user: body.username }, { headers: cors })
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: cors })
    }

    const body = await request.json().catch(() => ({}))

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

    if (route === 'orders') {
      const orderNumber = 'EA' + Date.now().toString().slice(-8)
      const doc = {
        id: uuidv4(),
        orderNumber,
        items: body.items || [],
        totals: body.totals || {},
        customer: body.customer || {},
        shipping: body.shipping || {},
        payment: body.payment || 'cod',
        notes: body.notes || '',
        status: 'pending',
        trackingNumber: '',
        statusHistory: [{ status: 'pending', at: new Date(), note: 'Order received' }],
        createdAt: new Date(),
      }
      await db.collection('orders').insertOne(doc)
      return NextResponse.json({ success: true, orderId: doc.id, orderNumber }, { headers: cors })
    }

    // ADMIN-ONLY routes below
    if (route.startsWith('admin/')) {
      if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
    }

    if (route === 'admin/products') {
      const doc = {
        id: uuidv4(),
        name: body.name || 'Untitled',
        category: body.category || 'women',
        price: Number(body.price) || 0,
        discount: Number(body.discount) || 0,
        rating: Number(body.rating) || 4.8,
        image: body.image || '',
        hoverImage: body.hoverImage || body.image || '',
        description: body.description || '',
        sizes: body.sizes || ['S','M','L'],
        colors: body.colors || ['Default'],
        stock: Number(body.stock) || 0,
        featured: !!body.featured,
        createdAt: new Date(),
      }
      await db.collection('products').insertOne(doc)
      const { _id, ...rest } = doc
      return NextResponse.json({ success: true, product: rest }, { headers: cors })
    }

    if (route === 'admin/gallery') {
      const doc = {
        id: uuidv4(),
        url: body.url || '',
        category: body.category || 'newest',
        createdAt: new Date(),
      }
      await db.collection('gallery').insertOne(doc)
      const { _id, ...rest } = doc
      return NextResponse.json({ success: true, item: rest }, { headers: cors })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: cors })
  }
}

export async function PUT(request, { params }) {
  try {
    const pathArr = (await params).path || []
    const route = pathArr.join('/')
    const db = await getDb()
    if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
    const body = await request.json().catch(() => ({}))

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
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: cors })
  }
}

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
