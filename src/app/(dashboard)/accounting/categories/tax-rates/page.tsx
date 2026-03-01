
'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface TaxGroup {
    id: string;
    code: string;
    name: string;
}

interface TaxRate {
    id: string;
    code: string;
    name: string;
    rate: number;
    taxGroupId: string;
    taxGroup?: TaxGroup;
    isActive: boolean;
}

export default function TaxRatePage() {
    const [data, setData] = useState<TaxRate[]>([]);
    const [groups, setGroups] = useState<TaxGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<TaxRate | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [filter, setFilter] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        rate: 0,
        taxGroupId: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [rateRes, groupRes] = await Promise.all([
                fetch('/api/tax-rates'),
                fetch('/api/tax-groups')
            ]);

            if (rateRes.ok) setData(await rateRes.json());
            if (groupRes.ok) setGroups(await groupRes.json());
        } catch (error) {
            console.error('Failed to fetch tax rates', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (item: TaxRate) => {
        if (!confirm(`Bạn có chắc muốn xóa mức thuế "${item.code}"?`)) return;

        try {
            const res = await fetch(`/api/tax-rates/${item.id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            } else {
                alert('Không thể xóa mức thuế này');
            }
        } catch (e) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleEdit = (item: TaxRate) => {
        setEditingItem(item);
        setFormData({
            code: item.code,
            name: item.name,
            rate: Number(item.rate),
            taxGroupId: item.taxGroupId
        });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        try {
            const url = editingItem ? `/api/tax-rates/${editingItem.id}` : '/api/tax-rates';
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || 'Có lỗi xảy ra');
                return;
            }

            setShowForm(false);
            setEditingItem(null);
            setFormData({ code: '', name: '', rate: 0, taxGroupId: '' });
            fetchData();
        } catch {
            alert('Có lỗi xảy ra');
        }
    };

    const filteredData = data.filter(item =>
        item.code.toLowerCase().includes(filter.toLowerCase()) ||
        item.name.toLowerCase().includes(filter.toLowerCase())
    );

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
                        📊 Danh mục Thuế suất
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                        Quản lý các mức thuế suất chi tiết theo từng nhóm thuế
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        placeholder="🔍 Tìm kiếm..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{ ...inputStyle, width: '200px' }}
                    />
                    <button onClick={fetchData} style={btnSecondary}>🔄</button>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ code: '', name: '', rate: 0, taxGroupId: groups[0]?.id || '' });
                            setShowForm(true);
                        }}
                        style={btnPrimary}
                    >
                        ＋ Thêm mới
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
                <div style={{
                    borderRadius: '12px',
                    border: '1px solid var(--border, #334155)',
                    boxShadow: 'var(--shadow-card)',
                    backgroundColor: 'var(--surface, #1e293b)',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                                <th style={thStyle}>Mã thuế</th>
                                <th style={thStyle}>Tên mức thuế</th>
                                <th style={thStyle}>Nhóm thuế</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Thuế suất (%)</th>
                                <th style={{ ...thStyle, textAlign: 'center', width: '100px' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Đang tải...</td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chưa có dữ liệu</td></tr>
                            ) : (
                                filteredData.map((item, idx) => (
                                    <tr key={item.id}
                                        onMouseEnter={() => setHoveredRow(item.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        style={{
                                            borderBottom: idx === filteredData.length - 1 ? 'none' : '1px solid var(--border, #334155)',
                                            backgroundColor: hoveredRow === item.id ? 'var(--surface-hover, #334155)' : 'transparent',
                                            cursor: 'pointer'
                                        }}
                                        onDoubleClick={() => handleEdit(item)}
                                    >
                                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', width: '120px' }}>{item.code}</td>
                                        <td style={{ ...tdStyle, fontWeight: 600 }}>{item.name}</td>
                                        <td style={{ ...tdStyle, color: '#94a3b8' }}>{item.taxGroup?.name || '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace', fontSize: '14px' }}>
                                            {Number(item.rate)}%
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', opacity: hoveredRow === item.id ? 1 : 0.3 }}>
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} style={actionBtn} title="Sửa">✏️</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} style={actionBtn} title="Xóa">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showForm && (
                <div style={modalOverlay} onClick={() => setShowForm(false)}>
                    <div style={modalContent} onClick={e => e.stopPropagation()}>
                        <h2 style={modalHeader}>
                            {editingItem ? '✏️ Sửa Mức thuế' : '➕ Thêm Mức thuế'}
                        </h2>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Mã thuế *</label>
                                    <input
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="VD: VAT10"
                                        style={inputStyle}
                                        disabled={!!editingItem} // Code usually immutable
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Thuế suất (%) *</label>
                                    <input
                                        type="number"
                                        value={formData.rate}
                                        onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Nhóm thuế *</label>
                                <select
                                    value={formData.taxGroupId}
                                    onChange={e => setFormData({ ...formData, taxGroupId: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="">-- Chọn nhóm thuế --</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.code} - {g.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Tên hiển thị *</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Thuế GTGT 10%"
                                    style={inputStyle}
                                />
                            </div>

                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                            <button onClick={() => setShowForm(false)} style={btnSecondary}>Hủy</button>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.code || !formData.name || !formData.taxGroupId}
                                style={{
                                    ...btnPrimary,
                                    opacity: (!formData.code || !formData.name || !formData.taxGroupId) ? 0.5 : 1
                                }}
                            >
                                {editingItem ? '💾 Lưu' : '✅ Tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Styles (Reused)
const modalOverlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalContent: React.CSSProperties = {
    backgroundColor: 'var(--surface, #1e293b)',
    borderRadius: '16px', padding: '28px', width: '500px', maxWidth: '95vw',
    boxShadow: '0 25px 80px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'
};
const modalHeader: React.CSSProperties = {
    fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary, #f1f5f9)'
};
const thStyle: React.CSSProperties = {
    padding: '12px 16px', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase',
    textAlign: 'left'
};
const tdStyle: React.CSSProperties = {
    padding: '14px 16px', fontSize: '13px', color: 'var(--text-primary, #e2e8f0)',
    borderBottom: '1px solid var(--border, #334155)'
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
