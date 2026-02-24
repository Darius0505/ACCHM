import { NextRequest, NextResponse } from 'next/server';
import { rbacService } from '@/services/rbac.service';
import { verifyToken } from '@/lib/auth';

/**
 * Extract user info from request headers (set by middleware.ts)
 */
export function getUserFromRequest(request: NextRequest) {
    const userId = request.headers.get('x-user-id');
    const email = request.headers.get('x-user-email');
    const companyId = request.headers.get('x-company-id');

    let roles: string[] = [];
    try {
        const rolesHeader = request.headers.get('x-user-roles');
        if (rolesHeader) roles = JSON.parse(rolesHeader);
    } catch { /* ignore */ }

    let permissions: string[] = [];
    try {
        const permHeader = request.headers.get('x-user-permissions');
        if (permHeader) permissions = JSON.parse(permHeader);
    } catch { /* ignore */ }

    return { userId, email, companyId, roles, permissions };
}

/**
 * Require a specific permission on a form+action
 * Returns null if allowed, or a NextResponse error if denied
 * 
 * Usage in API route:
 *   const denied = await requirePermission(request, 'CASH_RECEIPT', 'ADD');
 *   if (denied) return denied;
 */
export async function requirePermission(
    request: NextRequest,
    formCode: string,
    action: string
): Promise<NextResponse | null> {
    const { userId, roles, permissions } = getUserFromRequest(request);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Demo admin bypass
    if (userId === 'demo-admin-001') return null;

    // Admin role bypass
    if (roles.includes('ADMIN')) return null;

    // Wildcard permission bypass (e.g., '*:*:*' from JWT)
    if (permissions.includes('*:*:*')) return null;

    // Check specific permission pattern from JWT
    const permPattern = `${formCode}:${action}`;
    if (permissions.some(p => p === permPattern || p === `${formCode}:*` || p === `*:${action}`)) {
        return null;
    }

    // Fallback: check from database
    const hasPermission = await rbacService.checkPermission(userId, formCode, action);
    if (!hasPermission) {
        return NextResponse.json(
            { error: 'Forbidden', message: `Bạn không có quyền ${action} trên ${formCode}` },
            { status: 403 }
        );
    }

    return null; // Allowed
}
