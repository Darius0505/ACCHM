
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';

// GET /api/fiscal-years — List all fiscal years
export async function GET(request: NextRequest) {
    // Check permission (adjust form code as needed, e.g., 'SYSTEM' or 'ACCOUNTING_SETTINGS')
    const denied = await requirePermission(request, 'SYSTEM', 'VIEW');
    // Using SYSTEM for now or maybe define a 'FISCAL_YEAR' form code later if needed.
    // For now assuming basic VIEW access to settings implies access.

    if (denied) return denied;

    try {
        const years = await prisma.fiscalYear.findMany({
            include: {
                periods: {
                    orderBy: { periodNumber: 'asc' }
                }
            },
            orderBy: { year: 'desc' },
        });

        return NextResponse.json(years);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/fiscal-years — Create a new fiscal year
export async function POST(request: NextRequest) {
    const denied = await requirePermission(request, 'SYSTEM', 'ADD'); // Or EDIT
    if (denied) return denied;

    try {
        const body = await request.json();
        const { year, startDate, endDate, companyId } = body;

        // Validation
        if (!year || !startDate || !endDate) {
            return NextResponse.json({ error: 'Năm, Ngày bắt đầu và Ngày kết thúc là bắt buộc' }, { status: 400 });
        }

        // Check availability
        const existing = await prisma.fiscalYear.findFirst({
            where: { year: parseInt(year) } // Assuming single tenant for simplicity or use companyId from auth context if available
        });

        // Note: In a real multi-tenant app, we should filter by companyId from the user's session/token.
        // For this implementation, I will rely on the body's companyId or fallback (if single tenant). 
        // Ideally, we get companyId from headers/token.

        if (existing) {
            return NextResponse.json({ error: `Năm tài chính ${year} đã tồn tại` }, { status: 409 });
        }

        // Transaction to create Year + 12 Periods
        const newYear = await prisma.$transaction(async (tx) => {
            // 1. Create Fiscal Year
            const fy = await tx.fiscalYear.create({
                data: {
                    year: parseInt(year),
                    name: `Năm tài chính ${year}`,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    companyId: companyId || 'default-company-id', // TODO: Get from context/auth
                    status: 'OPEN'
                }
            });

            // 2. Generate 12 Periods
            // Simple logic: Assume startDate is Jan 1st for standard year, or just split by month
            // We'll generate standard 12 months based on the year provided.
            const periodsData = [];
            for (let i = 0; i < 12; i++) {
                const start = new Date(year, i, 1);
                const end = new Date(year, i + 1, 0); // Last day of month

                periodsData.push({
                    fiscalYearId: fy.id,
                    periodNumber: i + 1,
                    name: `Tháng ${i + 1}/${year}`,
                    startDate: start,
                    endDate: end,
                    status: 'OPEN'
                });
            }

            await tx.accountingPeriod.createMany({
                data: periodsData
            });

            return fy;
        });

        // Return the created year with periods
        const result = await prisma.fiscalYear.findUnique({
            where: { id: newYear.id },
            include: { periods: { orderBy: { periodNumber: 'asc' } } }
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
