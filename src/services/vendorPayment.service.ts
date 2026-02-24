import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { generateEntryNumber } from './numberSequence.service';
import { createJournalEntry } from './journalEntry.service';

// Types
interface VendorPaymentListInput {
    companyId: string;
    page?: number;
    limit?: number;
    partnerId?: string;
}

interface PaymentAllocation {
    invoiceId: string;
    amount: number;
}

interface VendorPaymentCreateInput {
    companyId: string;
    partnerId: string;
    date: Date;
    amount: number;
    paymentMethod: 'CASH' | 'BANK';
    bankAccountId?: string;
    description?: string;
    allocations: PaymentAllocation[];
    createdBy: string;
}

// List Vendor Payments
export async function listVendorPayments(input: VendorPaymentListInput & { dataFilter?: Record<string, any> }) {
    const { companyId, page = 1, limit = 20, partnerId, dataFilter } = input;

    const where: Prisma.PaymentWhereInput = {
        companyId,
        type: 'PAYABLE', // Payments to vendors
        ...dataFilter,
    };

    if (partnerId) where.partnerId = partnerId;

    return prisma.payment.findMany({
        where,
        include: {
            partner: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' }
    });
}

// Create Vendor Payment
export async function createVendorPayment(data: VendorPaymentCreateInput) {
    const { allocations, ...paymentData } = data;

    // Validate allocations
    const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
    if (totalAllocated > data.amount) {
        throw new Error('Tổng phân bổ không được lớn hơn số tiền thanh toán');
    }

    return prisma.payment.create({
        data: {
            ...paymentData,
            type: 'PAYABLE',
            paymentNumber: 'DRAFT',
            status: 'DRAFT',
            amount: new Prisma.Decimal(data.amount),
            allocations: {
                create: allocations.map(a => ({
                    invoiceId: a.invoiceId,
                    amount: new Prisma.Decimal(a.amount)
                }))
            }
        },
        include: {
            partner: true,
            allocations: true
        }
    });
}

// Post Vendor Payment
export async function postVendorPayment(id: string, postedBy: string) {
    const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
            partner: true,
            allocations: { include: { invoice: true } },
            company: true
        }
    });

    if (!payment) throw new Error('Chứng từ không tồn tại');
    if (payment.status !== 'DRAFT') throw new Error('Chỉ có thể ghi sổ chứng từ nháp');
    // Find journal first for number generation
    const journal = await prisma.journal.findFirst({
        where: { companyId: payment.companyId, code: { in: ['TC', 'CASH', 'NH', 'BANK', 'GJ'] } }
    });

    if (!journal) throw new Error('Không tìm thấy sổ nhật ký');

    // Generate payment number using journal
    const paymentNumber = await generateEntryNumber({ journalId: journal.id, date: payment.date });

    // Find accounts
    const apAccount = await prisma.account.findFirst({
        where: { code: { startsWith: '331' }, isPosting: true }
    });

    let offsetAccount;
    if (payment.paymentMethod === 'CASH') {
        offsetAccount = await prisma.account.findFirst({
            where: { code: { startsWith: '111' }, isPosting: true }
        });
    } else {
        // Get bank account's GL account
        const bankAcc = await prisma.bankAccount.findUnique({
            where: { id: payment.bankAccountId! },
            include: { account: true }
        });
        offsetAccount = bankAcc?.account;
    }

    if (!apAccount) throw new Error('Không tìm thấy TK phải trả (331)');
    if (!offsetAccount) throw new Error('Không tìm thấy TK tiền mặt/ngân hàng');

    const journalEntry = await createJournalEntry({
        journalId: journal.id,
        date: payment.date,
        description: `Thanh toán NCC ${paymentNumber} - ${payment.partner.name}`,
        lines: [
            {
                accountId: apAccount.id,
                debit: Number(payment.amount),
                credit: 0,
                description: `Trả nợ NCC - ${payment.partner.name}`
            },
            {
                accountId: offsetAccount.id,
                debit: 0,
                credit: Number(payment.amount),
                description: `Chi tiền - ${payment.partner.name}`
            }
        ],
        createdBy: postedBy
    });

    // Update allocated invoices' balance and status
    for (const alloc of payment.allocations) {
        const invoice = await prisma.invoice.findUnique({ where: { id: alloc.invoiceId } });
        if (!invoice) continue;

        const newBalance = Number(invoice.balanceAmount) - Number(alloc.amount);
        const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIAL';

        await prisma.invoice.update({
            where: { id: alloc.invoiceId },
            data: {
                balanceAmount: new Prisma.Decimal(Math.max(0, newBalance)),
                paymentStatus: newStatus
            }
        });
    }

    // Update payment
    return prisma.payment.update({
        where: { id },
        data: {
            paymentNumber,
            status: 'POSTED',
            postedAt: new Date(),
            postedBy,
            journalEntryId: journalEntry.id
        },
        include: { partner: true }
    });
}
