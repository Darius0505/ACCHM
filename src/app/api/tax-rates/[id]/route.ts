
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/tax-rates/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { taxGroupId, code, name, rate, isActive } = body;

        const existing = await prisma.taxRate.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Mức thuế không tồn tại' }, { status: 404 });
        }

        const data: any = {};
        if (taxGroupId) data.taxGroupId = taxGroupId;
        if (code) data.code = code.toUpperCase();
        if (name) data.name = name;
        if (rate !== undefined) data.rate = rate;
        if (isActive !== undefined) data.isActive = isActive;

        const updated = await prisma.taxRate.update({
            where: { id },
            data
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating tax rate:', error);
        return NextResponse.json({ error: 'Failed to update tax rate' }, { status: 500 });
    }
}

// DELETE /api/tax-rates/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Soft delete
        await prisma.taxRate.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({ message: 'Đã xóa mức thuế' });
    } catch (error) {
        console.error('Error deleting tax rate:', error);
        return NextResponse.json({ error: 'Failed to delete tax rate' }, { status: 500 });
    }
}
