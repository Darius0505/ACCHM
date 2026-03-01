
'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Department {
    id: string;
    code: string;
    name: string;
    branchId: string | null;
    branch?: { id: string; code: string; name: string };
    userCount: number;
}

interface Branch {
    id: string;
    code: string;
    name: string;
}

export default function DepartmentsPage() {
    const [data, setData] = useState<Department[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Department | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    // Filter
    const [filterBranchId, setFilterBranchId] = useState<string>('');

    const [formData, setFormData] = useState({
        code: '', name: '', branchId: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [deptRes, branchRes] = await Promise.all([
                fetch('/api/departments'),
                fetch('/api/branches')
            ]);

            if (!deptRes.ok || !branchRes.ok) throw new Error('Failed to fetch');

            const depts: Department[] = await deptRes.json();
            const brs: Branch[] = await branchRes.json();

            setData(depts);
            setBranches(brs);
            setError(null);
        } catch {
            setError('Không thể tải dữ liệu');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (item: Department) => {
        if (!confirm(`Bạn có chắc muốn xóa phòng ban "${item.name}"?`)) return;

        try {
            const res = await fetch(`/api/departments/${item.id}`, { method: 'DELETE' });
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

    const handleEdit = (item: Department) => {
        setEditingItem(item);
        setFormData({
            code: item.code,
            name: item.name,
            branchId: item.branchId || '',
        });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        try {
            const url = editingItem ? `/api/departments/${editingItem.id}` : '/api/departments';
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
            setFormData({ code: '', name: '', branchId: '' });
            fetchData();
        } catch {
            alert('Có lỗi xảy ra');
        }
    };

    const filteredData = filterBranchId
        ? data.filter(d => d.branchId === filterBranchId)
        : data;

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
                        🚪 Quản lý Phòng ban
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                        Thiết lập sơ đồ phòng ban và cơ cấu tổ chức
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                        value={filterBranchId}
                        onChange={e => setFilterBranchId(e.target.value)}
                        style={{ ...inputStyle, width: '200px', padding: '9px' }}
                    >
                        <option value="">-- Tất cả chi nhánh --</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                    <button onClick={fetchData} style={btnSecondary}>🔄 Làm mới</button>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ code: '', name: '', branchId: filterBranchId || '' }); // Auto-select current filter branch
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
                                <tr style={{ background: 'var(--grid-header-bg, #334155)' }}>
                                    <th style={thStyle}>STT</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '100px' }}>Mã PB</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '200px' }}>Tên Phòng ban</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '200px' }}>Thuộc Chi nhánh</th>
                                    <th style={{ ...thStyle, textAlign: 'center', width: '100px' }}>Nhân sự</th>
                                    <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{
                                            padding: '60px', textAlign: 'center',
                                            color: 'var(--text-muted, #64748b)', fontSize: '14px',
                                            background: 'var(--surface, #1e293b)'
                                        }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                                            Chưa có phòng ban nào{filterBranchId ? ' thuộc chi nhánh này' : ''}. Hãy thêm mới!
                                        </td>
                                    </tr>
                                ) : filteredData.map((item, idx) => {
                                    const isHovered = hoveredRow === item.id;
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
                                            <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '12px' }}>
                                                {idx + 1}
                                            </td>
                                            <td style={{ ...tdStyle }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center',
                                                    padding: '2px 8px', borderRadius: '4px',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    color: '#34d399',
                                                    fontSize: '13px', fontFamily: 'monospace',
                                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                                }}>
                                                    {item.code}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 600 }}>{item.name}</td>
                                            <td style={{ ...tdStyle, color: 'var(--text-secondary, #94a3b8)' }}>
                                                {item.branch ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ fontSize: '14px' }}>🏢</span>
                                                        {item.branch.name}
                                                    </span>
                                                ) : <span style={{ fontStyle: 'italic', opacity: 0.5 }}>— Chung —</span>}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                {item.userCount > 0 && (
                                                    <span style={{
                                                        padding: '2px 8px', borderRadius: '10px',
                                                        background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24',
                                                        fontSize: '11px', fontWeight: 600
                                                    }}>
                                                        {item.userCount}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', opacity: isHovered ? 1 : 0.3, transition: 'opacity 0.15s' }}>
                                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} title="Sửa" style={actionBtn}>✏️</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} title="Xóa" style={{ ...actionBtn, color: '#ef4444' }}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.2s ease'
                }} onClick={() => setShowForm(false)}>
                    <div style={{
                        backgroundColor: 'var(--surface, #1e293b)',
                        borderRadius: '16px', padding: '28px', width: '480px', maxWidth: '92vw',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
                        animation: 'slideUp 0.25s ease'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{
                            fontSize: '18px', fontWeight: 700, marginBottom: '20px',
                            color: 'var(--text-primary, #f1f5f9)',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            {editingItem ? '✏️ Sửa phòng ban' : '➕ Thêm phòng ban mới'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>Mã phòng ban *</label>
                                <input
                                    value={formData.code}
                                    onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                    placeholder="VD: P_SALE"
                                    disabled={!!editingItem}
                                    style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.5px' }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Tên phòng ban *</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder="VD: Phòng Kinh doanh"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Thuộc chi nhánh</label>
                                <select
                                    value={formData.branchId}
                                    onChange={e => setFormData(p => ({ ...p, branchId: e.target.value }))}
                                    style={inputStyle}
                                >
                                    <option value="">-- Không chọn (Dùng chung) --</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                            <button onClick={() => setShowForm(false)} style={btnSecondary}>Hủy</button>
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

// ─────────── Styles (Shared) ───────────
const thStyle: React.CSSProperties = {
    padding: '10px 12px', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-primary, #e2e8f0)', textTransform: 'uppercase',
    letterSpacing: '0.6px', whiteSpace: 'nowrap',
    borderBottom: '1px solid var(--border, #334155)',
    position: 'sticky', top: 0, zIndex: 2,
    backgroundColor: 'var(--grid-header-bg, #334155)',
};

const tdStyle: React.CSSProperties = {
    padding: '10px 12px', fontSize: '13px',
    color: 'var(--text-primary, #e2e8f0)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
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
    fontWeight: 500, fontSize: '13px', cursor: 'pointer',
    transition: 'all 0.2s',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-secondary, #94a3b8)', marginBottom: '5px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--border, #475569)',
    backgroundColor: 'var(--background, #0f172a)',
    color: 'var(--text-primary, #e2e8f0)',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};
