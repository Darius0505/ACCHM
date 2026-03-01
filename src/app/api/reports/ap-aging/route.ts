import { NextRequest, NextResponse } from 'next/server';
import { getAPAging } from '../../../../services/apReport.service';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const dateStr = searchParams.get('date') || new Date().toISOString();

        const result = await getAPAging({
            companyId: COMPANY_ID,
            date: new Date(dateStr)
        });

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
