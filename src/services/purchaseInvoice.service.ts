import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { generateEntryNumber } from './numberSequence.service';
import { createJournalEntry } from './journalEntry.service';

// Types
interface PurchaseInvoiceListInput {
    companyId: string;
    page?: number;
    limit?: number;
    partnerId?: string;
    status?: string;
}

interface PurchaseInvoiceLine {
    description: string;
    accountId: string; // Expense/Asset account (152, 153, 642, etc.)
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

interface PurchaseInvoiceCreateInput {
    companyId: string;
    partnerId: string;
    vendorInvoiceNumber?: string; // Vendor's invoice number
    date: Date;
    dueDate: Date;
    description?: string;
    lines: PurchaseInvoiceLine[];
    createdBy: string;
}

// List Purchase Invoices
export async function listPurchaseInvoices(input: PurchaseInvoiceListInput & { dataFilter?: Record<string, any> }) {
    const { companyId, page = 1, limit = 20, partnerId, status, dataFilter } = input;

    const where: Prisma.InvoiceWhereInput = {
        companyId,
        type: 'PURCHASE',
        ...dataFilter,
    };

    if (partnerId) where.partnerId = partnerId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
        prisma.invoice.findMany({
            where,
            include: {
                partner: true,
                lines: true
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { date: 'desc' }
        }),
        prisma.invoice.count({ where })
    ]);

    return { items, total };
}

// Get Single Invoice
export async function getPurchaseInvoice(id: string) {
    return prisma.invoice.findUnique({
        where: { id },
        include: {
            partner: true,
            lines: {
                include: { account: true }
            },
            journalEntry: true
        }
    });
}

// Create Purchase Invoice (Draft)
export async function createPurchaseInvoice(data: PurchaseInvoiceCreateInput) {
    const { lines, ...invoiceData } = data;

    // Find AP account (331) - required for Invoice model
    const apAccount = await prisma.account.findFirst({
        where: { code: { startsWith: '331' }, isPosting: true }
    });

    if (!apAccount) throw new Error('Không tìm thấy tài khoản phải trả (331)');

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    const processedLines = lines.map((line, index) => {
        const amount = line.quantity * line.unitPrice;
        const lineTax = amount * (line.taxRate / 100);
        subtotal += amount;
        taxAmount += lineTax;

        return {
            lineNumber: index + 1,
            description: line.description,
            accountId: line.accountId,
            quantity: new Prisma.Decimal(line.quantity),
            unitPrice: new Prisma.Decimal(line.unitPrice),
            taxRate: new Prisma.Decimal(line.taxRate),
            amount: new Prisma.Decimal(amount),
            taxAmount: new Prisma.Decimal(lineTax)
        };
    });

    const totalAmount = subtotal + taxAmount;

    return prisma.invoice.create({
        data: {
            ...invoiceData,
            type: 'PURCHASE',
            invoiceNumber: 'DRAFT',
            accountId: apAccount.id, // Required - AP control account
            status: 'DRAFT',
            paymentStatus: 'UNPAID',
            subtotal: new Prisma.Decimal(subtotal),
            taxAmount: new Prisma.Decimal(taxAmount),
            totalAmount: new Prisma.Decimal(totalAmount),
            balanceAmount: new Prisma.Decimal(totalAmount),
            lines: {
                create: processedLines
            }
        },
        include: {
            partner: true,
            lines: true
        }
    });
}

// Post Purchase Invoice
export async function postPurchaseInvoice(id: string, postedBy: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            partner: true,
            lines: { include: { account: true } },
            company: true
        }
    });

    if (!invoice) throw new Error('Hóa đơn không tồn tại');
    if (invoice.status !== 'DRAFT') throw new Error('Chỉ có thể ghi sổ hóa đơn nháp');

    // Find purchase journal first (needed for number generation)
    const journal = await prisma.journal.findFirst({
        where: { companyId: invoice.companyId, code: { in: ['MH', 'PURCHASE', 'NK', 'GJ'] } }
    });

    if (!journal) throw new Error('Không tìm thấy sổ nhật ký mua hàng');

    // Generate invoice number using the purchase journal
    const invoiceNumber = await generateEntryNumber({ journalId: journal.id, date: invoice.date });

    // Find AP account (331) and VAT account (133)
    const apAccount = await prisma.account.findFirst({
        where: { code: { startsWith: '331' }, isPosting: true }
    });
    const vatAccount = await prisma.account.findFirst({
        where: { code: { startsWith: '133' }, isPosting: true }
    });

    if (!apAccount) throw new Error('Không tìm thấy tài khoản phải trả (331)');

    // Build journal entry lines
    // Credit 331 (AP) for total
    // Debit expense/asset accounts for subtotals
    // Debit 133 (VAT input) for tax
    const jeLines: { accountId: string; debit: number; credit: number; description: string }[] = [];

    // Credit AP
    jeLines.push({
        accountId: apAccount.id,
        debit: 0,
        credit: Number(invoice.totalAmount),
        description: `Phải trả NCC - ${invoice.partner.name}`
    });

    // Debit expense/asset accounts
    for (const line of invoice.lines) {
        jeLines.push({
            accountId: line.accountId,
            debit: Number(line.amount),
            credit: 0,
            description: line.description
        });
    }

    // Debit VAT input if any
    if (vatAccount && Number(invoice.taxAmount) > 0) {
        jeLines.push({
            accountId: vatAccount.id,
            debit: Number(invoice.taxAmount),
            credit: 0,
            description: 'Thuế GTGT đầu vào'
        });
    }



    // Create and post journal entry
    const journalEntry = await createJournalEntry({
        journalId: journal.id,
        date: invoice.date,
        description: `Hóa đơn mua hàng ${invoiceNumber} - ${invoice.partner.name}`,
        lines: jeLines,
        createdBy: postedBy
    });

    // Update invoice
    return prisma.invoice.update({
        where: { id },
        data: {
            invoiceNumber,
            status: 'POSTED',
            postedAt: new Date(),
            postedBy,
            journalEntryId: journalEntry.id
        },
        include: { partner: true, lines: true }
    });
}

export const purchaseInvoiceService = {
    create: createPurchaseInvoice,
    getOne: getPurchaseInvoice,
    getAll: listPurchaseInvoices,
    post: postPurchaseInvoice,
};
