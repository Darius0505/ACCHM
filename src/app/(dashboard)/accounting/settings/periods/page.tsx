'use client';

import React, { useState, useEffect } from 'react';

// --- Types ---
interface FiscalYear {
    id: string;
    year: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    periods: AccountingPeriod[];
}

interface AccountingPeriod {
    id: string;
    periodNumber: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
}

export default function FiscalYearsPage() {
    // --- State ---
    const [years, setYears] = useState<FiscalYear[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        year: new Date().getFullYear(),
        startDate: `${new Date().getFullYear()}-01-01`,
        endDate: `${new Date().getFullYear()}-12-31`,
    });

    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    // --- Actions ---
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/fiscal-years');
            if (res.ok) {
                setYears(await res.json());
            } else {
                setError('Không thể tải danh sách năm tài chính');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/fiscal-years', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error || 'Lỗi khi tạo năm tài chính');
            }
        } catch (err) {
            alert('Lỗi kết nối');
        }
    };

    // --- Render ---
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Header */}
            <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border, #e2e8f0)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'linear-gradient(135deg, var(--surface, #1e293b) 0%, var(--surface-active, #334155) 100%)',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '22px', fontWeight: 800,
                        color: 'var(--text-primary, #f1f5f9)',
                        marginBottom: '4px', letterSpacing: '-0.3px'
                    }}>
                        📅 Kỳ Kế Toán (Fiscal Years)
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                        Thiết lập năm tài chính và các kỳ kế toán
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={fetchData} style={btnSecondary}>🔄 Làm mới</button>
                    <button onClick={() => setShowModal(true)} style={btnPrimary}>＋ Tạo năm mới</button>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Đang tải...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {years.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Chưa có năm tài chính nào.</div>
                        ) : years.map(fy => (
                            <div key={fy.id} style={{
                                background: 'var(--surface, #1e293b)',
                                borderRadius: '12px',
                                border: '1px solid var(--border, #334155)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '16px 20px',
                                    background: 'var(--surface-active, #253044)',
                                    borderBottom: '1px solid var(--border)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>{fy.name}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            {new Date(fy.startDate).toLocaleDateString('vi-VN')} - {new Date(fy.endDate).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                        background: fy.status === 'OPEN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: fy.status === 'OPEN' ? '#34d399' : '#f87171'
                                    }}>
                                        {fy.status === 'OPEN' ? 'ĐANG MỞ' : 'ĐÃ KHÓA'}
                                    </div>
                                </div>
                                <div style={{ padding: '0' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--grid-header-bg)', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>
                                                <th style={{ padding: '8px 20px', textAlign: 'left' }}>Kỳ / Tháng</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Từ ngày</th>
                                                <th style={{ padding: '8px', textAlign: 'left' }}>Đến ngày</th>
                                                <th style={{ padding: '8px', textAlign: 'center' }}>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {fy.periods.map((p, idx) => (
                                                <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '10px 20px', color: '#e2e8f0', fontSize: '13px' }}>{p.name}</td>
                                                    <td style={{ padding: '10px', color: '#cbd5e1', fontSize: '13px' }}>{new Date(p.startDate).toLocaleDateString('vi-VN')}</td>
                                                    <td style={{ padding: '10px', color: '#cbd5e1', fontSize: '13px' }}>{new Date(p.endDate).toLocaleDateString('vi-VN')}</td>
                                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                                        <span style={{
                                                            fontSize: '11px', fontWeight: 600,
                                                            color: p.status === 'OPEN' ? '#34d399' : '#f87171'
                                                        }}>
                                                            {p.status === 'OPEN' ? 'Open' : 'Closed'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div style={overlayStyle} onClick={() => setShowModal(false)}>
                    <div style={modalStyle} onClick={e => e.stopPropagation()}>
                        <h2 style={modalHeaderStyle}>➕ Tạo năm tài chính mới</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>Năm tài chính</label>
                                <input
                                    type="number"
                                    value={formData.year}
                                    onChange={e => {
                                        const y = parseInt(e.target.value);
                                        setFormData({
                                            year: y,
                                            startDate: `${y}-01-01`,
                                            endDate: `${y}-12-31`
                                        });
                                    }}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                                * Hệ thống sẽ tự động tạo 12 kỳ kế toán (Tháng 1 - Tháng 12) tương ứng với khoảng thời gian này.
                            </div>
                        </div>
                        <div style={modalFooterStyle}>
                            <button onClick={() => setShowModal(false)} style={btnSecondary}>Hủy</button>
                            <button onClick={handleCreate} style={btnPrimary}>Tạo mới</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Styles Reuse ---
const btnPrimary = {
    background: 'var(--btn-primary, #F97316)',
    color: '#fff', border: 'none',
    padding: '9px 20px', borderRadius: '8px',
    fontWeight: 600, fontSize: '13px', cursor: 'pointer',
    boxShadow: 'var(--shadow-card)',
};
const btnSecondary = {
    background: 'var(--surface-hover, #334155)',
    color: 'var(--text-primary, #e2e8f0)',
    border: '1px solid var(--border, #475569)',
    padding: '9px 18px', borderRadius: '8px',
    fontWeight: 500, fontSize: '13px', cursor: 'pointer',
};
const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-secondary, #94a3b8)', marginBottom: '5px',
    textTransform: 'uppercase' as const, letterSpacing: '0.5px',
};
const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--border, #475569)',
    backgroundColor: 'var(--background, #0f172a)',
    color: 'var(--text-primary, #e2e8f0)',
    fontSize: '14px', outline: 'none',
};
const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const modalStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface, #1e293b)',
    borderRadius: '16px', padding: '28px', width: '450px', maxWidth: '92vw',
    boxShadow: '0 25px 80px rgba(0,0,0,0.5)', color: '#f1f5f9'
};
const modalHeaderStyle: React.CSSProperties = {
    fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#f1f5f9'
};
const modalFooterStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px'
};
