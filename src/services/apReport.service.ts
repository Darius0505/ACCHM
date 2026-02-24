import { prisma } from '../lib/prisma';

interface APAgingInput {
    companyId: string;
    date: Date;
}

interface AgingRow {
    code: string;
    partnerName: string;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    over90: number;
    total: number;
}

// AP Aging Report
export async function getAPAging(input: APAgingInput): Promise<{ summary: any; details: AgingRow[] }> {
    const { companyId, date } = input;

    // Get all unpaid purchase invoices
    const invoices = await prisma.invoice.findMany({
        where: {
            companyId,
            type: 'PURCHASE',
            status: 'POSTED',
            paymentStatus: { not: 'PAID' },
            balanceAmount: { gt: 0 }
        },
        include: { partner: true }
    });

    // Group by vendor and calculate aging buckets
    const vendorMap = new Map<string, AgingRow>();

    for (const inv of invoices) {
        const dueDate = new Date(inv.dueDate);
        const reportDate = new Date(date);
        const daysPastDue = Math.floor((reportDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const balance = Number(inv.balanceAmount);

        if (!vendorMap.has(inv.partnerId)) {
            vendorMap.set(inv.partnerId, {
                code: inv.partner.code,
                partnerName: inv.partner.name,
                current: 0,
                days30: 0,
                days60: 0,
                days90: 0,
                over90: 0,
                total: 0
            });
        }

        const row = vendorMap.get(inv.partnerId)!;
        row.total += balance;

        if (daysPastDue <= 0) {
            row.current += balance;
        } else if (daysPastDue <= 30) {
            row.days30 += balance;
        } else if (daysPastDue <= 60) {
            row.days60 += balance;
        } else if (daysPastDue <= 90) {
            row.days90 += balance;
        } else {
            row.over90 += balance;
        }
    }

    const details = Array.from(vendorMap.values()).sort((a, b) => b.total - a.total);

    const summary = {
        current: details.reduce((s, r) => s + r.current, 0),
        days30: details.reduce((s, r) => s + r.days30, 0),
        days60: details.reduce((s, r) => s + r.days60, 0),
        days90: details.reduce((s, r) => s + r.days90, 0),
        over90: details.reduce((s, r) => s + r.over90, 0),
        total: details.reduce((s, r) => s + r.total, 0)
    };

    return { summary, details };
}
