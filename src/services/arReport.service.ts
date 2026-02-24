
import prisma from '../lib/prisma';

export interface ReportFilter {
    companyId: string;
    date: Date; // As of date
    partnerId?: string;
}

/**
 * Get AR Aging Report
 * Returns list of customers with breakdown: Current, 1-30, 31-60, 61-90, >90
 */
export async function getARAging(filter: ReportFilter) {
    // 1. Get all UNPAID or PARTIAL sales invoices as of 'date'
    // Note: This matches invoices created <= date and balance > 0
    // Theoretically we should reconstruct balance at 'date' from journal, but for simplified:
    // We look at current Invoice status.

    // Better approach:
    // Find all invoices where Date <= Report Date.
    // Calculate Age = Report Date - Invoice Due Date.

    const invoices = await prisma.invoice.findMany({
        where: {
            companyId: filter.companyId,
            type: 'SALES',
            date: { lte: filter.date },
            paymentStatus: { in: ['UNPAID', 'PARTIAL'] } // Assumption: historical query needs more complex event sourcing or computed values.
        },
        include: { partner: true }
    });

    const buckets = {
        current: 0,
        days30: 0,
        days60: 0,
        days90: 0,
        over90: 0,
        total: 0
    };

    const customerRows: any = {};

    for (const inv of invoices) {
        const balance = inv.balanceAmount.toNumber();
        if (balance <= 0) continue;

        const dueDate = new Date(inv.dueDate);
        const reportDate = new Date(filter.date);

        // Diff in days
        const diffTime = reportDate.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const partnerId = inv.partnerId;
        if (!customerRows[partnerId]) {
            customerRows[partnerId] = {
                partnerName: inv.partner.name,
                code: inv.partner.code,
                current: 0,
                days30: 0,
                days60: 0,
                days90: 0,
                over90: 0,
                total: 0
            };
        }

        const row = customerRows[partnerId];
        row.total += balance;
        buckets.total += balance;

        if (diffDays <= 0) {
            row.current += balance;
            buckets.current += balance;
        } else if (diffDays <= 30) {
            row.days30 += balance;
            buckets.days30 += balance;
        } else if (diffDays <= 60) {
            row.days60 += balance;
            buckets.days60 += balance;
        } else if (diffDays <= 90) {
            row.days90 += balance;
            buckets.days90 += balance;
        } else {
            row.over90 += balance;
            buckets.over90 += balance;
        }
    }

    return {
        summary: buckets,
        details: Object.values(customerRows)
    };
}
