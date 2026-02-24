'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Journal {
    id: string;
    code: string;
    name: string;
    nameEN: string | null;
    type: string;
    prefix: string | null;
    isActive: boolean;
}

const JOURNAL_TYPES = [
    { value: 'CASH', label: 'Tiền mặt' },
    { value: 'BANK', label: 'Ngân hàng' },
    { value: 'GENERAL', label: 'Tổng hợp' },
    { value: 'SALES', label: 'Bán hàng' },
    { value: 'PURCHASE', label: 'Mua hàng' },
    { value: 'INVENTORY', label: 'Kho' },
];

// ─── Shared Components (Reused/Adapted) ──────────────────────────────────────

const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

function StyledSearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const { style, ...rest } = props;
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ position: 'relative', width: '300px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>🔍</span>
            <input
                {...rest}
                style={{
                    ...inputBase,
                    paddingLeft: '36px',
                    borderColor: focused ? 'var(--border-focus)' : 'var(--border)',
                    boxShadow: focused ? '0 0 0 3px var(--primary-light)' : 'none',
                    ...style,
                }}
                onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
                onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            />
        </div>
    );
}

// ─── Modal Component ─────────────────────────────────────────────────────────

function JournalModal({ journal, onClose, onSave }: {
    journal: Partial<Journal> | null,
    onClose: () => void,
    onSave: (data: any) => Promise<void>
}) {
    const [formData, setFormData] = useState({
        code: journal?.code || '',
        name: journal?.name || '',
        nameEN: journal?.nameEN || '',
        type: journal?.type || 'GENERAL',
        prefix: journal?.prefix || ''
    });
    const [saving, setSaving] = useState(false);
    const isEdit = !!journal?.id;

    const handleSave = async () => {
        if (!formData.code || !formData.name) {
            alert('Vui lòng nhập Mã và Tên chứng từ');
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (e) {
            // Error handled by parent
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9990,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                width: '500px', maxWidth: '95vw',
                background: 'var(--surface)', borderRadius: '16px',
                display: 'flex', flexDirection: 'column',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                        {isEdit ? '✏️ Sửa chứng từ' : '✨ Thêm chứng từ mới'}
                    </h2>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Mã chứng từ <span style={{ color: 'red' }}>*</span></label>
                            <input
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="VD: PT"
                                disabled={isEdit}
                                style={{ ...inputBase, fontFamily: 'monospace', textTransform: 'uppercase', background: isEdit ? 'var(--surface-active)' : 'var(--background)' }}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Prefix (Số CT)</label>
                            <input
                                value={formData.prefix}
                                onChange={e => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                                placeholder="VD: PT"
                                style={{ ...inputBase, fontFamily: 'monospace', textTransform: 'uppercase' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Tên chứng từ <span style={{ color: 'red' }}>*</span></label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="VD: Phiếu thu tiền mặt"
                            style={inputBase}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Tên tiếng Anh</label>
                        <input
                            value={formData.nameEN}
                            onChange={e => setFormData({ ...formData, nameEN: e.target.value })}
                            placeholder="Ex: Cash Receipt"
                            style={inputBase}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Loại nghiệp vụ <span style={{ color: 'red' }}>*</span></label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            style={inputBase}
                        >
                            {JOURNAL_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px', borderTop: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'flex-end', gap: '12px'
                }}>
                    <button onClick={onClose} style={btnSecondary}>Hủy bỏ</button>
                    <button onClick={handleSave} disabled={saving} style={btnPrimary}>
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' };
const btnPrimary: React.CSSProperties = { padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 700 };
const btnSecondary: React.CSSProperties = { padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 };

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Page Component ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function VoucherSettingsPage() {
    const [journals, setJournals] = useState<Journal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJournal, setEditingJournal] = useState<Journal | null>(null);

    const fetchJournals = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/journals');
            if (res.ok) setJournals(await res.json());
        } catch (e) {
            console.error(e);
            toast({ title: 'Lỗi', description: 'Không thể tải danh sách chứng từ', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchJournals(); }, [fetchJournals]);

    const handleSave = async (data: any) => {
        try {
            const url = editingJournal ? `/api/journals/${editingJournal.id}` : '/api/journals';
            const method = editingJournal ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to save');
            }

            toast({ title: 'Thành công', description: editingJournal ? 'Đã cập nhật chứng từ' : 'Đã tạo chứng từ mới' });
            setIsModalOpen(false);
            fetchJournals();
        } catch (err: any) {
            console.error(err);
            toast({ title: 'Lỗi', description: err.message, variant: 'destructive' });
            throw err; // Propage to modal to stop closing? 
            // In this implementation, modal catches it but we re-throw to stop closing if needed, 
            // but our modal logic uses 'finally' so it might close. 
            // Refined logic: modal won't close if exception thrown in handleSave.
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa chứng từ "${name}"?`)) return;

        try {
            const res = await fetch(`/api/journals/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            toast({ title: 'Thành công', description: 'Đã xóa chứng từ' });
            fetchJournals();
        } catch (err) {
            toast({ title: 'Lỗi', description: 'Không thể xóa chứng từ', variant: 'destructive' });
        }
    };

    const getTypeLabel = (type: string) => JOURNAL_TYPES.find(t => t.value === type)?.label || type;

    const filtered = journals.filter(j =>
        j.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && journals.length === 0) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                <div style={{ fontSize: '14px' }}>Đang tải dữ liệu...</div>
            </div>
        </div>
    );

    return (
        <PermissionGuard permission="accounting.settings">
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}>

                {/* ═══ HEADER ═══ */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--surface)',
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '20px', fontWeight: 800,
                            color: 'var(--text-primary)',
                            marginBottom: '2px', letterSpacing: '-0.3px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                            📝 Thiết lập Chứng từ
                        </h1>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                            Quản lý danh mục các loại chứng từ kế toán trong hệ thống
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Stats Widget */}
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            borderRadius: '10px', overflow: 'hidden',
                            height: '38px',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{
                                padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center',
                                background: 'rgba(99, 102, 241, 0.1)', color: '#4F46E5',
                                fontSize: '13px', fontWeight: 600, borderRight: '1px solid var(--border)'
                            }}>
                                Tổng số: {journals.length}
                            </div>
                            <div style={{
                                padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center',
                                background: 'var(--background)', color: 'var(--text-muted)',
                                fontSize: '12px', fontWeight: 600
                            }}>
                                Đang hoạt động: {journals.filter(j => j.isActive).length}
                            </div>
                        </div>

                        <button
                            onClick={() => { setEditingJournal(null); setIsModalOpen(true); }}
                            style={{
                                background: 'var(--btn-primary)', color: 'var(--btn-primary-text)',
                                border: 'none', padding: '0 24px', borderRadius: '10px',
                                fontWeight: 700, cursor: 'pointer',
                                fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.2s', height: '38px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}
                        >
                            + Thêm mới
                        </button>
                    </div>
                </div>

                {/* ═══ CONTENT ═══ */}
                <div style={{ flex: 1, padding: '24px', overflow: 'auto', background: 'var(--background)' }}>
                    <div style={{
                        maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px'
                    }}>
                        {/* Search Bar */}
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <StyledSearchInput
                                placeholder="Tìm kiếm chứng từ (Tên, Mã)..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Table Card */}
                        <div style={{
                            background: 'var(--surface)',
                            borderRadius: '16px', border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-card)', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column',
                            minHeight: '400px'
                        }}>
                            <div style={{ overflow: 'auto', flex: 1 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--grid-header-bg)', position: 'sticky', top: 0, zIndex: 10 }}>
                                            <th style={thStyle}>Mã chứng từ</th>
                                            <th style={{ ...thStyle, width: '30%' }}>Tên chứng từ</th>
                                            <th style={thStyle}>Loại nghiệp vụ</th>
                                            <th style={thStyle}>Prefix</th>
                                            <th style={{ ...thStyle, textAlign: 'center' }}>Trạng thái</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                        <AlertCircle size={24} />
                                                        <span>Không tìm thấy chứng từ nào.</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filtered.map((journal) => (
                                            <tr key={journal.id} style={{
                                                borderBottom: '1px solid var(--border)',
                                                background: 'var(--surface)',
                                                transition: 'background 0.1s'
                                            }}
                                                className="hover:bg-[var(--surface-hover)]"
                                            >
                                                <td style={{ ...tdStyle, fontWeight: 700 }}>
                                                    <span style={{
                                                        padding: '4px 8px', borderRadius: '6px',
                                                        background: 'var(--background)', border: '1px solid var(--border)',
                                                        fontSize: '12px', fontFamily: 'monospace', color: 'var(--primary)'
                                                    }}>
                                                        {journal.code}
                                                    </span>
                                                </td>
                                                <td style={{ ...tdStyle, fontWeight: 600 }}>
                                                    {journal.name}
                                                    {journal.nameEN && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 400 }}>{journal.nameEN}</div>}
                                                </td>
                                                <td style={tdStyle}>
                                                    <Badge variant="outline" style={{ fontWeight: 500 }}>
                                                        {getTypeLabel(journal.type)}
                                                    </Badge>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{journal.prefix}</span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                    <Badge variant={journal.isActive ? 'success' : 'secondary'}>
                                                        {journal.isActive ? 'Đang dùng' : 'Ngưng'}
                                                    </Badge>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button
                                                            onClick={() => { setEditingJournal(journal); setIsModalOpen(true); }}
                                                            style={{ ...actionBtn, color: 'var(--primary)' }}
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(journal.id, journal.name)}
                                                            style={{ ...actionBtn, color: 'var(--danger)' }}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {isModalOpen && (
                    <JournalModal
                        journal={editingJournal}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSave}
                    />
                )}
            </div>
        </PermissionGuard>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
    padding: '12px 16px', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px',
    borderBottom: '1px solid var(--border)', textAlign: 'left'
};

const tdStyle: React.CSSProperties = {
    padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)',
    verticalAlign: 'middle'
};

const actionBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
    padding: '4px 8px', borderRadius: '4px'
};
