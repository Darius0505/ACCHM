import { prisma } from '@/lib/prisma';
import { signToken, verifyToken } from '@/lib/auth';
import { hash, compare } from 'bcryptjs';
import { auditService } from './audit.service';
import { rbacService } from './rbac.service';

const SALT_ROUNDS = 10;

export const authService = {
    async hashPassword(password: string) {
        return await hash(password, SALT_ROUNDS);
    },

    async verifyPassword(password: string, hash: string) {
        return await compare(password, hash);
    },

    async login(code: string, password: string, companyId?: string) {

        // Find user by code — try with companyId first, then without
        let user = await prisma.user.findFirst({
            where: { code, ...(companyId ? { companyId } : {}) },
            include: {
                roles: {
                    include: {
                        role: {
                            include: { permissions: { include: { permission: true } } }
                        }
                    }
                }
            }
        });

        if (!user) {
            throw new Error('Mã nhân viên hoặc mật khẩu không đúng');
        }

        if (!user.isActive) {
            throw new Error('User account is inactive');
        }

        const isValid = await this.verifyPassword(password, user.password);
        if (!isValid) {
            throw new Error('Mã nhân viên hoặc mật khẩu không đúng');
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        // Get Permissions & Scope
        const permissionCache = await rbacService.getPermissionCache(user.id);

        // Generate Token
        const token = await signToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles.map(ur => ur.role.name),
            companyId: companyId || user.companyId,
            permissions: permissionCache.permissions,
            scope: permissionCache.dataScope
        });

        // Audit Login
        // Ideally we pass context like IP, but for now simple log
        await auditService.logAction(user.id, 'User', user.id, 'LOGIN', 'User logged in');

        return {
            user: {
                id: user.id,
                code: user.code,
                email: user.email,
                name: user.name,
                role: user.roles.length > 0 ? user.roles[0].role.name : 'USER'
            },
            token
        };
    }
};
