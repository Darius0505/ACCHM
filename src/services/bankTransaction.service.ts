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
    reference?: string;
    debitAccountId: string;
    creditAccountId: string;
    createdBy: string;
    attachments?: string;
    details?: {
        description: string;
        debitAccountId?: string;
        creditAccountId?: string;
        amount: number;
        originalCurrency?: string;
        exchangeRate?: number;
        originalAmount?: number;
        partnerId?: string;
    }[];
}

export interface BankTransactionUpdateInput {
    date?: Date;
    type?: 'DEPOSIT' | 'WITHDRAWAL';
    partnerId?: string;
    amount?: number;
    description?: string;
    descriptionEN?: string;
    reference?: string;
    debitAccountId?: string;
    creditAccountId?: string;
    status?: string;
    attachments?: string;
    details?: {
        id?: string;
        description: string;
        debitAccountId?: string;
        creditAccountId?: string;
        amount: number;
        originalCurrency?: string;
        exchangeRate?: number;
        originalAmount?: number;
        partnerId?: string;
    }[];
    attachedFiles?: { id: string; name: string; size: number; type: string; url: string }[];
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
    const transaction = await prisma.bankTransaction.findUnique({
        where: { id },
        include: {
            partner: true,
            bankAccount: true,
            journalEntry: true,
            details: true
        }
    });

    if (!transaction) return null;

    // Fetch attached files linked to this transaction
    const attachedFiles = await prisma.fileMetadata.findMany({
        where: {
            entityId: id,
            entityType: 'VOUCHER',
            deletedAt: null
        },
        select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true
        }
    });

    return {
        ...transaction,
        attachedFiles: attachedFiles.map(f => ({
            id: f.id,
            name: f.fileName,
            size: f.fileSize,
            type: f.mimeType,
            url: `/api/files/${f.id}`
        }))
    };
}

/**
 * Create Bank Transaction
 */
export async function createBankTransaction(data: BankTransactionInput) {
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

    const bankAccount = await prisma.bankAccount.findUnique({
        where: { id: data.bankAccountId }
    });

    if (!bankAccount || !bankAccount.accountId) {
        throw new Error('Bank Account not found or not linked to a GL Account');
    }

    // Header amount from details or fallback to provided amount
    const totalAmount = data.details?.length
        ? data.details.reduce((sum, item) => sum + Number(item.amount), 0)
        : data.amount;

    // Determine basic header accounts based on type
    const defaultDebitAccount = data.type === 'DEPOSIT' ? bankAccount.accountId : data.debitAccountId;
    const defaultCreditAccount = data.type === 'DEPOSIT' ? data.creditAccountId : bankAccount.accountId;

    return prisma.bankTransaction.create({
        data: {
            bankAccountId: data.bankAccountId,
            transactionNumber,
            date: data.date,
            type: data.type,
            partnerId: data.partnerId,
            amount: totalAmount,
            description: data.description,
            descriptionEN: data.descriptionEN,
            reference: data.reference,
            debitAccountId: defaultDebitAccount,
            creditAccountId: defaultCreditAccount,
            attachments: data.attachments,
            status: 'DRAFT',
            createdBy: data.createdBy,
            details: {
                create: data.details?.map((detail: any) => ({
                    description: detail.description,
                    debitAccountId: detail.debitAccountId,
                    creditAccountId: detail.creditAccountId,
                    amount: detail.amount,
                    originalCurrency: detail.originalCurrency,
                    exchangeRate: detail.exchangeRate,
                    originalAmount: detail.originalAmount,
                    partnerId: detail.partnerId
                }))
            }
        },
        include: {
            details: true
        }
    });
}

/**
 * Update Bank Transaction
 */
export async function updateBankTransaction(id: string, data: BankTransactionUpdateInput) {
    const txDoc = await prisma.bankTransaction.findUnique({
        where: { id },
        include: { bankAccount: true }
    });

    if (!txDoc) throw new Error('Transaction not found');

    const { details, attachedFiles, attachments, ...headerData } = data;

    return prisma.$transaction(async (tx) => {
        // Handle unposting if already posted and updating
        if (txDoc.status === 'POSTED' && txDoc.journalEntryId) {
            await tx.bankTransaction.update({
                where: { id },
                data: { journalEntryId: null }
            });
            await tx.journalEntry.delete({
                where: { id: txDoc.journalEntryId }
            });
        }

        // Recalculate accounts if type changed
        let debitAccountId = headerData.debitAccountId ?? txDoc.debitAccountId;
        let creditAccountId = headerData.creditAccountId ?? txDoc.creditAccountId;

        // If type changed from D to W or vice versa, bank account side changes
        if (headerData.type && headerData.type !== txDoc.type) {
            if (txDoc.bankAccount?.accountId) {
                debitAccountId = headerData.type === 'DEPOSIT' ? txDoc.bankAccount.accountId : (headerData.debitAccountId || txDoc.creditAccountId);
                creditAccountId = headerData.type === 'DEPOSIT' ? (headerData.creditAccountId || txDoc.debitAccountId) : txDoc.bankAccount.accountId;
            }
        }

        const updated = await tx.bankTransaction.update({
            where: { id },
            data: {
                ...headerData,
                debitAccountId,
                creditAccountId,
                attachments: attachments !== undefined ? attachments : txDoc.attachments
            }
        });

        // Replace details atomically
        if (details) {
            await tx.bankTransactionDetail.deleteMany({
                where: { bankTransactionId: id }
            });

            if (details.length > 0) {
                await tx.bankTransactionDetail.createMany({
                    data: details.map((d: any) => ({
                        bankTransactionId: id,
                        description: d.description || '',
                        debitAccountId: d.debitAccountId,
                        creditAccountId: d.creditAccountId,
                        amount: d.amount,
                        originalCurrency: d.originalCurrency,
                        exchangeRate: d.exchangeRate,
                        originalAmount: d.originalAmount,
                        partnerId: d.partnerId
                    }))
                });
            }
        }

        // Handle attached files
        if (attachedFiles) {
            await tx.fileMetadata.updateMany({
                where: { entityId: id, entityType: 'VOUCHER' },
                data: { entityId: null }
            });

            if (attachedFiles.length > 0) {
                const fileIds = attachedFiles.map((f: any) => f.id);
                await tx.fileMetadata.updateMany({
                    where: { id: { in: fileIds } },
                    data: { entityId: id, entityType: 'VOUCHER' }
                });
            }
        }

        return updated;
    });
}

/**
 * Delete Bank Transaction
 */
export async function deleteBankTransaction(id: string) {
    const tx = await prisma.bankTransaction.findUnique({
        where: { id }
    });

    if (!tx) throw new Error('Transaction not found');

    return prisma.$transaction(async (prismaTx) => {
        const deletedTx = await prismaTx.bankTransaction.delete({
            where: { id }
        });

        if (tx.status === 'POSTED' && tx.journalEntryId) {
            await prismaTx.journalEntry.delete({
                where: { id: tx.journalEntryId }
            });
        }

        return deletedTx;
    });
}

/**
 * Post Bank Transaction
 */
export async function postBankTransaction(id: string, postedBy: string) {
    const transaction = await prisma.bankTransaction.findUnique({
        where: { id },
        include: {
            bankAccount: true,
            details: true
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

        let lines: any[] = [];

        if (transaction.details && transaction.details.length > 0) {
            lines = transaction.details.flatMap(detail => [
                {
                    accountId: detail.debitAccountId || transaction.debitAccountId,
                    debit: detail.amount,
                    credit: new Prisma.Decimal(0),
                    description: detail.description || transaction.description,
                    partnerId: detail.partnerId || transaction.partnerId
                },
                {
                    accountId: detail.creditAccountId || transaction.creditAccountId,
                    debit: new Prisma.Decimal(0),
                    credit: detail.amount,
                    description: detail.description || transaction.description,
                    partnerId: detail.partnerId || transaction.partnerId
                }
            ]);
        } else {
            lines = [
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
        }

        const journalEntry = await prismaTx.journalEntry.create({
            data: {
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
