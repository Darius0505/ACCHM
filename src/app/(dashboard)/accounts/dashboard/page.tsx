'use client';

import React from 'react';
import Link from 'next/link';

export default function AccountingDashboard() {
    return (
        <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>
                📊 Bàn làm việc Kế toán
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {/* Cash */}
                <Card
                    title="Tiền mặt"
                    icon="💰"
                    links={[
                        { label: 'Thu tiền', href: '/cash-receipts' },
                        { label: 'Chi tiền', href: '/cash-payments' },
                        { label: 'Sổ quỹ', href: '/cash-book' },
                    ]}
                />

                {/* Bank */}
                <Card
                    title="Tiền gửi"
                    icon="🏦"
                    links={[
                        { label: 'Thu tiền gửi', href: '/bank-receipts' },
                        { label: 'Chi tiền gửi', href: '/bank-payments' },
                        { label: 'Sổ tiền gửi', href: '/bank-book' },
                    ]}
                />

                {/* Purchase */}
                <Card
                    title="Mua hàng"
                    icon="🛍️"
                    links={[
                        { label: 'Đơn mua hàng', href: '/purchases/orders' },
                        { label: 'Hóa đơn mua', href: '/purchases/invoices' },
                        { label: 'Trả tiền nhà cung cấp', href: '/purchases/payments' },
                    ]}
                />

                {/* Sales */}
                <Card
                    title="Bán hàng"
                    icon="🛒"
                    links={[
                        { label: 'Báo giá', href: '/sales/quotes' },
                        { label: 'Đơn đặt hàng', href: '/sales/orders' },
                        { label: 'Hóa đơn bán', href: '/sales/invoices' },
                    ]}
                />
            </div>

            <div style={{ marginTop: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Truy cập nhanh</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/accounts/chart" style={{
                        padding: '10px 16px', borderRadius: '8px',
                        background: '#EEF2FF', color: '#4F46E5', fontWeight: 600, textDecoration: 'none'
                    }}>
                        🔢 Hệ thống tài khoản
                    </Link>
                    <Link href="/accounting/settings/vouchers" style={{
                        padding: '10px 16px', borderRadius: '8px',
                        background: '#F0FDF4', color: '#16A34A', fontWeight: 600, textDecoration: 'none'
                    }}>
                        🧾 Thiết lập chứng từ
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Card({ title, icon, links }: { title: string, icon: string, links: { label: string, href: string }[] }) {
    return (
        <div style={{
            background: 'white', borderRadius: '16px', padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E5E7EB'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px' }}>{icon}</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#374151' }}>{title}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {links.map(link => (
                    <Link key={link.href} href={link.href} style={{
                        fontSize: '14px', color: '#6B7280', textDecoration: 'none',
                        padding: '6px 0', borderBottom: '1px dashed #F3F4F6'
                    }}>
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
