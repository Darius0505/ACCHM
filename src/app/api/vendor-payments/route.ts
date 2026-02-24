import { NextRequest, NextResponse } from 'next/server';
import { createVendorPayment, listVendorPayments } from '../../../services/vendorPayment.service';
import { getDataFilter } from '@/lib/dataFilter';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const partnerId = searchParams.get('partnerId') || undefined;

        const result = await listVendorPayments({
            companyId: COMPANY_ID,
            partnerId,
            dataFilter: getDataFilter(request)
        });

        return NextResponse.json({ items: result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const payment = await createVendorPayment({
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
