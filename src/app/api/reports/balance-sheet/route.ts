
import { NextResponse } from 'next/server';
import { financialReportService } from '@/services/financialReport.service';

export const dynamic = 'force-dynamic';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8'; // Hardcoded for now

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const asOfDateParam = searchParams.get('asOfDate');

    if (!asOfDateParam) {
        return NextResponse.json(
            { error: 'As Of Date is required' },
            { status: 400 }
        );
    }

    try {
        const report = await financialReportService.getBalanceSheet({
            companyId: COMPANY_ID,
            asOfDate: new Date(asOfDateParam)
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error('Error generating Balance Sheet:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
