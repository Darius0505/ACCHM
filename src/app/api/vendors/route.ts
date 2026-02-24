import { NextRequest, NextResponse } from 'next/server';
import { createVendor, listVendors } from '../../../services/vendor.service';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || undefined;

        const result = await listVendors({
            companyId: COMPANY_ID,
            page,
            limit,
            search,
            isActive: true
        });

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.code || !body.name) {
            return NextResponse.json({ error: 'Code and Name are required' }, { status: 400 });
        }

        const vendor = await createVendor({
            ...body,
            companyId: COMPANY_ID
        });

        return NextResponse.json(vendor, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
