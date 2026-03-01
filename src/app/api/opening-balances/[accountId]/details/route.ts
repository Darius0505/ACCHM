
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';

// GET /api/opening-balances/[accountId]/details
export async function GET(
    request: NextRequest,
    { params }: { params: { accountId: string } }
) {
    const check = await requirePermission(request, 'accounting.settings.view', 'VIEW');
    if (check) return check;

    try {
        const details = await prisma.openingBalanceDetail.findMany({
            where: {
                accountId: params.accountId,
                // Ensure we filter by company context if needed, usually via middleware or session
                // For now, assuming accountId is unique enough or we trust the user has access to this account
                // Ideally we check account.companyId matches user.companyId
            },
            include: {
                partner: { select: { id: true, code: true, name: true } },
                product: { select: { id: true, code: true, name: true } },
                warehouse: { select: { id: true, code: true, name: true } },
                bankAccount: { select: { id: true, code: true, name: true } },
                fixedAsset: { select: { id: true, code: true, name: true } },
            },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json(details);
    } catch (error) {
        console.error('Error fetching details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/opening-balances/[accountId]/details
// Replace all details for this account and update the main Account balance
export async function POST(
    request: NextRequest,
    { params }: { params: { accountId: string } }
) {
    const check = await requirePermission(request, 'accounting.settings.edit', 'EDIT');
    if (check) return check;

    try {
        const body = await request.json();
        const { details, companyId } = body;
        // details: { partnerId?, productId?, warehouseId?, quantity, unitPrice, amount, debit, credit }[]

        if (!Array.isArray(details)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Transaction: Delete old details -> Insert new -> Sum -> Update Account
        await prisma.$transaction(async (tx) => {
            // 1. Delete existing details for this account
            await tx.openingBalanceDetail.deleteMany({
                where: { accountId: params.accountId }
            });

            // 2. Create new details
            if (details.length > 0) {
                await tx.openingBalanceDetail.createMany({
                    data: details.map((d: any) => ({
                        companyId: companyId, // Should be passed or validated
                        accountId: params.accountId,
                        partnerId: d.partnerId || null,
                        productId: d.productId || null,
                        warehouseId: d.warehouseId || null,
                        bankAccountId: d.bankAccountId || null,
                        fixedAssetId: d.fixedAssetId || null,

                        quantity: d.quantity || 0,
                        unitPrice: d.unitPrice || 0,
                        amount: d.amount || 0,

                        debit: d.debit || 0,
                        credit: d.credit || 0,
                        note: d.note || ''
                    }))
                });
            }

            // 3. Calculate Totals
            const totalDebit = details.reduce((sum: number, d: any) => sum + (Number(d.debit) || 0), 0);
            const totalCredit = details.reduce((sum: number, d: any) => sum + (Number(d.credit) || 0), 0);

            // 4. Update Main Account
            await tx.account.update({
                where: { id: params.accountId },
                data: {
                    openingDebit: totalDebit,
                    openingCredit: totalCredit
                }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
