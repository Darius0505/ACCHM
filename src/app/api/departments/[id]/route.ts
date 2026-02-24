
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';

// PUT /api/departments/[id] — Update department
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'DEPARTMENTS', 'EDIT');
    if (denied) return denied;

    try {
        const { code, name, branchId } = await request.json();

        // Check if department exists
        const existing = await prisma.department.findUnique({ where: { id: params.id } });
        if (!existing) {
            return NextResponse.json({ error: 'Phòng ban không tồn tại' }, { status: 404 });
        }

        const department = await prisma.department.update({
            where: { id: params.id },
            data: {
                ...(code ? { code: code.toUpperCase() } : {}),
                ...(name ? { name } : {}),
                ...(branchId !== undefined ? { branchId: branchId || null } : {}),
            },
        });

        return NextResponse.json(department);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Mã phòng ban đã tồn tại' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/departments/[id] — Delete department (if empty)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'DEPARTMENTS', 'DELETE');
    if (denied) return denied;

    try {
        const department = await prisma.department.findUnique({
            where: { id: params.id },
            include: {
                _count: { select: { users: true } },
            },
        });

        if (!department) {
            return NextResponse.json({ error: 'Phòng ban không tồn tại' }, { status: 404 });
        }

        if (department._count.users > 0) {
            return NextResponse.json(
                { error: `Không thể xóa: Phòng ban đang có ${department._count.users} nhân viên.` },
                { status: 409 }
            );
        }

        await prisma.department.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
