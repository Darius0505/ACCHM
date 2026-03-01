import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const journals = await prisma.journal.findMany({
            where: { code: { in: ['BR', 'BP'] } }
        });

        if (journals.length === 0) {
            return NextResponse.json({ error: 'Journals BR/BP not found' }, { status: 404 });
        }

        const columns = [
            { field: 'description', headerName: 'Diễn giải', width: 250, flex: 2, type: 'text', align: 'left', orderIndex: 1, isReadOnly: false, isRequired: false },
            { field: 'debitAccount', headerName: 'TK Nợ', width: 100, flex: 1, type: 'account', align: 'center', orderIndex: 2, isReadOnly: false, isRequired: true },
            { field: 'creditAccount', headerName: 'TK Có', width: 100, flex: 1, type: 'account', align: 'center', orderIndex: 3, isReadOnly: false, isRequired: true },
            { field: 'currency', headerName: 'Loại tiền', width: 90, flex: 1, type: 'text', align: 'center', orderIndex: 4, isReadOnly: false, isRequired: false },
            { field: 'amount', headerName: 'Số tiền', width: 150, flex: 1.5, type: 'currency', align: 'right', orderIndex: 5, isReadOnly: false, isRequired: true },
            { field: 'objectId', headerName: 'Đối tượng', width: 150, flex: 1.5, type: 'text', align: 'left', orderIndex: 6, isReadOnly: false, isRequired: false },
        ];

        for (const journal of journals) {
            console.log(`Clearing old columns for ${journal.code}...`);
            await prisma.sys_GridColumn.deleteMany({
                where: { journalId: journal.id }
            });

            console.log(`Inserting columns for ${journal.code}...`);
            for (const col of columns) {
                await prisma.sys_GridColumn.create({
                    data: {
                        journalId: journal.id,
                        ...col
                    }
                });
            }

            // Define rules
            await prisma.sys_VoucherRule.deleteMany({
                where: { journalId: journal.id }
            });

            const taskType = journal.code === 'BR' ? 'INSERT_BANK_RECEIPT' : 'INSERT_BANK_PAYMENT';

            // Define workflow
            await prisma.sys_VoucherWorkflow.deleteMany({
                where: { journalId: journal.id }
            });

            // 1. SAVE Workflow
            await prisma.sys_VoucherWorkflow.create({
                data: {
                    journalId: journal.id,
                    action: 'SAVE',
                    stepOrder: 1,
                    taskType: taskType,
                    isActive: true
                }
            });

            // 2. DELETE Workflow
            await prisma.sys_VoucherWorkflow.create({
                data: {
                    journalId: journal.id,
                    action: 'DELETE',
                    stepOrder: 1,
                    taskType: taskType,
                    isActive: true
                }
            });
        }

        return NextResponse.json({ message: 'BR and BP columns and workflows seeded successfully!' });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
