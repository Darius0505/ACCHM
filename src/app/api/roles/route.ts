import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/roles — List all roles with user count
export async function GET() {
    try {
        const roles = await prisma.role.findMany({
            include: {
                _count: { select: { users: true } },
                dataScopes: true,
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(roles.map(r => ({
            ...r,
            userCount: r._count.users,
            _count: undefined,
        })));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/roles — Create a new role
export async function POST(request: NextRequest) {
    try {
        const { code, name, description, companyId } = await request.json();

        if (!code || !name) {
            return NextResponse.json({ error: 'Mã vai trò và Tên hiển thị là bắt buộc' }, { status: 400 });
        }

        const roleCode = code.toUpperCase().replace(/\s+/g, '_');

        const role = await prisma.role.create({
            data: {
                code: roleCode,
                name: name,
                description: description || null,
                companyId: companyId || '',
                isSystem: false,
            },
        });

        return NextResponse.json(role, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Role đã tồn tại' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
