import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/cash-payments/next-number
 * Generate the next payment number (PC-XXXX format)
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 'DEFAULT_COMPANY_ID';

    try {
        // Get the latest payment number
        const latestPayment = await prisma.cashPayment.findFirst({
            where: { companyId },
            orderBy: { paymentNumber: 'desc' },
            select: { paymentNumber: true }
        });

        let nextNum = 1;
        if (latestPayment?.paymentNumber) {
            // Extract number from format like "PC-0001"
            const match = latestPayment.paymentNumber.match(/PC-(\d+)/);
            if (match) {
                nextNum = parseInt(match[1], 10) + 1;
            }
        }

        const year = new Date().getFullYear().toString().slice(-2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const nextNumber = `PC${year}${month}-${nextNum.toString().padStart(4, '0')}`;

        return NextResponse.json({ nextNumber });
    } catch (error) {
        console.error('Error generating next payment number:', error);
        // Fallback
        const fallback = `PC-${Date.now().toString().slice(-8)}`;
        return NextResponse.json({ nextNumber: fallback });
    }
}
