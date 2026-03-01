const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('⚙️ Seeding System Metadata (Hybrid Core)...');

    // Find the Journal 'PT' (Phiếu Thu)
    const journalPT = await prisma.journal.findFirst({
        where: { code: 'PT' }
    });

    if (!journalPT) {
        console.error('❌ Journal PT not found. Run seed-journals.ts first.');
        return;
    }

    // Define Grid Columns for PT
    const ptColumns = [
        { field: 'description', headerName: 'Diễn giải', width: 250, flex: 2, type: 'text', align: 'left', orderIndex: 1, isReadOnly: false, isRequired: false },
        { field: 'debitAccount', headerName: 'TK Nợ', width: 100, flex: 1, type: 'account', align: 'center', orderIndex: 2, isReadOnly: false, isRequired: true },
        { field: 'creditAccount', headerName: 'TK Có', width: 100, flex: 1, type: 'account', align: 'center', orderIndex: 3, isReadOnly: false, isRequired: true },
        { field: 'currency', headerName: 'Loại tiền', width: 90, flex: 1, type: 'text', align: 'center', orderIndex: 4, isReadOnly: false, isRequired: false },
        { field: 'amount', headerName: 'Số tiền', width: 150, flex: 1.5, type: 'currency', align: 'right', orderIndex: 5, isReadOnly: false, isRequired: true },
        { field: 'objectId', headerName: 'Đối tượng', width: 150, flex: 1.5, type: 'text', align: 'left', orderIndex: 6, isReadOnly: false, isRequired: false },
    ];

    console.log(`Clearing old columns for PT...`);
    await prisma.sys_GridColumn.deleteMany({
        where: { journalId: journalPT.id }
    });

    console.log(`Inserting ${ptColumns.length} columns for PT...`);
    for (const col of ptColumns) {
        await prisma.sys_GridColumn.create({
            data: {
                journalId: journalPT.id,
                ...col
            }
        });
    }

    // Define basic rules for PT (Phase 3 readiness)
    await prisma.sys_VoucherRule.deleteMany({
        where: { journalId: journalPT.id }
    });

    await prisma.sys_VoucherRule.create({
        data: {
            journalId: journalPT.id,
            name: 'Bắt buộc TK Nợ 111',
            condition: 'details.every(d => d.debitAccount.startsWith("111"))',
            errorMessage: 'Phiếu thu tiền mặt bắt buộc ghi Nợ tài khoản 111.',
            isActive: true,
            orderIndex: 1
        }
    });

    // Define rules for PT
    await prisma.sys_VoucherRule.deleteMany({
        where: { journalId: journalPT.id }
    });

    await prisma.sys_VoucherRule.create({
        data: {
            journalId: journalPT.id,
            name: 'Bắt buộc Tài khoản Nợ là Tiền Mặt (111)',
            condition: "data.details.every(d => d.debitAccountId && d.debitAccountId.startsWith('111'))",
            errorMessage: 'Phiếu thu tiền mặt bắt buộc phải ghi Nợ vào nhóm Tài khoản 111.',
            isActive: true,
            orderIndex: 1
        }
    });

    // Define workflow for PT
    await prisma.sys_VoucherWorkflow.deleteMany({
        where: { journalId: journalPT.id }
    });

    // 1. SAVE Workflow
    await prisma.sys_VoucherWorkflow.create({
        data: {
            journalId: journalPT.id,
            action: 'SAVE',
            stepOrder: 1,
            taskType: 'INSERT_RECEIPT',
            isActive: true
        }
    });

    // 2. DELETE Workflow
    await prisma.sys_VoucherWorkflow.create({
        data: {
            journalId: journalPT.id,
            action: 'DELETE',
            stepOrder: 1,
            taskType: 'INSERT_RECEIPT', // Using the same handler type for CRUD 
            isActive: true
        }
    });

    // 3. COPY Workflow
    await prisma.sys_VoucherWorkflow.create({
        data: {
            journalId: journalPT.id,
            action: 'COPY',
            stepOrder: 1,
            taskType: 'INSERT_RECEIPT',
            isActive: true
        }
    });

    // ===================================================================
    // JOURNAL PC (Phiếu Chi) - Cash Payment
    // ===================================================================
    const journalPC = await prisma.journal.findFirst({
        where: { code: 'PC' }
    });

    if (!journalPC) {
        console.error('❌ Journal PC not found. Run seed-journals.ts first.');
    } else {
        // Grid Columns for PC (identical structure to PT)
        const pcColumns = [
            { field: 'description', headerName: 'Diễn giải', width: 250, flex: 2, type: 'text', align: 'left', orderIndex: 1, isReadOnly: false, isRequired: false },
            { field: 'debitAccount', headerName: 'TK Nợ', width: 100, flex: 1, type: 'account', align: 'center', orderIndex: 2, isReadOnly: false, isRequired: true },
            { field: 'creditAccount', headerName: 'TK Có', width: 100, flex: 1, type: 'account', align: 'center', orderIndex: 3, isReadOnly: false, isRequired: true },
            { field: 'currency', headerName: 'Loại tiền', width: 90, flex: 1, type: 'text', align: 'center', orderIndex: 4, isReadOnly: false, isRequired: false },
            { field: 'amount', headerName: 'Số tiền', width: 150, flex: 1.5, type: 'currency', align: 'right', orderIndex: 5, isReadOnly: false, isRequired: true },
            { field: 'objectId', headerName: 'Đối tượng', width: 150, flex: 1.5, type: 'text', align: 'left', orderIndex: 6, isReadOnly: false, isRequired: false },
        ];

        console.log(`Clearing old columns for PC...`);
        await prisma.sys_GridColumn.deleteMany({
            where: { journalId: journalPC.id }
        });

        console.log(`Inserting ${pcColumns.length} columns for PC...`);
        for (const col of pcColumns) {
            await prisma.sys_GridColumn.create({
                data: {
                    journalId: journalPC.id,
                    ...col
                }
            });
        }

        // Rules for PC
        await prisma.sys_VoucherRule.deleteMany({
            where: { journalId: journalPC.id }
        });

        await prisma.sys_VoucherRule.create({
            data: {
                journalId: journalPC.id,
                name: 'Bắt buộc TK Có là Tiền Mặt (111)',
                condition: "data.details.every(d => d.creditAccountId && d.creditAccountId.startsWith('111'))",
                errorMessage: 'Phiếu chi tiền mặt bắt buộc phải ghi Có vào nhóm Tài khoản 111.',
                isActive: true,
                orderIndex: 1
            }
        });

        // Workflows for PC
        await prisma.sys_VoucherWorkflow.deleteMany({
            where: { journalId: journalPC.id }
        });

        await prisma.sys_VoucherWorkflow.create({
            data: {
                journalId: journalPC.id,
                action: 'SAVE',
                stepOrder: 1,
                taskType: 'INSERT_PAYMENT',
                isActive: true
            }
        });

        await prisma.sys_VoucherWorkflow.create({
            data: {
                journalId: journalPC.id,
                action: 'DELETE',
                stepOrder: 1,
                taskType: 'INSERT_PAYMENT',
                isActive: true
            }
        });

        await prisma.sys_VoucherWorkflow.create({
            data: {
                journalId: journalPC.id,
                action: 'COPY',
                stepOrder: 1,
                taskType: 'INSERT_PAYMENT',
                isActive: true
            }
        });

        console.log('✅ PC System Metadata seeded successfully.');
    }

    console.log('✅ All System Metadata seeded successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
