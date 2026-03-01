
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';

// PUT /api/accounting-periods/[id]/close
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'SYSTEM', 'EDIT');
    if (denied) return denied;

    try {
        const periodId = params.id;

        // Get period details
        const period = await prisma.accountingPeriod.findUnique({
            where: { id: periodId },
            include: { fiscalYear: true }
        });

        if (!period) return NextResponse.json({ error: 'Kỳ kế toán không tồn tại' }, { status: 404 });

        // Logic check: Cannot close if previous period is Open
        if (period.periodNumber > 1) {
            const prevPeriod = await prisma.accountingPeriod.findFirst({
                where: {
                    fiscalYearId: period.fiscalYearId,
                    periodNumber: period.periodNumber - 1
                }
            });
            if (prevPeriod && prevPeriod.status === 'OPEN') {
                return NextResponse.json({ error: `Không thể khóa kỳ này vì kỳ trước (${prevPeriod.name}) chưa khóa.` }, { status: 400 });
            }
        }

        // Check 2: Cannot Open if next period is Closed
        // (If user is trying to "Unclose" / Re-open) - logic for toggle
        // For now let's assume this endpoint is just for STATUS update sent in body

        const body = await request.json();
        const { status } = body; // 'OPEN' or 'CLOSED' (SOFT_CLOSED/HARD_CLOSED)

        if (status === 'OPEN') {
            const nextPeriod = await prisma.accountingPeriod.findFirst({
                where: {
                    fiscalYearId: period.fiscalYearId,
                    periodNumber: period.periodNumber + 1
                }
            });
            if (nextPeriod && nextPeriod.status !== 'OPEN') {
                return NextResponse.json({ error: `Không thể mở lại kỳ này vì kỳ sau (${nextPeriod.name}) đã khóa.` }, { status: 400 });
            }
        }

        const updated = await prisma.accountingPeriod.update({
            where: { id: periodId },
            data: { status }
        });

        return NextResponse.json(updated);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
