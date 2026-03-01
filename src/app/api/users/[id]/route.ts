import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { requirePermission } from '@/lib/rbac.middleware';

// GET /api/users/[id] — Get user detail
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'USERS', 'VIEW');
    if (denied) return denied;

    try {
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            include: {
                roles: {
                    include: { role: { select: { id: true, name: true, description: true } } }
                },
                branch: { select: { id: true, code: true, name: true } },
                department: { select: { id: true, code: true, name: true } },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { password, ...safeUser } = user;
        return NextResponse.json({
            ...safeUser,
            roles: safeUser.roles.map(ur => ur.role),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/users/[id] — Update user
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'USERS', 'EDIT');
    if (denied) return denied;

    try {
        const body = await request.json();
        const { name, phone, branchId, departmentId, roleIds, isActive, password, avatar, code } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (code !== undefined) updateData.code = code;
        if (phone !== undefined) updateData.phone = phone;
        if (branchId !== undefined) updateData.branchId = branchId || null;
        if (departmentId !== undefined) updateData.departmentId = departmentId || null;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (password) updateData.password = await hash(password, 10);

        // Check if code is unique (if updating code)
        if (code) {
            const existingUser = await prisma.user.findUnique({ where: { id: params.id } });
            if (existingUser) {
                const duplicateCode = await prisma.user.findFirst({
                    where: {
                        companyId: existingUser.companyId,
                        code: code,
                        id: { not: params.id }
                    }
                });
                if (duplicateCode) {
                    return NextResponse.json({ error: 'Mã nhân viên đã tồn tại' }, { status: 409 });
                }
            }
        }

        // Update user
        const user = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            include: {
                roles: { include: { role: { select: { id: true, name: true } } } },
                branch: { select: { id: true, code: true, name: true } },
                department: { select: { id: true, code: true, name: true } },
            }
        });

        // Update roles if provided
        if (roleIds !== undefined) {
            // Remove existing roles
            await prisma.userRole.deleteMany({ where: { userId: params.id } });
            // Assign new roles
            if (roleIds.length > 0) {
                await prisma.userRole.createMany({
                    data: roleIds.map((roleId: string) => ({
                        userId: params.id,
                        roleId,
                    })),
                });
            }
        }

        const { password: _, ...safeUser } = user;
        return NextResponse.json({
            ...safeUser,
            roles: safeUser.roles.map(ur => ur.role),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/users/[id] — Deactivate user (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const denied = await requirePermission(request, 'USERS', 'DELETE');
    if (denied) return denied;

    try {
        await prisma.user.update({
            where: { id: params.id },
            data: { isActive: false },
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
