
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/currencies/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { code, name, nameEN, symbol, exchangeRate, isDefault, isActive } = body;

        const existing = await prisma.currency.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Loại tiền không tồn tại' }, { status: 404 });
        }

        const data: any = {};
        if (code) data.code = code.toUpperCase();
        if (name) data.name = name;
        if (nameEN) data.nameEN = nameEN;
        if (symbol) data.symbol = symbol;
        if (exchangeRate) data.exchangeRate = exchangeRate;

        if (isActive !== undefined) data.isActive = isActive;

        if (isDefault) {
            data.isDefault = true;
            // Unset other defaults
            await prisma.currency.updateMany({
                where: { companyId: existing.companyId, isDefault: true, NOT: { id } },
                data: { isDefault: false }
            });
        } else if (isDefault === false) {
            data.isDefault = false;
        }

        const updated = await prisma.currency.update({
            where: { id },
            data
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating currency:', error);
        return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 });
    }
}

// DELETE /api/currencies/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check usage or default
        const existing = await prisma.currency.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: 'Loại tiền không tồn tại' }, { status: 404 });
        }
        if (existing.isDefault) {
            return NextResponse.json({ error: 'Không thể xóa đồng tiền đang được chọn làm mặc định' }, { status: 400 });
        }

        // Soft delete
        await prisma.currency.update({
            where: { id },
            data: { isActive: false }
        });

        return NextResponse.json({ message: 'Đã xóa loại tiền' });
    } catch (error) {
        console.error('Error deleting currency:', error);
        return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 });
    }
}
