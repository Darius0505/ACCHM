/**
 * Cash Payment Service
 * Handles Cash Payment (Phiếu Chi) logic
 */

import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';
import { generateEntryNumber } from './numberSequence.service';

// Types
export interface CashPaymentInput {
    companyId: string;
    date: Date;
    partnerId?: string;
    amount: number;
    description: string;
    descriptionEN?: string;
    debitAccountId: string; // Typically 331, 642, etc.
    creditAccountId: string; // Typically 111
    attachments?: string;
    createdBy: string;
}

export interface CashPaymentUpdateInput {
    date?: Date;
    paymentNumber?: string;
    partnerId?: string;
    payeeName?: string;
    amount?: number;
    description?: string;
    descriptionEN?: string;
    debitAccountId?: string;
    creditAccountId?: string;
    status?: 'DRAFT' | 'POSTED';
    details?: {
        description?: string;
        debitAccountId?: string;
        creditAccountId?: string;
        amount: number;
        originalCurrency?: string;
        exchangeRate?: number;
        originalAmount?: number;
        partnerId?: string;
    }[];
    attachments?: string;
    attachedFiles?: { id: string }[];
}

export interface CashPaymentFilter {
    companyId: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * List Cash Payments with filtering
 */
export async function listCashPayments(filters: CashPaymentFilter & { dataFilter?: Record<string, any> }) {
    const { companyId, startDate, endDate, status, search, page = 1, limit = 20, dataFilter } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.CashPaymentWhereInput = {
        companyId,
        ...dataFilter,
        ...(startDate && endDate ? {
            date: {
                gte: startDate,
                lte: endDate
            }
        } : {}),
        ...(status ? { status } : {}),
        ...(search ? {
            OR: [
                { paymentNumber: { contains: search } },
                { description: { contains: search } },
                { partner: { name: { contains: search } } },
                { payeeName: { contains: search } }
            ]
        } : {})
    };

    const [total, items] = await Promise.all([
        prisma.cashPayment.count({ where }),
        prisma.cashPayment.findMany({
            where,
            include: {
                partner: true
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
 * Get single Cash Payment
 */
export async function getCashPayment(id: string) {
    const payment = await prisma.cashPayment.findUnique({
        where: { id },
        include: {
            partner: true,
            journalEntry: true,
            details: true
        }
    });

    if (!payment) return null;

    // Fetch attached files linked to this payment
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
        ...payment,
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
 * Create Cash Payment (Draft)
 */
export async function createCashPayment(data: CashPaymentInput & {
    payeeName?: string;
    details?: {
        description: string;
        debitAccountId: string;
        creditAccountId: string;
        amount: number;
        originalCurrency?: string;
        exchangeRate?: number;
        originalAmount?: number;
        partnerId?: string;
    }[];
}) {
    const journal = await prisma.journal.findFirst({
        where: {
            companyId: data.companyId,
            code: 'PC' // Phiếu Chi
        }
    });

    if (!journal) {
        throw new Error('Không tìm thấy loại chứng từ Phiếu Chi (Code: PC) trong thiết lập.');
    }

    const paymentNumber = await generateEntryNumber({
        journalId: journal.id,
        date: data.date
    });

    // Calculate total amount from details if available, otherwise use header amount
    const totalAmount = data.details?.length
        ? data.details.reduce((sum, item) => sum + Number(item.amount), 0)
        : data.amount;

    return prisma.cashPayment.create({
        data: {
            companyId: data.companyId,
            paymentNumber,
            date: data.date,
            partnerId: data.partnerId,
            payeeName: data.payeeName, // Save payeeName
            amount: totalAmount,
            description: data.description,
            descriptionEN: data.descriptionEN,
            debitAccountId: data.debitAccountId,
            creditAccountId: data.creditAccountId,
            attachments: data.attachments,
            status: 'DRAFT',
            createdBy: data.createdBy,
            details: {
                create: data.details?.map(detail => ({
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
 * Update Cash Payment
 * - If POSTED: auto-unpost (delete journal entry) first, then update
 */
export async function updateCashPayment(id: string, data: CashPaymentUpdateInput) {
    const payment = await prisma.cashPayment.findUnique({
        where: { id }
    });

    if (!payment) throw new Error('Cash Payment not found');

    const { details, attachedFiles, attachments, ...headerData } = data;

    return prisma.$transaction(async (tx) => {
        // If POSTED, clean up old journal entry (auto-unpost before edit)
        if (payment.status === 'POSTED' && payment.journalEntryId) {
            await tx.cashPayment.update({
                where: { id },
                data: { journalEntryId: null }
            });
            await tx.journalEntry.delete({
                where: { id: payment.journalEntryId }
            });
        }

        // Update header fields
        const updated = await tx.cashPayment.update({
            where: { id },
            data: {
                ...headerData,
                attachments: attachments !== undefined ? attachments : payment.attachments
            }
        });

        // Replace details if provided
        if (details) {
            await tx.cashPaymentDetail.deleteMany({
                where: { cashPaymentId: id }
            });

            if (details.length > 0) {
                await tx.cashPaymentDetail.createMany({
                    data: details.map(d => ({
                        cashPaymentId: id,
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
                const fileIds = attachedFiles.map(f => f.id);
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
 * Delete Cash Payment (Draft only)
 */
export async function deleteCashPayment(id: string) {
    const payment = await prisma.cashPayment.findUnique({
        where: { id }
    });

    if (!payment) throw new Error('Cash Payment not found');

    return prisma.$transaction(async (tx) => {
        // Delete the payment FIRST to satisfy foreign key constraints
        const deletedPayment = await tx.cashPayment.delete({
            where: { id }
        });

        // If POSTED, clean up journal entry SECOND
        if (payment.status === 'POSTED' && payment.journalEntryId) {
            await tx.journalEntry.delete({
                where: { id: payment.journalEntryId }
            });
        }

        return deletedPayment;
    });
}

/**
 * Post Cash Payment
 * - Creates Journal Entry
 * - Updates status to POSTED
 * - Optional: Check cash balance
 */
export async function postCashPayment(id: string, postedBy: string) {
    const payment = await prisma.cashPayment.findUnique({
        where: { id },
        include: { details: true } // Include details
    });

    if (!payment) throw new Error('Cash Payment not found');
    if (payment.status !== 'DRAFT') throw new Error('Payment is already posted or cancelled');

    const journal = await prisma.journal.findFirst({
        where: {
            companyId: payment.companyId,
            code: 'PC'
        }
    });

    if (!journal) throw new Error('Không tìm thấy loại chứng từ Phiếu Chi (Code: PC) để ghi sổ.');

    return prisma.$transaction(async (tx) => {
        // Generate GL Entry Number
        const entryNumber = await generateEntryNumber({ journalId: journal.id, date: payment.date });

        // Generate lines from details OR fallback to header if no details
        let lines: any[] = [];

        if (payment.details && payment.details.length > 0) {
            // Multi-line strategies:
            // 1. One Credit Line (Total Cash) + Multiple Debit Lines (Expenses)
            // 2. Pair per detail (Debit/Credit per line) -> This is cleaner for tracking partners

            // Strategy 2: Per detail
            lines = payment.details.flatMap(detail => [
                {
                    accountId: detail.debitAccountId || payment.debitAccountId,
                    debit: detail.amount,
                    credit: new Prisma.Decimal(0),
                    description: detail.description,
                    partnerId: detail.partnerId || payment.partnerId // Detail partner > Header partner
                },
                {
                    accountId: detail.creditAccountId || payment.creditAccountId,
                    debit: new Prisma.Decimal(0),
                    credit: detail.amount,
                    description: detail.description,
                    partnerId: null // Cash usually doesn't need partner
                }
            ]);
        } else {
            // Fallback: Header only (Legacy)
            lines = [
                {
                    accountId: payment.debitAccountId,
                    debit: payment.amount,
                    credit: new Prisma.Decimal(0),
                    description: payment.description,
                    partnerId: payment.partnerId
                },
                {
                    accountId: payment.creditAccountId,
                    debit: new Prisma.Decimal(0),
                    credit: payment.amount,
                    description: payment.description,
                    partnerId: payment.partnerId
                }
            ];
        }

        const journalEntry = await tx.journalEntry.create({
            data: {
                // companyId inferred from Journal
                journalId: journal.id,
                entryNumber: entryNumber,
                date: payment.date,
                postingDate: payment.date,
                description: payment.description,
                descriptionEN: payment.descriptionEN,
                reference: payment.paymentNumber,
                status: 'POSTED',
                createdBy: postedBy,
                postedBy: postedBy,
                postedAt: new Date(),
                totalDebit: payment.amount,
                totalCredit: payment.amount,
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

        const updatedPayment = await tx.cashPayment.update({
            where: { id },
            data: {
                status: 'POSTED',
                postedBy,
                postedAt: new Date(),
                journalEntryId: journalEntry.id
            }
        });

        return updatedPayment;
    });
}

/**
 * Unpost Cash Payment
 * - Deletes Journal Entry
 * - Updates status to DRAFT
 */
export async function unpostCashPayment(id: string) {
    const payment = await prisma.cashPayment.findUnique({
        where: { id }
    });

    if (!payment) throw new Error('Cash Payment not found');
    if (payment.status !== 'POSTED') throw new Error('Payment is not posted, cannot unpost.');

    return prisma.$transaction(async (tx) => {
        // 1. Reset payment status to DRAFT and clear journalEntryId FIRST
        const updatedPayment = await tx.cashPayment.update({
            where: { id },
            data: {
                status: 'DRAFT',
                postedBy: null,
                postedAt: null,
                journalEntryId: null
            }
        });

        // 2. Delete journal entry if exists SECOND
        if (payment.journalEntryId) {
            await tx.journalEntry.delete({
                where: { id: payment.journalEntryId }
            });
        }

        return updatedPayment;
    });
}
