'use client';

import React, { useState } from 'react';
import AccountingGrid, { AccountingGridColumn } from '@/components/accounting/AccountingGrid';

interface VoucherLine {
    id: string;
    description: string;
    debitAccount: string;
    creditAccount: string;
    currency: string;
    amount: number;
    objectId: string;
    objectName: string;
}

// Sample data
const initialData: VoucherLine[] = [
    { id: '1', description: 'Thu tiền bán hàng', debitAccount: '1111', creditAccount: '131', currency: 'VND', amount: 5000000, objectId: 'KH001', objectName: 'Công ty ABC' },
    { id: '2', description: 'Thu tiền dịch vụ', debitAccount: '1111', creditAccount: '511', currency: 'VND', amount: 2500000, objectId: 'KH002', objectName: 'Công ty XYZ' },
    { id: '3', description: 'Thu lãi ngân hàng', debitAccount: '1121', creditAccount: '515', currency: 'VND', amount: 150000, objectId: '', objectName: '' },
];

export default function AgGridDemoPage() {
    const [data, setData] = useState<VoucherLine[]>(initialData);

    const columns: AccountingGridColumn<VoucherLine>[] = [
        { field: 'description', headerName: 'Diễn giải', width: 250, type: 'text' },
        { field: 'debitAccount', headerName: 'TK Nợ', width: 100, type: 'text', align: 'center' },
        { field: 'creditAccount', headerName: 'TK Có', width: 100, type: 'text', align: 'center' },
        {
            field: 'currency',
            headerName: 'Tiền tệ',
            width: 90,
            type: 'select',
            align: 'center',
            cellEditorParams: { values: ['VND', 'USD', 'EUR'] }
        },
        { field: 'amount', headerName: 'Số tiền', width: 140, type: 'currency', align: 'right' },
        { field: 'objectId', headerName: 'Mã ĐT', width: 100, type: 'text' },
        { field: 'objectName', headerName: 'Tên Đối tượng', flex: 1, minWidth: 200, type: 'text' },
    ];

    const totalAmount = data.reduce((sum, row) => sum + (row.amount || 0), 0);

    const addRow = () => {
        setData(prev => [...prev, {
            id: `new-${Date.now()}`,
            description: '',
            debitAccount: '',
            creditAccount: '',
            currency: 'VND',
            amount: 0,
            objectId: '',
            objectName: '',
        }]);
    };

    return (
        <main style={{
            padding: '24px',
            backgroundColor: 'var(--background)',
            minHeight: '100vh',
            color: 'var(--text-primary)'
        }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
                AG Grid Demo - Accounting Grid
            </h1>

            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Test các tính năng: <strong>Filter</strong> (click header), <strong>Sort</strong> (click header),
                <strong>Edit</strong> (double-click cell), <strong>Delete</strong> (click X button)
            </p>

            <div style={{
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '16px'
            }}>
                <AccountingGrid
                    data={data}
                    columns={columns}
                    onDataChange={setData}
                    height="350px"
                />
            </div>

            {/* Add Row Button */}
            <button
                onClick={addRow}
                style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginBottom: '16px'
                }}
            >
                + Thêm dòng mới
            </button>

            {/* Summary */}
            <div style={{
                padding: '12px 16px',
                backgroundColor: 'var(--surface-active)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontWeight: 600 }}>Tổng cộng:</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
                    {new Intl.NumberFormat('vi-VN').format(totalAmount)} VND
                </span>
            </div>

            {/* Features List */}
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '12px', fontWeight: 600 }}>✅ Tính năng đã tích hợp:</h3>
                <ul style={{ lineHeight: 1.8 }}>
                    <li>🔍 <strong>Filter</strong>: Click vào icon filter trên header</li>
                    <li>↕️ <strong>Sort</strong>: Click vào header để sắp xếp A-Z, Z-A</li>
                    <li>✏️ <strong>Edit</strong>: Double-click vào cell để chỉnh sửa</li>
                    <li>🗑️ <strong>Delete</strong>: Click nút X để xóa dòng</li>
                    <li>📌 <strong>Pin Column</strong>: Cột # đã pin bên trái</li>
                    <li>🎨 <strong>Dark Mode</strong>: Tự động theo theme</li>
                </ul>
            </div>
        </main>
    );
}
