
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching journals...');
        const journals = await prisma.journal.findMany({
            select: {
                id: true,
                code: true,
                template: true, // Should exist
                padding: true,  // Should exist
            }
        });
        console.log(`Journals found: ${journals.length}`);
        console.log(journals);
    } catch (error) {
        console.error('Error fetching journals:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
