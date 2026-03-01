
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/bank-accounts/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { code, name, bankName, accountNumber, branch, currency, accountId, partnerId, isActive } = body;

        const existing = await prisma.bankAccount.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Tài khoản ngân hàng không tồn tại' }, { status: 404 });
        }

        const data: any = {};
        if (code) data.code = code;
        if (name) data.name = name;
        if (bankName) data.bankName = bankName;
        if (accountNumber) data.accountNumber = accountNumber;
        if (branch !== undefined) data.branch = branch;
        if (currency) data.currency = currency;
        if (accountId) data.accountId = accountId;
        if (partnerId !== undefined) data.partnerId = partnerId;
        if (isActive !== undefined) data.isActive = isActive;

        const updated = await prisma.bankAccount.update({
            where: { id },
            data
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating bank account:', error);
        return NextResponse.json({ error: 'Failed to update bank account' }, { status: 500 });
    }
}

// DELETE /api/bank-accounts/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check transactions
        const transactionCount = await prisma.bankTransaction.count({ where: { bankAccountId: id } });
        if (transactionCount > 0) {
            return NextResponse.json({ error: 'Không thể xóa tài khoản đã có phát sinh giao dịch' }, { status: 400 });
        }

        // Soft delete
        await prisma.bankAccount.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({ message: 'Đã xóa tài khoản ngân hàng' });
    } catch (error) {
        console.error('Error deleting bank account:', error);
        return NextResponse.json({ error: 'Failed to delete bank account' }, { status: 500 });
    }
}
