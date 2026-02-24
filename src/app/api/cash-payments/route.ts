/**
 * Cash Payments API Route
 * GET /api/cash-payments - List payments
 * POST /api/cash-payments - Create payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { listCashPayments, createCashPayment } from '@/services/cashPayment.service';
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

        const result = await listCashPayments({
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

        // Validate basic fields
        if (!companyId || !body.date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate details OR single line
        if ((!body.details || body.details.length === 0) && (!body.amount || !body.debitAccountId || !body.creditAccountId)) {
            return NextResponse.json({ error: 'Missing accounting details' }, { status: 400 });
        }

        const payment = await createCashPayment({
            companyId,
            date: new Date(body.date),
            partnerId: body.partnerId,
            payeeName: body.payeeName, // Pass payeeName
            amount: body.amount, // Will be recalculated from details if present
            description: body.description,
            descriptionEN: body.descriptionEN,
            debitAccountId: body.debitAccountId,
            creditAccountId: body.creditAccountId,
            attachments: body.attachments,
            createdBy: userId || body.createdBy || 'system',
            details: body.details // Pass details array
        });

        return NextResponse.json(payment, { status: 201 });
    } catch (error: any) {
        console.error('Create Cash Payment Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
