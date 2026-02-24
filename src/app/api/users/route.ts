import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { requirePermission } from '@/lib/rbac.middleware';

export const dynamic = 'force-dynamic';

// GET /api/users — List all users with roles, branch, department
export async function GET(request: NextRequest) {
    // Check permission
    const denied = await requirePermission(request, 'USERS', 'VIEW');
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const isActive = searchParams.get('isActive');

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
            ];
        }
        if (isActive !== null && isActive !== undefined && isActive !== '') {
            where.isActive = isActive === 'true';
        }

        const companyId = request.headers.get('x-company-id');
        if (companyId) {
            where.companyId = companyId;
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                roles: {
                    include: {
                        role: { select: { id: true, name: true, description: true } }
                    }
                },
                branch: { select: { id: true, code: true, name: true } },
                department: { select: { id: true, code: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const sanitized = users.map(({ password, ...u }) => ({
            ...u,
            roles: u.roles.map(ur => ur.role),
        }));

        return NextResponse.json(sanitized);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/users — Create a new user
export async function POST(request: NextRequest) {
    // Check permission
    const denied = await requirePermission(request, 'USERS', 'ADD');
    if (denied) return denied;

    try {
        const body = await request.json();
        const { email, name, password, phone, branchId, departmentId, roleIds, code } = body;
        let { companyId } = body; // Allow manual override if needed (e.g. super admin)

        // If companyId is not in body, try to get from header (set by middleware)
        if (!companyId) {
            companyId = request.headers.get('x-company-id');
        }

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        if (!email || !name || !password || !code) {
            return NextResponse.json(
                { error: 'Mã nhân viên, Email, tên và mật khẩu là bắt buộc' },
                { status: 400 }
            );
        }

        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email đã tồn tại trong hệ thống' },
                { status: 409 }
            );
        }

        const existingCode = await prisma.user.findFirst({
            where: {
                companyId,
                code,
            }
        });

        if (existingCode) {
            return NextResponse.json(
                { error: 'Mã nhân viên đã tồn tại' },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                code,
                email,
                name,
                password: hashedPassword,
                phone: phone || null,
                branchId: branchId || null,
                departmentId: departmentId || null,
                companyId: companyId || null,
                isActive: true,
                roles: roleIds?.length ? {
                    createMany: {
                        data: roleIds.map((roleId: string) => ({ roleId })),
                    }
                } : undefined,
            },
            include: {
                roles: { include: { role: { select: { id: true, name: true } } } },
                branch: { select: { id: true, code: true, name: true } },
                department: { select: { id: true, code: true, name: true } },
            }
        });

        const { password: _, ...safeUser } = user;
        return NextResponse.json(safeUser, { status: 201 });
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
