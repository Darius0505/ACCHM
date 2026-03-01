
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const id = 'DEFAULT_COMPANY_ID'; // Matches auth.service.ts demo user

    try {
        const existing = await prisma.company.findUnique({ where: { id } });
        if (existing) {
            console.log('✅ Company with DEFAULT_COMPANY_ID already exists.');
            return;
        }

        await prisma.company.create({
            data: {
                id, // Explicitly set ID
                code: 'DEFAULT',
                name: 'Default Demo Company',
                address: 'Demo Address',
                phone: '0000000000',
                email: 'demo@company.com',
                // Defaults
                currency: 'VND',
                fiscalYearStart: 1,
                accountingStandard: 'VAS',
            },
        });
        console.log('✅ Created company with DEFAULT_COMPANY_ID');
    } catch (e) {
        console.error('Error seeding company:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
