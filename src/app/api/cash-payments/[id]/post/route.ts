/**
 * Post Cash Payment API Route
 * POST /api/cash-payments/[id]/post
 */

import { NextRequest, NextResponse } from 'next/server';
import { postCashPayment } from '@/services/cashPayment.service';

interface RouteParams {
    params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const body = await request.json().catch(() => ({}));
        const postedBy = body.userId || 'system';

        const payment = await postCashPayment(params.id, postedBy);
        return NextResponse.json(payment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
