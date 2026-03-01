import { prisma } from '@/lib/prisma';

export const auditService = {
    async logAction(
        userId: string | undefined,
        entity: string,
        entityId: string | undefined,
        action: string,
        details?: string,
        changes?: { old?: any, new?: any }
    ) {
        try {
            await prisma.auditLog.create({
                data: {
                    userId,
                    entity,
                    entityId,
                    action,
                    details,
                    oldValues: changes?.old ? JSON.stringify(changes.old) : null,
                    newValues: changes?.new ? JSON.stringify(changes.new) : null,
                }
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw, just log error to not block main flow
        }
    }
};
