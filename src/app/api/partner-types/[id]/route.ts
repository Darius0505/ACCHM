// Partner Type Detail API
// PUT: Update, DELETE: Soft delete
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/partner-types/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, nameEN, nature, description, parentId, sortOrder } = body;

        const existing = await prisma.partnerType.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Partner type not found' }, { status: 404 });
        }

        if (existing.isSystem && body.code && body.code !== existing.code) {
            return NextResponse.json({ error: 'Không thể đổi mã loại hệ thống' }, { status: 400 });
        }

        const updated = await prisma.partnerType.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(nameEN !== undefined && { nameEN }),
                ...(nature && { nature }),
                ...(description !== undefined && { description }),
                ...(parentId !== undefined && { parentId: parentId || null }),
                ...(sortOrder !== undefined && { sortOrder }),
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating partner type:', error);
        return NextResponse.json({ error: 'Failed to update partner type' }, { status: 500 });
    }
}

// DELETE /api/partner-types/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const existing = await prisma.partnerType.findUnique({
            where: { id },
            include: { _count: { select: { partners: true, children: true } } }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Partner type not found' }, { status: 404 });
        }

        if (existing.isSystem) {
            return NextResponse.json({ error: 'Không thể xóa loại hệ thống' }, { status: 400 });
        }

        if (existing._count.partners > 0) {
            return NextResponse.json({
                error: `Loại đối tượng đang được sử dụng bởi ${existing._count.partners} đối tượng`
            }, { status: 400 });
        }

        if (existing._count.children > 0) {
            return NextResponse.json({
                error: `Loại đối tượng có ${existing._count.children} loại con`
            }, { status: 400 });
        }

        // Soft delete
        await prisma.partnerType.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting partner type:', error);
        return NextResponse.json({ error: 'Failed to delete partner type' }, { status: 500 });
    }
}
