// Product Detail API - PUT and DELETE
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/products/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const {
            name, nameEN, type, unit,
            productCategoryId,
            purchasePrice, salePrice, taxRate,
            inventoryAccountId, cogsAccountId, revenueAccountId
        } = body;

        const existing = await prisma.product.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Sản phẩm không tồn tại' }, { status: 404 });
        }

        const updated = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(nameEN !== undefined && { nameEN: nameEN || null }),
                ...(type && { type }),
                ...(unit !== undefined && { unit: unit || null }),
                ...(productCategoryId !== undefined && { productCategoryId: productCategoryId || null }),
                ...(purchasePrice !== undefined && { purchasePrice }),
                ...(salePrice !== undefined && { salePrice }),
                ...(taxRate !== undefined && { taxRate }),
                ...(inventoryAccountId !== undefined && { inventoryAccountId: inventoryAccountId || null }),
                ...(cogsAccountId !== undefined && { cogsAccountId: cogsAccountId || null }),
                ...(revenueAccountId !== undefined && { revenueAccountId: revenueAccountId || null }),
            },
            include: {
                category: { select: { id: true, code: true, name: true } }
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE /api/products/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        // Soft delete
        await prisma.product.update({
            where: { id },
            data: { isActive: false, deletedAt: new Date() }
        });

        return NextResponse.json({ message: 'Đã xóa sản phẩm' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
