/**
 * Single Cash Payment API Route
 * GET /api/cash-payments/[id]
 * PUT /api/cash-payments/[id]
 * DELETE /api/cash-payments/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCashPayment, updateCashPayment, deleteCashPayment } from '@/services/cashPayment.service';

interface RouteParams {
    params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const payment = await getCashPayment(params.id);
        if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(payment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const body = await request.json();
        const payment = await updateCashPayment(params.id, {
            date: body.date ? new Date(body.date) : undefined,
            partnerId: body.partnerId,
            amount: body.amount,
            description: body.description,
            debitAccountId: body.debitAccountId,
            creditAccountId: body.creditAccountId,
            attachments: body.attachments
        });
        return NextResponse.json(payment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await deleteCashPayment(params.id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
