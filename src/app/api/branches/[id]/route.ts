
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';

// PUT /api/branches/[id] — Update branch
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'BRANCHES', 'EDIT');
    if (denied) return denied;

    try {
        const { code, name, address, phone } = await request.json();

        // Check if branch exists
        const existing = await prisma.branch.findUnique({ where: { id: params.id } });
        if (!existing) {
            return NextResponse.json({ error: 'Chi nhánh không tồn tại' }, { status: 404 });
        }

        const branch = await prisma.branch.update({
            where: { id: params.id },
            data: {
                ...(code ? { code: code.toUpperCase() } : {}),
                ...(name ? { name } : {}),
                ...(address !== undefined ? { address } : {}),
                ...(phone !== undefined ? { phone } : {}),
            },
        });

        return NextResponse.json(branch);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Mã chi nhánh đã tồn tại' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/branches/[id] — Delete branch (if empty)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'BRANCHES', 'DELETE');
    if (denied) return denied;

    try {
        const branch = await prisma.branch.findUnique({
            where: { id: params.id },
            include: {
                _count: { select: { users: true, departments: true } },
            },
        });

        if (!branch) {
            return NextResponse.json({ error: 'Chi nhánh không tồn tại' }, { status: 404 });
        }

        if (branch._count.users > 0 || branch._count.departments > 0) {
            return NextResponse.json(
                { error: `Không thể xóa: Chi nhánh đang có ${branch._count.users} nhân viên và ${branch._count.departments} phòng ban.` },
                { status: 409 }
            );
        }

        await prisma.branch.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
