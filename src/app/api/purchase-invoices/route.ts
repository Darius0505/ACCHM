import { NextRequest, NextResponse } from 'next/server';
import { createPurchaseInvoice, listPurchaseInvoices } from '../../../services/purchaseInvoice.service';
import { getDataFilter } from '@/lib/dataFilter';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const partnerId = searchParams.get('partnerId') || undefined;
        const status = searchParams.get('status') || undefined;

        const result = await listPurchaseInvoices({
            companyId: COMPANY_ID,
            page,
            limit,
            partnerId,
            status,
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

        const invoice = await createPurchaseInvoice({
            ...body,
            companyId: COMPANY_ID,
            date: new Date(body.date),
            dueDate: new Date(body.dueDate),
            createdBy: 'admin'
        });

        return NextResponse.json(invoice, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
