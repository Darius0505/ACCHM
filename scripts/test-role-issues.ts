
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING ROLE ISSUE TEST ---');
    const roleName = 'TEST_ROLE_01';

    // 1. Cleanup previous runs
    console.log('1. Cleaning up...');
    try {
        const existing = await prisma.role.findFirst({ where: { name: roleName } });
        if (existing) {
            await prisma.role.delete({ where: { id: existing.id } });
            console.log('   Deleted existing role.');
        }
    } catch (e) {
        console.log('   Cleanup warning:', e.message);
    }

    // 2. Create Role
    console.log('2. Creating Role...');
    const role1 = await prisma.role.create({
        data: {
            name: roleName,
            isSystem: false,
            companyId: '', // Simulating default
        }
    });
    console.log('   Created Role ID:', role1.id);

    // 3. Test Duplication
    console.log('3. Testing Duplication...');
    try {
        await prisma.role.create({
            data: {
                name: roleName,
                isSystem: false,
                companyId: '',
            }
        });
        console.error('   ❌ FAILED: Duplicate role allowed!');
    } catch (e: any) {
        if (e.code === 'P2002') {
            console.log('   ✅ SUCCESS: Duplicate role prevented (P2002).');
        } else {
            console.error('   ❌ FAILED: Unexpected error:', e.code, e.message);
        }
    }

    // 4. Test Deletion (With Permissions/Scopes)
    console.log('4. Testing Deletion (With Permissions/Scopes)...');
    try {
        // Create Role again
        const role2 = await prisma.role.create({
            data: {
                name: 'TEST_ROLE_CASCADE',
                isSystem: false,
                companyId: '',
            }
        });

        // Add Permission (need a real Form ID or create one)
        // For simplicity, just add Data Scope which is easier
        await prisma.roleDataScope.create({
            data: {
                roleId: role2.id,
                scopeType: 'ALL'
            }
        });
        console.log('   Added Data Scope to Role.');

        await prisma.role.delete({ where: { id: role2.id } });
        console.log('   ✅ SUCCESS: Role with DataScope deleted (Cascade works).');
    } catch (e: any) {
        console.error('   ❌ FAILED: Could not delete role with relations:', e.message);
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
