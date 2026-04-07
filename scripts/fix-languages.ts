import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting language cleanup...');
  
  const mappings = [
    { from: 'Français', to: 'fr' },
    { from: 'Fran%C3%A7ais', to: 'fr' }, // URL encoded
    { from: 'FranÃ§ais', to: 'fr' },    // Encoding mess
    { from: 'Deutsch', to: 'de' },
    { from: 'Italiano', to: 'it' },
    { from: 'English', to: 'en' },
  ];

  for (const mapping of mappings) {
    const result = await (prisma as any).profiles.updateMany({
      where: {
        preferred_language: {
          contains: mapping.from,
          mode: 'insensitive',
        },
      },
      data: {
        preferred_language: mapping.to,
      },
    });
    
    if (result.count > 0) {
      console.log(`Updated ${result.count} records from "${mapping.from}" to "${mapping.to}"`);
    }
  }

  // Also catch any other long strings that are definitely not codes
  const allProfiles = await (prisma as any).profiles.findMany({
    where: {
      preferred_language: {
        length: { gt: 2 }
      }
    }
  });

  for (const profile of allProfiles) {
      let target = 'de'; // Default fallback
      const current = profile.preferred_language.toLowerCase();
      if (current.includes('franc') || current.includes('fran')) target = 'fr';
      if (current.includes('ital')) target = 'it';
      if (current.includes('engl')) target = 'en';
      if (current.includes('deut')) target = 'de';

      await (prisma as any).profiles.update({
          where: { id: profile.id },
          data: { preferred_language: target }
      });
      console.log(`Cleaned up profile ${profile.id}: "${profile.preferred_language}" -> "${target}"`);
  }

  console.log('Cleanup finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
