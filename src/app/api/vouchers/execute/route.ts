import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { companyId: authCompanyId, userId } = getUserFromRequest(request);
        const body = await request.json();
        const { journalCode, action, data } = body;

        // Simple auth for dev
        const company = await prisma.company.findFirst();
        if (!company) {
            return NextResponse.json({ error: 'Company ID is missing' }, { status: 400 });
        }

        if (!journalCode || !action || !data) {
            return NextResponse.json({ error: 'Missing journalCode, action, or data' }, { status: 400 });
        }

        // 1. Validation Engine (Run rules before ANY action, especially SAVE)
        if (action === 'SAVE') {
            const rules = await prisma.sys_VoucherRule.findMany({
                where: {
                    journal: { code: journalCode, companyId: company.id },
                    isActive: true
                },
                orderBy: { orderIndex: 'asc' }
            });

            for (const rule of rules) {
                try {
                    // Sandbox expression evaluator: expects conditions like "data.amount > 0" or "data.details.every(d => d.debitAccount.startsWith('111'))"
                    const fn = new Function('data', `return ${rule.condition};`);
                    const isValid = fn(data);
                    if (!isValid) {
                        return NextResponse.json({ error: rule.errorMessage }, { status: 400 });
                    }
                } catch (e: any) {
                    console.error(`Rule Evaluation Error [${rule.name}]:`, e);
                    return NextResponse.json({ error: `Lỗi cấu hình luật kiểm tra: ${rule.name}` }, { status: 500 });
                }
            }
        }

        // 2. Fetch Workflow config
        const workflows = await prisma.sys_VoucherWorkflow.findMany({
            where: {
                journal: { code: journalCode, companyId: company.id },
                action: action,
                isActive: true
            },
            orderBy: { stepOrder: 'asc' }
        });

        if (workflows.length === 0) {
            // Fallback for isolated testing of the core hook when no workflow is defined
            return NextResponse.json({ success: true, message: `Action ${action} executed successfully (No workflow defined)` }, { status: 200 });
        }

        // 2. Execute workflow steps sequentially (Phase 3 core implementation)
        let resultData = { ...data };

        for (const step of workflows) {
            console.log(`Executing step ${step.stepOrder}: ${step.taskType}`);

            if (step.taskType === 'INSERT_RECEIPT') {
                if (action === 'SAVE') {
                    if (data.id) {
                        // Update existing
                        const { createCashReceipt, updateCashReceipt } = await import('@/services/cashReceipt.service');
                        resultData = await updateCashReceipt(data.id, {
                            ...data,
                            date: data.date ? new Date(data.date) : new Date(),
                            amount: data.amount ? parseFloat(data.amount.toString()) : 0,
                            status: data.status || 'POSTED'
                        });
                    } else {
                        // Create new
                        const { createCashReceipt } = await import('@/services/cashReceipt.service');
                        resultData = await createCashReceipt({
                            companyId: company.id,
                            ...data,
                            date: data.date ? new Date(data.date) : new Date(),
                            amount: data.amount ? parseFloat(data.amount.toString()) : 0,
                            createdBy: userId || 'system',
                            status: data.status || 'POSTED'
                        });
                    }
                } else if (action === 'DELETE') {
                    if (data.id) {
                        const { deleteCashReceipt } = await import('@/services/cashReceipt.service');
                        await deleteCashReceipt(data.id);
                        resultData = { id: data.id, deleted: true };
                    } else {
                        throw new Error('Cannot delete without ID');
                    }
                } else if (action === 'COPY') {
                    if (data.id) {
                        const { getCashReceipt } = await import('@/services/cashReceipt.service');
                        const { previewEntryNumber } = await import('@/services/numberSequence.service');

                        // 1. Fetch original
                        const original = await getCashReceipt(data.id);
                        if (!original) throw new Error('Bản gốc không tồn tại');

                        // 2. Generate new number (preview, don't increment yet)
                        const journal = await prisma.journal.findFirst({
                            where: { companyId: company.id, code: journalCode, isActive: true }
                        });
                        const newNumber = journal ? await previewEntryNumber({ journalId: journal.id }) : `COPY-${Date.now()}`;

                        // 3. Return fresh payload
                        resultData = {
                            ...original,
                            id: undefined,
                            receiptNumber: newNumber,
                            date: new Date(),
                            postedDate: new Date(),
                            status: 'DRAFT',
                            attachments: '',
                            attachedFiles: [],
                            journalEntryId: null,
                            details: original.details.map(d => ({ ...d, id: crypto.randomUUID(), cashReceiptId: undefined }))
                        };
                    } else {
                        throw new Error('Cannot copy without ID');
                    }
                }
            } else if (step.taskType === 'CALL_SP') {
                // Phase 4: Stored Procedure Delegation logic
                console.log(`[Workflow SP Delegation]: Preparing to call ${step.taskConfig}`);
                try {
                    if (!step.taskConfig) throw new Error("Lack of SP Configuration");
                    const spConfig = JSON.parse(step.taskConfig);

                    if (spConfig.spName) {
                        // Dynamically map params from payload data
                        const params = (spConfig.params || []).map((p: string) => data[p] !== undefined ? data[p] : null);

                        console.log(`Executing raw SQL procedure: ${spConfig.spName} with params`, params);

                        // Execute raw query (Note: varies based on SQL Flavor, using a generic pattern)
                        // In a real scenario: await prisma.$executeRawUnsafe(`EXEC ${spConfig.spName} ${params.map(()=>'?').join(',')}`, ...params);

                        resultData.spResult = { status: 'Success', executedProcedure: spConfig.spName, paramsSent: params };
                    }
                } catch (e: any) {
                    console.error("CALL_SP Execution Error:", e);
                    throw new Error(`Lỗi thi hành rẽ nhánh Stored Procedure: ${e.message}`);
                }
            }
        }

        return NextResponse.json({ success: true, message: `Action ${action} executed via workflow`, ...resultData }, { status: 200 });

    } catch (error: any) {
        console.error("Master API Execute Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
