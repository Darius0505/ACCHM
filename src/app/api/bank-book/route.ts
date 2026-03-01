/**
 * Bank Book Report API
 * GET /api/bank-book
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBankBook } from '@/services/bankBook.service';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const bankAccountId = searchParams.get('bankAccountId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!bankAccountId || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'bankAccountId, startDate, and endDate are required' },
                { status: 400 }
            );
        }

        const result = await getBankBook({
            bankAccountId,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
