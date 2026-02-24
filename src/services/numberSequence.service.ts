/**
 * Number Sequence Service
 * Handles auto-incrementing document numbers for journal entries, invoices, etc.
 * Format: PREFIX-YYYY-NNNNN (e.g., GJ-2026-00001)
 */

import prisma from '../lib/prisma';

// const prisma = new PrismaClient();

interface GenerateNumberOptions {
    journalId: string;
    date?: Date;
}

/**
 * Get the next document number for a journal
 * Thread-safe using database transaction
 */
export async function generateEntryNumber(options: GenerateNumberOptions): Promise<string> {
    const { journalId, date = new Date() } = options;
    const year = date.getFullYear();

    // Get journal info and increment number in a transaction
    const result = await prisma.$transaction(async (tx) => {
        const journal = await tx.journal.findUnique({
            where: { id: journalId }
        });

        if (!journal) {
            throw new Error(`Journal not found: ${journalId}`);
        }

        // Get current next number
        const nextNumber = journal.nextNumber;

        // Increment for next use
        await tx.journal.update({
            where: { id: journalId },
            data: { nextNumber: nextNumber + 1 }
        });

        return {
            prefix: journal.prefix || journal.code,
            number: nextNumber,
            template: journal.template || '{PREFIX}-{YYYY}-{NNNNN}',
            padding: journal.padding || 5
        };
    });

    // Format using template
    let formatted = result.template;
    const prefix = result.prefix || '';
    const numberStr = String(result.number).padStart(result.padding, '0');

    formatted = formatted.replace('{PREFIX}', prefix);
    formatted = formatted.replace('{YYYY}', String(year));
    formatted = formatted.replace('{YY}', String(year).slice(-2));
    formatted = formatted.replace('{MM}', String(date.getMonth() + 1).padStart(2, '0'));
    formatted = formatted.replace('{DD}', String(date.getDate()).padStart(2, '0'));
    formatted = formatted.replace(/{N+}/, numberStr); // Match {NNNNN} or similar

    // Fallback if no {N...} placeholder found but template exists (append at end)
    if (!result.template.includes('{N')) {
        formatted += numberStr;
    }

    return formatted;
}

/**
 * Preview the next document number without incrementing
 */
export async function previewEntryNumber(options: GenerateNumberOptions): Promise<string> {
    const { journalId, date = new Date() } = options;
    const year = date.getFullYear();

    const journal = await prisma.journal.findUnique({
        where: { id: journalId }
    });

    if (!journal) {
        throw new Error(`Journal not found: ${journalId}`);
    }

    const nextNumber = journal.nextNumber;
    const padding = journal.padding || 5;
    const template = journal.template || '{PREFIX}-{YYYY}-{NNNNN}';
    const numStr = String(nextNumber).padStart(padding, '0');
    const prefix = journal.prefix || journal.code;

    let formatted = template;
    formatted = formatted.replace('{PREFIX}', prefix);
    formatted = formatted.replace('{YYYY}', String(year));
    formatted = formatted.replace('{YY}', String(year).slice(-2));
    formatted = formatted.replace('{MM}', String(date.getMonth() + 1).padStart(2, '0'));
    formatted = formatted.replace('{DD}', String(date.getDate()).padStart(2, '0'));
    formatted = formatted.replace(/{N+}/, numStr);

    if (!template.includes('{N')) {
        formatted += numStr;
    }

    return formatted;
}

/**
 * Parse a document number to extract components
 */
export function parseEntryNumber(entryNumber: string): {
    prefix: string;
    year: number;
    sequence: number;
} | null {
    const match = entryNumber.match(/^([A-Z]+)-(\d{4})-(\d+)$/);
    if (!match) return null;

    return {
        prefix: match[1],
        year: parseInt(match[2]),
        sequence: parseInt(match[3])
    };
}

/**
 * Reset sequence for a journal (typically at year start)
 */
export async function resetJournalSequence(journalId: string, startNumber: number = 1): Promise<void> {
    await prisma.journal.update({
        where: { id: journalId },
        data: { nextNumber: startNumber }
    });
}
