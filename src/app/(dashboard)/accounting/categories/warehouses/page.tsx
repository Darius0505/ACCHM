
'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Warehouse {
    id: string;
    code: string;
    name: string;
    address?: string;
    description?: string;
    parentId?: string;
    children?: Warehouse[];
    _isChild?: boolean;
    _childCount?: number;
    // _count not used yet
}

export default function WarehousePage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Warehouse | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [parentWarehouses, setParentWarehouses] = useState<Warehouse[]>([]);

    const [formData, setFormData] = useState({
        code: '', name: '', address: '', description: '', parentId: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/warehouses`);
            if (!res.ok) throw new Error('Failed to fetch');
            const warehouses: Warehouse[] = await res.json();
            if (!Array.isArray(warehouses)) throw new Error('Invalid data format received');
            setParentWarehouses(warehouses);

            // Flatten hierarchy for table display
            const rows: any[] = [];

            const flatten = (items: Warehouse[], level = 0) => {
                items.forEach(item => {
                    rows.push({
                        ...item,
                        _level: level,
                        _isChild: level > 0,
                        _childCount: item.children?.length || 0
                    });
                    if (item.children && item.children.length > 0) {
                        flatten(item.children, level + 1);
                    }
                });
            };

            flatten(warehouses);

            setData(rows);
            setError(null);
        } catch {
            setError('Không thể tải dữ liệu');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (item: any) => {
        if (!confirm(`Bạn có chắc muốn xóa kho "${item.name}"?`)) return;

        try {
            const res = await fetch(`/api/warehouses/${item.id}`, { method: 'DELETE' });
            if (!res.ok) {
                let errorMessage = `Lỗi xóa (HTTP ${res.status})`;
                try {
                    const err = await res.json();
                    if (err && err.error) errorMessage = err.error;
                } catch { }
                alert(`❌ ${errorMessage}`);
                return;
            }
            fetchData();
        } catch (e: any) {
            alert(`❌ Có lỗi xảy ra khi xóa: ${e?.message || 'Unknown error'}`);
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            code: item.code,
            name: item.name,
            address: item.address || '',
            description: item.description || '',
            parentId: item.parentId || '',
        });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        try {
            const url = editingItem ? `/api/warehouses/${editingItem.id}` : '/api/warehouses';
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, parentId: formData.parentId || null }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || 'Có lỗi xảy ra');
                return;
            }

            setShowForm(false);
            setEditingItem(null);
            setFormData({ code: '', name: '', address: '', description: '', parentId: '' });
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
                        🏭 Danh mục Kho
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                        Quản lý hệ thống kho hàng, kho nguyên vật liệu
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={fetchData} style={btnSecondary}>🔄 Làm mới</button>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ code: '', name: '', address: '', description: '', parentId: '' });
                            setShowForm(true);
                        }}
                        style={btnPrimary}
                    >
                        ＋ Thêm mới
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: '12px 24px', fontSize: '13px',
                    background: 'linear-gradient(90deg, #fef2f2, #fff1f2)',
                    color: '#dc2626', borderBottom: '1px solid #fecaca'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Table */}
            <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>⏳</div>
                            <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '14px' }}>Đang tải dữ liệu...</div>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        borderRadius: '12px',
                        border: '1px solid var(--border, #334155)',
                        boxShadow: 'var(--shadow-card)',
                        overflow: 'auto',
                        maxHeight: 'calc(100vh - 240px)',
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead>
                                <tr style={{
                                    background: 'var(--grid-header-bg, #334155)',
                                }}>
                                    <th style={thStyle}>STT</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '120px' }}>Mã kho</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '250px' }}>Tên kho</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '200px' }}>Địa chỉ</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '200px' }}>Diễn giải</th>
                                    <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{
                                            padding: '60px', textAlign: 'center',
                                            color: 'var(--text-muted, #64748b)', fontSize: '14px',
                                            background: 'var(--surface, #1e293b)'
                                        }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                                            Chưa có kho nào. Hãy thêm mới!
                                        </td>
                                    </tr>
                                ) : data.map((item, idx) => {
                                    const isHovered = hoveredRow === item.id;
                                    const level = item._level || 0;
                                    const isChild = level > 0;

                                    return (
                                        <tr
                                            key={item.id}
                                            onMouseEnter={() => setHoveredRow(item.id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                            style={{
                                                backgroundColor: isHovered
                                                    ? 'var(--surface-hover, #334155)'
                                                    : idx % 2 === 0
                                                        ? 'var(--surface, #1e293b)'
                                                        : 'var(--surface-active, #253044)',
                                                borderBottom: '1px solid var(--border, #334155)',
                                                transition: 'background-color 0.15s ease',
                                                cursor: 'pointer',
                                            }}
                                            onDoubleClick={() => handleEdit(item)}
                                        >
                                            <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '12px', width: '50px' }}>
                                                {idx + 1}
                                            </td>

                                            <td style={{ ...tdStyle, fontWeight: isChild ? 500 : 700 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: level * 20 }}>
                                                    {isChild && (
                                                        <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '12px' }}>└</span>
                                                    )}
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center',
                                                        padding: '2px 8px', borderRadius: '4px',
                                                        backgroundColor: isChild ? 'transparent' : 'rgba(59,130,246,0.12)',
                                                        color: isChild ? 'var(--text-primary, #e2e8f0)' : '#3b82f6',
                                                        fontSize: '13px', fontFamily: 'monospace',
                                                        border: isChild ? 'none' : `1px solid rgba(59,130,246,0.3)`,
                                                    }}>
                                                        {item.code}
                                                    </span>
                                                </div>
                                            </td>

                                            <td style={{
                                                ...tdStyle,
                                                fontWeight: isChild ? 400 : 600,
                                                color: 'var(--text-primary, #e2e8f0)',
                                            }}>
                                                {!isChild && item._childCount > 0 && (
                                                    <span style={{ fontSize: '14px', marginRight: '6px' }}>📂</span>
                                                )}
                                                {item.name}
                                            </td>

                                            <td style={{ ...tdStyle, color: 'var(--text-secondary, #94a3b8)', fontSize: '12px' }}>
                                                {item.address || '—'}
                                            </td>

                                            <td style={{ ...tdStyle, color: 'var(--text-secondary, #94a3b8)', fontSize: '12px' }}>
                                                {item.description || '—'}
                                            </td>

                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', opacity: isHovered ? 1 : 0.3, transition: 'opacity 0.15s' }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                                        title="Sửa"
                                                        style={actionBtn}
                                                    >✏️</button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                                        title="Xóa"
                                                        style={actionBtn}
                                                    >🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Footer */}
                        <div style={{
                            padding: '10px 16px',
                            background: 'var(--surface-active, #253044)',
                            borderTop: '1px solid var(--border, #334155)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            fontSize: '12px', color: 'var(--text-muted, #64748b)'
                        }}>
                            <span>Tổng: <strong style={{ color: 'var(--text-primary, #e2e8f0)' }}>{data.length}</strong> kho</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.2s ease'
                }}
                    onClick={() => { setShowForm(false); setEditingItem(null); }}
                >
                    <div
                        style={{
                            backgroundColor: 'var(--surface, #1e293b)',
                            borderRadius: '16px', padding: '28px', width: '520px', maxWidth: '92vw',
                            boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
                            animation: 'slideUp 0.25s ease'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{
                            fontSize: '18px', fontWeight: 700, marginBottom: '20px',
                            color: 'var(--text-primary, #f1f5f9)',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            {editingItem ? '✏️ Sửa Kho' : '➕ Thêm Kho mới'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Row 1: Code */}
                            <div>
                                <label style={labelStyle}>Mã kho *</label>
                                <input
                                    value={formData.code}
                                    onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                    placeholder="VD: KHO-TONG, KHO-NL..."
                                    disabled={!!editingItem}
                                    style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.5px' }}
                                />
                            </div>

                            {/* Row 2: Name */}
                            <div>
                                <label style={labelStyle}>Tên kho *</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder="VD: Kho hàng hóa, Kho nguyên liệu"
                                    style={inputStyle}
                                />
                            </div>

                            {/* Row 3: Address */}
                            <div>
                                <label style={labelStyle}>Địa chỉ</label>
                                <input
                                    value={formData.address}
                                    onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                                    placeholder="Địa chỉ kho..."
                                    style={inputStyle}
                                />
                            </div>

                            {/* Row 4: Parent */}
                            <div>
                                <label style={labelStyle}>Thuộc kho cha</label>
                                <select
                                    value={formData.parentId}
                                    onChange={e => setFormData(p => ({ ...p, parentId: e.target.value }))}
                                    style={inputStyle}
                                >
                                    <option value="">— Không (kho gốc) —</option>
                                    {parentWarehouses
                                        .filter(p => !editingItem || p.id !== editingItem.id) // Prevent self-select
                                        .map(p => (
                                            <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                        ))}
                                </select>
                            </div>

                            {/* Row 5: Description */}
                            <div>
                                <label style={labelStyle}>Diễn giải</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Mô tả..."
                                    rows={2}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                            <button
                                onClick={() => { setShowForm(false); setEditingItem(null); }}
                                style={btnSecondary}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.code || !formData.name}
                                style={{
                                    ...btnPrimary,
                                    opacity: (!formData.code || !formData.name) ? 0.4 : 1,
                                    cursor: (!formData.code || !formData.name) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {editingItem ? '💾 Cập nhật' : '✅ Tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

// ─────────── Styles ───────────
const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: '11px', fontWeight: 700,
    color: 'var(--text-primary, #e2e8f0)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid var(--border, #334155)',
    position: 'sticky', top: 0, zIndex: 2,
    backgroundColor: 'var(--grid-header-bg, #334155)',
};

const tdStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: '13px',
    color: 'var(--text-primary, #e2e8f0)',
    whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis',
};

const actionBtn: React.CSSProperties = {
    border: 'none', background: 'transparent',
    cursor: 'pointer', padding: '4px 6px', borderRadius: '4px',
    fontSize: '14px', lineHeight: 1,
    transition: 'background 0.15s',
};

const btnPrimary: React.CSSProperties = {
    background: 'var(--btn-primary, #F97316)',
    color: 'var(--btn-primary-text, #fff)', border: 'none',
    padding: '9px 20px', borderRadius: '8px',
    fontWeight: 600, fontSize: '13px', cursor: 'pointer',
    boxShadow: 'var(--shadow-card)', transition: 'all 0.2s',
};

const btnSecondary: React.CSSProperties = {
    background: 'var(--surface-hover, #334155)',
    color: 'var(--text-primary, #e2e8f0)',
    border: '1px solid var(--border, #475569)',
    padding: '9px 18px', borderRadius: '8px',
    fontWeight: 500, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-secondary, #94a3b8)',
    marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--border, #475569)',
    backgroundColor: 'var(--background, #0f172a)',
    color: 'var(--text-primary, #e2e8f0)',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};
