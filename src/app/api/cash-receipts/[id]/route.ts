/**
 * Single Cash Receipt API Route
 * GET /api/cash-receipts/[id]
 * PUT /api/cash-receipts/[id]
 * DELETE /api/cash-receipts/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCashReceipt, updateCashReceipt, deleteCashReceipt } from '@/services/cashReceipt.service';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const receipt = await getCashReceipt(id);
        if (!receipt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(receipt);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const receipt = await updateCashReceipt(id, {
            date: body.date ? new Date(body.date) : undefined,
            receiptNumber: body.receiptNumber,
            partnerId: body.partnerId,
            payerName: body.payerName,
            amount: body.amount,
            description: body.description,
            debitAccountId: body.debitAccountId,
            creditAccountId: body.creditAccountId,
            attachments: body.attachments,
            status: body.status,
            details: body.details,
            attachedFiles: body.attachedFiles
        });
        return NextResponse.json(receipt);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        await deleteCashReceipt(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
