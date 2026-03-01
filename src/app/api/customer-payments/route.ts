
import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPayment, listCustomerPayments } from '../../../services/customerPayment.service';
import { getDataFilter } from '@/lib/dataFilter';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const partnerId = searchParams.get('partnerId') || undefined;

        const result = await listCustomerPayments({
            companyId: COMPANY_ID,
            page,
            limit,
            partnerId,
            dataFilter: getDataFilter(request)
        });

        return NextResponse.json({ items: result }); // Consistent wrapper
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const payment = await createCustomerPayment({
            ...body,
            companyId: COMPANY_ID,
            date: new Date(body.date),
            createdBy: 'admin'
        });

        return NextResponse.json(payment, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
