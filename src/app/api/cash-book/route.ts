/**
 * Cash Book Report API
 * GET /api/cash-book
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCashBook } from '@/services/cashBook.service';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const companyId = searchParams.get('companyId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!companyId || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'companyId, startDate, and endDate are required' },
                { status: 400 }
            );
        }

        const result = await getCashBook({
            companyId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            accountId: searchParams.get('accountId') || undefined
        });

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
