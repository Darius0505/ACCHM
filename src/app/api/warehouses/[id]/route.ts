
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/warehouses/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, address, description, parentId } = body;

        const existing = await prisma.warehouse.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Kho/Danh mục không tồn tại' }, { status: 404 });
        }

        if (parentId && parentId === id) {
            return NextResponse.json({ error: 'Không thể chọn chính mình làm kho cha' }, { status: 400 });
        }

        const updated = await prisma.warehouse.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(address !== undefined && { address }),
                ...(description !== undefined && { description }),
                ...(parentId !== undefined && { parentId: parentId || null }),
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating warehouse:', error);
        return NextResponse.json({ error: 'Failed to update warehouse' }, { status: 500 });
    }
}

// DELETE /api/warehouses/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check children
        const childrenCount = await prisma.warehouse.count({ where: { parentId: id, isActive: true } });
        if (childrenCount > 0) {
            return NextResponse.json({ error: 'Không thể xóa kho đang có kho con' }, { status: 400 });
        }

        // Future: Check stock/transactions
        // const stockCount = await prisma.stock.count({ where: { warehouseId: id } }); ...

        await prisma.warehouse.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({ message: 'Đã xóa kho' });
    } catch (error) {
        console.error('Error deleting warehouse:', error);
        return NextResponse.json({ error: 'Failed to delete warehouse' }, { status: 500 });
    }
}
