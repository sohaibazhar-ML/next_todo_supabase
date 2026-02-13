
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const docs = await prisma.documents.findMany({
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
            id: true,
            title: true,
            file_name: true,
            google_drive_template_id: true,
            created_at: true
        }
    })

    console.log('Recent Documents:')
    console.log(JSON.stringify(docs, null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
