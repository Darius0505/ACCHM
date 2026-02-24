
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';

// GET /api/opening-balances — List accounts with OB
// We can reuse /api/accounts but maybe lightweight is better or just reuse.
// Let's create a specific one to ensure we get exactly what we need for the OB grid.

export async function GET(request: NextRequest) {
    const denied = await requirePermission(request, 'SYSTEM', 'VIEW');
    if (denied) return denied;

    try {
        const accounts = await prisma.account.findMany({
            where: { isActive: true },
            orderBy: { code: 'asc' },
            select: {
                id: true,
                code: true,
                name: true,
                type: true,
                openingDebit: true,
                openingCredit: true,
                isPosting: true,
                parentId: true,
            }
        });
        return NextResponse.json(accounts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/opening-balances — Bulk Update
export async function PUT(request: NextRequest) {
    const denied = await requirePermission(request, 'SYSTEM', 'EDIT');
    if (denied) return denied;

    try {
        const body = await request.json();
        const { balances } = body; // Array of { id, debit, credit }

        if (!Array.isArray(balances)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Use transaction for bulk update
        const results = await prisma.$transaction(
            balances.map((b: any) =>
                prisma.account.update({
                    where: { id: b.id },
                    data: {
                        openingDebit: b.debit,
                        openingCredit: b.credit
                    }
                })
            )
        );

        return NextResponse.json({ success: true, count: results.length });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
