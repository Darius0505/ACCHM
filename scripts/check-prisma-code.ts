
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Fetching Roles ---');
    const roles = await prisma.role.findMany();
    console.log('Roles found:', roles.length);
    if (roles.length > 0) {
        console.log('First role:', JSON.stringify(roles[0], null, 2));
        if ('code' in roles[0]) {
            console.log('✅ "code" field exists in Prisma output.');
        } else {
            console.error('❌ "code" field MISSING in Prisma output.');
        }
    }

    console.log('\n--- Attempting Create ---');
    const code = `TEST_${Date.now()}`;
    try {
        const newRole = await prisma.role.create({
            data: {
                code: code,
                name: 'Test Role Script',
                isSystem: false,
                companyId: ''
            }
        });
        console.log('✅ Created role:', newRole);
        // cleanup
        await prisma.role.delete({ where: { id: newRole.id } });
    } catch (e: any) {
        console.error('❌ Creation failed:', e.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
