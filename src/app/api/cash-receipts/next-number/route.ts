import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

/**
 * GET /api/cash-receipts/next-number
 * Generate the next receipt number (PTYYMM-NNNN format)
 */
export async function GET(request: NextRequest) {
    try {
        const { companyId: authCompanyId } = getUserFromRequest(request);
        const companyId = authCompanyId || request.nextUrl.searchParams.get('companyId');

        const year = new Date().getFullYear().toString().slice(-2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const prefix = `PT${year}${month}-`;

        // Find the latest receipt with this prefix pattern
        const latestReceipt = await prisma.cashReceipt.findFirst({
            where: {
                ...(companyId ? { companyId } : {}),
                receiptNumber: { startsWith: prefix }
            },
            orderBy: { receiptNumber: 'desc' },
            select: { receiptNumber: true }
        });

        let nextNum = 1;
        if (latestReceipt?.receiptNumber) {
            // Extract trailing number from format "PT2602-0001"
            const match = latestReceipt.receiptNumber.match(/(\d+)$/);
            if (match) {
                nextNum = parseInt(match[1], 10) + 1;
            }
        }

        const nextNumber = `${prefix}${nextNum.toString().padStart(4, '0')}`;

        return NextResponse.json({ nextNumber });
    } catch (error) {
        console.error('Error generating next receipt number:', error);
        const fallback = `PT-${Date.now().toString().slice(-8)}`;
        return NextResponse.json({ nextNumber: fallback });
    }
}
