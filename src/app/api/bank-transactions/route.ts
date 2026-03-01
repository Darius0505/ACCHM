/**
 * Bank Transactions API Route
 * GET /api/bank-transactions - List transactions
 * POST /api/bank-transactions - Create transaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { listBankTransactions, createBankTransaction } from '@/services/bankTransaction.service';
import { getDataFilter } from '@/lib/dataFilter';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const companyId = searchParams.get('companyId');

        if (!companyId) {
            return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
        }

        const result = await listBankTransactions({
            companyId,
            bankAccountId: searchParams.get('bankAccountId') || undefined,
            startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
            endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
            type: searchParams.get('type') || undefined,
            status: searchParams.get('status') || undefined,
            search: searchParams.get('search') || undefined,
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
            dataFilter: getDataFilter(request)
        });

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.bankAccountId || !body.amount || !body.type || !body.offsetAccountId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const transaction = await createBankTransaction({
            companyId: body.companyId,
            bankAccountId: body.bankAccountId,
            date: new Date(body.date),
            type: body.type, // DEPOSIT | WITHDRAWAL
            partnerId: body.partnerId,
            amount: body.amount,
            description: body.description,
            descriptionEN: body.descriptionEN,
            reference: body.reference,
            offsetAccountId: body.offsetAccountId,
            createdBy: body.createdBy || 'system'
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
