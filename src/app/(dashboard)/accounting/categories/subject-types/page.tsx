'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface PartnerType {
    id: string;
    code: string;
    name: string;
    nameEN?: string;
    nature: string;
    description?: string;
    parentId?: string;
    isSystem: boolean;
    sortOrder: number;
    children?: PartnerType[];
    _count?: { partners: number };
}

const NATURE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    CUSTOMER: { label: 'Khách hàng', bg: 'rgba(34,197,94,0.12)', text: '#16a34a', icon: '👤' },
    VENDOR: { label: 'Nhà cung cấp', bg: 'rgba(59,130,246,0.12)', text: '#2563eb', icon: '🏭' },
    EMPLOYEE: { label: 'Nhân viên', bg: 'rgba(245,158,11,0.12)', text: '#d97706', icon: '💼' },
    BANK: { label: 'Ngân hàng', bg: 'rgba(6,182,212,0.12)', text: '#0891b2', icon: '🏦' },
    OTHER: { label: 'Khác', bg: 'rgba(148,163,184,0.12)', text: '#64748b', icon: '📋' },
};

export default function SubjectTypesPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<PartnerType | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [parentTypes, setParentTypes] = useState<PartnerType[]>([]);

    const [formData, setFormData] = useState({
        code: '', name: '', nameEN: '', nature: 'CUSTOMER', description: '', parentId: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/partner-types`);
            if (!res.ok) throw new Error('Failed to fetch');
            const types: PartnerType[] = await res.json();
            setParentTypes(types);

            // Flatten hierarchy
            const rows: any[] = [];
            types.forEach(parent => {
                rows.push({ ...parent, _isChild: false, _childCount: parent.children?.length || 0 });
                parent.children?.forEach(child => {
                    rows.push({ ...child, _isChild: true, _childCount: 0 });
                });
            });

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
        if (item.isSystem) {
            alert('❌ Không thể xóa loại hệ thống!');
            return;
        }
        if (!confirm(`Bạn có chắc muốn xóa "${item.name}"?`)) return;

        try {
            const res = await fetch(`/api/partner-types/${item.id}`, { method: 'DELETE' });
            if (!res.ok) {
                let errorMessage = `Lỗi xóa (HTTP ${res.status})`;
                try {
                    const err = await res.json();
                    if (err && err.error) errorMessage = err.error;
                } catch {
                    // Response is not JSON
                }
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
            nameEN: item.nameEN || '',
            nature: item.nature,
            description: item.description || '',
            parentId: item.parentId || '',
        });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        try {
            const url = editingItem ? `/api/partner-types/${editingItem.id}` : '/api/partner-types';
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
            setFormData({ code: '', name: '', nameEN: '', nature: 'CUSTOMER', description: '', parentId: '' });
            fetchData();
        } catch {
            alert('Có lỗi xảy ra');
        }
    };

    const NatureBadge = ({ nature }: { nature: string }) => {
        const config = NATURE_CONFIG[nature] || NATURE_CONFIG.OTHER;
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px', borderRadius: '20px',
                backgroundColor: config.bg, color: config.text,
                fontSize: '12px', fontWeight: 600, letterSpacing: '0.3px',
                whiteSpace: 'nowrap'
            }}>
                <span style={{ fontSize: '11px' }}>{config.icon}</span>
                {config.label}
            </span>
        );
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
                        📇 Danh mục Loại đối tượng
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                        Phân loại đối tượng: Khách hàng, Nhà cung cấp, Nhân viên
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={fetchData} style={btnSecondary}>🔄 Làm mới</button>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ code: '', name: '', nameEN: '', nature: 'CUSTOMER', description: '', parentId: '' });
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
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '120px' }}>Mã loại</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '200px' }}>Tên loại đối tượng</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '160px' }}>Tên tiếng Anh</th>
                                    <th style={{ ...thStyle, textAlign: 'center', minWidth: '130px' }}>Phân loại</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '200px' }}>Diễn giải</th>
                                    <th style={{ ...thStyle, textAlign: 'center', width: '90px' }}>Đối tượng</th>
                                    <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{
                                            padding: '60px', textAlign: 'center',
                                            color: 'var(--text-muted, #64748b)', fontSize: '14px',
                                            background: 'var(--surface, #1e293b)'
                                        }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                                            Chưa có loại đối tượng nào. Hãy thêm mới!
                                        </td>
                                    </tr>
                                ) : data.map((item, idx) => {
                                    const isHovered = hoveredRow === item.id;
                                    const isChild = item._isChild;
                                    const natureKey = item.nature;
                                    const config = NATURE_CONFIG[natureKey] || NATURE_CONFIG.OTHER;

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
                                            {/* STT */}
                                            <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '12px', width: '50px' }}>
                                                {idx + 1}
                                            </td>

                                            {/* Mã loại */}
                                            <td style={{ ...tdStyle, fontWeight: isChild ? 500 : 700 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {isChild && (
                                                        <span style={{ color: config.text, fontSize: '12px', opacity: 0.6 }}>└</span>
                                                    )}
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center',
                                                        padding: '2px 8px', borderRadius: '4px',
                                                        backgroundColor: isChild ? 'transparent' : config.bg,
                                                        color: isChild ? 'var(--text-primary, #e2e8f0)' : config.text,
                                                        fontSize: '13px', fontFamily: 'monospace',
                                                        border: isChild ? 'none' : `1px solid ${config.text}20`,
                                                    }}>
                                                        {item.code}
                                                    </span>
                                                    {item.isSystem && (
                                                        <span title="Hệ thống" style={{
                                                            fontSize: '9px', padding: '1px 5px',
                                                            borderRadius: '3px', background: 'var(--primary-light, rgba(249,115,22,0.15))',
                                                            color: 'var(--primary, #F97316)', fontWeight: 700
                                                        }}>
                                                            SYS
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Tên */}
                                            <td style={{
                                                ...tdStyle,
                                                paddingLeft: isChild ? '32px' : '12px',
                                                fontWeight: isChild ? 400 : 600,
                                                color: isChild ? 'var(--text-secondary, #94a3b8)' : 'var(--text-primary, #e2e8f0)',
                                            }}>
                                                {!isChild && item._childCount > 0 && (
                                                    <span style={{ fontSize: '10px', marginRight: '4px' }}>📂</span>
                                                )}
                                                {item.name}
                                            </td>

                                            {/* Tên EN */}
                                            <td style={{ ...tdStyle, color: 'var(--text-secondary, #94a3b8)', fontStyle: 'italic', fontSize: '12px' }}>
                                                {item.nameEN || '—'}
                                            </td>

                                            {/* Phân loại */}
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <NatureBadge nature={natureKey} />
                                            </td>

                                            {/* Diễn giải */}
                                            <td style={{ ...tdStyle, color: 'var(--text-secondary, #94a3b8)', fontSize: '12px' }}>
                                                {item.description || '—'}
                                            </td>

                                            {/* Số đối tượng */}
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                    minWidth: '28px', height: '22px', borderRadius: '11px',
                                                    fontSize: '12px', fontWeight: 600,
                                                    backgroundColor: (item._count?.partners || 0) > 0 ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.08)',
                                                    color: (item._count?.partners || 0) > 0 ? '#60a5fa' : 'var(--text-muted, #475569)',
                                                }}>
                                                    {item._count?.partners || 0}
                                                </span>
                                            </td>

                                            {/* Actions */}
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
                                                        style={{ ...actionBtn, ...(item.isSystem ? { opacity: 0.2, cursor: 'not-allowed' } : {}) }}
                                                        disabled={item.isSystem}
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
                            <span>Tổng: <strong style={{ color: 'var(--text-primary, #e2e8f0)' }}>{data.length}</strong> loại đối tượng</span>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {Object.entries(NATURE_CONFIG).map(([key, cfg]) => {
                                    const count = data.filter(d => d.nature === key).length;
                                    if (count === 0) return null;
                                    return (
                                        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cfg.text }} />
                                            <span>{cfg.label}: <strong style={{ color: cfg.text }}>{count}</strong></span>
                                        </span>
                                    );
                                })}
                            </div>
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
                            {editingItem ? '✏️ Sửa loại đối tượng' : '➕ Thêm loại đối tượng mới'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Row 1: Code + Nature */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Mã loại *</label>
                                    <input
                                        value={formData.code}
                                        onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                        placeholder="VD: KH_VIP"
                                        disabled={!!editingItem}
                                        style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.5px' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Phân loại *</label>
                                    <select
                                        value={formData.nature}
                                        onChange={e => setFormData(p => ({ ...p, nature: e.target.value }))}
                                        style={inputStyle}
                                    >
                                        {Object.entries(NATURE_CONFIG).map(([key, cfg]) => (
                                            <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Tên */}
                            <div>
                                <label style={labelStyle}>Tên loại đối tượng *</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder="VD: Khách hàng VIP"
                                    style={inputStyle}
                                />
                            </div>

                            {/* Row 3: Tên EN */}
                            <div>
                                <label style={labelStyle}>Tên tiếng Anh</label>
                                <input
                                    value={formData.nameEN}
                                    onChange={e => setFormData(p => ({ ...p, nameEN: e.target.value }))}
                                    placeholder="VD: VIP Customer"
                                    style={inputStyle}
                                />
                            </div>

                            {/* Row 4: Parent */}
                            <div>
                                <label style={labelStyle}>Thuộc loại cha</label>
                                <select
                                    value={formData.parentId}
                                    onChange={e => setFormData(p => ({ ...p, parentId: e.target.value }))}
                                    style={inputStyle}
                                >
                                    <option value="">— Không (loại gốc) —</option>
                                    {parentTypes.map(p => (
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
                                    placeholder="Mô tả chi tiết..."
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

            {/* Animations */}
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
    position: 'sticky',
    top: 0,
    zIndex: 2,
    backgroundColor: 'var(--grid-header-bg, #334155)',
};

const tdStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: '13px',
    color: 'var(--text-primary, #e2e8f0)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
    boxShadow: 'var(--shadow-card)',
    transition: 'all 0.2s',
};

const btnSecondary: React.CSSProperties = {
    background: 'var(--surface-hover, #334155)',
    color: 'var(--text-primary, #e2e8f0)',
    border: '1px solid var(--border, #475569)',
    padding: '9px 18px', borderRadius: '8px',
    fontWeight: 500, fontSize: '13px', cursor: 'pointer',
    transition: 'all 0.2s',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-secondary, #94a3b8)',
    marginBottom: '5px', textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--border, #475569)',
    backgroundColor: 'var(--background, #0f172a)',
    color: 'var(--text-primary, #e2e8f0)',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};
