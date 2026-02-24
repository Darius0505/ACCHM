import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac.middleware';

// GET /api/departments — List all departments
export async function GET(request: NextRequest) {
    // Map to DEPARTMENTS form in SYSTEM module if exists, or similar
    // Seed has 'DEPARTMENTS' form code.
    const denied = await requirePermission(request, 'DEPARTMENTS', 'VIEW');
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const branchId = searchParams.get('branchId');

        const where: any = {};
        if (branchId) where.branchId = branchId;

        const departments = await prisma.department.findMany({
            where,
            include: {
                branch: { select: { id: true, code: true, name: true } },
                _count: { select: { users: true } },
            },
            orderBy: { code: 'asc' },
        });

        return NextResponse.json(departments.map(d => ({
            ...d,
            userCount: d._count.users,
            _count: undefined,
        })));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/departments — Create department
export async function POST(request: NextRequest) {
    const denied = await requirePermission(request, 'DEPARTMENTS', 'ADD');
    if (denied) return denied;

    try {
        const body = await request.json();
        const { code, name, branchId } = body;
        let { companyId } = body;

        if (!companyId) {
            companyId = request.headers.get('x-company-id');
        }

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        if (!code || !name) {
            return NextResponse.json({ error: 'Mã và tên phòng ban là bắt buộc' }, { status: 400 });
        }

        const dept = await prisma.department.create({
            data: {
                code: code.toUpperCase(),
                name,
                branchId: branchId || null,
                companyId: companyId,
            },
        });

        return NextResponse.json(dept, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Mã phòng ban đã tồn tại' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
