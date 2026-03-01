import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// MODULES & FORMS DEFINITION
// ============================================================================

const MODULES_AND_FORMS = [
    {
        code: 'SYSTEM', name: 'Hệ thống', icon: '⚙️', order: 0,
        forms: [
            { code: 'USERS', name: 'Người dùng', order: 0 },
            { code: 'ROLES', name: 'Phân quyền', order: 1 },
            { code: 'COMPANY_SETTINGS', name: 'Thiết lập công ty', order: 2 },
            { code: 'BRANCHES', name: 'Chi nhánh', order: 3 },
            { code: 'DEPARTMENTS', name: 'Phòng ban', order: 4 },
        ]
    },
    {
        code: 'ACCOUNTING', name: 'Kế toán', icon: '📊', order: 1,
        forms: [
            { code: 'CHART_OF_ACCOUNTS', name: 'Hệ thống tài khoản', order: 0 },
            { code: 'CASH_RECEIPT', name: 'Thu tiền mặt', order: 1 },
            { code: 'CASH_PAYMENT', name: 'Chi tiền mặt', order: 2 },
            { code: 'CASH_BOOK', name: 'Sổ quỹ', order: 3 },
            { code: 'BANK_TRANSACTION', name: 'Giao dịch ngân hàng', order: 4 },
            { code: 'GENERAL_JOURNAL', name: 'Chứng từ tổng hợp', order: 5 },
            { code: 'PARTNER', name: 'Đối tượng', order: 6 },
            { code: 'PARTNER_TYPE', name: 'Loại đối tượng', order: 7 },
            { code: 'PRODUCT', name: 'Vật tư hàng hóa', order: 8 },
            { code: 'PRODUCT_CATEGORY', name: 'Loại VTHH', order: 9 },
            { code: 'WAREHOUSE', name: 'Kho', order: 10 },
            { code: 'BANK_ACCOUNT', name: 'Tài khoản ngân hàng', order: 11 },
            { code: 'CURRENCY', name: 'Loại tiền', order: 12 },
            { code: 'TAX_GROUP', name: 'Nhóm thuế', order: 13 },
            { code: 'TAX_RATE', name: 'Thuế suất', order: 14 },
            { code: 'COST_CENTER', name: 'Đối tượng THCP', order: 15 },
            { code: 'COST_ITEM', name: 'Khoản mục CP', order: 16 },
            { code: 'ACCOUNTING_PERIOD', name: 'Kỳ kế toán', order: 17 },
            { code: 'OPENING_BALANCE', name: 'Số dư đầu', order: 18 },
            { code: 'REPORT', name: 'Báo cáo tài chính', order: 19 },
        ]
    },
    {
        code: 'SALES', name: 'Bán hàng', icon: '🛒', order: 2,
        forms: [
            { code: 'SALES_QUOTE', name: 'Báo giá', order: 0 },
            { code: 'SALES_ORDER', name: 'Đơn hàng bán', order: 1 },
            { code: 'SALES_INVOICE', name: 'Hóa đơn bán', order: 2 },
            { code: 'CUSTOMER', name: 'Khách hàng', order: 3 },
            { code: 'PRICE_LIST', name: 'Bảng giá', order: 4 },
        ]
    },
    {
        code: 'PURCHASES', name: 'Mua hàng', icon: '📦', order: 3,
        forms: [
            { code: 'PURCHASE_ORDER', name: 'Đơn mua hàng', order: 0 },
            { code: 'PURCHASE_INVOICE', name: 'Chứng từ mua', order: 1 },
            { code: 'PURCHASE_RETURN', name: 'Trả lại hàng mua', order: 2 },
            { code: 'VENDOR', name: 'Nhà cung cấp', order: 3 },
            { code: 'PURCHASE_CONTRACT', name: 'Hợp đồng mua', order: 4 },
        ]
    },
    {
        code: 'INVENTORY', name: 'Kho', icon: '🏭', order: 4,
        forms: [
            { code: 'INVENTORY_INBOUND', name: 'Nhập kho', order: 0 },
            { code: 'INVENTORY_OUTBOUND', name: 'Xuất kho', order: 1 },
            { code: 'INVENTORY_STOCK', name: 'Tồn kho', order: 2 },
        ]
    },
    {
        code: 'HRM', name: 'Nhân sự', icon: '👥', order: 5,
        forms: [
            { code: 'EMPLOYEE', name: 'Nhân viên', order: 0 },
            { code: 'TIMEKEEPING', name: 'Chấm công', order: 1 },
            { code: 'PAYROLL', name: 'Tính lương', order: 2 },
        ]
    },
];

const ACTIONS = ['VIEW', 'ADD', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'PRINT'];

// ============================================================================
// DEFAULT ROLES
// ============================================================================

const DEFAULT_ROLES = [
    {
        code: 'ADMIN',
        name: 'Quản trị hệ thống',
        description: 'Quản trị viên hệ thống — toàn quyền',
        isSystem: true,
        allPermissions: true,
        scopeType: 'ALL',
    },
    {
        code: 'KE_TOAN',
        name: 'Kế toán viên',
        description: 'Kế toán viên — quyền nghiệp vụ kế toán',
        isSystem: true,
        modules: ['ACCOUNTING'],
        actions: ['VIEW', 'ADD', 'EDIT', 'EXPORT', 'PRINT'],
        scopeType: 'BRANCH',
    },
    {
        code: 'KE_TOAN_TRUONG',
        name: 'Kế toán trưởng',
        description: 'Kế toán trưởng — toàn quyền kế toán + duyệt',
        isSystem: true,
        modules: ['ACCOUNTING'],
        actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'PRINT'],
        scopeType: 'ALL',
    },
    {
        code: 'SALE',
        name: 'Nhân viên kinh doanh',
        description: 'Nhân viên kinh doanh — quyền bán hàng',
        isSystem: true,
        modules: ['SALES'],
        actions: ['VIEW', 'ADD', 'EDIT', 'EXPORT', 'PRINT'],
        scopeType: 'OWN',
    },
    {
        code: 'TRUONG_PHONG_SALE',
        name: 'Trưởng phòng kinh doanh',
        description: 'Trưởng phòng kinh doanh — toàn quyền bán hàng + duyệt',
        isSystem: true,
        modules: ['SALES'],
        actions: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'PRINT'],
        scopeType: 'DEPARTMENT',
    },
    {
        code: 'KHO',
        name: 'Thủ kho',
        description: 'Nhân viên kho — quyền quản lý kho',
        isSystem: true,
        modules: ['INVENTORY'],
        actions: ['VIEW', 'ADD', 'EDIT', 'EXPORT', 'PRINT'],
        scopeType: 'BRANCH',
    },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seedRBAC() {
    console.log('🔐 Seeding RBAC data...\n');

    // --- Step 1: Create Modules, Forms, and Permissions ---
    console.log('📦 Creating Modules & Forms...');

    // Store form IDs by code for role assignment
    const formIdsByCode: Record<string, string> = {};
    const formIdsByModule: Record<string, string[]> = {};
    const permissionIds: Record<string, string> = {}; // "FORM_CODE:ACTION" -> permissionId

    for (const moduleDef of MODULES_AND_FORMS) {
        // Upsert Module
        const mod = await prisma.module.upsert({
            where: { code: moduleDef.code },
            update: { name: moduleDef.name, icon: moduleDef.icon, order: moduleDef.order },
            create: { code: moduleDef.code, name: moduleDef.name, icon: moduleDef.icon, order: moduleDef.order },
        });
        console.log(`  ✅ Module: ${mod.name} (${mod.code})`);

        formIdsByModule[moduleDef.code] = [];

        for (const formDef of moduleDef.forms) {
            // Upsert Form
            const form = await prisma.form.upsert({
                where: { code: formDef.code },
                update: { name: formDef.name, order: formDef.order, moduleId: mod.id },
                create: { code: formDef.code, name: formDef.name, order: formDef.order, moduleId: mod.id },
            });
            formIdsByCode[formDef.code] = form.id;
            formIdsByModule[moduleDef.code].push(form.id);

            // Create Permissions for each action
            for (const action of ACTIONS) {
                const perm = await prisma.permission.upsert({
                    where: { formId_action: { formId: form.id, action } },
                    update: {},
                    create: { formId: form.id, action, description: `${formDef.name} — ${action}` },
                });
                permissionIds[`${formDef.code}:${action}`] = perm.id;
            }
            console.log(`    📄 Form: ${formDef.name} (${ACTIONS.length} actions)`);
        }
    }

    // --- Step 2: Create Default Roles & Assign Permissions ---
    console.log('\n👥 Creating Default Roles...');

    for (const roleDef of DEFAULT_ROLES) {
        // Upsert Role (system-level, no companyId)
        const role = await prisma.role.upsert({
            where: { companyId_code: { companyId: '', code: roleDef.code } },
            update: { name: roleDef.name, description: roleDef.description, isSystem: roleDef.isSystem },
            create: { companyId: '', code: roleDef.code, name: roleDef.name, description: roleDef.description, isSystem: roleDef.isSystem },
        });
        console.log(`  ✅ Role: ${roleDef.name} (${roleDef.code})`);

        // Clear existing permissions for this role
        await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

        // Assign permissions
        if (roleDef.allPermissions) {
            // ADMIN gets all permissions
            const allPerms = await prisma.permission.findMany();
            for (const perm of allPerms) {
                await prisma.rolePermission.create({
                    data: { roleId: role.id, permissionId: perm.id },
                });
            }
            console.log(`    🔑 All ${allPerms.length} permissions assigned`);
        } else if (roleDef.modules) {
            // Assign permissions for specific modules
            const roleActions = roleDef.actions || ACTIONS;
            let count = 0;
            for (const moduleCode of roleDef.modules) {
                const formIds = formIdsByModule[moduleCode] || [];
                for (const formId of formIds) {
                    for (const action of roleActions) {
                        const key = Object.entries(formIdsByCode).find(([, id]) => id === formId)?.[0];
                        if (key) {
                            const permId = permissionIds[`${key}:${action}`];
                            if (permId) {
                                await prisma.rolePermission.create({
                                    data: { roleId: role.id, permissionId: permId },
                                });
                                count++;
                            }
                        }
                    }
                }
            }
            // Also add VIEW for SYSTEM module (everyone can view their own profile)
            const systemUserViewPerm = permissionIds['USERS:VIEW'];
            if (systemUserViewPerm) {
                await prisma.rolePermission.create({
                    data: { roleId: role.id, permissionId: systemUserViewPerm },
                }).catch(() => { }); // Ignore if already exists
                count++;
            }
            console.log(`    🔑 ${count} permissions assigned`);
        }

        // Assign Data Scope
        await prisma.roleDataScope.deleteMany({ where: { roleId: role.id } });
        await prisma.roleDataScope.create({
            data: { roleId: role.id, scopeType: roleDef.scopeType },
        });
        console.log(`    🔒 Scope: ${roleDef.scopeType}`);
    }

    console.log('\n✅ RBAC seed completed!');

    // Summary
    const stats = {
        modules: await prisma.module.count(),
        forms: await prisma.form.count(),
        permissions: await prisma.permission.count(),
        roles: await prisma.role.count(),
    };
    console.log(`\n📊 Summary:`);
    console.log(`   Modules: ${stats.modules}`);
    console.log(`   Forms: ${stats.forms}`);
    console.log(`   Permissions: ${stats.permissions}`);
    console.log(`   Roles: ${stats.roles}`);
}

seedRBAC()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
