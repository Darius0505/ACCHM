import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';

// GET /api/roles/[id] — Get role detail with permissions
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'ROLES', 'VIEW');
    if (denied) return denied;

    try {
        const role = await prisma.role.findUnique({
            where: { id: params.id },
            include: {
                permissions: {
                    include: {
                        permission: {
                            include: {
                                form: { include: { module: true } }
                            }
                        }
                    }
                },
                dataScopes: true,
                _count: { select: { users: true } },
            },
        });

        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...role,
            userCount: role._count.users,
            _count: undefined,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/roles/[id] — Update role name/description
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'ROLES', 'EDIT');
    if (denied) return denied;

    try {
        const body = await request.json();
        const { code, name, description } = body;

        const existing = await prisma.role.findUnique({ where: { id: params.id } });
        if (!existing) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        // System roles: Cannot change Code. Name change might be allowed? 
        // Logic: if system, code must match.
        if (existing.isSystem) {
            if (code && code !== existing.code) {
                return NextResponse.json({ error: 'Không được đổi mã của vai trò hệ thống' }, { status: 403 });
            }
        }

        // Check for duplicate code if code is being changed
        if (code && code !== existing.code) {
            const roleCode = code.toUpperCase().replace(/\s+/g, '_');
            // Try check existence or rely on Prisma unique constraint error
        }

        const role = await prisma.role.update({
            where: { id: params.id },
            data: {
                ...(code ? { code: code.toUpperCase().replace(/\s+/g, '_') } : {}),
                ...(name ? { name } : {}),
                ...(description !== undefined ? { description } : {}),
            },
        });

        return NextResponse.json(role);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/roles/[id] — Delete role (if not system and no users)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'ROLES', 'DELETE');
    if (denied) return denied;

    try {
        const role = await prisma.role.findUnique({
            where: { id: params.id },
            include: { _count: { select: { users: true } } },
        });

        if (!role) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        if (role.isSystem) {
            return NextResponse.json(
                { error: 'Không thể xóa role hệ thống' },
                { status: 403 }
            );
        }

        if (role._count.users > 0) {
            return NextResponse.json(
                { error: `Không thể xóa — role đang được gán cho ${role._count.users} người dùng` },
                { status: 409 }
            );
        }

        await prisma.role.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
