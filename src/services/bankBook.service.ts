/**
 * Bank Book Service
 * Report Logic for Bank Book (Sổ Tiền Gửi Ngân Hàng)
 */

import prisma from '../lib/prisma';
import { getGeneralLedger } from './generalLedger.service';

export async function getBankBook(params: {
    bankAccountId: string;
    startDate: Date;
    endDate: Date;
}) {
    const { bankAccountId, startDate, endDate } = params;

    // 1. Get Bank Account to find linked GL Account
    const bankAccount = await prisma.bankAccount.findUnique({
        where: { id: bankAccountId },
        include: { account: true } // GL Account linkage
    });

    if (!bankAccount) {
        throw new Error('Bank Account not found');
    }

    if (!bankAccount.accountId) {
        throw new Error(`Bank Account ${bankAccount.accountNumber} is not linked to a GL Account`);
    }

    // 2. Get GL Data
    const glResult = await getGeneralLedger(bankAccount.accountId, startDate, endDate);

    // 3. Transform
    const entries = glResult.entries.map(entry => ({
        date: entry.date,
        documentNumber: entry.reference || entry.entryNumber,
        description: entry.description,
        depositAmount: entry.debit > 0 ? entry.debit : 0,
        withdrawalAmount: entry.credit > 0 ? entry.credit : 0,
        balance: entry.balance,
        partnerName: entry.partnerName,
        journalEntryId: entry.journalEntryId
    }));

    const totalDeposit = glResult.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalWithdrawal = glResult.entries.reduce((sum, e) => sum + (e.credit || 0), 0);

    return {
        bankAccount: {
            id: bankAccount.id,
            bankName: bankAccount.bankName,
            accountNumber: bankAccount.accountNumber,
            currency: bankAccount.currency
        },
        glAccount: glResult.account,
        openingBalance: glResult.openingBalance,
        entries,
        closingBalance: glResult.closingBalance,
        totalDeposit,
        totalWithdrawal
    };
}
