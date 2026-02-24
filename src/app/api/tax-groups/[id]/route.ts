
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/tax-groups/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { code, name, description, isActive } = body;

        const existing = await prisma.taxGroup.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Nhóm thuế không tồn tại' }, { status: 404 });
        }

        const data: any = {};
        if (code) data.code = code.toUpperCase();
        if (name) data.name = name;
        if (description !== undefined) data.description = description; // Allow clear
        if (isActive !== undefined) data.isActive = isActive;

        const updated = await prisma.taxGroup.update({
            where: { id },
            data
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating tax group:', error);
        return NextResponse.json({ error: 'Failed to update tax group' }, { status: 500 });
    }
}

// DELETE /api/tax-groups/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check usage in TaxRate?
        const usageCount = await prisma.taxRate.count({ where: { taxGroupId: id, isActive: true } });
        if (usageCount > 0) {
            return NextResponse.json({ error: 'Không thể xóa nhóm thuế đang được sử dụng bởi các mức thuế suất' }, { status: 400 });
        }

        // Soft delete
        await prisma.taxGroup.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({ message: 'Đã xóa nhóm thuế' });
    } catch (error) {
        console.error('Error deleting tax group:', error);
        return NextResponse.json({ error: 'Failed to delete tax group' }, { status: 500 });
    }
}
