
import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';
import { generateEntryNumber } from './numberSequence.service';

export interface InvoiceLineInput {
    lineNumber?: number;
    description: string;
    accountId: string; // Revenue account (511)
    quantity: number;
    unitPrice: number;
    taxRate: number; // percentage (0, 5, 8, 10)
}

export interface SalesInvoiceInput {
    companyId: string;
    date: Date;
    dueDate: Date;
    partnerId: string;
    description?: string;
    descriptionEN?: string;
    lines: InvoiceLineInput[];
    createdBy: string;
}

/**
 * List Sales Invoices
 */
export async function listSalesInvoices(filters: any) {
    const { companyId, partnerId, status, paymentStatus, page = 1, limit = 20, dataFilter } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
        companyId,
        type: 'SALES',
        ...dataFilter,
        ...(partnerId ? { partnerId } : {}),
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {})
    };

    const [total, items] = await Promise.all([
        prisma.invoice.count({ where }),
        prisma.invoice.findMany({
            where,
            include: { partner: true },
            orderBy: { date: 'desc' },
            skip,
            take: limit
        })
    ]);

    return { total, items };
}

/**
 * Get Invoice
 */
export async function getSalesInvoice(id: string) {
    return prisma.invoice.findUnique({
        where: { id },
        include: {
            partner: true,
            lines: { include: { account: true } },
            journalEntry: true
        }
    });
}

/**
 * Create Sales Invoice (Draft)
 */
export async function createSalesInvoice(data: SalesInvoiceInput) {
    // 1. Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    const linesToCreate = data.lines.map((line, index) => {
        const amount = line.quantity * line.unitPrice;
        const lineTax = amount * (line.taxRate / 100);

        subtotal += amount;
        taxAmount += lineTax;

        return {
            lineNumber: index + 1,
            description: line.description,
            accountId: line.accountId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            amount,
            taxRate: line.taxRate,
            taxAmount: lineTax
        };
    });

    const totalAmount = subtotal + taxAmount;

    // 2. Generate Invoice Number (HD-YYYY-NNNNN)
    // We reuse generateEntryNumber logic but for invoices if needed, or simple increment.
    // For simplicity, let's look for latest invoice number or use a sequence if available.
    // Here we'll implement a simple counter for now or unique string.
    // Ideally we should have a 'SalesInvoice' journal/sequence type. 
    // Let's assume HD-{Year}-{Sequence}.

    // We can reuse Journal Sequence logic if we create a pseudo-journal for Invoices? 
    // Or just query max invoice number.
    const year = data.date.getFullYear();
    const count = await prisma.invoice.count({
        where: {
            companyId: data.companyId,
            type: 'SALES',
            date: {
                gte: new Date(year, 0, 1),
                lte: new Date(year, 11, 31)
            }
        }
    });
    const seq = (count + 1).toString().padStart(5, '0');
    const invoiceNumber = `HD-${year}-${seq}`;

    // Get default receivable account from partner
    const partner = await prisma.partner.findUnique({ where: { id: data.partnerId } });
    if (!partner) throw new Error('Partner not found');

    const accountId = partner.receivableAccountId || '';
    // Note: If accountId is empty, user must supply it. Validation needed.

    // 3. Create
    return prisma.invoice.create({
        data: {
            companyId: data.companyId,
            invoiceNumber,
            type: 'SALES',
            date: data.date,
            dueDate: data.dueDate,
            partnerId: data.partnerId,
            description: data.description,
            descriptionEN: data.descriptionEN,
            subtotal,
            taxAmount,
            totalAmount,
            balanceAmount: totalAmount, // Initially equal to total
            paidAmount: 0,
            accountId: accountId || 'MISSING_ACCOUNT', // Needs handling
            status: 'DRAFT',
            paymentStatus: 'UNPAID',
            createdBy: data.createdBy,
            lines: {
                create: linesToCreate
            }
        },
        include: { lines: true }
    });
}

/**
 * Post Sales Invoice
 */
export async function postSalesInvoice(id: string, postedBy: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { lines: true, partner: true }
    });

    if (!invoice) throw new Error('Invoice not found');
    if (invoice.status !== 'DRAFT') throw new Error('Invoice already posted');
    if (!invoice.accountId || invoice.accountId === 'MISSING_ACCOUNT') {
        throw new Error('Receivable account (131) is missing');
    }

    // 1. Get Journal (Sales Journal - SJ)
    const journal = await prisma.journal.findFirst({
        where: { companyId: invoice.companyId, code: 'SJ' }
    });
    if (!journal) throw new Error('Sales Journal (SJ) not found');

    // 2. Generate Journal Entry
    const entryNumber = await generateEntryNumber({ journalId: journal.id, date: invoice.date });

    // Lines:
    // 1. Debit Receivable Account (Total Amount)
    // 2. Credit Revenue Account (for each line or grouped) (Subtotal)
    // 3. Credit Tax Account (3331) (Tax Amount)

    return prisma.$transaction(async (tx) => {
        // Find tax account (3331)
        const taxAccount = await tx.account.findFirst({
            where: { companyId: invoice.companyId, code: { startsWith: '3331' } }
        });

        const glLines = [];
        let lineRef = 1;

        // Debit Receivable
        glLines.push({
            lineNumber: lineRef++,
            accountId: invoice.accountId,
            description: `Phải thu khách hàng - ${invoice.invoiceNumber}`,
            debit: invoice.totalAmount,
            credit: new Prisma.Decimal(0),
            partnerId: invoice.partnerId
        });

        // Credit Revenues (Group by account ideally, but here per line is fine for detail)
        invoice.lines.forEach(line => {
            glLines.push({
                lineNumber: lineRef++,
                accountId: line.accountId,
                description: line.description,
                debit: new Prisma.Decimal(0),
                credit: line.amount,
                partnerId: null // Revenue usually doesn't track partner
            });
        });

        // Credit Tax (if any)
        if (invoice.taxAmount.toNumber() > 0) {
            if (!taxAccount) throw new Error('Tax Account 3331 not found');
            glLines.push({
                lineNumber: lineRef++,
                accountId: taxAccount.id,
                description: `Thuế GTGT đầu ra - ${invoice.invoiceNumber}`,
                debit: new Prisma.Decimal(0),
                credit: invoice.taxAmount,
                partnerId: null
            });
        }

        const journalEntry = await tx.journalEntry.create({
            data: {
                journalId: journal.id,
                entryNumber,
                date: invoice.date,
                postingDate: invoice.date,
                description: invoice.description || `Hóa đơn bán hàng ${invoice.invoiceNumber}`,
                reference: invoice.invoiceNumber,
                status: 'POSTED',
                createdBy: postedBy,
                postedBy,
                postedAt: new Date(),
                totalDebit: invoice.totalAmount,
                totalCredit: invoice.totalAmount,
                invoice: { connect: { id: invoice.id } },
                lines: {
                    create: glLines
                }
            }
        });

        const updatedInvoice = await tx.invoice.update({
            where: { id },
            data: {
                status: 'POSTED',
                postedBy,
                postedAt: new Date(),
                journalEntryId: journalEntry.id
            }
        });

        // Update Partner stats if needed (managed dynamically via queries usually)

        return updatedInvoice;
    });
}
