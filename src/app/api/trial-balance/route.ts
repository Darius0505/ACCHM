/**
 * Trial Balance API Route
 * GET /api/trial-balance - Get trial balance report
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTrialBalance } from '@/services/generalLedger.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const companyId = searchParams.get('companyId');
        const asOfDate = searchParams.get('asOfDate');
        const level = searchParams.get('level');

        if (!companyId || !asOfDate) {
            return NextResponse.json(
                { error: 'companyId and asOfDate are required' },
                { status: 400 }
            );
        }

        const result = await getTrialBalance(
            companyId,
            new Date(asOfDate),
            level ? parseInt(level) : undefined
        );

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Error getting trial balance:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get trial balance' },
            { status: 500 }
        );
    }
}
