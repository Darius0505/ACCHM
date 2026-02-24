/**
 * General Ledger API Route
 * GET /api/general-ledger - Get general ledger for an account
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGeneralLedger } from '@/services/generalLedger.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const accountId = searchParams.get('accountId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!accountId || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'accountId, startDate, and endDate are required' },
                { status: 400 }
            );
        }

        const result = await getGeneralLedger(
            accountId,
            new Date(startDate),
            new Date(endDate)
        );

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Error getting general ledger:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get general ledger' },
            { status: 500 }
        );
    }
}
