import { prisma } from '@/lib/prisma';
import { authService } from './auth.service';
import { auditService } from './audit.service';

export const userService = {
    async createUser(data: any, creatorId?: string) {
        const hashedPassword = await authService.hashPassword(data.password);

        const user = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                roles: data.roles ? {
                    create: data.roles.map((roleId: string) => ({
                        role: { connect: { id: roleId } }
                    }))
                } : undefined
            }
        });

        await auditService.logAction(creatorId, 'User', user.id, 'CREATE', `Created user ${user.email}`);
        return user;
    },

    async updateUser(id: string, data: any, modifierId?: string) {
        if (data.password) {
            data.password = await authService.hashPassword(data.password);
        }

        const start = await prisma.user.findUnique({ where: { id } });

        const user = await prisma.user.update({
            where: { id },
            data
        });

        await auditService.logAction(modifierId, 'User', id, 'UPDATE', `Updated user ${user.email}`, {
            old: start,
            new: user
        });
        return user;
    },

    async getUser(id: string) {
        return await prisma.user.findUnique({
            where: { id },
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
    },

    async getByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }
};
