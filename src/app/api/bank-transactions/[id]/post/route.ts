/**
 * Post Bank Transaction API Route
 * POST /api/bank-transactions/[id]/post
 */

import { NextRequest, NextResponse } from 'next/server';
import { postBankTransaction } from '@/services/bankTransaction.service';

interface RouteParams {
    params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const body = await request.json().catch(() => ({}));
        const postedBy = body.userId || 'system';

        const transaction = await postBankTransaction(params.id, postedBy);
        return NextResponse.json(transaction);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
