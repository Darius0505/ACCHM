/**
 * Unpost Cash Receipt API Route
 * POST /api/cash-receipts/[id]/unpost
 */

import { NextRequest, NextResponse } from 'next/server';
import { unpostCashReceipt } from '@/services/cashReceipt.service';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const receipt = await unpostCashReceipt(id);
        return NextResponse.json(receipt);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
