/**
 * Cash Receipts API Route
 * GET /api/cash-receipts - List receipts
 * POST /api/cash-receipts - Create receipt
 */

import { NextRequest, NextResponse } from 'next/server';
import { listCashReceipts, createCashReceipt } from '@/services/cashReceipt.service';
import { getDataFilter } from '@/lib/dataFilter';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const { companyId: authCompanyId } = getUserFromRequest(request);
        const companyId = authCompanyId || searchParams.get('companyId');

        if (!companyId) {
            return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
        }

        const result = await listCashReceipts({
            companyId,
            startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
            endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
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
        const { companyId: authCompanyId, userId } = getUserFromRequest(request);
        const body = await request.json();
        const companyId = authCompanyId || body.companyId;

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID is missing' }, { status: 400 });
        }

        if (body.amount == null || !body.debitAccountId || !body.creditAccountId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const receipt = await createCashReceipt({
            companyId,
            receiptNumber: body.receiptNumber,
            date: new Date(body.date),
            partnerId: body.partnerId,
            payerName: body.payerName,
            amount: body.amount,
            description: body.description,
            descriptionEN: body.descriptionEN,
            debitAccountId: body.debitAccountId,
            creditAccountId: body.creditAccountId,
            attachments: body.attachments,
            status: body.status || 'POSTED',
            createdBy: userId || body.createdBy || 'system',
            details: body.details,
            attachedFiles: body.attachedFiles
        });

        return NextResponse.json(receipt, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
