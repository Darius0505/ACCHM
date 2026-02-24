
'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface BankAccount {
    id: string;
    code: string;
    name: string;
    bankName: string;
    accountNumber: string;
    branch?: string;
    currency: string;
    accountId: string;
    partnerId?: string;
    partner?: { id: string; code: string; name: string };
    account?: { id: string; code: string; name: string };
}

interface Partner {
    id: string;
    code: string;
    name: string;
}

interface Account {
    id: string;
    code: string;
    name: string;
}

export default function BankAccountPage() {
    const [data, setData] = useState<BankAccount[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [glAccounts, setGlAccounts] = useState<Account[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<BankAccount | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        bankName: '',
        accountNumber: '',
        branch: '',
        currency: 'VND',
        accountId: '',
        partnerId: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [resBanks, resPartners, resAccounts] = await Promise.all([
                fetch('/api/bank-accounts'),
                fetch('/api/partners?type=BANK'),
                fetch('/api/accounts?type=ASSET&code=112') // Assuming filtering works, or just fetch all
            ]);

            if (!resBanks.ok) throw new Error('Failed to fetch bank accounts');
            const banksData = await resBanks.json();

            if (resPartners.ok) setPartners(await resPartners.json());
            if (resAccounts.ok) setGlAccounts(await resAccounts.json());

            setData(banksData);
            setError(null);
        } catch {
            setError('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (item: BankAccount) => {
        if (!confirm(`Bạn có chắc muốn xóa tài khoản "${item.accountNumber}"?`)) return;

        try {
            const res = await fetch(`/api/bank-accounts/${item.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                alert(`❌ ${err.error || 'Lỗi xóa'}`);
                return;
            }
            fetchData();
        } catch (e: any) {
            alert(`❌ Có lỗi xảy ra: ${e.message}`);
        }
    };

    const handleEdit = (item: BankAccount) => {
        setEditingItem(item);
        setFormData({
            code: item.code,
            name: item.name,
            bankName: item.bankName,
            accountNumber: item.accountNumber,
            branch: item.branch || '',
            currency: item.currency,
            accountId: item.accountId,
            partnerId: item.partnerId || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        try {
            const url = editingItem ? `/api/bank-accounts/${editingItem.id}` : '/api/bank-accounts';
            const method = editingItem ? 'PUT' : 'POST';

            // Auto-fill bankName from partner if selected and empty
            let finalData = { ...formData };
            if (finalData.partnerId && !finalData.bankName) {
                const p = partners.find(x => x.id === finalData.partnerId);
                if (p) finalData.bankName = p.name;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || 'Có lỗi xảy ra');
                return;
            }

            setShowForm(false);
            setEditingItem(null);
            setFormData({
                code: '', name: '', bankName: '', accountNumber: '',
                branch: '', currency: 'VND', accountId: '', partnerId: ''
            });
            fetchData();
        } catch {
            alert('Có lỗi xảy ra');
        }
    };

    // Grouping by Partner for display
    const groupedData = React.useMemo(() => {
        const groups: Record<string, BankAccount[]> = {};
        data.forEach(item => {
            const key = item.partner ? `${item.partner.code} - ${item.partner.name}` : 'Khác';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        return groups;
    }, [data]);

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
                        🏦 Danh mục Tài khoản Ngân hàng
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                        Quản lý tài khoản ngân hàng và liên kết đối tượng
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={fetchData} style={btnSecondary}>🔄 Làm mới</button>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({
                                code: '', name: '', bankName: '', accountNumber: '',
                                branch: '', currency: 'VND', accountId: '', partnerId: ''
                            });
                            setShowForm(true);
                        }}
                        style={btnPrimary}
                    >
                        ＋ Thêm mới
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>⏳</div>
                            <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '14px' }}>Đang tải dữ liệu...</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {Object.entries(groupedData).map(([groupName, items]) => (
                            <div key={groupName} style={{
                                borderRadius: '12px',
                                border: '1px solid var(--border, #334155)',
                                boxShadow: 'var(--shadow-card)',
                                backgroundColor: 'var(--surface, #1e293b)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    background: 'var(--surface-active, #253044)',
                                    borderBottom: '1px solid var(--border, #334155)',
                                    fontWeight: 700, color: 'var(--text-primary, #e2e8f0)',
                                    fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    <span>🏛️</span> {groupName}
                                    <span style={{
                                        fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.05)', fontWeight: 500
                                    }}>{items.length} tài khoản</span>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                                            <th style={thStyle}>Mã tham chiếu</th>
                                            <th style={thStyle}>Số tài khoản</th>
                                            <th style={thStyle}>Tên tài khoản</th>
                                            <th style={thStyle}>Chi nhánh</th>
                                            <th style={thStyle}>Loại tiền</th>
                                            <th style={thStyle}>TK Kế toán</th>
                                            <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={item.id}
                                                onMouseEnter={() => setHoveredRow(item.id)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                                style={{
                                                    borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--border, #334155)',
                                                    backgroundColor: hoveredRow === item.id ? 'var(--surface-hover, #334155)' : 'transparent',
                                                    cursor: 'pointer'
                                                }}
                                                onDoubleClick={() => handleEdit(item)}
                                            >
                                                <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#3b82f6' }}>{item.code}</td>
                                                <td style={{ ...tdStyle, fontWeight: 600 }}>{item.accountNumber}</td>
                                                <td style={tdStyle}>{item.name}</td>
                                                <td style={tdStyle}>{item.branch || '—'}</td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '2px 6px', borderRadius: '4px',
                                                        background: item.currency === 'VND' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                                        color: item.currency === 'VND' ? '#10b981' : '#f59e0b',
                                                        fontSize: '11px', fontWeight: 600
                                                    }}>{item.currency}</span>
                                                </td>
                                                <td style={tdStyle}>{item.account ? `${item.account.code} - ${item.account.name}` : '—'}</td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', opacity: hoveredRow === item.id ? 1 : 0.3 }}>
                                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} style={actionBtn}>✏️</button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} style={actionBtn}>🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}

                        {data.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #94a3b8)' }}>
                                Chưa có tài khoản ngân hàng nào.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div style={modalOverlay} onClick={() => setShowForm(false)}>
                    <div style={modalContent} onClick={e => e.stopPropagation()}>
                        <h2 style={modalHeader}>
                            {editingItem ? '✏️ Sửa Tài khoản' : '➕ Thêm Tài khoản'}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Ngân hàng (Đối tượng) *</label>
                                <select
                                    value={formData.partnerId}
                                    onChange={e => {
                                        const pid = e.target.value;
                                        const p = partners.find(x => x.id === pid);
                                        setFormData(prev => ({
                                            ...prev,
                                            partnerId: pid,
                                            bankName: p ? p.name : prev.bankName
                                        }));
                                    }}
                                    style={inputStyle}
                                >
                                    <option value="">-- Chọn ngân hàng --</option>
                                    {partners.map(p => (
                                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Mã tham chiếu *</label>
                                <input
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="VD: VCB-HCM"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Số tài khoản *</label>
                                <input
                                    value={formData.accountNumber}
                                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                    placeholder="007100..."
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Tên gợi nhớ (Mô tả) *</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: TK Thanh toán chính"
                                    style={inputStyle}
                                />
                            </div>

                            {/* Hidden or read-only bank name if partner selected, but editable if needed */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Tên Ngân hàng (Hiển thị) *</label>
                                <input
                                    value={formData.bankName}
                                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Chi nhánh</label>
                                <input
                                    value={formData.branch}
                                    onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                    placeholder="CN TP.HCM"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Loại tiền</label>
                                <select
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="VND">VND</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="JPY">JPY</option>
                                </select>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Tài khoản kế toán *</label>
                                <select
                                    value={formData.accountId}
                                    onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="">-- Chọn TK --</option>
                                    {glAccounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                            <button onClick={() => setShowForm(false)} style={btnSecondary}>Hủy</button>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.code || !formData.accountNumber || !formData.accountId}
                                style={{
                                    ...btnPrimary,
                                    opacity: (!formData.code || !formData.accountNumber || !formData.accountId) ? 0.5 : 1
                                }}
                            >
                                {editingItem ? '💾 Lưu' : '✅ Tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

// Styles
const modalOverlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalContent: React.CSSProperties = {
    backgroundColor: 'var(--surface, #1e293b)',
    borderRadius: '16px', padding: '28px', width: '600px', maxWidth: '95vw',
    boxShadow: '0 25px 80px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'
};
const modalHeader: React.CSSProperties = {
    fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary, #f1f5f9)'
};
const thStyle: React.CSSProperties = {
    padding: '10px 12px', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase',
    textAlign: 'left'
};
const tdStyle: React.CSSProperties = {
    padding: '12px', fontSize: '13px', color: 'var(--text-primary, #e2e8f0)',
    borderBottom: '1px solid var(--border, #334155)' // Override inside loop
};
const btnPrimary: React.CSSProperties = {
    background: 'var(--btn-primary, #F97316)', color: '#fff', border: 'none',
    padding: '9px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
};
const btnSecondary: React.CSSProperties = {
    background: 'var(--surface-hover, #334155)', color: 'var(--text-primary, #e2e8f0)',
    border: '1px solid var(--border, #475569)', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer'
};
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--border, #475569)', backgroundColor: 'var(--background, #0f172a)',
    color: 'var(--text-primary, #e2e8f0)', fontSize: '14px', outline: 'none'
};
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #94a3b8)',
    marginBottom: '5px', textTransform: 'uppercase'
};
const actionBtn: React.CSSProperties = {
    border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', fontSize: '14px'
};
