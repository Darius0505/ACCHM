import { NextRequest } from 'next/server';
import { rbacService } from '@/services/rbac.service';

/**
 * Extract data scope from request headers and build Prisma WHERE filter.
 * 
 * Usage in API routes:
 *   const dataFilter = getDataFilter(request);
 *   const items = await prisma.cashReceipt.findMany({
 *       where: { ...otherFilters, ...dataFilter }
 *   });
 * 
 * Scope types:
 *   ALL        → {} (no filter)
 *   BRANCH     → { branchId: { in: [...] } }
 *   DEPARTMENT → { departmentId: { in: [...] } }
 *   OWN        → { createdBy: userId }
 */
export function getDataFilter(request: NextRequest): Record<string, any> {
    const userId = request.headers.get('x-user-id');
    if (!userId) return { createdBy: '__none__' }; // Block all if no user

    // Parse scope from JWT (forwarded by middleware)
    let scope = { type: 'OWN' } as { type: string; values?: string[] };
    try {
        const scopeHeader = request.headers.get('x-user-scope');
        if (scopeHeader) scope = JSON.parse(scopeHeader);
    } catch { /* default to OWN */ }

    const branchId = request.headers.get('x-user-branch') || undefined;
    const departmentId = request.headers.get('x-user-department') || undefined;

    return rbacService.buildDataFilter(scope, userId, branchId, departmentId);
}

/**
 * Check if request has admin/superuser scope (ALL)
 * Useful for skipping filters on admin users
 */
export function isFullScope(request: NextRequest): boolean {
    try {
        const scopeHeader = request.headers.get('x-user-scope');
        if (scopeHeader) {
            const scope = JSON.parse(scopeHeader);
            return scope.type === 'ALL';
        }
    } catch { /* ignore */ }
    return false;
}
