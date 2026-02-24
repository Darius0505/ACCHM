// Partner Detail API - PUT (update) and DELETE (soft delete)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/partners/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const {
            name, nameEN, type, partnerTypeId,
            taxCode, address, phone, email, contactPerson,
            paymentTermDays, creditLimit
        } = body;

        const existing = await prisma.partner.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Đối tượng không tồn tại' }, { status: 404 });
        }

        const updated = await prisma.partner.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(nameEN !== undefined && { nameEN: nameEN || null }),
                ...(type && { type }),
                ...(partnerTypeId !== undefined && { partnerTypeId: partnerTypeId || null }),
                ...(taxCode !== undefined && { taxCode: taxCode || null }),
                ...(address !== undefined && { address: address || null }),
                ...(phone !== undefined && { phone: phone || null }),
                ...(email !== undefined && { email: email || null }),
                ...(contactPerson !== undefined && { contactPerson: contactPerson || null }),
                ...(paymentTermDays !== undefined && { paymentTermDays }),
                ...(creditLimit !== undefined && { creditLimit }),
            },
            include: {
                partnerType: {
                    select: { id: true, code: true, name: true, nature: true }
                }
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating partner:', error);
        return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
    }
}

// DELETE /api/partners/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const existing = await prisma.partner.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Đối tượng không tồn tại' }, { status: 404 });
        }

        // Soft delete
        await prisma.partner.update({
            where: { id },
            data: { isActive: false, deletedAt: new Date() }
        });

        return NextResponse.json({ message: 'Đã xóa đối tượng' });
    } catch (error) {
        console.error('Error deleting partner:', error);
        return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
    }
}
