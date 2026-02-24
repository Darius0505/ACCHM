import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rbacService } from '@/services/rbac.service';
import { requirePermission } from '@/lib/rbac.middleware';

// GET /api/roles/[id]/permissions — Get permission matrix for a role
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Only require VIEW access to roles to see permissions
    const denied = await requirePermission(request, 'ROLES', 'VIEW');
    if (denied) return denied;

    try {
        // Get all modules with forms + permissions (the full matrix)
        const matrix = await rbacService.getPermissionMatrix();

        // Get which permissions this role currently has
        const rolePermissions = await prisma.rolePermission.findMany({
            where: { roleId: params.id },
            select: { permissionId: true },
        });
        const assignedIds = new Set(rolePermissions.map(rp => rp.permissionId));

        // Build matrix response
        const result = matrix.map(mod => ({
            id: mod.id,
            code: mod.code,
            name: mod.name,
            icon: mod.icon,
            forms: mod.forms.map(form => ({
                id: form.id,
                code: form.code,
                name: form.name,
                permissions: form.permissions.map(perm => ({
                    id: perm.id,
                    action: perm.action,
                    assigned: assignedIds.has(perm.id),
                })),
            })),
        }));

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/roles/[id]/permissions — Batch update permissions
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Require EDIT access to roles to change permissions
    const denied = await requirePermission(request, 'ROLES', 'EDIT');
    if (denied) return denied;

    try {
        const { permissionIds } = await request.json();
        const updatedBy = request.headers.get('x-user-id') || undefined;

        await rbacService.updateRolePermissions(params.id, permissionIds || [], updatedBy);

        return NextResponse.json({ success: true, count: permissionIds?.length || 0 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
