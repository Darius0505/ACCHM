const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Find a POSTED receipt that has a journalEntryId
        const receipt = await prisma.cashReceipt.findFirst({
            where: {
                status: 'POSTED',
                journalEntryId: { not: null }
            },
            include: { details: true }
        });

        if (!receipt) {
            console.log("No POSTED CashReceipt found with a JournalEntry.");
            return;
        }

        console.log(`Found receipt to delete: ${receipt.receiptNumber} (ID: ${receipt.id}) with JournalEntry: ${receipt.journalEntryId}`);

        // Replicate deleteCashReceipt logic
        await prisma.$transaction(async (tx) => {
            console.log("1. Deleting CashReceipt...");
            await tx.cashReceipt.delete({
                where: { id: receipt.id }
            });

            if (receipt.journalEntryId) {
                console.log("2. Deleting JournalEntry...");
                await tx.journalEntry.delete({
                    where: { id: receipt.journalEntryId }
                });
            }
        });

        console.log("Successfully deleted receipt and its journal entry!");

    } catch (e) {
        console.error("Deletion failed with error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
