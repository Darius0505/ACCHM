/**
 * Bank Transaction Service
 * Handles Bank Deposits, Withdrawals, and Transfers
 */

import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';
import { generateEntryNumber } from './numberSequence.service';

export interface BankTransactionInput {
    companyId: string;
    bankAccountId: string;
    date: Date;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    partnerId?: string;
    amount: number;
    description: string;
    descriptionEN?: string;
    reference?: string; // Bank statement ref
    offsetAccountId: string; // The other side of the entry (e.g. 131, 331)
    createdBy: string;
}

export interface BankTransactionUpdateInput {
    date?: Date;
    type?: 'DEPOSIT' | 'WITHDRAWAL';
    partnerId?: string;
    amount?: number;
    description?: string;
    descriptionEN?: string;
    reference?: string;
    offsetAccountId?: string;
}

export interface BankTransactionFilter {
    companyId: string;
    bankAccountId?: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * List Bank Transactions
 */
export async function listBankTransactions(filters: BankTransactionFilter & { dataFilter?: Record<string, any> }) {
    const { companyId, bankAccountId, startDate, endDate, type, status, search, page = 1, limit = 20, dataFilter } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.BankTransactionWhereInput = {
        bankAccount: { companyId },
        ...dataFilter,
        ...(bankAccountId ? { bankAccountId } : {}),
        ...(startDate && endDate ? {
            date: {
                gte: startDate,
                lte: endDate
            }
        } : {}),
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
        ...(search ? {
            OR: [
                { transactionNumber: { contains: search } },
                { description: { contains: search } },
                { reference: { contains: search } },
                { partner: { name: { contains: search } } }
            ]
        } : {})
    };

    const [total, items] = await Promise.all([
        prisma.bankTransaction.count({ where }),
        prisma.bankTransaction.findMany({
            where,
            include: {
                partner: true,
                bankAccount: true
            },
            orderBy: { date: 'desc' },
            skip,
            take: limit
        })
    ]);

    return {
        items,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

/**
 * Get single Bank Transaction
 */
export async function getBankTransaction(id: string) {
    return prisma.bankTransaction.findUnique({
        where: { id },
        include: {
            partner: true,
            bankAccount: true,
            journalEntry: true
        }
    });
}

/**
 * Create Bank Transaction (Draft)
 */
export async function createBankTransaction(data: BankTransactionInput) {
    // Determine Journal Type based on transaction type
    // DEPOSIT -> Bank Receipts (BR/BC)
    // WITHDRAWAL -> Bank Payments (BP/BN)
    const journalCode = data.type === 'DEPOSIT' ? 'BR' : 'BP';

    const journal = await prisma.journal.findFirst({
        where: {
            companyId: data.companyId,
            code: journalCode
        }
    });

    if (!journal) {
        throw new Error(`Bank Journal (Code: ${journalCode}) not found`);
    }

    const transactionNumber = await generateEntryNumber({
        journalId: journal.id,
        date: data.date
    });

    // Determine Debit/Credit accounts
    // We need the GL Account ID associated with the Bank Account
    const bankAccount = await prisma.bankAccount.findUnique({
        where: { id: data.bankAccountId }
    });

    if (!bankAccount || !bankAccount.accountId) {
        throw new Error('Bank Account not found or not linked to a GL Account');
    }

    const debitAccountId = data.type === 'DEPOSIT' ? bankAccount.accountId : data.offsetAccountId;
    const creditAccountId = data.type === 'DEPOSIT' ? data.offsetAccountId : bankAccount.accountId;

    return prisma.bankTransaction.create({
        data: {
            bankAccountId: data.bankAccountId,
            transactionNumber,
            date: data.date,
            type: data.type,
            partnerId: data.partnerId,
            amount: data.amount,
            description: data.description,
            descriptionEN: data.descriptionEN,
            reference: data.reference,
            debitAccountId,
            creditAccountId,
            status: 'DRAFT',
            createdBy: data.createdBy
        }
    });
}

/**
 * Update Bank Transaction (Draft only)
 */
export async function updateBankTransaction(id: string, data: BankTransactionUpdateInput) {
    const tx = await prisma.bankTransaction.findUnique({
        where: { id }
    });

    if (!tx) throw new Error('Transaction not found');
    if (tx.status !== 'DRAFT') throw new Error('Cannot update posted transaction');

    // If type changed, we might need to swap accounts, but simplifying assume UI handles providing correct offset
    // Recalculate Debit/Credit if type or offset changed
    let debitAccountId = tx.debitAccountId;
    let creditAccountId = tx.creditAccountId;

    if (data.type || data.offsetAccountId) {
        const type = data.type || tx.type;
        const offsetId = data.offsetAccountId || (type === 'DEPOSIT' ? tx.creditAccountId : tx.debitAccountId); // infer current offset

        // Need bank account GL ID
        const bankAccount = await prisma.bankAccount.findUnique({ where: { id: tx.bankAccountId } });
        if (bankAccount && bankAccount.accountId) {
            debitAccountId = type === 'DEPOSIT' ? bankAccount.accountId : offsetId;
            creditAccountId = type === 'DEPOSIT' ? offsetId : bankAccount.accountId;
        }
    }

    return prisma.bankTransaction.update({
        where: { id },
        data: {
            ...data,
            debitAccountId,
            creditAccountId
        }
    });
}

/**
 * Delete Bank Transaction (Draft only)
 */
export async function deleteBankTransaction(id: string) {
    const tx = await prisma.bankTransaction.findUnique({
        where: { id }
    });

    if (!tx) throw new Error('Transaction not found');
    if (tx.status !== 'DRAFT') throw new Error('Cannot delete posted transaction');

    return prisma.bankTransaction.delete({
        where: { id }
    });
}

/**
 * Post Bank Transaction
 */
export async function postBankTransaction(id: string, postedBy: string) {
    const transaction = await prisma.bankTransaction.findUnique({
        where: { id },
        include: {
            bankAccount: true
        }
    });

    if (!transaction) throw new Error('Transaction not found');
    if (transaction.status !== 'DRAFT') throw new Error('Transaction is already posted or cancelled');

    const journalCode = transaction.type === 'DEPOSIT' ? 'BR' : 'BP';
    const journal = await prisma.journal.findFirst({
        where: {
            companyId: transaction.bankAccount.companyId,
            code: journalCode
        }
    });

    if (!journal) throw new Error(`Bank Journal (${journalCode}) not found`);

    return prisma.$transaction(async (prismaTx) => {
        const entryNumber = await generateEntryNumber({ journalId: journal.id, date: transaction.date });

        const lines = [
            {
                accountId: transaction.debitAccountId,
                debit: transaction.amount,
                credit: new Prisma.Decimal(0),
                description: transaction.description,
                partnerId: transaction.partnerId
            },
            {
                accountId: transaction.creditAccountId,
                debit: new Prisma.Decimal(0),
                credit: transaction.amount,
                description: transaction.description,
                partnerId: transaction.partnerId
            }
        ];

        const journalEntry = await prismaTx.journalEntry.create({
            data: {
                // companyId not needed, it's inferred from Journal
                journalId: journal.id,
                entryNumber: entryNumber,
                date: transaction.date,
                postingDate: transaction.date,
                description: transaction.description,
                descriptionEN: transaction.descriptionEN,
                reference: transaction.transactionNumber,
                status: 'POSTED',
                createdBy: postedBy,
                postedBy: postedBy,
                postedAt: new Date(),
                totalDebit: transaction.amount,
                totalCredit: transaction.amount,
                lines: {
                    create: lines.map((line, index) => ({
                        lineNumber: index + 1,
                        accountId: line.accountId,
                        description: line.description,
                        debit: line.debit,
                        credit: line.credit,
                        partnerId: line.partnerId
                    }))
                }
            }
        });

        const updatedTx = await prismaTx.bankTransaction.update({
            where: { id },
            data: {
                status: 'POSTED',
                postedBy,
                postedAt: new Date(),
                journalEntryId: journalEntry.id
            }
        });

        return updatedTx;
    });
}
