/**
 * General Ledger Service
 * Handles GL queries, trial balance, and account balance calculations
 */

import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';

// const prisma = new PrismaClient();

// Types
export interface GeneralLedgerEntry {
    date: Date;
    entryNumber: string;
    description: string | null;
    debit: number;
    credit: number;
    balance: number;
    journalEntryId: string;
    partnerName?: string | null;
    reference?: string | null;
}

export interface GeneralLedgerResult {
    account: {
        id: string;
        code: string;
        name: string;
        nameEN: string | null;
        type: string;
        nature: string;
    };
    openingBalance: number;
    entries: GeneralLedgerEntry[];
    closingBalance: number;
    totalDebit: number;
    totalCredit: number;
}

export interface TrialBalanceRow {
    accountId: string;
    code: string;
    name: string;
    nameEN: string | null;
    level: number;
    type: string;
    nature: string;
    debit: number;
    credit: number;
}

export interface TrialBalanceResult {
    asOfDate: Date;
    rows: TrialBalanceRow[];
    totalDebit: number;
    totalCredit: number;
}

// Helper: Calculate opening balance for an account
async function calculateOpeningBalance(
    accountId: string,
    beforeDate: Date
): Promise<number> {
    // Get account info
    const account = await prisma.account.findUnique({
        where: { id: accountId },
        select: { openingDebit: true, openingCredit: true, nature: true }
    });

    if (!account) return 0;

    // Start with beginning balance
    let balance = Number(account.openingDebit) - Number(account.openingCredit);

    // Add all posted entries before the date
    const result = await prisma.journalEntryLine.aggregate({
        where: {
            accountId,
            entry: {
                status: 'POSTED',
                postingDate: { lt: beforeDate }
            }
        },
        _sum: {
            debit: true,
            credit: true
        }
    });

    const sumDebit = Number(result._sum.debit || 0);
    const sumCredit = Number(result._sum.credit || 0);

    // For debit nature accounts: balance = debit - credit
    // For credit nature accounts: balance = credit - debit
    if (account.nature === 'DEBIT') {
        balance += sumDebit - sumCredit;
    } else {
        balance += sumCredit - sumDebit;
    }

    return balance;
}

// General Ledger
export async function getGeneralLedger(
    accountId: string,
    startDate: Date,
    endDate: Date
): Promise<GeneralLedgerResult> {
    // Get account
    const account = await prisma.account.findUnique({
        where: { id: accountId },
        select: { id: true, code: true, name: true, nameEN: true, type: true, nature: true }
    });

    if (!account) {
        throw new Error('Account not found');
    }

    // Calculate opening balance
    const openingBalance = await calculateOpeningBalance(accountId, startDate);

    // Get entries in period
    const lines = await prisma.journalEntryLine.findMany({
        where: {
            accountId,
            entry: {
                status: 'POSTED',
                postingDate: { gte: startDate, lte: endDate }
            }
        },
        include: {
            entry: {
                select: { id: true, entryNumber: true, date: true, description: true, reference: true }
            },
            partner: {
                select: { name: true }
            }
        },
        orderBy: {
            entry: { date: 'asc' }
        }
    });

    // Build entries with running balance
    let runningBalance = openingBalance;
    const entries: GeneralLedgerEntry[] = lines.map(line => {
        const debit = Number(line.debit);
        const credit = Number(line.credit);

        if (account.nature === 'DEBIT') {
            runningBalance += debit - credit;
        } else {
            runningBalance += credit - debit;
        }

        return {
            date: line.entry.date,
            entryNumber: line.entry.entryNumber,
            description: line.description || line.entry.description,
            debit,
            credit,
            balance: runningBalance,
            journalEntryId: line.entry.id,
            partnerName: line.partner?.name || null,
            reference: line.entry.reference
        };
    });

    // Calculate totals
    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

    return {
        account,
        openingBalance,
        entries,
        closingBalance: runningBalance,
        totalDebit,
        totalCredit
    };
}

// Account Balance
export async function getAccountBalance(
    accountId: string,
    asOfDate: Date
): Promise<{ balance: number; debit: number; credit: number }> {
    const account = await prisma.account.findUnique({
        where: { id: accountId },
        select: { openingDebit: true, openingCredit: true, nature: true }
    });

    if (!account) {
        throw new Error('Account not found');
    }

    // Get all posted entries up to asOfDate
    const result = await prisma.journalEntryLine.aggregate({
        where: {
            accountId,
            entry: {
                status: 'POSTED',
                postingDate: { lte: asOfDate }
            }
        },
        _sum: {
            debit: true,
            credit: true
        }
    });

    const totalDebit = Number(account.openingDebit) + Number(result._sum.debit || 0);
    const totalCredit = Number(account.openingCredit) + Number(result._sum.credit || 0);

    let balance: number;
    if (account.nature === 'DEBIT') {
        balance = totalDebit - totalCredit;
    } else {
        balance = totalCredit - totalDebit;
    }

    return { balance, debit: totalDebit, credit: totalCredit };
}

// Trial Balance
export async function getTrialBalance(
    companyId: string,
    asOfDate: Date,
    level?: number
): Promise<TrialBalanceResult> {
    // Get all posting accounts
    const accounts = await prisma.account.findMany({
        where: {
            companyId,
            isPosting: true,
            isActive: true,
            ...(level && { level: { lte: level } })
        },
        select: {
            id: true,
            code: true,
            name: true,
            nameEN: true,
            level: true,
            type: true,
            nature: true,
            openingDebit: true,
            openingCredit: true
        },
        orderBy: { code: 'asc' }
    });

    // Get aggregated balances for all accounts
    const balances = await prisma.journalEntryLine.groupBy({
        by: ['accountId'],
        where: {
            entry: {
                status: 'POSTED',
                postingDate: { lte: asOfDate }
            },
            account: { companyId }
        },
        _sum: {
            debit: true,
            credit: true
        }
    });

    const balanceMap = new Map(balances.map(b => [b.accountId, {
        debit: Number(b._sum.debit || 0),
        credit: Number(b._sum.credit || 0)
    }]));

    // Build trial balance rows
    const rows: TrialBalanceRow[] = accounts.map(account => {
        const movements = balanceMap.get(account.id) || { debit: 0, credit: 0 };
        const totalDebit = Number(account.openingDebit) + movements.debit;
        const totalCredit = Number(account.openingCredit) + movements.credit;

        let debit = 0;
        let credit = 0;

        // Net balance goes to debit or credit column based on nature
        const netBalance = totalDebit - totalCredit;
        if (account.nature === 'DEBIT') {
            if (netBalance >= 0) {
                debit = netBalance;
            } else {
                credit = Math.abs(netBalance);
            }
        } else {
            if (netBalance <= 0) {
                credit = Math.abs(netBalance);
            } else {
                debit = netBalance;
            }
        }

        return {
            accountId: account.id,
            code: account.code,
            name: account.name,
            nameEN: account.nameEN,
            level: account.level,
            type: account.type,
            nature: account.nature,
            debit,
            credit
        };
    }).filter(row => row.debit !== 0 || row.credit !== 0); // Only show accounts with balance

    // Calculate totals
    const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0);
    const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0);

    return {
        asOfDate,
        rows,
        totalDebit,
        totalCredit
    };
}
