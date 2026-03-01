// Export Excel API - Balance Sheet
// GET /api/reports/balance-sheet/export?asOfDate=2025-01-31&format=excel

import { NextRequest, NextResponse } from 'next/server';
import { financialReportService } from '@/services/financialReport.service';
import { prisma } from '@/lib/prisma';
import { exportToExcel } from '@/services/export/excelExportService';
import { getVASTemplate } from '@/config/reports/vasTemplates';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const asOfDate = searchParams.get('asOfDate');
        const format = searchParams.get('format') || 'excel';

        if (!asOfDate) {
            return NextResponse.json(
                { error: 'asOfDate is required' },
                { status: 400 }
            );
        }

        // Get company info (simplified - use first company for demo)
        const company = await prisma.company.findFirst();
        if (!company) {
            return NextResponse.json(
                { error: 'No company found' },
                { status: 404 }
            );
        }

        // Get balance sheet data
        const reportData = await financialReportService.getBalanceSheet({
            companyId: company.id,
            asOfDate: new Date(asOfDate)
        });

        // Transform data to flat rows for export
        const rows: Record<string, unknown>[] = [];

        // Assets section
        rows.push({ vasCode: '100', name: 'A. TÀI SẢN NGẮN HẠN', thisPeriod: null, prevPeriod: null });
        reportData.assets.details.forEach(item => {
            rows.push({
                vasCode: item.code,
                name: item.name,
                thisPeriod: item.balance,
                prevPeriod: 0
            });
        });
        rows.push({
            vasCode: '270',
            name: 'TỔNG CỘNG TÀI SẢN',
            thisPeriod: reportData.assets.total,
            prevPeriod: 0
        });

        // Liabilities section
        rows.push({ vasCode: '300', name: 'C. NỢ PHẢI TRẢ', thisPeriod: null, prevPeriod: null });
        reportData.liabilities.details.forEach(item => {
            rows.push({
                vasCode: item.code,
                name: item.name,
                thisPeriod: item.balance,
                prevPeriod: 0
            });
        });

        // Equity section
        rows.push({ vasCode: '400', name: 'D. VỐN CHỦ SỞ HỮU', thisPeriod: null, prevPeriod: null });
        reportData.equity.details.forEach(item => {
            rows.push({
                vasCode: item.code,
                name: item.name,
                thisPeriod: item.balance,
                prevPeriod: 0
            });
        });
        rows.push({
            vasCode: '421',
            name: 'Lợi nhuận sau thuế chưa phân phối',
            thisPeriod: reportData.equity.calculatedRetainedEarnings,
            prevPeriod: 0
        });
        rows.push({
            vasCode: '440',
            name: 'TỔNG CỘNG NGUỒN VỐN',
            thisPeriod: reportData.totalLiabilitiesAndEquity,
            prevPeriod: 0
        });

        // Get VAS template
        const template = getVASTemplate('B01-DN');
        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 500 }
            );
        }

        // Generate Excel
        const buffer = await exportToExcel({
            template: template.config,
            data: rows,
            companyInfo: {
                name: company.name,
                address: company.address || '',
                taxCode: company.taxCode || ''
            },
            reportPeriod: {
                type: 'asOf',
                asOfDate: new Date(asOfDate)
            }
        });

        // Return as download
        const fileName = `BangCanDoiKeToan_${asOfDate}.xlsx`;

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${fileName}"`
            }
        });
    } catch (error) {
        console.error('Error exporting balance sheet:', error);
        return NextResponse.json(
            { error: 'Failed to export balance sheet' },
            { status: 500 }
        );
    }
}
