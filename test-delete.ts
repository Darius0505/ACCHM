import { deleteCashReceipt } from './src/services/cashReceipt.service';
import prisma from './src/lib/prisma';

async function main() {
    // 1. Get the latest cash receipt
    const receipt = await prisma.cashReceipt.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!receipt) {
        console.log("No receipts found");
        return;
    }

    console.log(`Trying to delete receipt: ${receipt.receiptNumber} (${receipt.id}) with status ${receipt.status}`);

    try {
        await deleteCashReceipt(receipt.id);
        console.log("Delete successful!");
    } catch (e: any) {
        console.error("Delete failed:", e.message);
        console.error(e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
