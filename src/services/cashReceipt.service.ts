/**
 * Cash Receipt Service
 * Handles Cash Receipt (Phiếu Thu) logic
 */

import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';
import { generateEntryNumber } from './numberSequence.service';
import { createJournalEntry } from './journalEntry.service';

// Types
export interface CashReceiptInput {
    companyId: string;
    date: Date;
    partnerId?: string;
    payerName?: string;
    amount: number;
    description: string;
    descriptionEN?: string;
    debitAccountId: string;
    creditAccountId: string;
    status?: 'DRAFT' | 'POSTED';
    createdBy: string;
    receiptNumber?: string;
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

export interface CashReceiptUpdateInput {
    date?: Date;
    receiptNumber?: string;
    partnerId?: string;
    payerName?: string;
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

export interface CashReceiptFilter {
    companyId: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

/**
 * List Cash Receipts with filtering
 */
export async function listCashReceipts(filters: CashReceiptFilter & { dataFilter?: Record<string, any> }) {
    const { companyId, startDate, endDate, status, search, page = 1, limit = 20, dataFilter } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.CashReceiptWhereInput = {
        companyId,
        ...dataFilter,
        ...(startDate ? { date: { gte: startDate } } : {}),
        ...(endDate ? { date: { lte: endDate } } : {}),
        ...(status ? { status } : {}),
        ...(search ? {
            OR: [
                { receiptNumber: { contains: search } },
                { description: { contains: search } },
                { partner: { name: { contains: search } } }
            ]
        } : {})
    };

    const [total, items] = await Promise.all([
        prisma.cashReceipt.count({ where }),
        prisma.cashReceipt.findMany({
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
 * Get single Cash Receipt
 */
export async function getCashReceipt(id: string) {
    const receipt = await prisma.cashReceipt.findUnique({
        where: { id },
        include: {
            partner: true,
            journalEntry: true,
            details: true
        }
    });

    if (!receipt) return null;

    // Fetch attached files linked to this receipt
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
        ...receipt,
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
 * Create Cash Receipt (Draft)
 */
export async function createCashReceipt(data: CashReceiptInput) {
    // Find Cash Journal to generate number
    // Look for any active journal with type 'CASH'
    const journal = await prisma.journal.findFirst({
        where: {
            companyId: data.companyId,
            type: 'CASH',
            isActive: true
        },
        orderBy: { code: 'asc' }
    });

    if (!journal) {
        throw new Error('Không tìm thấy loại chứng từ Phiếu Thu (Type: CASH) trong thiết lập.');
    }

    // Generate Number if not provided
    const receiptNumber = data.receiptNumber || await generateEntryNumber({
        journalId: journal.id,
        date: data.date
    });

    const receipt = await prisma.cashReceipt.create({
        data: {
            companyId: data.companyId,
            receiptNumber,
            date: data.date,
            partnerId: data.partnerId,
            payerName: data.payerName || '', // [Fixed] Save payer name
            amount: data.amount, // Total amount
            description: data.description,
            descriptionEN: data.descriptionEN,
            debitAccountId: data.debitAccountId, // General or First line? -> We keep it as "Main" account or leave null? Schema says required. Let's keep it as Header/Default
            creditAccountId: data.creditAccountId, // Same here
            attachments: data.attachments,
            status: data.status || 'POSTED',
            createdBy: data.createdBy,
            details: data.details ? {
                create: data.details.map(d => ({
                    description: d.description || data.description,
                    debitAccountId: d.debitAccountId || data.debitAccountId,
                    creditAccountId: d.creditAccountId || data.creditAccountId,
                    amount: d.amount,
                    originalCurrency: d.originalCurrency,
                    exchangeRate: d.exchangeRate,
                    originalAmount: d.originalAmount,
                    partnerId: d.partnerId || data.partnerId
                }))
            } : undefined
        }
    });

    // Link uploaded files to this receipt
    if (data.attachedFiles && data.attachedFiles.length > 0) {
        const fileIds: string[] = data.attachedFiles.map((f: { id: string }) => f.id);
        await prisma.fileMetadata.updateMany({
            where: { id: { in: fileIds } },
            data: {
                entityId: receipt.id,
                entityType: 'VOUCHER'
            }
        });
    }

    return receipt;
}

/**
 * Update Cash Receipt
 * - If POSTED: auto-unpost (delete journal entry) first, then update
 */
export async function updateCashReceipt(id: string, data: CashReceiptUpdateInput) {
    const receipt = await prisma.cashReceipt.findUnique({
        where: { id }
    });

    if (!receipt) throw new Error('Cash Receipt not found');

    const { details, attachedFiles, attachments, ...headerData } = data;

    // Use transaction to update header + replace details atomically
    return prisma.$transaction(async (tx) => {
        // If POSTED, clean up old journal entry (auto-unpost before edit)
        if (receipt.status === 'POSTED' && receipt.journalEntryId) {
            // Clear the journalEntryId reference FIRST
            await tx.cashReceipt.update({
                where: { id },
                data: { journalEntryId: null }
            });
            // Then delete the JournalEntry
            await tx.journalEntry.delete({
                where: { id: receipt.journalEntryId }
            });
        }

        // Update header fields
        const updated = await tx.cashReceipt.update({
            where: { id },
            data: {
                ...headerData,
                attachments: attachments !== undefined ? attachments : receipt.attachments
            }
        });

        // Replace details if provided
        if (details) {
            // Delete old details
            await tx.cashReceiptDetail.deleteMany({
                where: { cashReceiptId: id }
            });

            // Create new details
            if (details.length > 0) {
                await tx.cashReceiptDetail.createMany({
                    data: details.map(d => ({
                        cashReceiptId: id,
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

        // Handle attached files: Clear previous links first, then set new ones
        if (attachedFiles) {
            // Unlink current files
            await tx.fileMetadata.updateMany({
                where: { entityId: id, entityType: 'VOUCHER' },
                data: { entityId: null }
            });

            // Link new files
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
 * Delete Cash Receipt
 * - If POSTED: auto-unpost (delete journal entry) then delete receipt
 * - If DRAFT: delete directly
 */
export async function deleteCashReceipt(id: string) {
    console.log(`[Service] Requested deletion for Cash Receipt: ${id}`);

    const receipt = await prisma.cashReceipt.findUnique({
        where: { id }
    });

    if (!receipt) {
        console.warn(`[Service] Delete failed: Cash Receipt ${id} not found.`);
        throw new Error('Không tìm thấy phiếu thu');
    }

    console.log(`[Service] Found receipt ${receipt.receiptNumber} with status ${receipt.status}`);

    return prisma.$transaction(async (tx) => {
        // 1. If POSTED, clean up journal entry FIRST to avoid orphan GL entries
        if (receipt.status === 'POSTED' && receipt.journalEntryId) {
            console.log(`[Service] Receipt is POSTED. Deleting associated Journal Entry: ${receipt.journalEntryId}`);

            // Clear the reference in the receipt first to satisfy DB constraints if any
            await tx.cashReceipt.update({
                where: { id },
                data: { journalEntryId: null }
            });

            await tx.journalEntry.delete({
                where: { id: receipt.journalEntryId }
            });
            console.log(`[Service] Journal Entry deleted successfully.`);
        }

        // 2. Delete the receipt (cascade will handle details if configured, but we do it explicitly if needed)
        // Actually schema has: cashReceipt   CashReceipt @relation(fields: [cashReceiptId], references: [id], onDelete: Cascade)
        console.log(`[Service] Deleting Cash Receipt header and details (via cascade)...`);
        const deletedReceipt = await tx.cashReceipt.delete({
            where: { id }
        });

        console.log(`[Service] Cash Receipt ${receipt.receiptNumber} deleted successfully.`);
        return deletedReceipt;
    });
}

/**
 * Post Cash Receipt
 * - Creates Journal Entry
 * - Updates status to POSTED
 */
export async function postCashReceipt(id: string, postedBy: string) {
    // 1. Get receipt
    const receipt = await prisma.cashReceipt.findUnique({
        where: { id },
        include: { details: true }
    });

    if (!receipt) throw new Error('Cash Receipt not found');
    if (receipt.status !== 'DRAFT') throw new Error('Receipt is already posted or cancelled');

    // 2. Find Cash Journal
    const journal = await prisma.journal.findFirst({
        where: {
            companyId: receipt.companyId,
            type: 'CASH',
            isActive: true
        },
        orderBy: { code: 'asc' }
    });

    if (!journal) throw new Error('Không tìm thấy loại chứng từ Phiếu Thu (Type: CASH) để ghi sổ.');

    // 3. Create Journal Entry and Update Receipt in Transaction
    return prisma.$transaction(async (tx) => {
        // A. Generate Journal Entry Number (can be same as Receipt or new sequence)
        // Here we use the Receipt Number as reference, but generate a new GL Entry Number
        // Or we could reuse the journal ID logic if we want them to match exactly.
        // Let's generate a separate Journal Entry number to be safe and consistent with GL.
        // NOTE: This calls `generateEntryNumber` which is separate from `cashReceipt` creation.
        // If we want to link them tightly, we can.

        // Create Journal Entry
        // Create Journal Entry
        // We construct the lines manually from details if available, else fallback to header
        let lines: any[] = [];

        if (receipt.details && receipt.details.length > 0) {
            // Map details to lines
            // Strategy: Each detail line = 1 Debit + 1 Credit in GL? 
            // Or Group Debits / Credits?
            // Simplest: Each detail line generates a Debit and a Credit pair (or just the split part).
            // Usually for Cash Receipt: 
            // Debit Cash (111) - Total or Split?
            // Credit Revenue/Customer (131, 511) - Split

            // APPROACH: We will create a Debit line and a Credit line for EACH detail row.
            // This ensures full granular tracking.

            receipt.details.forEach(detail => {
                // Debit Line
                lines.push({
                    accountId: detail.debitAccountId || receipt.debitAccountId,
                    debit: detail.amount,
                    credit: new Prisma.Decimal(0),
                    description: detail.description,
                    partnerId: detail.partnerId
                });

                // Credit Line
                lines.push({
                    accountId: detail.creditAccountId || receipt.creditAccountId,
                    debit: new Prisma.Decimal(0),
                    credit: detail.amount,
                    description: detail.description,
                    partnerId: detail.partnerId
                });
            });
        } else {
            // Fallback to legacy single-line behavior
            lines = [
                {
                    accountId: receipt.debitAccountId, // Debit CASH
                    debit: receipt.amount,
                    credit: new Prisma.Decimal(0),
                    description: receipt.description,
                    partnerId: receipt.partnerId
                },
                {
                    accountId: receipt.creditAccountId, // Credit REVENUE/RECEIVABLE
                    debit: new Prisma.Decimal(0),
                    credit: receipt.amount,
                    description: receipt.description,
                    partnerId: receipt.partnerId
                }
            ];
        }

        // Using `createJournalEntry` service might be tricky inside a transaction if it handles its own transaction.
        // Let's stick to using Prisma tx directly here for safety.

        // Get next number for Journal Entry
        // Note: generateEntryNumber uses a separate transaction, so we can't easily wrap it in THIS transaction 
        // unless we refactor it. For now, we'll accept a small gap risk or pull logic here.
        // Minimal risk: we'll just call it.

        // We need the ID of the Journal for the GL Entry.
        // It could be the same CR journal or a General Journal.
        // Usually, specialized journals post to themselves.

        const entryNumber = await generateEntryNumber({ journalId: journal.id, date: receipt.date });

        const journalEntry = await tx.journalEntry.create({
            data: {
                // companyId inferred from Journal
                journalId: journal.id,
                entryNumber: entryNumber,
                date: receipt.date,
                postingDate: receipt.date,
                description: receipt.description,
                descriptionEN: receipt.descriptionEN,
                reference: receipt.receiptNumber, // Link back to receipt number
                status: 'POSTED',
                createdBy: postedBy,
                postedBy: postedBy,
                postedAt: new Date(),
                totalDebit: receipt.amount,
                totalCredit: receipt.amount,
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

        // B. Update Cash Receipt
        const updatedReceipt = await tx.cashReceipt.update({
            where: { id },
            data: {
                status: 'POSTED',
                postedBy,
                postedAt: new Date(),
                journalEntryId: journalEntry.id
            }
        });

        // Update Accounts balance (optional if we calculate on the fly, but good for caching)
        // For now we rely on GL calculation on the fly.

        return updatedReceipt;
    });
}

/**
 * Unpost Cash Receipt
 * - Deletes the associated Journal Entry (and its lines)
 * - Resets status to DRAFT
 */
export async function unpostCashReceipt(id: string) {
    const receipt = await prisma.cashReceipt.findUnique({
        where: { id }
    });

    if (!receipt) throw new Error('Không tìm thấy phiếu thu');
    if (receipt.status !== 'POSTED') throw new Error('Phiếu chưa ghi sổ, không cần bỏ ghi.');

    return prisma.$transaction(async (tx) => {
        // 1. Reset receipt status to DRAFT and clear journalEntryId FIRST
        const updatedReceipt = await tx.cashReceipt.update({
            where: { id },
            data: {
                status: 'DRAFT',
                postedBy: null,
                postedAt: null,
                journalEntryId: null
            }
        });

        // 2. Delete journal entry if exists SECOND
        if (receipt.journalEntryId) {
            await tx.journalEntry.delete({
                where: { id: receipt.journalEntryId }
            });
        }

        return updatedReceipt;
    });
}
