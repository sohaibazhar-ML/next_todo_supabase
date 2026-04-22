const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function check() {
  try {
    const total = await prisma.documents.count();
    const featured = await prisma.documents.count({ where: { is_featured: true } });
    const unfeatured = await prisma.documents.count({ where: { is_featured: false } });
    const nullFeatured = await prisma.documents.count({ where: { is_featured: null } });
    
    console.log({ total, featured, unfeatured, nullFeatured });
    
    const sample = await prisma.documents.findMany({
      take: 5,
      select: { title: true, is_featured: true }
    });
    console.log('Samples:', sample);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
