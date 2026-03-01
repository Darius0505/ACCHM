'use client';

import { useState } from 'react';

// Mock data
const invoices = [
    { id: 'PUR001', vendor: 'Công ty TNHH Nhất Việt', date: '2024-03-20', total: 15000000, status: 'PAID', ref: 'HĐ001' },
    { id: 'PUR002', vendor: 'Công ty An Bình', date: '2024-03-21', total: 5500000, status: 'PENDING', ref: 'HĐ002' },
    { id: 'PUR003', vendor: 'Google Cloud EMEA', date: '2024-03-22', total: 2400000, status: 'OVERDUE', ref: 'INV-2024' },
    { id: 'PUR004', vendor: 'Văn phòng phẩm Hồng Hà', date: '2024-03-23', total: 850000, status: 'PAID', ref: 'HĐ005' },
];

const statusColors: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    OVERDUE: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
    PAID: 'Đã thanh toán',
    PENDING: 'Chừa thanh toán',
    OVERDUE: 'Quá hạn',
};

export default function PurchasesPage() {
    return (
        <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>Chứng từ Mua hàng</h2>
                    <p style={{ color: '#6B7280', marginTop: '4px' }}>Quản lý hóa đơn và thanh toán nhà cung cấp</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', fontWeight: 500, cursor: 'pointer' }}>
                        Xuất khẩu
                    </button>
                    <button style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#EF4444', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }}>
                        + Thêm chứng từ
                    </button>
                </div>
            </div>

            {/* Stats / Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>CẦN THANH TOÁN</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#F59E0B', marginTop: '4px' }}>5.500.000 ₫</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>1 hóa đơn sắp đến hạn</div>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>QUÁ HẠN</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#EF4444', marginTop: '4px' }}>2.400.000 ₫</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Cần xử lý gấp</div>
                </div>
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>ĐÃ THANH TOÁN (THÁNG 3)</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>15.850.000 ₫</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>2 hóa đơn</div>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>SỐ CT</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>NGÀY CT</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>NHÀ CUNG CẤP</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>SỐ HÓA ĐƠN</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>TỔNG TIỀN</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>TRẠNG THÁI</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv, i) => (
                            <tr key={inv.id} style={{ borderBottom: i < invoices.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                            >
                                <td style={{ padding: '16px', color: '#111827', fontWeight: 500 }}>{inv.id}</td>
                                <td style={{ padding: '16px', color: '#4B5563' }}>{inv.date}</td>
                                <td style={{ padding: '16px', color: '#111827', fontWeight: 500 }}>{inv.vendor}</td>
                                <td style={{ padding: '16px', color: '#6B7280' }}>{inv.ref}</td>
                                <td style={{ padding: '16px', textAlign: 'right', color: '#111827', fontWeight: 600 }}>{inv.total.toLocaleString()} ₫</td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                                        backgroundColor: inv.status === 'PAID' ? '#DCFCE7' : inv.status === 'PENDING' ? '#FEF3C7' : '#FEE2E2',
                                        color: inv.status === 'PAID' ? '#15803D' : inv.status === 'PENDING' ? '#B45309' : '#B91C1C'
                                    }}>
                                        {statusLabels[inv.status]}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <button style={{ color: '#4B5563', background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '8px' }}>✏️</button>
                                    <button style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
