
'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Currency {
    id: string;
    code: string;
    name: string;
    nameEN?: string;
    symbol?: string;
    exchangeRate: number;
    isDefault: boolean;
    isActive: boolean;
}

export default function CurrencyPage() {
    const [data, setData] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Currency | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        nameEN: '',
        symbol: '',
        exchangeRate: 1,
        isDefault: false
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/currencies');
            if (res.ok) {
                setData(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch currencies', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (item: Currency) => {
        if (!confirm(`Bạn có chắc muốn xóa loại tiền "${item.code}"?`)) return;

        try {
            const res = await fetch(`/api/currencies/${item.id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            } else {
                alert('Không thể xóa loại tiền này');
            }
        } catch (e) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleEdit = (item: Currency) => {
        setEditingItem(item);
        setFormData({
            code: item.code,
            name: item.name,
            nameEN: item.nameEN || '',
            symbol: item.symbol || '',
            exchangeRate: Number(item.exchangeRate),
            isDefault: item.isDefault
        });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        try {
            const url = editingItem ? `/api/currencies/${editingItem.id}` : '/api/currencies';
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
            setFormData({ code: '', name: '', nameEN: '', symbol: '', exchangeRate: 1, isDefault: false });
            fetchData();
        } catch {
            alert('Có lỗi xảy ra');
        }
    };

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
                        💱 Danh mục Loại tiền
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                        Quản lý các loại tiền tệ và tỷ giá quy đổi
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={fetchData} style={btnSecondary}>🔄 Làm mới</button>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ code: '', name: '', nameEN: '', symbol: '', exchangeRate: 1, isDefault: false });
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
                                <th style={thStyle}>Mã tiền tệ</th>
                                <th style={thStyle}>Tên loại tiền</th>
                                <th style={thStyle}>Ký hiệu</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Tỷ giá quy đổi</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Mặc định</th>
                                <th style={{ ...thStyle, textAlign: 'center', width: '100px' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Đang tải...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chưa có dữ liệu</td></tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr key={item.id}
                                        onMouseEnter={() => setHoveredRow(item.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        style={{
                                            borderBottom: idx === data.length - 1 ? 'none' : '1px solid var(--border, #334155)',
                                            backgroundColor: hoveredRow === item.id ? 'var(--surface-hover, #334155)' : 'transparent',
                                            cursor: 'pointer'
                                        }}
                                        onDoubleClick={() => handleEdit(item)}
                                    >
                                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b' }}>{item.code}</td>
                                        <td style={tdStyle}>
                                            <div>{item.name}</div>
                                            {item.nameEN && <div style={{ fontSize: '11px', color: '#64748b' }}>{item.nameEN}</div>}
                                        </td>
                                        <td style={{ ...tdStyle, fontSize: '16px' }}>{item.symbol}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>
                                            {new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 6 }).format(Number(item.exchangeRate))}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            {item.isDefault ? (
                                                <span style={{ fontSize: '18px' }}>⭐️</span>
                                            ) : (
                                                <span style={{ color: '#475569' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', opacity: hoveredRow === item.id ? 1 : 0.3 }}>
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} style={actionBtn} title="Sửa">✏️</button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (item.isDefault) {
                                                            alert('Không thể xóa đồng tiền đang được chọn làm mặc định.\nVui lòng thiết lập loại tiền khác làm mặc định trước.');
                                                            return;
                                                        }
                                                        handleDelete(item);
                                                    }}
                                                    style={{ ...actionBtn, opacity: item.isDefault ? 0.3 : 1, cursor: item.isDefault ? 'not-allowed' : 'pointer' }}
                                                    title={item.isDefault ? "Không thể xóa mặc định" : "Xóa"}
                                                >
                                                    🗑️
                                                </button>
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
                            {editingItem ? '✏️ Sửa Loại tiền' : '➕ Thêm Loại tiền'}
                        </h2>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Mã tiền tệ *</label>
                                    <input
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="VD: USD"
                                        style={inputStyle}
                                        disabled={!!editingItem} // Code usually immutable
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Ký hiệu</label>
                                    <input
                                        value={formData.symbol}
                                        onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                                        placeholder="VD: $"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Tên loại tiền *</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Đô la Mỹ"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Tên tiếng Anh</label>
                                <input
                                    value={formData.nameEN}
                                    onChange={e => setFormData({ ...formData, nameEN: e.target.value })}
                                    placeholder="VD: US Dollar"
                                    style={inputStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Tỷ giá quy đổi (so với đồng hạch toán) *</label>
                                <input
                                    type="number"
                                    value={formData.exchangeRate}
                                    onChange={e => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) })}
                                    style={inputStyle}
                                />
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                    Ví dụ: 1 USD = 23,500 VND. Nhập 23500.
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={formData.isDefault}
                                    onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                                    style={{ width: '16px', height: '16px' }}
                                />
                                <label htmlFor="isDefault" style={{ color: '#e2e8f0', fontSize: '14px', cursor: 'pointer' }}>
                                    Là đồng tiền hạch toán (Mặc định)
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                            <button onClick={() => setShowForm(false)} style={btnSecondary}>Hủy</button>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.code || !formData.name}
                                style={{
                                    ...btnPrimary,
                                    opacity: (!formData.code || !formData.name) ? 0.5 : 1
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
