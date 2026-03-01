
import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';

export interface CustomerFilter {
    companyId: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

export interface CustomerInput {
    companyId: string;
    code: string;
    name: string;
    nameEN?: string;
    taxCode?: string;
    address?: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    paymentTermDays?: number;
    creditLimit?: number;
    receivableAccountId?: string; // TK 131
    payableAccountId?: string;    // TK 331 (if needed)
    type?: 'CUSTOMER' | 'BOTH';
}

/**
 * List Customers
 */
export async function listCustomers(filters: CustomerFilter) {
    const { companyId, search, isActive, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.PartnerWhereInput = {
        companyId,
        type: { in: ['CUSTOMER', 'BOTH'] },
        ...(isActive !== undefined ? { isActive } : {}),
        ...(search ? {
            OR: [
                { code: { contains: search } },
                { name: { contains: search } },
                { taxCode: { contains: search } },
                { phone: { contains: search } }
            ]
        } : {})
    };

    const [total, items] = await Promise.all([
        prisma.partner.count({ where }),
        prisma.partner.findMany({
            where,
            orderBy: { createdAt: 'desc' },
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
 * Get Customer by ID
 */
export async function getCustomer(id: string) {
    return prisma.partner.findUnique({
        where: { id }
    });
}

/**
 * Create Customer
 */
export async function createCustomer(data: CustomerInput) {
    // Check code uniqueness
    const existing = await prisma.partner.findUnique({
        where: {
            companyId_code: {
                companyId: data.companyId,
                code: data.code
            }
        }
    });

    if (existing) {
        throw new Error(`Partner code ${data.code} already exists`);
    }

    return prisma.partner.create({
        data: {
            ...data,
            type: data.type || 'CUSTOMER'
        }
    });
}

/**
 * Update Customer
 */
export async function updateCustomer(id: string, data: Partial<CustomerInput>) {
    return prisma.partner.update({
        where: { id },
        data
    });
}

/**
 * Delete Customer (Soft delete)
 */
export async function deleteCustomer(id: string) {
    return prisma.partner.update({
        where: { id },
        data: {
            isActive: false,
            deletedAt: new Date()
        }
    });
}

/**
 * Get Customer Balance (Simple calculation from Journal Lines)
 * In reality, this would likely query a materialized view or perform aggregation
 */
export async function getCustomerBalance(id: string) {
    const partner = await prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new Error('Customer not found');

    // Sum all debit - credit for this partner in receivable account (normally 131)
    // Note: This is an approximation. A proper implementation checks specific account types.
    // For now, we sum up all posted journal lines for this partner.
    const aggregations = await prisma.journalEntryLine.aggregate({
        where: {
            partnerId: id,
            entry: { status: 'POSTED' },
            account: { code: { startsWith: '131' } } // Look specifically for receivables
        },
        _sum: {
            debit: true,
            credit: true
        }
    });

    const debit = aggregations._sum.debit?.toNumber() || 0;
    const credit = aggregations._sum.credit?.toNumber() || 0;

    return debit - credit;
}
