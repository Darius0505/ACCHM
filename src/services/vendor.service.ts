import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

// Types
interface VendorListInput {
    companyId: string;
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}

interface VendorCreateInput {
    companyId: string;
    code: string;
    name: string;
    taxCode?: string;
    address?: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    paymentTermDays?: number;
}

// List Vendors
export async function listVendors(input: VendorListInput) {
    const { companyId, page = 1, limit = 20, search, isActive = true } = input;

    const where: Prisma.PartnerWhereInput = {
        companyId,
        type: 'SUPPLIER',
        isActive
    };

    if (search) {
        where.OR = [
            { code: { contains: search } },
            { name: { contains: search } },
            { taxCode: { contains: search } }
        ];
    }

    const [items, total] = await Promise.all([
        prisma.partner.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { code: 'asc' }
        }),
        prisma.partner.count({ where })
    ]);

    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

// Get Single Vendor
export async function getVendor(id: string) {
    return prisma.partner.findUnique({
        where: { id },
        include: {
            company: true
        }
    });
}

// Create Vendor
export async function createVendor(data: VendorCreateInput) {
    // Check duplicate code
    const existing = await prisma.partner.findFirst({
        where: { companyId: data.companyId, code: data.code }
    });

    if (existing) {
        throw new Error(`Mã NCC ${data.code} đã tồn tại`);
    }

    return prisma.partner.create({
        data: {
            ...data,
            type: 'SUPPLIER',
            isActive: true
        }
    });
}

// Update Vendor
export async function updateVendor(id: string, data: Partial<VendorCreateInput>) {
    return prisma.partner.update({
        where: { id },
        data
    });
}

// Delete Vendor (soft)
export async function deleteVendor(id: string) {
    return prisma.partner.update({
        where: { id },
        data: { isActive: false }
    });
}

// Get Vendor AP Balance
export async function getVendorBalance(vendorId: string): Promise<number> {
    // Sum of unpaid purchase invoice balances
    const result = await prisma.invoice.aggregate({
        where: {
            partnerId: vendorId,
            type: 'PURCHASE',
            status: 'POSTED',
            balanceAmount: { gt: 0 }
        },
        _sum: {
            balanceAmount: true
        }
    });

    return Number(result._sum.balanceAmount) || 0;
}
