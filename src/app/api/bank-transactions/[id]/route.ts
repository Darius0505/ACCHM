/**
 * Single Bank Transaction API Route
 * GET /api/bank-transactions/[id]
 * PUT /api/bank-transactions/[id]
 * DELETE /api/bank-transactions/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBankTransaction, updateBankTransaction, deleteBankTransaction } from '@/services/bankTransaction.service';

interface RouteParams {
    params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const transaction = await getBankTransaction(params.id);
        if (!transaction) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(transaction);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const body = await request.json();
        const transaction = await updateBankTransaction(params.id, {
            date: body.date ? new Date(body.date) : undefined,
            type: body.type,
            partnerId: body.partnerId,
            amount: body.amount,
            description: body.description,
            reference: body.reference,
            offsetAccountId: body.offsetAccountId
        });
        return NextResponse.json(transaction);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await deleteBankTransaction(params.id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
