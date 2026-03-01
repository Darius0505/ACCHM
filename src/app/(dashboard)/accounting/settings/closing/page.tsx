'use client';

import React, { useState, useEffect } from 'react';

interface FiscalYear {
    id: string;
    name: string;
    periods: AccountingPeriod[];
}

interface AccountingPeriod {
    id: string;
    periodNumber: number;
    name: string;
    status: string; // OPEN, CLOSED
}

export default function ClosingPage() {
    const [years, setYears] = useState<FiscalYear[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/fiscal-years'); // Reuse endpoint
            if (res.ok) setYears(await res.json());
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleStatus = async (period: AccountingPeriod) => {
        const newStatus = period.status === 'OPEN' ? 'CLOSED' : 'OPEN';
        const action = newStatus === 'CLOSED' ? 'khóa sổ' : 'mở lại';

        if (!confirm(`Bạn có chắc muốn ${action} kỳ "${period.name}"?`)) return;

        try {
            const res = await fetch(`/api/accounting-periods/${period.id}/close`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error || 'Lỗi xử lý');
            }
        } catch {
            alert('Lỗi kết nối');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border, #e2e8f0)',
                background: 'linear-gradient(135deg, var(--surface, #1e293b) 0%, var(--surface-active, #334155) 100%)',
            }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>
                    🔚 Khóa Sổ Kỳ Kế Toán
                </h1>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                    Thực hiện khóa sổ cuối tháng để chốt số liệu
                </p>
            </div>

            <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
                {years.map(fy => (
                    <div key={fy.id} style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px', borderLeft: '4px solid #F97316', paddingLeft: '12px' }}>{fy.name}</h3>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px'
                        }}>
                            {fy.periods.map(p => {
                                const isClosed = p.status !== 'OPEN';
                                return (
                                    <div key={p.id} style={{
                                        background: isClosed ? 'var(--surface-active, #253044)' : 'var(--surface, #1e293b)',
                                        border: isClosed ? '1px solid #475569' : '1px solid #F97316',
                                        borderRadius: '12px', padding: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        opacity: isClosed ? 0.7 : 1
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{p.name}</div>
                                            <div style={{ fontSize: '12px', color: isClosed ? '#94a3b8' : '#34d399', fontWeight: 600 }}>
                                                {isClosed ? '🔒 Đã khóa' : '🟢 Đang mở'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleStatus(p)}
                                            style={{
                                                padding: '6px 12px', borderRadius: '6px',
                                                border: 'none', cursor: 'pointer',
                                                fontSize: '12px', fontWeight: 600,
                                                background: isClosed ? '#475569' : '#F97316',
                                                color: '#fff'
                                            }}
                                        >
                                            {isClosed ? 'Mở lại' : 'Khóa sổ'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
