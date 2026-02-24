
import { NextResponse } from 'next/server';
import { financialReportService } from '@/services/financialReport.service';

export const dynamic = 'force-dynamic';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8'; // Hardcoded for now

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!startDateParam || !endDateParam) {
        return NextResponse.json(
            { error: 'Start Date and End Date are required' },
            { status: 400 }
        );
    }

    try {
        const report = await financialReportService.getIncomeStatement({
            companyId: COMPANY_ID,
            startDate: new Date(startDateParam),
            endDate: new Date(endDateParam)
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error('Error generating Income Statement:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
