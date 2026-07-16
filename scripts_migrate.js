const { MongoClient } = require('mongodb')

const SRC = 'mongodb://localhost:27017'
const SRC_DB = 'your_database_name'

const DST = 'mongodb+srv://sarojyadav3196_db_user:Kumar7870601403@eliraatelier.fsfwrrt.mongodb.net/?retryWrites=true&w=majority'
const DST_DB = 'eliraatelier'

async function main() {
  const src = new MongoClient(SRC)
  const dst = new MongoClient(DST)
  await src.connect()
  await dst.connect()
  const sdb = src.db(SRC_DB)
  const ddb = dst.db(DST_DB)

  const collections = await sdb.listCollections().toArray()
  console.log(`Found ${collections.length} collections in source`)

  for (const c of collections) {
    const name = c.name
    if (name.startsWith('system.')) continue
    const docs = await sdb.collection(name).find({}).toArray()
    if (docs.length === 0) { console.log(`  ${name}: empty, skip`); continue }
    // Wipe destination first for clean import
    await ddb.collection(name).deleteMany({})
    await ddb.collection(name).insertMany(docs)
    console.log(`  ${name}: ${docs.length} docs migrated`)
  }

  console.log('\n=== MIGRATION COMPLETE ===')
  await src.close()
  await dst.close()
}
main().catch(e => { console.error(e); process.exit(1) })
