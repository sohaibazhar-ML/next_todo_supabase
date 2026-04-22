const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

require('dotenv').config({ path: '/Users/apple/Desktop/ML Projects/next_todo_supabase/.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Check what recipient values exist
  const docs = await prisma.documents.findMany({
    select: { id: true, title: true, recipient: true, category: true },
    take: 10,
    orderBy: { created_at: 'desc' }
  });
  console.log("=== First 10 documents (recipient values) ===");
  docs.forEach(d => {
    console.log(`  title: "${d.title}", recipient: ${JSON.stringify(d.recipient)}, category: "${d.category}"`);
  });

  // 2. Try recipient-only query
  console.log("\n=== Testing recipient contains 'Private' ===");
  try {
    const results = await prisma.documents.findMany({
      where: {
        recipient: { contains: 'Private', mode: 'insensitive' }
      },
      select: { title: true, recipient: true }
    });
    console.log(`Found ${results.length} results:`, JSON.stringify(results));
  } catch (err) {
    console.error("Query FAILED:", err.message);
  }

  // 3. Try the full OR query
  console.log("\n=== Testing full OR with security filter ===");
  try {
    const results = await prisma.documents.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: 'Private', mode: 'insensitive' } },
              { recipient: { contains: 'Private', mode: 'insensitive' } },
            ]
          },
          { category: { notIn: ['Personal', 'personal'] } }
        ]
      },
      select: { title: true, recipient: true, category: true }
    });
    console.log(`Found ${results.length} results:`, JSON.stringify(results));
  } catch (err) {
    console.error("Query FAILED:", err.message);
  }

  // 4. Try searching "Privat" (the category value shown in screenshot)
  console.log("\n=== Testing 'Privat' search (category) ===");
  try {
    const results = await prisma.documents.findMany({
      where: {
        AND: [
          {
            OR: [
              { category: { contains: 'Privat', mode: 'insensitive' } },
            ]
          },
          { category: { notIn: ['Personal', 'personal'] } }
        ]
      },
      select: { title: true, category: true, recipient: true }
    });
    console.log(`Found ${results.length} results:`, JSON.stringify(results));
  } catch (err) {
    console.error("Query FAILED:", err.message);
  }

  await prisma.$disconnect();
  pool.end();
}
main().catch(console.error);
