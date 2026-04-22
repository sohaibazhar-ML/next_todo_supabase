const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const docs = await prisma.documents.findMany({
    select: { title: true, is_featured: true }
  });
  console.log(JSON.stringify(docs, null, 2));
}

check();
