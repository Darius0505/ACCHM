'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Types
interface Role {
    id: string;
    code: string;
    name: string;
    description?: string;
}

interface Branch {
    id: string;
    code: string;
    name: string;
}

interface Department {
    id: string;
    code: string;
    name: string;
    branchId: string | null;
}

interface User {
    id: string;
    code: string;
    email: string;
    name: string;
    phone?: string;
    isActive: boolean;
    roles: { id: string; name: string; description?: string }[];
    branch?: Branch;
    department?: Department;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        email: '',
        name: '',
        password: '',
        phone: '',
        branchId: '',
        departmentId: '',
        roleIds: [] as string[],
        isActive: true,
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes, branchesRes, deptsRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/roles'),
                fetch('/api/branches'),
                fetch('/api/departments'),
            ]);

            if (!usersRes.ok) throw new Error('Failed to fetch users');

            setUsers(await usersRes.json());
            setRoles(await rolesRes.json());
            setBranches(await branchesRes.json());
            setDepartments(await deptsRes.json());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async () => {
        setError(null);
        try {
            const isEdit = !!editingUser;
            const url = isEdit ? `/api/users/${editingUser.id}` : '/api/users';
            const method = isEdit ? 'PUT' : 'POST';

            const payload = { ...formData };
            if (isEdit && !payload.password) delete (payload as any).password;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save user');
            }

            setShowModal(false);
            fetchData();
            resetForm();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            code: user.code || '',
            email: user.email,
            name: user.name,
            password: '',
            phone: user.phone || '',
            branchId: user.branch?.id || '',
            departmentId: user.department?.id || '',
            roleIds: user.roles.map(r => r.id),
            isActive: user.isActive,
        });
        setShowModal(true);
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`Bạn có chắc muốn xóa/vô hiệu hóa người dùng "${user.name}"?`)) return;
        try {
            const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to deactivate user');
            fetchData();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        setFormData({
            code: '', email: '', name: '', password: '', phone: '',
            branchId: '', departmentId: '', roleIds: [], isActive: true
        });
        setError(null);
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.code && user.code.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesBranch = branchFilter ? user.branch?.id === branchFilter : true;
        return matchesSearch && matchesBranch;
    });

    // Dynamic departments in modal
    const modalDepartments = formData.branchId
        ? departments.filter(d => d.branchId === formData.branchId)
        : departments;

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
                        👥 Quản lý Người dùng
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                        Quản trị tài khoản và phân quyền hệ thống
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="🔍 Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ ...inputStyle, width: '220px', paddingLeft: '32px' }}
                        />
                        {/* Icon placeholder if needed, input has padding */}
                    </div>
                    <select
                        value={branchFilter}
                        onChange={e => setBranchFilter(e.target.value)}
                        style={{ ...inputStyle, width: '200px' }}
                    >
                        <option value="">-- Tất cả chi nhánh --</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                    <button onClick={fetchData} style={btnSecondary}>🔄 Làm mới</button>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
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
                {isLoading ? (
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
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                            <thead>
                                <tr style={{ background: 'var(--grid-header-bg, #334155)' }}>
                                    <th style={thStyle}>Mã NV</th>
                                    <th style={{ ...thStyle, textAlign: 'left' }}>Người dùng</th>
                                    <th style={{ ...thStyle, textAlign: 'left' }}>Vai trò</th>
                                    <th style={{ ...thStyle, textAlign: 'left' }}>Chi nhánh / Phòng ban</th>
                                    <th style={{ ...thStyle, textAlign: 'center', width: '120px' }}>Trạng thái</th>
                                    <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{
                                            padding: '60px', textAlign: 'center',
                                            color: 'var(--text-muted, #64748b)', fontSize: '14px',
                                            background: 'var(--surface, #1e293b)'
                                        }}>
                                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                                            Chưa có người dùng nào phù hợp.
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user, idx) => {
                                    const isHovered = hoveredRow === user.id;
                                    return (
                                        <tr
                                            key={user.id}
                                            onMouseEnter={() => setHoveredRow(user.id)}
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
                                            onDoubleClick={() => handleEdit(user)}
                                        >
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center',
                                                    padding: '3px 10px', borderRadius: '6px',
                                                    backgroundColor: 'var(--primary-light, rgba(16, 185, 129, 0.1))',
                                                    color: 'var(--primary, #D2604C)',
                                                    fontSize: '13px', fontFamily: 'monospace',
                                                    fontWeight: 600,
                                                    border: '1px solid var(--border, #e2e8f0)',
                                                    letterSpacing: '0.5px',
                                                }}>
                                                    {user.code || '—'}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '50%',
                                                        background: 'var(--surface-active, #334155)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 700, fontSize: '12px', color: 'var(--text-primary, #f1f5f9)'
                                                    }}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {user.roles.map(role => (
                                                        <span key={role.id} style={{
                                                            fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
                                                            background: 'rgba(210, 96, 76, 0.1)', color: 'var(--primary, #D2604C)',
                                                            border: '1px solid rgba(210, 96, 76, 0.2)'
                                                        }}>
                                                            {role.name}
                                                        </span>
                                                    ))}
                                                    {user.roles.length === 0 && <span style={{ fontStyle: 'italic', opacity: 0.5 }}>-</span>}
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle, color: 'var(--text-secondary, #94a3b8)' }}>
                                                <div>{user.branch?.name || <span style={{ opacity: 0.5 }}>-</span>}</div>
                                                <div style={{ fontSize: '11px' }}>{user.department?.name}</div>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '10px',
                                                    fontSize: '11px', fontWeight: 600,
                                                    background: user.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: user.isActive ? '#34d399' : '#f87171',
                                                }}>
                                                    {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', opacity: isHovered ? 1 : 0.3, transition: 'opacity 0.15s' }}>
                                                    <button onClick={(e) => { e.stopPropagation(); handleEdit(user); }} title="Sửa" style={actionBtn}>✏️</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(user); }} title="Xóa" style={{ ...actionBtn, color: '#ef4444' }}>🗑️</button>
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

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.2s ease'
                }} onClick={() => setShowModal(false)}>
                    <div style={{
                        backgroundColor: 'var(--surface, #1e293b)',
                        borderRadius: '16px', padding: '28px', width: '600px', maxWidth: '92vw',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
                        animation: 'slideUp 0.25s ease'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{
                                fontSize: '18px', fontWeight: 700,
                                color: 'var(--text-primary, #f1f5f9)',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                {editingUser ? '✏️ Cập nhật người dùng' : '➕ Thêm người dùng mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Mã nhân viên *</label>
                                    <input
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="VD: NV001"
                                        disabled={!!editingUser}
                                        style={{ ...inputStyle, fontFamily: 'monospace' }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Họ và tên *</label>
                                    <input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Nguyễn Văn A"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Email đăng nhập *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@company.com"
                                        disabled={!!editingUser}
                                        style={{ ...inputStyle, opacity: editingUser ? 0.6 : 1 }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Số điện thoại</label>
                                    <input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="0912..."
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Mật khẩu {!editingUser && '*'}</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={editingUser ? '(Giữ nguyên nếu không đổi)' : '••••••••'}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ padding: '16px', background: 'var(--surface-active, #334155)', borderRadius: '8px', border: '1px solid var(--border, #475569)' }}>
                                <label style={{ ...labelStyle, marginBottom: '12px' }}>Cấu trúc tổ chức</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ ...labelStyle, fontSize: '10px' }}>Chi nhánh</label>
                                        <select
                                            value={formData.branchId}
                                            onChange={e => setFormData({ ...formData, branchId: e.target.value, departmentId: '' })}
                                            style={inputStyle}
                                        >
                                            <option value="">-- Chọn chi nhánh --</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ ...labelStyle, fontSize: '10px' }}>Phòng ban</label>
                                        <select
                                            value={formData.departmentId}
                                            onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                                            style={inputStyle}
                                            disabled={!formData.branchId}
                                        >
                                            <option value="">-- Chọn phòng ban --</option>
                                            {modalDepartments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Vai trò (Roles)</label>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
                                    border: '1px solid var(--border, #475569)', padding: '8px', borderRadius: '8px',
                                    background: 'var(--background, #0f172a)', maxHeight: '120px', overflowY: 'auto'
                                }}>
                                    {roles.map(r => (
                                        <label key={r.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '6px', borderRadius: '4px', cursor: 'pointer',
                                            fontSize: '13px', color: 'var(--text-primary, #e2e8f0)'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.roleIds.includes(r.id)}
                                                onChange={e => {
                                                    const newRoles = e.target.checked
                                                        ? [...formData.roleIds, r.id]
                                                        : formData.roleIds.filter(id => id !== r.id);
                                                    setFormData({ ...formData, roleIds: newRoles });
                                                }}
                                                style={{ accentColor: '#3b82f6' }}
                                            />
                                            <span>{r.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {editingUser && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                                    />
                                    <span style={{ fontSize: '14px', color: 'var(--text-primary, #e2e8f0)' }}>Đang hoạt động</span>
                                </label>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border, #475569)' }}>
                            <button onClick={() => setShowModal(false)} style={btnSecondary}>Hủy bỏ</button>
                            <button
                                onClick={handleSubmit}
                                style={btnPrimary}
                            >
                                {editingUser ? '💾 Cập nhật' : '✅ Tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: var(--surface, #1e293b); }
                ::-webkit-scrollbar-thumb { background: var(--border, #475569); borderRadius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #64748b; }
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
