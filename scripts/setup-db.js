/**
 * MongoDB Database Setup Script
 * Creates indexes and initial data
 */

import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vettcode'

async function setupDatabase() {
  console.log('🔧 Setting up VettCode MongoDB database...\n')

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB\n')

    const db = client.db('vettcode')

    // Create collections
    console.log('📦 Creating collections...')
    
    await db.createCollection('users').catch(() => console.log('  - users collection already exists'))
    await db.createCollection('scans').catch(() => console.log('  - scans collection already exists'))
    await db.createCollection('ai_usage').catch(() => console.log('  - ai_usage collection already exists'))
    
    console.log('✅ Collections created\n')

    // Create indexes
    console.log('🔍 Creating indexes...')

    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ plan: 1 })
    await db.collection('users').createIndex({ createdAt: -1 })
    console.log('  ✓ Users indexes')

    // Scans indexes
    await db.collection('scans').createIndex({ userId: 1, createdAt: -1 })
    await db.collection('scans').createIndex({ timestamp: -1 })
    await db.collection('scans').createIndex({ totalFindings: -1 })
    console.log('  ✓ Scans indexes')

    // AI Usage indexes
    await db.collection('ai_usage').createIndex({ userId: 1, createdAt: -1 })
    await db.collection('ai_usage').createIndex({ createdAt: -1 })
    await db.collection('ai_usage').createIndex({ provider: 1 })
    await db.collection('ai_usage').createIndex({ plan: 1 })
    console.log('  ✓ AI Usage indexes')

    console.log('\n✅ All indexes created\n')

    // Create demo user (optional)
    console.log('👤 Creating demo user...')
    
    const demoUser = {
      email: 'demo@vettcode.dev',
      name: 'Demo User',
      plan: 'free',
      createdAt: new Date(),
      updatedAt: new Date(),
      scanCount: 0,
    }

    try {
      await db.collection('users').insertOne(demoUser)
      console.log('  ✓ Demo user created: demo@vettcode.dev')
    } catch (error) {
      if (error.code === 11000) {
        console.log('  - Demo user already exists')
      } else {
        throw error
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 Database setup complete!')
    console.log('='.repeat(50))
    console.log('\n📊 Database: vettcode')
    console.log('📝 Collections: users, scans, ai_usage')
    console.log('🔑 Indexes: Created for optimal performance')
    console.log('\n🚀 You can now run: npm run dev\n')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

setupDatabase()
