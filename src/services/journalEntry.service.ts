/**
 * Journal Entry Service
 * Core business logic for creating, updating, posting, and cancelling journal entries
 */

import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';
import { generateEntryNumber } from './numberSequence.service';

// const prisma = new PrismaClient();

// Types
export interface JournalEntryLineInput {
    accountId: string;
    description?: string;
    debit: number;
    credit: number;
    partnerId?: string;
}

export interface CreateJournalEntryInput {
    journalId: string;
    date: Date;
    postingDate?: Date;
    reference?: string;
    description: string;
    descriptionEN?: string;
    descriptionJP?: string;
    lines: JournalEntryLineInput[];
    createdBy: string;
}

export interface UpdateJournalEntryInput {
    date?: Date;
    postingDate?: Date;
    reference?: string;
    description?: string;
    descriptionEN?: string;
    descriptionJP?: string;
    lines?: JournalEntryLineInput[];
}

// Validation helpers
export function validateBalanced(lines: JournalEntryLineInput[]): { valid: boolean; difference: number } {
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);

    // Allow for small floating point differences
    return {
        valid: difference < 0.01,
        difference
    };
}

export async function validateAccounts(lines: JournalEntryLineInput[], companyId: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const accountIds = Array.from(new Set(lines.map(l => l.accountId)));

    const accounts = await prisma.account.findMany({
        where: {
            id: { in: accountIds },
            companyId
        },
        select: { id: true, code: true, isPosting: true, isActive: true }
    });

    const accountMap = new Map(accounts.map(a => [a.id, a]));

    for (const line of lines) {
        const account = accountMap.get(line.accountId);
        if (!account) {
            errors.push(`Account not found: ${line.accountId}`);
        } else if (!account.isPosting) {
            errors.push(`Account ${account.code} is not a posting account`);
        } else if (!account.isActive) {
            errors.push(`Account ${account.code} is inactive`);
        }
    }

    return { valid: errors.length === 0, errors };
}

export async function validatePeriod(date: Date, companyId: string): Promise<{ valid: boolean; error?: string }> {
    // Find the fiscal year and period for this date
    const fiscalYear = await prisma.fiscalYear.findFirst({
        where: {
            companyId,
            startDate: { lte: date },
            endDate: { gte: date }
        }
    });

    if (!fiscalYear) {
        return { valid: false, error: 'No fiscal year found for this date' };
    }

    if (fiscalYear.status !== 'OPEN') {
        return { valid: false, error: `Fiscal year is ${fiscalYear.status}` };
    }

    const period = await prisma.accountingPeriod.findFirst({
        where: {
            fiscalYearId: fiscalYear.id,
            startDate: { lte: date },
            endDate: { gte: date }
        }
    });

    if (period && period.status !== 'OPEN') {
        return { valid: false, error: `Accounting period is ${period.status}` };
    }

    return { valid: true };
}

// CRUD Operations
export async function createJournalEntry(input: CreateJournalEntryInput) {
    const { journalId, date, postingDate = date, reference, description, descriptionEN, descriptionJP, lines, createdBy } = input;

    // Get journal to find company
    const journal = await prisma.journal.findUnique({
        where: { id: journalId },
        select: { companyId: true }
    });

    if (!journal) {
        throw new Error('Journal not found');
    }

    // Validate balanced
    const balanceCheck = validateBalanced(lines);
    if (!balanceCheck.valid) {
        throw new Error(`Entry is not balanced. Difference: ${balanceCheck.difference}`);
    }

    // Validate accounts
    const accountCheck = await validateAccounts(lines, journal.companyId);
    if (!accountCheck.valid) {
        throw new Error(`Invalid accounts: ${accountCheck.errors.join(', ')}`);
    }

    // Generate entry number
    const entryNumber = await generateEntryNumber({ journalId, date });

    // Calculate totals
    const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);

    // Create entry with lines
    const entry = await prisma.journalEntry.create({
        data: {
            journalId,
            entryNumber,
            date,
            postingDate,
            reference,
            description,
            descriptionEN,
            descriptionJP,
            status: 'DRAFT',
            totalDebit: new Prisma.Decimal(totalDebit),
            totalCredit: new Prisma.Decimal(totalCredit),
            createdBy,
            lines: {
                create: lines.map((line, index) => ({
                    lineNumber: index + 1,
                    accountId: line.accountId,
                    description: line.description,
                    debit: new Prisma.Decimal(line.debit || 0),
                    credit: new Prisma.Decimal(line.credit || 0),
                    partnerId: line.partnerId
                }))
            }
        },
        include: {
            lines: {
                include: {
                    account: { select: { code: true, name: true } }
                }
            },
            journal: { select: { code: true, name: true } }
        }
    });

    return entry;
}

export async function updateJournalEntry(id: string, input: UpdateJournalEntryInput) {
    // Check if entry is draft
    const existing = await prisma.journalEntry.findUnique({
        where: { id },
        include: { journal: { select: { companyId: true } } }
    });

    if (!existing) {
        throw new Error('Journal entry not found');
    }

    if (existing.status !== 'DRAFT') {
        throw new Error('Can only edit draft entries');
    }

    const { lines, ...updateData } = input;

    // If updating lines, validate
    if (lines) {
        const balanceCheck = validateBalanced(lines);
        if (!balanceCheck.valid) {
            throw new Error(`Entry is not balanced. Difference: ${balanceCheck.difference}`);
        }

        const accountCheck = await validateAccounts(lines, existing.journal.companyId);
        if (!accountCheck.valid) {
            throw new Error(`Invalid accounts: ${accountCheck.errors.join(', ')}`);
        }

        // Delete existing lines and create new ones
        await prisma.journalEntryLine.deleteMany({
            where: { entryId: id }
        });

        const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
        const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);

        await prisma.journalEntry.update({
            where: { id },
            data: {
                ...updateData,
                totalDebit: new Prisma.Decimal(totalDebit),
                totalCredit: new Prisma.Decimal(totalCredit),
                lines: {
                    create: lines.map((line, index) => ({
                        lineNumber: index + 1,
                        accountId: line.accountId,
                        description: line.description,
                        debit: new Prisma.Decimal(line.debit || 0),
                        credit: new Prisma.Decimal(line.credit || 0),
                        partnerId: line.partnerId
                    }))
                }
            }
        });
    } else {
        await prisma.journalEntry.update({
            where: { id },
            data: updateData
        });
    }

    return getJournalEntry(id);
}

export async function deleteJournalEntry(id: string) {
    const existing = await prisma.journalEntry.findUnique({
        where: { id }
    });

    if (!existing) {
        throw new Error('Journal entry not found');
    }

    if (existing.status !== 'DRAFT') {
        throw new Error('Can only delete draft entries');
    }

    await prisma.journalEntry.delete({
        where: { id }
    });

    return { success: true };
}

export async function getJournalEntry(id: string) {
    const entry = await prisma.journalEntry.findUnique({
        where: { id },
        include: {
            lines: {
                include: {
                    account: { select: { id: true, code: true, name: true, nameEN: true } },
                    partner: { select: { id: true, code: true, name: true } }
                },
                orderBy: { lineNumber: 'asc' }
            },
            journal: { select: { id: true, code: true, name: true, nameEN: true } }
        }
    });

    return entry;
}

export async function listJournalEntries(filters: {
    companyId: string;
    journalId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
    dataFilter?: Record<string, any>;
}) {
    const { companyId, journalId, status, startDate, endDate, search, page = 1, limit = 20, dataFilter } = filters;

    const where: Prisma.JournalEntryWhereInput = {
        journal: { companyId },
        ...dataFilter,
        ...(journalId && { journalId }),
        ...(status && { status }),
        ...(startDate && endDate && {
            date: { gte: startDate, lte: endDate }
        }),
        ...(search && {
            OR: [
                { entryNumber: { contains: search } },
                { description: { contains: search } },
                { reference: { contains: search } }
            ]
        })
    };

    const [entries, total] = await Promise.all([
        prisma.journalEntry.findMany({
            where,
            include: {
                journal: { select: { code: true, name: true } }
            },
            orderBy: { date: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.journalEntry.count({ where })
    ]);

    return {
        entries,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

// Post & Cancel
export async function postJournalEntry(id: string, userId: string) {
    const entry = await prisma.journalEntry.findUnique({
        where: { id },
        include: { journal: { select: { companyId: true } } }
    });

    if (!entry) {
        throw new Error('Journal entry not found');
    }

    if (entry.status !== 'DRAFT') {
        throw new Error('Can only post draft entries');
    }

    // Validate period is open
    const periodCheck = await validatePeriod(entry.postingDate, entry.journal.companyId);
    if (!periodCheck.valid) {
        throw new Error(periodCheck.error || 'Period is closed');
    }

    const updated = await prisma.journalEntry.update({
        where: { id },
        data: {
            status: 'POSTED',
            postedBy: userId,
            postedAt: new Date()
        }
    });

    return updated;
}

export async function cancelJournalEntry(id: string, userId: string) {
    const entry = await prisma.journalEntry.findUnique({
        where: { id },
        include: {
            lines: true,
            journal: { select: { companyId: true } }
        }
    });

    if (!entry) {
        throw new Error('Journal entry not found');
    }

    if (entry.status !== 'POSTED') {
        throw new Error('Can only cancel posted entries');
    }

    // Validate period is open
    const periodCheck = await validatePeriod(entry.postingDate, entry.journal.companyId);
    if (!periodCheck.valid) {
        throw new Error(periodCheck.error || 'Period is closed');
    }

    // Update status to cancelled
    const updated = await prisma.journalEntry.update({
        where: { id },
        data: {
            status: 'CANCELLED',
            cancelledBy: userId,
            cancelledAt: new Date()
        }
    });

    // Create reversal entry
    const reversalNumber = await generateEntryNumber({ journalId: entry.journalId, date: new Date() });

    await prisma.journalEntry.create({
        data: {
            journalId: entry.journalId,
            entryNumber: reversalNumber,
            date: new Date(),
            postingDate: new Date(),
            reference: entry.entryNumber,
            description: `Reversal of ${entry.entryNumber}`,
            descriptionEN: `Reversal of ${entry.entryNumber}`,
            status: 'POSTED',
            totalDebit: entry.totalCredit, // Swap
            totalCredit: entry.totalDebit, // Swap
            createdBy: userId,
            postedBy: userId,
            postedAt: new Date(),
            lines: {
                create: entry.lines.map((line, index) => ({
                    lineNumber: index + 1,
                    accountId: line.accountId,
                    description: `Reversal: ${line.description || ''}`,
                    debit: line.credit, // Swap
                    credit: line.debit, // Swap
                    partnerId: line.partnerId
                }))
            }
        }
    });

    return updated;
}
