/**
 * Post Cash Receipt API Route
 * POST /api/cash-receipts/[id]/post
 */

import { NextRequest, NextResponse } from 'next/server';
import { postCashReceipt } from '@/services/cashReceipt.service';

interface RouteParams {
    params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const body = await request.json().catch(() => ({}));
        const postedBy = body.userId || 'system'; // TODO: Auth

        const receipt = await postCashReceipt(params.id, postedBy);
        return NextResponse.json(receipt);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
