
import prisma from '../lib/prisma';
import { PartnerContact, Partner } from '@prisma/client';

/**
 * Get contacts for a specific partner
 */
export async function getPartnerContacts(partnerId: string) {
    return prisma.partnerContact.findMany({
        where: {
            partnerId,
            isActive: true
        },
        orderBy: [
            { isDefault: 'desc' },
            { name: 'asc' }
        ]
    });
}

/**
 * Create a new contact for a partner
 */
export async function createPartnerContact(data: {
    partnerId: string;
    name: string;
    phone?: string;
    email?: string;
    position?: string;
    note?: string;
    isDefault?: boolean;
}) {
    // If setting as default, unset others first
    if (data.isDefault) {
        await prisma.partnerContact.updateMany({
            where: { partnerId: data.partnerId },
            data: { isDefault: false }
        });
    }

    return prisma.partnerContact.create({
        data
    });
}
