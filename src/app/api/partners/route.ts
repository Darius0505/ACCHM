import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/partners
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const companyId = user.companyId;

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // CUSTOMER, VENDOR, EMPLOYEE, BANK, OTHER
        const partnerTypeId = searchParams.get('partnerTypeId');
        const search = searchParams.get('search');

        const where: any = {
            companyId,
            isActive: true,
        };

        if (type) where.type = type;
        if (partnerTypeId) where.partnerTypeId = partnerTypeId;
        if (search) {
            where.OR = [
                { code: { contains: search } },
                { name: { contains: search } },
                { taxCode: { contains: search } },
                { phone: { contains: search } },
            ];
        }

        const partners = await prisma.partner.findMany({
            where,
            include: {
                partnerType: {
                    select: { id: true, code: true, name: true, nature: true }
                }
            },
            orderBy: [{ type: 'asc' }, { code: 'asc' }],
        });

        return NextResponse.json(partners);
    } catch (error) {
        console.error('Error fetching partners:', error);
        return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
    }
}

// POST /api/partners
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const companyId = user.companyId;

        const body = await request.json();
        const {
            code, name, nameEN, type, partnerTypeId,
            taxCode, address, phone, email, contactPerson,
            paymentTermDays, creditLimit,
            receivableAccountId, payableAccountId
        } = body;

        if (!code || !name || !type) {
            return NextResponse.json({ error: 'Mã, tên và loại đối tượng là bắt buộc' }, { status: 400 });
        }

        // Check duplicate
        const existing = await prisma.partner.findUnique({
            where: { companyId_code: { companyId, code } }
        });
        if (existing) {
            return NextResponse.json({ error: `Mã đối tượng '${code}' đã tồn tại` }, { status: 400 });
        }

        const partner = await prisma.partner.create({
            data: {
                companyId,
                code,
                name,
                nameEN: nameEN || null,
                type,
                partnerTypeId: partnerTypeId || null,
                taxCode: taxCode || null,
                address: address || null,
                phone: phone || null,
                email: email || null,
                contactPerson: contactPerson || null,
                paymentTermDays: paymentTermDays || 30,
                creditLimit: creditLimit || null,
                receivableAccountId: receivableAccountId || null,
                payableAccountId: payableAccountId || null,
            },
            include: {
                partnerType: {
                    select: { id: true, code: true, name: true, nature: true }
                }
            }
        });

        return NextResponse.json(partner, { status: 201 });
    } catch (error) {
        console.error('Error creating partner:', error);
        return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
    }
}
