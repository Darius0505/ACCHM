import { prisma } from '@/lib/prisma';

type PermissionMap = Record<string, string[]>; // formCode -> actions[]
type DataScope = { type: string; values?: string[] };

/**
 * RBAC Service — Central permission checking
 * 
 * Usage:
 *   const can = await rbacService.checkPermission(userId, 'CASH_RECEIPT', 'ADD');
 *   const scope = await rbacService.getDataScope(userId);
 */
export const rbacService = {
    /**
     * Load ALL permissions for a user (through their roles)
     * Returns a Map: formCode -> [actions]
     * This is cached in JWT after login (Step 12)
     */
    async getUserPermissions(userId: string): Promise<PermissionMap> {
        const userRoles = await prisma.userRole.findMany({
            where: { userId },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: {
                                    include: { form: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        const permissions: PermissionMap = {};

        for (const ur of userRoles) {
            for (const rp of ur.role.permissions) {
                const formCode = rp.permission.form.code;
                if (!permissions[formCode]) {
                    permissions[formCode] = [];
                }
                if (!permissions[formCode].includes(rp.permission.action)) {
                    permissions[formCode].push(rp.permission.action);
                }
            }
        }

        return permissions;
    },

    /**
     * Check if user has specific permission
     */
    async checkPermission(userId: string, formCode: string, action: string): Promise<boolean> {
        const count = await prisma.rolePermission.count({
            where: {
                role: {
                    users: { some: { userId } }
                },
                permission: {
                    form: { code: formCode },
                    action: action,
                }
            }
        });
        return count > 0;
    },

    /**
     * Get data scope for user (most permissive wins if multiple roles)
     * Returns: { type: 'ALL' | 'BRANCH' | 'DEPARTMENT' | 'OWN', values?: string[] }
     */
    async getDataScope(userId: string): Promise<DataScope> {
        const scopes = await prisma.roleDataScope.findMany({
            where: {
                role: {
                    users: { some: { userId } }
                }
            }
        });

        // Priority: ALL > BRANCH > DEPARTMENT > OWN
        const priority = ['ALL', 'BRANCH', 'DEPARTMENT', 'OWN'];

        let bestScope: DataScope = { type: 'OWN' };
        let bestPriority = 3;

        for (const scope of scopes) {
            const idx = priority.indexOf(scope.scopeType);
            if (idx < bestPriority) {
                bestPriority = idx;
                bestScope = {
                    type: scope.scopeType,
                    values: scope.scopeValue ? [scope.scopeValue] : undefined,
                };
            } else if (idx === bestPriority && scope.scopeValue) {
                // Merge values for same level
                if (!bestScope.values) bestScope.values = [];
                if (!bestScope.values.includes(scope.scopeValue)) {
                    bestScope.values.push(scope.scopeValue);
                }
            }
        }

        return bestScope;
    },

    /**
     * Build WHERE clause for data filtering (Step 11)
     * Returns Prisma-compatible filter object
     */
    buildDataFilter(scope: DataScope, userId: string, userBranchId?: string, userDeptId?: string) {
        switch (scope.type) {
            case 'ALL':
                return {}; // No filter
            case 'BRANCH':
                return {
                    OR: [
                        { branchId: { in: scope.values || [userBranchId].filter(Boolean) } },
                        { createdBy: userId }, // Always see own data
                    ]
                };
            case 'DEPARTMENT':
                return {
                    OR: [
                        { departmentId: { in: scope.values || [userDeptId].filter(Boolean) } },
                        { createdBy: userId },
                    ]
                };
            case 'OWN':
                return { createdBy: userId };
            default:
                return { createdBy: userId }; // Safest default
        }
    },

    /**
     * Get permission summary for JWT cache
     * Called after login, results are embedded in token
     */
    async getPermissionCache(userId: string) {
        const [permissions, dataScope] = await Promise.all([
            this.getUserPermissions(userId),
            this.getDataScope(userId),
        ]);
        return { permissions, dataScope };
    },

    /**
     * Get all modules with forms (for permission matrix UI)
     */
    async getPermissionMatrix() {
        return prisma.module.findMany({
            orderBy: { order: 'asc' },
            include: {
                forms: {
                    orderBy: { order: 'asc' },
                    include: {
                        permissions: {
                            orderBy: { action: 'asc' },
                        }
                    }
                }
            }
        });
    },

    /**
     * Get role with all its permissions grouped by module+form
     */
    async getRolePermissions(roleId: string) {
        const role = await prisma.role.findUnique({
            where: { id: roleId },
            include: {
                permissions: {
                    include: {
                        permission: {
                            include: {
                                form: {
                                    include: { module: true }
                                }
                            }
                        }
                    }
                },
                dataScopes: true,
            }
        });
        return role;
    },

    /**
     * Batch update role permissions (for permission matrix save)
     * permissionIds: array of permission IDs to assign (replaces all)
     */
    async updateRolePermissions(roleId: string, permissionIds: string[], updatedBy?: string) {
        // Delete all existing
        await prisma.rolePermission.deleteMany({ where: { roleId } });

        // Insert new
        if (permissionIds.length > 0) {
            await prisma.rolePermission.createMany({
                data: permissionIds.map(permissionId => ({
                    roleId,
                    permissionId,
                })),
            });
        }

        // Audit log
        if (updatedBy) {
            await prisma.auditLog.create({
                data: {
                    userId: updatedBy,
                    action: 'UPDATE_PERMISSIONS',
                    entity: 'Role',
                    entityId: roleId,
                    newValues: JSON.stringify({ permissionCount: permissionIds.length }),
                }
            });
        }
    },

    /**
     * Update data scopes for a role
     */
    async updateRoleDataScopes(roleId: string, scopes: { scopeType: string; scopeValue?: string }[], updatedBy?: string) {
        await prisma.roleDataScope.deleteMany({ where: { roleId } });

        if (scopes.length > 0) {
            await prisma.roleDataScope.createMany({
                data: scopes.map(s => ({
                    roleId,
                    scopeType: s.scopeType,
                    scopeValue: s.scopeValue || null,
                })),
            });
        }

        if (updatedBy) {
            await prisma.auditLog.create({
                data: {
                    userId: updatedBy,
                    action: 'UPDATE_DATA_SCOPE',
                    entity: 'Role',
                    entityId: roleId,
                    newValues: JSON.stringify(scopes),
                }
            });
        }
    },
};
