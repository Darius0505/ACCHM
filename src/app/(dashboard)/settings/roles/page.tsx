'use client';

import { useState, useEffect } from 'react';

// --- Types ---
interface Role {
    id: string;
    code: string;
    name: string;
    description?: string;
    isSystem: boolean;
    userCount?: number;
}

interface PermissionNode {
    id: string;
    action: string;
    assigned: boolean;
}

interface FormNode {
    id: string;
    code: string;
    name: string;
    permissions: PermissionNode[];
}

interface ModuleNode {
    id: string;
    code: string;
    name: string;
    icon?: string;
    forms: FormNode[];
}

interface DataScope {
    id?: string;
    scopeType: 'ALL' | 'BRANCH' | 'DEPARTMENT' | 'OWN';
    scopeValue?: string;
}

// --- Component ---
export default function RolesPage() {
    // --- State ---
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleForm, setRoleForm] = useState({ code: '', name: '', description: '' });

    // Permission Modal State
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<Role | null>(null);
    const [activePermTab, setActivePermTab] = useState<'MATRIX' | 'SCOPE'>('MATRIX');

    // Matrix & Scope Data
    const [matrix, setMatrix] = useState<ModuleNode[]>([]);
    const [scopes, setScopes] = useState<DataScope[]>([]);
    const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);
    const [isLoadingScopes, setIsLoadingScopes] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Hover state for table
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    // --- Effects ---
    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        if (selectedRoleForPerms) {
            if (activePermTab === 'MATRIX') fetchPermissions(selectedRoleForPerms.id);
            if (activePermTab === 'SCOPE') fetchScopes(selectedRoleForPerms.id);
        }
    }, [selectedRoleForPerms, activePermTab]);

    // --- Fetch Actions ---
    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/roles');
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
                setError(null);
            } else {
                setError('Không thể tải danh sách vai trò');
            }
        } catch {
            setError('Lỗi kết nối');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPermissions = async (roleId: string) => {
        setIsLoadingMatrix(true);
        try {
            const res = await fetch(`/api/roles/${roleId}/permissions`);
            if (res.ok) setMatrix(await res.json());
        } finally {
            setIsLoadingMatrix(false);
        }
    };

    const fetchScopes = async (roleId: string) => {
        setIsLoadingScopes(true);
        try {
            const res = await fetch(`/api/roles/${roleId}/scopes`);
            if (res.ok) setScopes(await res.json());
        } finally {
            setIsLoadingScopes(false);
        }
    };

    // --- Role CRUD ---
    const handleCreateOrUpdateRole = async () => {
        if (!roleForm.code || !roleForm.name) return alert('Vui lòng nhập Mã và Tên vai trò');

        try {
            const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
            const method = editingRole ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleForm),
            });

            if (res.ok) {
                setShowRoleModal(false);
                setEditingRole(null);
                setRoleForm({ code: '', name: '', description: '' });
                fetchRoles();
            } else {
                const err = await res.json();
                if (res.status === 409) {
                    alert('⚠️ Tên vai trò này đã tồn tại! Vui lòng chọn tên khác.');
                } else {
                    alert(err.error || 'Có lỗi xảy ra');
                }
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối');
        }
    };

    const handleDeleteRole = async (role: Role) => {
        if (role.isSystem) return alert('Không thể xóa role hệ thống!');

        if (role.userCount && role.userCount > 0) {
            return alert(`⚠️ Không thể xóa vai trò này vì đang được gán cho ${role.userCount} người dùng.\n\nVui lòng gỡ vai trò khỏi các tài khoản người dùng trước khi xóa.`);
        }

        if (!confirm(`Bạn có chắc muốn xóa vai trò "${role.name}"?`)) return;

        try {
            const res = await fetch(`/api/roles/${role.id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchRoles();
            } else {
                const err = await res.json();
                alert(err.error || 'Không thể xóa');
            }
        } catch {
            alert('Lỗi kết nối');
        }
    };

    const openCreateModal = () => {
        setEditingRole(null);
        setRoleForm({ code: '', name: '', description: '' });
        setShowRoleModal(true);
    };

    const openEditModal = (role: Role) => {
        setEditingRole(role);
        setRoleForm({ code: role.code, name: role.name, description: role.description || '' });
        setShowRoleModal(true);
    };

    // --- Permission Logic ---
    const openPermissionModal = (role: Role) => {
        setSelectedRoleForPerms(role);
        setActivePermTab('MATRIX');
        setShowPermissionModal(true);
    };

    const togglePermission = (moduleId: string, formId: string, permId: string) => {
        setMatrix(prev => prev.map(mod => {
            if (mod.id !== moduleId) return mod;
            return {
                ...mod,
                forms: mod.forms.map(form => {
                    if (form.id !== formId) return form;
                    return {
                        ...form,
                        permissions: form.permissions.map(p =>
                            p.id === permId ? { ...p, assigned: !p.assigned } : p
                        )
                    };
                })
            };
        }));
    };

    const toggleRow = (moduleId: string, formId: string, val: boolean) => {
        setMatrix(prev => prev.map(mod => {
            if (mod.id !== moduleId) return mod;
            return {
                ...mod,
                forms: mod.forms.map(form => {
                    if (form.id !== formId) return form;
                    return {
                        ...form,
                        permissions: form.permissions.map(p => ({ ...p, assigned: val }))
                    };
                })
            };
        }));
    };

    const savePermissions = async () => {
        if (!selectedRoleForPerms) return;
        setIsSaving(true);

        const permissionIds: string[] = [];
        matrix.forEach(mod => {
            mod.forms.forEach(form => {
                form.permissions.forEach(p => {
                    if (p.assigned) permissionIds.push(p.id);
                });
            });
        });

        try {
            const res = await fetch(`/api/roles/${selectedRoleForPerms.id}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissionIds }),
            });
            if (res.ok) alert('Đã lưu phân quyền thành công!');
        } finally {
            setIsSaving(false);
        }
    };

    const saveScopes = async () => {
        if (!selectedRoleForPerms) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/roles/${selectedRoleForPerms.id}/scopes`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scopes }),
            });
            if (res.ok) alert('Đã lưu cấu hình dữ liệu thành công!');
        } finally {
            setIsSaving(false);
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
                        🛡️ Quản lý Vai trò (Roles)
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                        Định nghĩa các vai trò và phân quyền truy cập hệ thống
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={fetchRoles} style={btnSecondary}>🔄 Làm mới</button>
                    <button onClick={openCreateModal} style={btnPrimary}>＋ Thêm mới</button>
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
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ background: 'var(--grid-header-bg, #334155)' }}>
                                    <th style={thStyle}>STT</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '150px' }}>Mã vai trò</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '200px' }}>Tên hiển thị</th>
                                    <th style={{ ...thStyle, textAlign: 'left', minWidth: '250px' }}>Mô tả</th>
                                    <th style={{ ...thStyle, textAlign: 'center', width: '120px' }}>Phân loại</th>
                                    <th style={{ ...thStyle, textAlign: 'center', width: '120px' }}>Người dùng</th>
                                    <th style={{ ...thStyle, textAlign: 'center', width: '150px' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                                            Chưa có vai trò nào.
                                        </td>
                                    </tr>
                                ) : roles.map((role, idx) => {
                                    const isHovered = hoveredRow === role.id;
                                    return (
                                        <tr
                                            key={role.id}
                                            onMouseEnter={() => setHoveredRow(role.id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                            style={{
                                                backgroundColor: isHovered ? 'var(--grid-row-hover)' : idx % 2 === 0 ? 'var(--surface)' : 'var(--grid-row-alt)',
                                                borderBottom: '1px solid var(--border)',
                                                transition: 'background-color 0.15s ease',
                                                cursor: 'pointer',
                                            }}
                                            onDoubleClick={() => openEditModal(role)}
                                        >
                                            <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>{idx + 1}</td>
                                            <td style={{ ...tdStyle, fontWeight: 600, fontFamily: 'monospace', color: 'var(--primary)' }}>{role.code}</td>
                                            <td style={{ ...tdStyle, fontWeight: 600 }}>{role.name}</td>
                                            <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{role.description || '—'}</td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                {role.isSystem ? (
                                                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>SYSTEM</span>
                                                ) : (
                                                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-active)', color: 'var(--text-secondary)' }}>CUSTOM</span>
                                                )}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{role.userCount || 0}</span>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(role); }} title="Sửa thông tin" style={actionBtn}>✏️</button>
                                                    <button onClick={(e) => { e.stopPropagation(); openPermissionModal(role); }} title="Phân quyền" style={actionBtn}>⚙️</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteRole(role); }} title="Xóa" style={{ ...actionBtn, opacity: role.isSystem ? 0.3 : 1, cursor: role.isSystem ? 'not-allowed' : 'pointer' }} disabled={role.isSystem}>🗑️</button>
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

            {/* Role Modal (Small) */}
            {showRoleModal && (
                <div style={overlayStyle} onClick={() => setShowRoleModal(false)}>
                    <div style={modalStyleSmall} onClick={e => e.stopPropagation()}>
                        <h2 style={modalHeaderStyle}>
                            {editingRole ? '✏️ Chỉnh sửa vai trò' : '➕ Thêm vai trò mới'}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Mã vai trò *</label>
                                    <input
                                        value={roleForm.code}
                                        onChange={e => setRoleForm({ ...roleForm, code: e.target.value.toUpperCase() })}
                                        placeholder="VD: SALES_OP"
                                        style={{ ...inputStyle, fontFamily: 'monospace', textTransform: 'uppercase' }}
                                        disabled={editingRole?.isSystem || !!editingRole}
                                    />
                                    {/* Disable code editing for now to avoid complexity, or allow if not system */}
                                </div>
                                <div>
                                    <label style={labelStyle}>Tên hiển thị *</label>
                                    <input
                                        value={roleForm.name}
                                        onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                                        placeholder="VD: Nhân viên kinh doanh"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Mô tả</label>
                                <textarea
                                    value={roleForm.description}
                                    onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                                    placeholder="Mô tả nhiệm vụ của vai trò này..."
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div style={modalFooterStyle}>
                            <button onClick={() => setShowRoleModal(false)} style={btnSecondary}>Hủy</button>
                            <button onClick={handleCreateOrUpdateRole} style={btnPrimary}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Permission Modal (Large) */}
            {showPermissionModal && selectedRoleForPerms && (
                <div style={overlayStyle} onClick={() => setShowPermissionModal(false)}>
                    <div style={modalStyleLarge} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>
                                    ⚙️ Phân quyền: <span style={{ color: '#F97316' }}>{selectedRoleForPerms.name}</span>
                                </h2>
                            </div>
                            <div style={{ display: 'flex', background: '#334155', padding: '3px', borderRadius: '6px' }}>
                                <button
                                    onClick={() => setActivePermTab('MATRIX')}
                                    style={{
                                        ...tabBtnStyle,
                                        background: activePermTab === 'MATRIX' ? '#F97316' : 'transparent',
                                        color: activePermTab === 'MATRIX' ? '#fff' : '#94a3b8'
                                    }}
                                >Ma trận phân quyền</button>
                                <button
                                    onClick={() => setActivePermTab('SCOPE')}
                                    style={{
                                        ...tabBtnStyle,
                                        background: activePermTab === 'SCOPE' ? '#F97316' : 'transparent',
                                        color: activePermTab === 'SCOPE' ? '#fff' : '#94a3b8'
                                    }}
                                >Phạm vi dữ liệu</button>
                            </div>
                        </div>

                        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                            {activePermTab === 'MATRIX' && (
                                <>
                                    {isLoadingMatrix ? (
                                        <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>Đang tải quyền...</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {matrix.map(module => (
                                                <div key={module.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                                                    <div style={{ background: 'var(--surface-active)', padding: '10px 16px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                                                        {module.icon || '📦'} {module.name}
                                                    </div>
                                                    <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                                        <thead style={{ background: 'var(--grid-header-bg)', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
                                                            <tr>
                                                                <th style={{ padding: '8px 12px', textAlign: 'left', width: '25%' }}>Chức năng (Form)</th>
                                                                {['VIEW', 'ADD', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'PRINT'].map(a => (
                                                                    <th key={a} style={{ padding: '8px', textAlign: 'center' }}>{a}</th>
                                                                ))}
                                                                <th style={{ padding: '8px', textAlign: 'center', width: '50px' }}>ALL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody style={{ background: 'var(--background)' }}>
                                                            {module.forms.map(form => {
                                                                const allChecked = form.permissions.every(p => p.assigned);
                                                                return (
                                                                    <tr key={form.id} style={{ borderTop: '1px solid var(--border)' }}>
                                                                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{form.name}</td>
                                                                        {['VIEW', 'ADD', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'PRINT'].map(action => {
                                                                            const perm = form.permissions.find(p => p.action === action);
                                                                            if (!perm) return <td key={action} />;
                                                                            return (
                                                                                <td key={action} style={{ textAlign: 'center' }}>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={perm.assigned}
                                                                                        onChange={() => togglePermission(module.id, form.id, perm.id)}
                                                                                        style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                                                                                    />
                                                                                </td>
                                                                            );
                                                                        })}
                                                                        <td style={{ textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={allChecked}
                                                                                onChange={e => toggleRow(module.id, form.id, e.target.checked)}
                                                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={savePermissions} disabled={isSaving} style={btnPrimary}>
                                            {isSaving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                                        </button>
                                    </div>
                                </>
                            )}

                            {activePermTab === 'SCOPE' && (
                                <>
                                    {isLoadingScopes ? (
                                        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</div>
                                    ) : (
                                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                            <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '16px' }}>Chọn cấp độ truy cập dữ liệu:</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {[
                                                    { type: 'ALL', label: 'Toàn hệ thống', desc: 'Xem tất cả dữ liệu của tất cả chi nhánh và phòng ban' },
                                                    { type: 'BRANCH', label: 'Theo chi nhánh', desc: 'Chỉ xem dữ liệu thuộc chi nhánh của người dùng' },
                                                    { type: 'DEPARTMENT', label: 'Theo phòng ban', desc: 'Chỉ xem dữ liệu thuộc phòng ban của người dùng' },
                                                    { type: 'OWN', label: 'Cá nhân', desc: 'Chỉ xem dữ liệu do chính người dùng tạo ra' }
                                                ].map(opt => (
                                                    <div
                                                        key={opt.type}
                                                        onClick={() => setScopes([{ scopeType: opt.type as any }])}
                                                        style={{
                                                            padding: '16px', borderRadius: '8px',
                                                            border: scopes.some(s => s.scopeType === opt.type) ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                            background: scopes.some(s => s.scopeType === opt.type) ? 'var(--primary-light)' : 'var(--surface)',
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '20px', height: '20px', borderRadius: '50%',
                                                            border: scopes.some(s => s.scopeType === opt.type) ? '6px solid var(--primary)' : '2px solid var(--text-secondary)',
                                                            background: 'var(--surface)'
                                                        }} />
                                                        <div>
                                                            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{opt.label}</div>
                                                            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{opt.desc}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                                <button onClick={saveScopes} disabled={isSaving} style={btnPrimary}>
                                                    {isSaving ? 'Đang lưu...' : '💾 Lưu cấu hình'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

// ─────────── Styles ───────────
const thStyle: React.CSSProperties = {
    padding: '10px 12px', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-primary)', textTransform: 'uppercase',
    letterSpacing: '0.6px', whiteSpace: 'nowrap',
    borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, zIndex: 2,
    backgroundColor: 'var(--grid-header-bg)',
};

const tdStyle: React.CSSProperties = {
    padding: '10px 12px', fontSize: '13px',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis',
};

const actionBtn: React.CSSProperties = {
    border: 'none', background: 'transparent',
    cursor: 'pointer', padding: '6px', borderRadius: '4px',
    fontSize: '16px', lineHeight: 1,
    transition: 'background 0.15s',
};

const btnPrimary: React.CSSProperties = {
    background: 'var(--btn-primary)',
    color: 'var(--btn-primary-text)', border: 'none',
    padding: '9px 20px', borderRadius: '8px',
    fontWeight: 600, fontSize: '13px', cursor: 'pointer',
    boxShadow: 'var(--shadow-card)', transition: 'all 0.2s',
};

const btnSecondary: React.CSSProperties = {
    background: 'var(--surface-hover)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    padding: '9px 18px', borderRadius: '8px',
    fontWeight: 500, fontSize: '13px', cursor: 'pointer',
    transition: 'all 0.2s',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-secondary)',
    marginBottom: '5px', textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
};

const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'fadeIn 0.2s ease',
};

const modalStyleSmall: React.CSSProperties = {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px', padding: '28px', width: '480px', maxWidth: '92vw',
    boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
    animation: 'slideUp 0.25s ease',
    color: 'var(--text-primary)',
};

const modalStyleLarge: React.CSSProperties = {
    backgroundColor: 'var(--surface)',
    borderRadius: '16px', width: '900px', maxWidth: '95vw',
    height: '80vh', display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
    animation: 'slideUp 0.25s ease',
    color: 'var(--text-primary)',
};

const modalHeaderStyle: React.CSSProperties = {
    fontSize: '18px', fontWeight: 700, marginBottom: '20px',
    color: 'var(--text-primary)',
};

const modalFooterStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px',
};

const tabBtnStyle: React.CSSProperties = {
    padding: '6px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: 600,
    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
};
