/**
 * Cash Book Service
 * Report Logic for Cash Book (Sổ Quỹ Tiền Mặt)
 */

import prisma from '../lib/prisma';
import { getGeneralLedger } from './generalLedger.service';

export async function getCashBook(params: {
    companyId: string;
    startDate: Date;
    endDate: Date;
    accountId?: string; // Optional if specific cash account needed
}) {
    const { companyId, startDate, endDate } = params;
    let accountId = params.accountId;

    // If no account provided, trying to find default Cash Account (111)
    if (!accountId) {
        const cashAccount = await prisma.account.findFirst({
            where: {
                companyId,
                code: { startsWith: '111' }, // 111 - Tiền mặt / Cash on hand
                isPosting: true
            },
            orderBy: { code: 'asc' }
        });

        if (!cashAccount) {
            throw new Error('No default Cash Account (111) found');
        }
        accountId = cashAccount.id;
    }

    // Reuse GL Logic
    const glResult = await getGeneralLedger(accountId, startDate, endDate);

    // Transform entries to Cash Book format (Receipt/Payment columns)
    // Cash Book is usually View from "Debit = Receipt", "Credit = Payment" perspective (for Asset account)

    const entries = glResult.entries.map(entry => ({
        date: entry.date,
        documentNumber: entry.reference || entry.entryNumber, // Prefer reference (receipt#) over entry#
        description: entry.description,
        receiptAmount: entry.debit > 0 ? entry.debit : 0,
        paymentAmount: entry.credit > 0 ? entry.credit : 0,
        balance: entry.balance,
        partnerName: entry.partnerName,
        journalEntryId: entry.journalEntryId
    }));

    const totalReceipt = glResult.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalPayment = glResult.entries.reduce((sum, e) => sum + (e.credit || 0), 0);

    return {
        account: glResult.account,
        openingBalance: glResult.openingBalance,
        entries,
        closingBalance: glResult.closingBalance,
        totalReceipt,
        totalPayment
    };
}
