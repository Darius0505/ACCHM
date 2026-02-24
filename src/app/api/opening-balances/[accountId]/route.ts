
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/opening-balances/[accountId]
// List all details for a specific account
export async function GET(
    request: NextRequest,
    { params }: { params: { accountId: string } }
) {
    const denied = await requirePermission(request, 'SYSTEM', 'VIEW');
    if (denied) return denied;

    const { accountId } = params;

    try {
        const details = await prisma.openingBalanceDetail.findMany({
            where: { accountId },
            include: {
                partner: { select: { id: true, name: true, code: true } },
                product: { select: { id: true, name: true, code: true } },
                warehouse: { select: { id: true, name: true, code: true } },
                bankAccount: { select: { id: true, name: true, code: true, bankName: true, accountNumber: true } },
                fixedAsset: { select: { id: true, name: true, code: true } },
            },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(details);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/opening-balances/[accountId]
// Replace all details for a specific account and update the account total
export async function POST(
    request: NextRequest,
    { params }: { params: { accountId: string } }
) {
    const denied = await requirePermission(request, 'SYSTEM', 'EDIT');
    if (denied) return denied;

    const { accountId } = params;

    try {
        const { companyId } = getUserFromRequest(request);
        const body = await request.json();
        const { details } = body; // Array of OpeningBalanceDetail objects

        if (!Array.isArray(details)) {
            return NextResponse.json({ error: 'Invalid data format: details must be an array' }, { status: 400 });
        }

        // Validate account exists
        const account = await prisma.account.findUnique({
            where: { id: accountId }
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Prepare data for update
        // We will:
        // 1. Delete all existing details for this account
        // 2. Insert new details
        // 3. Calculate new total debit/credit
        // 4. Update the parent Account

        let totalDebit = 0;
        let totalCredit = 0;

        const newDetailsData = details.map((d: any) => {
            const debit = Number(d.debit) || 0;
            const credit = Number(d.credit) || 0;
            totalDebit += debit;
            totalCredit += credit;

            return {
                companyId: companyId || account.companyId, // Fallback to account's company if not in request
                accountId,
                partnerId: d.partnerId || null,
                productId: d.productId || null,
                warehouseId: d.warehouseId || null,
                bankAccountId: d.bankAccountId || null,
                fixedAssetId: d.fixedAssetId || null,
                quantity: d.quantity || 0,
                unitPrice: d.unitPrice || 0,
                amount: d.amount || 0,
                debit,
                credit,
                note: d.note || null
            };
        });

        // Execute transaction
        await prisma.$transaction(async (tx) => {
            // 1. Delete existing
            await tx.openingBalanceDetail.deleteMany({
                where: { accountId }
            });

            // 2. Create new
            if (newDetailsData.length > 0) {
                await tx.openingBalanceDetail.createMany({
                    data: newDetailsData
                });
            }

            // 3. Update Account totals
            await tx.account.update({
                where: { id: accountId },
                data: {
                    openingDebit: totalDebit,
                    openingCredit: totalCredit
                }
            });
        });

        return NextResponse.json({
            success: true,
            count: newDetailsData.length,
            totalDebit,
            totalCredit
        });

    } catch (error: any) {
        console.error('Error saving opening balance details:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
