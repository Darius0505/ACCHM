
import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';
import { generateEntryNumber } from './numberSequence.service';

export interface PaymentAllocationInput {
    invoiceId: string;
    amount: number;
}

export interface CustomerPaymentInput {
    companyId: string;
    date: Date;
    partnerId: string;
    amount: number;
    paymentMethod: 'CASH' | 'BANK'; // For now simple enum
    bankAccountId?: string; // If BANK
    description?: string;
    allocations: PaymentAllocationInput[];
    createdBy: string;
}

/**
 * List Customer Payments
 */
export async function listCustomerPayments(filters: any) {
    const { companyId, partnerId, page = 1, limit = 20, dataFilter } = filters;
    const skip = (page - 1) * limit;

    return prisma.payment.findMany({
        where: {
            companyId,
            type: 'RECEIPT', // Assuming this model covers both AP and AR payments
            ...dataFilter,
            ...(partnerId ? { partnerId } : {})
        },
        include: { partner: true },
        orderBy: { date: 'desc' },
        skip,
        take: limit
    });
}

/**
 * Create Customer Payment (Draft)
 * Note: Real implementation might link to CashReceipt or BankTransaction.
 * For this phase, we assume a separate Payment entity that MIGHT generate those OR acts independently.
 * The plan implies "Customer Payment service" handles "recording payments".
 * Ideally, a Cash Receipt IS a customer payment if cash. 
 * A Bank Transaction (Deposit) IS a customer payment if transfer.
 * 
 * To avoid duplication, `Payment` model acts as a "Remittance Advice" or "Application" layer
 * OR it's the primary record that generates the others.
 * 
 * Given the Schema has `Payment` model and `CashReceipt`/`BankTransaction` models,
 * we should clarify the relationship.
 * 
 * Strategy: 
 * - Create `Payment` record to track the "Application" of funds to invoices.
 * - This `Payment` record will point to a Journal Entry.
 * - If the payment method is CASH, it should effectively overlap with CashReceipt.
 * 
 * For simplicity in this Phase 04:
 * The `Payment` model tracks the logical payment from customer against invoices.
 * When posted:
 * 1. It updates Invoice balances.
 * 2. It creates a Journal Entry (Debit Cash/Bank, Credit AR).
 * 
 * This duplicates CashReceipt/BankTransaction slightly but allows specific invoice allocation.
 * We will proceed with `Payment` model as the driver for AR clearance.
 */
export async function createCustomerPayment(data: CustomerPaymentInput) {
    // 1. Validate Total Allocation
    const totalAllocated = data.allocations.reduce((sum, a) => sum + a.amount, 0);
    if (totalAllocated > data.amount) {
        throw new Error(`Allocated amount (${totalAllocated}) exceeds payment amount (${data.amount})`);
    }

    // 2. Generate Number
    const year = data.date.getFullYear();
    const count = await prisma.payment.count({ where: { companyId: data.companyId, type: 'RECEIPT' } });
    const paymentNumber = `TT-${year}-${(count + 1).toString().padStart(5, '0')}`;

    return prisma.payment.create({
        data: {
            companyId: data.companyId,
            paymentNumber,
            type: 'RECEIPT', // Receipt from customer
            date: data.date,
            partnerId: data.partnerId,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            bankAccountId: data.bankAccountId,
            description: data.description,
            status: 'DRAFT',
            createdBy: data.createdBy,
            allocations: {
                create: data.allocations.map(a => ({
                    invoiceId: a.invoiceId,
                    amount: a.amount
                }))
            }
        },
        include: { allocations: true }
    });
}

/**
 * Post Customer Payment
 */
export async function postCustomerPayment(id: string, postedBy: string) {
    const payment = await prisma.payment.findUnique({
        where: { id },
        include: { allocations: true, partner: true }
    });

    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'DRAFT') throw new Error('Payment already posted');

    // 1. Determine Accounts
    // Debit: Cash (111) or Bank (112)
    // Credit: Receivable (131)

    let debitAccountId: string;

    if (payment.paymentMethod === 'CASH') {
        const acc = await prisma.account.findFirst({ where: { companyId: payment.companyId, code: { startsWith: '111' } } });
        if (!acc) throw new Error('Cash account 111 not found');
        debitAccountId = acc.id;
    } else {
        // Bank
        if (!payment.bankAccountId) throw new Error('Bank account required for BANK method');
        const bankAcc = await prisma.bankAccount.findUnique({ where: { id: payment.bankAccountId } });
        if (!bankAcc || !bankAcc.accountId) throw new Error('Bank account GL link missing');
        debitAccountId = bankAcc.accountId;
    }

    const creditAccountId = payment.partner.receivableAccountId;
    if (!creditAccountId) throw new Error('Partner receivable account missing');

    return prisma.$transaction(async (tx) => {
        // 2. Journal Entry
        // This is a "Receipt", so typically uses Cash Receipt Journal (CR) or Bank Receipt (BR)
        const journalCode = payment.paymentMethod === 'CASH' ? 'CR' : 'BR';
        const journal = await tx.journal.findFirst({ where: { companyId: payment.companyId, code: journalCode } });
        if (!journal) throw new Error(`Journal ${journalCode} not found`);

        const entryNumber = await generateEntryNumber({ journalId: journal.id, date: payment.date });

        const journalEntry = await tx.journalEntry.create({
            data: {
                journalId: journal.id,
                entryNumber,
                date: payment.date,
                postingDate: payment.date,
                description: payment.description || `Thu tiền khách hàng ${payment.paymentNumber}`,
                reference: payment.paymentNumber,
                status: 'POSTED',
                createdBy: postedBy,
                postedBy,
                postedAt: new Date(),
                totalDebit: payment.amount,
                totalCredit: payment.amount,
                payment: { connect: { id: payment.id } },
                lines: {
                    create: [
                        {
                            lineNumber: 1,
                            accountId: debitAccountId,
                            description: payment.description,
                            debit: payment.amount,
                            credit: 0,
                            partnerId: payment.partnerId // Maybe? Usually Cash doesn't track partner, but can.
                        },
                        {
                            lineNumber: 2,
                            accountId: creditAccountId,
                            description: payment.description,
                            debit: 0,
                            credit: payment.amount,
                            partnerId: payment.partnerId
                        }
                    ]
                }
            }
        });

        // 3. Update Invoices
        for (const allocation of payment.allocations) {
            const invoice = await tx.invoice.findUnique({ where: { id: allocation.invoiceId } });
            if (!invoice) continue;

            const newPaid = invoice.paidAmount.toNumber() + allocation.amount.toNumber();
            const newBalance = invoice.totalAmount.toNumber() - newPaid;

            let status = 'UNPAID';
            if (newBalance <= 0) status = 'PAID';
            else if (newPaid > 0) status = 'PARTIAL';

            await tx.invoice.update({
                where: { id: invoice.id },
                data: {
                    paidAmount: newPaid,
                    balanceAmount: newBalance,
                    paymentStatus: status
                }
            });
        }

        return tx.payment.update({
            where: { id },
            data: {
                status: 'POSTED',
                postedBy,
                postedAt: new Date(),
                journalEntryId: journalEntry.id
            }
        });
    });
}
