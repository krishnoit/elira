import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

const uri = process.env.MONGO_URL
const dbName = process.env.DB_NAME || 'elira_atelier'

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

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors })
}

// Sample seed products
const SEED_PRODUCTS = [
  { id: 'p1', name: 'Ivory Silk Kaftan', category: 'women', price: 24500, discount: 15, rating: 4.9, image: 'https://images.unsplash.com/photo-1568251188392-ae32f898cb3b?w=800&q=80', hoverImage: 'https://images.unsplash.com/photo-1589212987511-4a924cb9d8ac?w=800&q=80', description: 'Hand-embroidered silk kaftan with gold thread work.', sizes: ['XS','S','M','L','XL'], colors: ['Ivory','Champagne','Blush'], stock: 12, featured: true },
  { id: 'p2', name: 'Onyx Tailored Suit', category: 'men', price: 38900, discount: 0, rating: 4.8, image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?w=800', hoverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80', description: 'Bespoke wool suit tailored to perfection.', sizes: ['38','40','42','44'], colors: ['Onyx','Charcoal'], stock: 8, featured: true },
  { id: 'p3', name: 'Saffron Ethnic Lehenga', category: 'ethnic', price: 45200, discount: 20, rating: 5.0, image: 'https://images.unsplash.com/photo-1589212987511-4a924cb9d8ac?w=800&q=80', hoverImage: 'https://images.unsplash.com/photo-1568251188392-ae32f898cb3b?w=800&q=80', description: 'Hand-crafted lehenga with intricate zardozi work.', sizes: ['S','M','L'], colors: ['Saffron','Emerald','Ruby'], stock: 5, featured: true },
  { id: 'p4', name: 'Champagne Evening Gown', category: 'western', price: 32800, discount: 10, rating: 4.9, image: 'https://images.unsplash.com/photo-1762395500105-988d1860c152?w=800&q=80', hoverImage: 'https://images.pexels.com/photos/34171256/pexels-photo-34171256.jpeg?w=800', description: 'Floor-length gown for gala evenings.', sizes: ['XS','S','M','L'], colors: ['Champagne','Ivory'], stock: 6, featured: true },
  { id: 'p5', name: 'Golden Hour Clutch', category: 'accessories', price: 8900, discount: 0, rating: 4.7, image: 'https://images.pexels.com/photos/20858959/pexels-photo-20858959.jpeg?w=800', hoverImage: 'https://images.pexels.com/photos/12901715/pexels-photo-12901715.jpeg?w=800', description: 'Handcrafted evening clutch with gold detailing.', sizes: ['One Size'], colors: ['Gold','Rose Gold'], stock: 20, featured: true },
  { id: 'p6', name: 'Ivory Bespoke Blazer', category: 'women', price: 21500, discount: 0, rating: 4.8, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80', hoverImage: 'https://images.pexels.com/photos/8306370/pexels-photo-8306370.jpeg?w=800', description: 'Modern tailored blazer in silk-wool blend.', sizes: ['XS','S','M','L'], colors: ['Ivory','Camel'], stock: 10, featured: true },
]

const SEED_GALLERY = [
  { id: 'g1', url: 'https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=1000&q=80', category: 'editorial', h: 900 },
  { id: 'g2', url: 'https://images.unsplash.com/photo-1574015974293-817f0ebebb74?w=1000&q=80', category: 'newest', h: 1200 },
  { id: 'g3', url: 'https://images.unsplash.com/photo-1562151270-c7d22ceb586a?w=1000&q=80', category: 'popular', h: 800 },
  { id: 'g4', url: 'https://images.pexels.com/photos/1066171/pexels-photo-1066171.jpeg?w=1000', category: 'editorial', h: 1000 },
  { id: 'g5', url: 'https://images.unsplash.com/photo-1568251188392-ae32f898cb3b?w=1000&q=80', category: 'collection', h: 1100 },
  { id: 'g6', url: 'https://images.unsplash.com/photo-1762395500105-988d1860c152?w=1000&q=80', category: 'newest', h: 900 },
  { id: 'g7', url: 'https://images.pexels.com/photos/34171256/pexels-photo-34171256.jpeg?w=1000', category: 'popular', h: 1300 },
  { id: 'g8', url: 'https://images.unsplash.com/photo-1606143412458-acc5f86de897?w=1000&q=80', category: 'editorial', h: 900 },
  { id: 'g9', url: 'https://images.unsplash.com/photo-1603775020644-eb8decd79994?w=1000&q=80', category: 'collection', h: 1100 },
  { id: 'g10', url: 'https://images.pexels.com/photos/31850380/pexels-photo-31850380.jpeg?w=1000', category: 'newest', h: 1000 },
  { id: 'g11', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1000&q=80', category: 'popular', h: 950 },
  { id: 'g12', url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&q=80', category: 'collection', h: 1050 },
]

async function ensureSeed(db) {
  const count = await db.collection('products').countDocuments()
  if (count === 0) {
    await db.collection('products').insertMany(SEED_PRODUCTS)
  }
  const gcount = await db.collection('gallery').countDocuments()
  if (gcount === 0) {
    await db.collection('gallery').insertMany(SEED_GALLERY)
  }
}

export async function GET(request, { params }) {
  try {
    const pathArr = (await params).path || []
    const route = pathArr.join('/')
    const db = await getDb()
    await ensureSeed(db)

    if (!route || route === '') {
      return NextResponse.json({ message: 'Elira Atelier API', status: 'ok' }, { headers: cors })
    }

    if (route === 'products') {
      const url = new URL(request.url)
      const category = url.searchParams.get('category')
      const featured = url.searchParams.get('featured')
      const q = {}
      if (category && category !== 'all') q.category = category
      if (featured) q.featured = true
      const items = await db.collection('products').find(q, { projection: { _id: 0 } }).toArray()
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
      const items = await db.collection('gallery').find(q, { projection: { _id: 0 } }).toArray()
      return NextResponse.json({ gallery: items }, { headers: cors })
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

    if (route === 'products') {
      const doc = { id: uuidv4(), ...body, createdAt: new Date() }
      await db.collection('products').insertOne(doc)
      return NextResponse.json({ success: true, product: doc }, { headers: cors })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: cors })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: cors })
  }
}
