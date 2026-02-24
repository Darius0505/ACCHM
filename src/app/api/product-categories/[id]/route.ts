// Product Categories Detail API - PUT (update) and DELETE (check usage)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/product-categories/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, description, parentId } = body;

        const existing = await prisma.productCategory.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Danh mục không tồn tại' }, { status: 404 });
        }

        // Prevent circular dependency if parentId is updated
        if (parentId && parentId === id) {
            return NextResponse.json({ error: 'Không thể chọn chính mình làm danh mục cha' }, { status: 400 });
        }

        const updated = await prisma.productCategory.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(parentId !== undefined && { parentId: parentId || null }),
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating product category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// DELETE /api/product-categories/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check for children categories
        const childrenCount = await prisma.productCategory.count({ where: { parentId: id, isActive: true } });
        if (childrenCount > 0) {
            return NextResponse.json({ error: 'Không thể xóa danh mục đang có danh mục con' }, { status: 400 });
        }

        // Check for usage in products
        const productsCount = await prisma.product.count({ where: { productCategoryId: id, isActive: true } });
        if (productsCount > 0) {
            return NextResponse.json({ error: 'Không thể xóa danh mục đang có sản phẩm' }, { status: 400 });
        }

        // Soft delete (or hard delete if safe? sticking to soft delete per plan)
        // Check plan: "soft delete" was generally implied for system, but for categories hard delete might be cleaner if unused.
        // Let's stick to soft delete `isActive: false` as per Schema default.

        await prisma.productCategory.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({ message: 'Đã xóa danh mục' });
    } catch (error) {
        console.error('Error deleting product category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
