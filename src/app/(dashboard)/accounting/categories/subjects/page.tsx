'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface PartnerType {
    id: string;
    code: string;
    name: string;
    nature: string;
}

interface Partner {
    id: string;
    code: string;
    name: string;
    nameEN?: string;
    type: string;
    partnerTypeId?: string;
    partnerType?: PartnerType;
    taxCode?: string;
    address?: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    paymentTermDays: number;
    creditLimit?: number;
    isActive: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string; folderIcon: string }> = {
    BANK: { label: 'Ngân hàng', bg: 'rgba(6,182,212,0.12)', text: '#0891b2', icon: '🏦', folderIcon: '🏦' },
    CUSTOMER: { label: 'Khách hàng', bg: 'rgba(34,197,94,0.12)', text: '#16a34a', icon: '👤', folderIcon: '👤' },
    VENDOR: { label: 'Nhà cung cấp', bg: 'rgba(59,130,246,0.12)', text: '#2563eb', icon: '🏭', folderIcon: '🏭' },
    EMPLOYEE: { label: 'Nhân viên', bg: 'rgba(245,158,11,0.12)', text: '#d97706', icon: '💼', folderIcon: '💼' },
    OTHER: { label: 'Khác', bg: 'rgba(148,163,184,0.12)', text: '#64748b', icon: '📋', folderIcon: '📋' },
};

const HEADERS = ['STT', 'Mã', 'Tên đối tượng', 'Tên tiếng Anh', 'Phân loại', 'MST', 'SĐT', 'Email', ''];

export default function SubjectsPage() {
    const [data, setData] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Partner | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [partnerTypes, setPartnerTypes] = useState<PartnerType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    // Track collapsed groups
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    const [formData, setFormData] = useState({
        code: '', name: '', nameEN: '', type: 'CUSTOMER', partnerTypeId: '',
        taxCode: '', address: '', phone: '', email: '', contactPerson: '',
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            const res = await fetch(`/api/partners?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const partners: Partner[] = await res.json();
            setData(partners);
            setError(null);
        } catch {
            setError('Không thể tải dữ liệu');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    const fetchPartnerTypes = useCallback(async () => {
        try {
            const res = await fetch('/api/partner-types');
            if (!res.ok) return;
            const types = await res.json();
            const flat: PartnerType[] = [];
            types.forEach((t: any) => {
                flat.push({ id: t.id, code: t.code, name: t.name, nature: t.nature });
                t.children?.forEach((c: any) => {
                    flat.push({ id: c.id, code: c.code, name: c.name, nature: c.nature });
                });
            });
            setPartnerTypes(flat);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { fetchPartnerTypes(); }, [fetchPartnerTypes]);

    const toggleGroup = (key: string) => {
        setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleDelete = async (item: Partner) => {
        if (!confirm(`Bạn có chắc muốn xóa "${item.name}"?`)) return;
        try {
            const res = await fetch(`/api/partners/${item.id}`, { method: 'DELETE' });
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

    const handleEdit = (item: Partner) => {
        setEditingItem(item);
        setFormData({
            code: item.code, name: item.name, nameEN: item.nameEN || '',
            type: item.type, partnerTypeId: item.partnerTypeId || '',
            taxCode: item.taxCode || '', address: item.address || '',
            phone: item.phone || '', email: item.email || '',
            contactPerson: item.contactPerson || '',
        });
        setShowForm(true);
    };

    const handleAdd = (type?: string) => {
        setEditingItem(null);
        setFormData({
            code: '', name: '', nameEN: '', type: type || 'CUSTOMER', partnerTypeId: '',
            taxCode: '', address: '', phone: '', email: '', contactPerson: '',
        });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!formData.code || !formData.name || !formData.type) {
            alert('⚠️ Vui lòng nhập mã, tên và chọn loại đối tượng');
            return;
        }
        try {
            const url = editingItem ? `/api/partners/${editingItem.id}` : '/api/partners';
            const method = editingItem ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                let errorMessage = `Lỗi (HTTP ${res.status})`;
                try {
                    const err = await res.json();
                    if (err && err.error) errorMessage = err.error;
                } catch { }
                alert(`❌ ${errorMessage}`);
                return;
            }
            setShowForm(false);
            fetchData();
        } catch (e: any) {
            alert(`❌ Có lỗi: ${e?.message || 'Unknown error'}`);
        }
    };

    // Group data by type
    const groupedData = Object.entries(TYPE_CONFIG).map(([key, cfg]) => ({
        key,
        cfg,
        items: data.filter(d => d.type === key),
    })).filter(g => g.items.length > 0 || !searchQuery);

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
    let globalIndex = 0;

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
                        👥 Danh mục Đối tượng
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                        Quản lý khách hàng, nhà cung cấp, ngân hàng, nhân viên
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => fetchData()} style={btnSecondary}>🔄 Làm mới</button>
                    <button onClick={() => handleAdd()} style={btnPrimary}>
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

            {/* Search bar */}
            <div style={{ padding: '16px 24px 0', display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm mã, tên, MST, SĐT..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ ...inputStyle, width: 350, padding: '8px 14px' }}
                />
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Tổng: <b>{data.length}</b> đối tượng
                </span>
            </div>

            {/* Table Area */}
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
                        maxHeight: 'calc(100vh - 280px)',
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                            <thead>
                                <tr style={{
                                    background: 'var(--grid-header-bg, #334155)',
                                }}>
                                    {HEADERS.map((h, i) => (
                                        <th key={i} style={{
                                            ...thStyle,
                                            textAlign: i === 0 ? 'center' : 'left',
                                            width: i === 0 ? 50 : i === 8 ? 80 : undefined,
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{
                                            padding: '60px', textAlign: 'center',
                                            color: 'var(--text-muted, #64748b)', fontSize: '14px',
                                            background: 'var(--surface, #1e293b)'
                                        }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                                            Chưa có đối tượng nào. Hãy thêm mới!
                                        </td>
                                    </tr>
                                ) : (
                                    groupedData.map(({ key, cfg, items }) => {
                                        const isCollapsed = collapsedGroups[key];
                                        return (
                                            <React.Fragment key={key}>
                                                {/* Group Header Row */}
                                                <tr
                                                    onClick={() => toggleGroup(key)}
                                                    style={{
                                                        backgroundColor: 'var(--surface-active, #253044)',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid var(--border, #334155)',
                                                        userSelect: 'none',
                                                    }}
                                                >
                                                    <td colSpan={8} style={{ ...tdStyle, fontWeight: 700 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{
                                                                display: 'inline-block', width: 20, textAlign: 'center',
                                                                fontSize: 12, transition: 'transform 0.2s',
                                                                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                                                color: 'var(--text-secondary, #94a3b8)',
                                                            }}>▼</span>
                                                            <span style={{ fontSize: 18 }}>{cfg.folderIcon}</span>
                                                            <span style={{ color: cfg.text }}>{cfg.label}</span>
                                                            <span style={{
                                                                background: cfg.text, color: '#fff',
                                                                padding: '1px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                                                                marginLeft: 4,
                                                            }}>{items.length}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                        <button
                                                            title={`Thêm ${cfg.label}`}
                                                            onClick={(e) => { e.stopPropagation(); handleAdd(key); }}
                                                            style={{
                                                                ...actionBtn,
                                                                border: `1px solid ${cfg.text}`,
                                                                color: cfg.text,
                                                            }}
                                                        >＋</button>
                                                    </td>
                                                </tr>

                                                {/* Partner Rows */}
                                                {!isCollapsed && items.map((item) => {
                                                    globalIndex++;
                                                    const isHovered = hoveredRow === item.id;
                                                    return (
                                                        <tr key={item.id}
                                                            onMouseEnter={() => setHoveredRow(item.id)}
                                                            onMouseLeave={() => setHoveredRow(null)}
                                                            style={{
                                                                backgroundColor: isHovered
                                                                    ? 'var(--surface-hover, #334155)'
                                                                    : 'var(--surface, #1e293b)',
                                                                borderBottom: '1px solid var(--border, #334155)',
                                                                transition: 'background-color 0.15s ease',
                                                            }}
                                                        >
                                                            <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '12px' }}>
                                                                {globalIndex}
                                                            </td>
                                                            <td style={tdStyle}>
                                                                <span style={{
                                                                    background: cfg.bg, color: cfg.text,
                                                                    padding: '2px 8px', borderRadius: 6, fontSize: 13,
                                                                    fontWeight: 600, fontFamily: 'monospace',
                                                                    border: `1px solid ${cfg.text}20`,
                                                                }}>{item.code}</span>
                                                            </td>
                                                            <td style={{ ...tdStyle, fontWeight: 500 }}>
                                                                <span style={{ paddingLeft: 20 }}>└ {item.name}</span>
                                                            </td>
                                                            <td style={{ ...tdStyle, color: 'var(--text-secondary, #94a3b8)', fontStyle: 'italic' }}>
                                                                {item.nameEN || ''}
                                                            </td>
                                                            <td style={tdStyle}>
                                                                {item.partnerType ? (
                                                                    <span style={{
                                                                        padding: '2px 8px', borderRadius: 4,
                                                                        background: 'rgba(255,255,255,0.05)', fontSize: '12px'
                                                                    }}>
                                                                        {item.partnerType.code} - {item.partnerType.name}
                                                                    </span>
                                                                ) : '—'}
                                                            </td>
                                                            <td style={{ ...tdStyle, fontFamily: 'monospace' }}>
                                                                {item.taxCode || '—'}
                                                            </td>
                                                            <td style={tdStyle}>
                                                                {item.phone || '—'}
                                                            </td>
                                                            <td style={tdStyle}>
                                                                {item.email || '—'}
                                                            </td>
                                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                                <div style={{
                                                                    display: 'flex', gap: 4, justifyContent: 'center',
                                                                    opacity: isHovered ? 1 : 0.3, transition: 'opacity 0.15s',
                                                                }}>
                                                                    <button title="Sửa" onClick={() => handleEdit(item)} style={actionBtn}>✏️</button>
                                                                    <button title="Xóa" onClick={() => handleDelete(item)} style={{ ...actionBtn, color: '#ef4444' }}>🗑️</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>

                        {/* Footer stats */}
                        <div style={{
                            padding: '10px 16px',
                            background: 'var(--surface-active, #253044)',
                            borderTop: '1px solid var(--border, #334155)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            fontSize: '12px', color: 'var(--text-muted, #64748b)'
                        }}>
                            <span>Tổng: <strong style={{ color: 'var(--text-primary, #e2e8f0)' }}>{data.length}</strong> đối tượng</span>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {groupedData.map(({ key, cfg, items }) => (
                                    <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.text }} />
                                        <span>{cfg.label}: <strong style={{ color: cfg.text }}>{items.length}</strong></span>
                                    </span>
                                ))}
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
                            borderRadius: '16px', padding: '28px', width: '600px', maxWidth: '92vw',
                            boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
                            animation: 'slideUp 0.25s ease'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            marginBottom: '20px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <h2 style={{
                                fontSize: '18px', fontWeight: 700, margin: 0,
                                color: 'var(--text-primary, #f1f5f9)',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                {editingItem ? `✏️ Sửa: ${editingItem.code}` : '➕ Thêm đối tượng mới'}
                            </h2>
                            <button onClick={() => setShowForm(false)} style={{
                                background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
                                color: 'var(--text-secondary)', padding: '4px',
                            }}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Mã đối tượng *</label>
                                    <input value={formData.code}
                                        onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                        placeholder="VD: KH001" disabled={!!editingItem}
                                        style={{ ...inputStyle, fontFamily: 'monospace', ...(editingItem ? { opacity: 0.6 } : {}) }} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Nhóm đối tượng *</label>
                                    <select value={formData.type}
                                        onChange={e => setFormData(p => ({ ...p, type: e.target.value, partnerTypeId: '' }))}
                                        style={inputStyle}>
                                        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                                            <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Tên đối tượng *</label>
                                    <input value={formData.name}
                                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                        placeholder="VD: Công ty ABC" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Tên tiếng Anh</label>
                                    <input value={formData.nameEN}
                                        onChange={e => setFormData(p => ({ ...p, nameEN: e.target.value }))}
                                        placeholder="English name" style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Loại đối tượng</label>
                                <select value={formData.partnerTypeId}
                                    onChange={e => setFormData(p => ({ ...p, partnerTypeId: e.target.value }))}
                                    style={inputStyle}>
                                    <option value="">-- Chọn loại --</option>
                                    {partnerTypes
                                        .filter(t => !formData.type || t.nature === formData.type)
                                        .map(t => (
                                            <option key={t.id} value={t.id}>{t.code} - {t.name}</option>
                                        ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Mã số thuế</label>
                                    <input value={formData.taxCode}
                                        onChange={e => setFormData(p => ({ ...p, taxCode: e.target.value }))}
                                        placeholder="0312345678" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Số điện thoại</label>
                                    <input value={formData.phone}
                                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="0901234567" style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input value={formData.email}
                                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                        placeholder="email@company.com" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Người liên hệ</label>
                                    <input value={formData.contactPerson}
                                        onChange={e => setFormData(p => ({ ...p, contactPerson: e.target.value }))}
                                        placeholder="Tên người liên hệ" style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Địa chỉ</label>
                                <input value={formData.address}
                                    onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                                    placeholder="Địa chỉ liên hệ" style={inputStyle} />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                            <button onClick={() => setShowForm(false)} style={btnSecondary}>Hủy</button>
                            <button onClick={handleSubmit} style={btnPrimary}>
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
