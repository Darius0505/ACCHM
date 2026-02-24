
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Company {
    id: string;
    code: string;
    name: string;
    nameEN?: string;
    nameJP?: string;
    nameOther?: string;
    address?: string;
    taxCode?: string;
    phone?: string;
    email?: string;
    fax?: string;
    website?: string;
    logo?: string;
    directorName?: string;
    chiefAccountantName?: string;
    establishedDate?: string;
    currency: string;
    fiscalYearStart: number;
    accountingStandard: string;
}

type TabKey = 'general' | 'contact' | 'accounting';

interface TabDef {
    key: TabKey;
    label: string;
    icon: string;
}

const TABS: TabDef[] = [
    { key: 'general', label: 'Thông tin chung', icon: '📦' },
    { key: 'contact', label: 'Liên hệ & Lãnh đạo', icon: '📞' },
    { key: 'accounting', label: 'Kế toán', icon: '📊' },
];

// ─── Toast Component ─────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 22px', borderRadius: '12px',
            background: type === 'success'
                ? 'linear-gradient(135deg, #059669, #10B981)'
                : 'linear-gradient(135deg, #DC2626, #EF4444)',
            color: '#fff', fontWeight: 600, fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            animation: 'slideInToast 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
            <span style={{ fontSize: '18px' }}>{type === 'success' ? '✅' : '❌'}</span>
            {message}
            <style>{`
                @keyframes slideInToast {
                    from { transform: translateY(24px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

// ─── Field Component ─────────────────────────────────────────────────────────
function Field({ label, required, children, hint }: {
    label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
                fontSize: '12px', fontWeight: 700,
                color: 'var(--text-secondary)', textTransform: 'uppercase',
                letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
                {label}
                {required && <span style={{ color: 'var(--danger)', fontSize: '14px' }}>*</span>}
            </label>
            {children}
            {hint && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{hint}</span>}
        </div>
    );
}

// ─── Input Styles ────────────────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement> & { bold?: boolean }) {
    const { bold, style, ...rest } = props;
    const [focused, setFocused] = useState(false);
    return (
        <input
            {...rest}
            style={{
                ...inputBase,
                fontWeight: bold ? 600 : 400,
                fontSize: bold ? '16px' : '14px',
                borderColor: focused ? 'var(--border-focus)' : 'var(--border)',
                boxShadow: focused ? '0 0 0 3px var(--primary-light)' : 'none',
                ...style,
            }}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        />
    );
}

function StyledSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    const { style, ...rest } = props;
    const [focused, setFocused] = useState(false);
    return (
        <select
            {...rest}
            style={{
                ...inputBase,
                borderColor: focused ? 'var(--border-focus)' : 'var(--border)',
                boxShadow: focused ? '0 0 0 3px var(--primary-light)' : 'none',
                cursor: 'pointer',
                ...style,
            }}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        />
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Page Component ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function CompanySettingsPage() {
    const [company, setCompany] = useState<Company | null>(null);
    const [original, setOriginal] = useState<string>(''); // JSON snapshot for dirty-check
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>('general');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isDirty = company ? JSON.stringify(company) !== original : false;

    // ─── Fetch ───────────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/company');
                if (res.ok) {
                    const data = await res.json();
                    setCompany(data);
                    setOriginal(JSON.stringify(data));
                }
            } catch (e) { console.error('Failed to fetch company', e); }
            finally { setLoading(false); }
        })();
    }, []);

    const handleChange = useCallback((field: keyof Company, value: any) => {
        setCompany(prev => prev ? { ...prev, [field]: value } : prev);
    }, []);

    // ─── Save ────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!company || !company.name.trim()) {
            setToast({ message: 'Tên công ty không được để trống!', type: 'error' });
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/company', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(company),
            });
            if (res.ok) {
                const updated = await res.json();
                setCompany(updated);
                setOriginal(JSON.stringify(updated));
                setToast({ message: 'Đã lưu thành công!', type: 'success' });
            } else {
                const err = await res.json();
                setToast({ message: err.error || 'Lỗi khi lưu', type: 'error' });
            }
        } catch {
            setToast({ message: 'Lỗi kết nối server', type: 'error' });
        } finally { setSaving(false); }
    };

    // ─── Logo Upload ─────────────────────────────────────────────────────────
    const processFile = async (file: File) => {
        if (!company) return;
        const allowed = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowed.includes(file.type)) {
            setToast({ message: 'Chỉ chấp nhận PNG, JPEG, GIF, WebP, SVG', type: 'error' });
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setToast({ message: 'File quá lớn (tối đa 10MB)', type: 'error' });
            return;
        }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('entityType', 'LOGO');
            fd.append('companyId', company.id);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (res.ok) {
                const { url } = await res.json();
                handleChange('logo', url);
                setToast({ message: 'Logo đã được tải lên!', type: 'success' });
            } else {
                const err = await res.json();
                setToast({ message: err.error || 'Upload thất bại', type: 'error' });
            }
        } catch { setToast({ message: 'Upload thất bại', type: 'error' }); }
        finally { setUploading(false); }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    // ─── Loading / Error ─────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin 1.2s linear infinite' }}>⏳</div>
                <p style={{ fontSize: '14px' }}>Đang tải thông tin...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    if (!company) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏢</div>
                <p style={{ fontSize: '15px', fontWeight: 600 }}>Không tìm thấy thông tin công ty</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Vui lòng liên hệ quản trị viên.</p>
            </div>
        </div>
    );

    return (
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
                        🏢 Thông tin công ty
                    </h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                        Thiết lập thông tin doanh nghiệp, logo, liên hệ và cài đặt kế toán
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !company.name.trim()}
                    style={{
                        background: 'var(--btn-primary)', color: 'var(--btn-primary-text)',
                        border: 'none', padding: '10px 24px', borderRadius: '10px',
                        fontWeight: 700, cursor: (saving || !company.name.trim()) ? 'not-allowed' : 'pointer',
                        fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                        opacity: (saving || !company.name.trim()) ? 0.6 : 1,
                        transition: 'all 0.2s',
                        position: 'relative',
                    }}
                >
                    {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                    {isDirty && !saving && (
                        <span style={{
                            position: 'absolute', top: '-3px', right: '-3px',
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: 'var(--warning)', border: '2px solid var(--surface)',
                        }} />
                    )}
                </button>
            </div>

            {/* ═══ CONTENT ═══ */}
            <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
                <div style={{
                    maxWidth: '880px', margin: '0 auto',
                    display: 'flex', flexDirection: 'column', gap: '20px',
                }}>

                    {/* ─── LOGO CARD ─── */}
                    <div style={{
                        background: 'var(--surface)',
                        borderRadius: '16px', border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-card)', padding: '24px',
                        display: 'flex', alignItems: 'center', gap: '24px',
                    }}>
                        {/* Logo Preview / Drop Zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '120px', height: '120px', borderRadius: '16px',
                                border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                                background: dragOver
                                    ? 'var(--primary-light)'
                                    : 'var(--background)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', flexShrink: 0, cursor: 'pointer',
                                transition: 'all 0.25s',
                                position: 'relative',
                            }}
                        >
                            {uploading ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '28px', animation: 'spin 1.2s linear infinite' }}>⏳</div>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Đang tải...</span>
                                </div>
                            ) : company.logo ? (
                                <img src={company.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>📤</div>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3', display: 'block' }}>
                                        Kéo thả hoặc<br />click để chọn
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Logo Info */}
                        <div style={{ flex: 1 }}>
                            <h3 style={{
                                fontSize: '16px', fontWeight: 700,
                                color: 'var(--text-primary)', marginBottom: '4px',
                            }}>
                                🖼️ Logo công ty
                            </h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                                PNG, JPEG, WebP, SVG — Tối đa 5MB. Logo sẽ hiển thị trên báo cáo, hóa đơn.
                            </p>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    style={{
                                        background: 'var(--surface-hover)', color: 'var(--text-primary)',
                                        border: '1px solid var(--border)', padding: '7px 16px',
                                        borderRadius: '8px', fontWeight: 600, fontSize: '13px',
                                        cursor: uploading ? 'wait' : 'pointer', transition: 'all 0.2s',
                                    }}
                                >
                                    📤 Chọn ảnh
                                </button>
                                {company.logo && (
                                    <button
                                        onClick={() => handleChange('logo', null)}
                                        style={{
                                            background: 'none', border: 'none',
                                            color: 'var(--danger)', cursor: 'pointer',
                                            fontSize: '13px', fontWeight: 600, padding: '7px 12px',
                                        }}
                                    >
                                        ✕ Xóa
                                    </button>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file" accept="image/*"
                                onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Company Code Input */}
                        <div style={{
                            textAlign: 'right', flexShrink: 0, width: '200px'
                        }}>
                            <Field label="Mã công ty" required>
                                <StyledInput
                                    value={company.code}
                                    onChange={e => handleChange('code', e.target.value)}
                                    placeholder="Mã công ty"
                                    style={{
                                        textAlign: 'right',
                                        fontWeight: 800,
                                        fontFamily: 'monospace',
                                        fontSize: '16px',
                                        color: 'var(--primary)',
                                        background: 'var(--primary-light)',
                                        border: '1px solid var(--primary-light)'
                                    }}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* ─── TABS + FORM CARD ─── */}
                    <div style={{
                        background: 'var(--surface)',
                        borderRadius: '16px', border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-card)', overflow: 'hidden',
                    }}>
                        {/* Tab Bar */}
                        <div style={{
                            display: 'flex', borderBottom: '1px solid var(--border)',
                            background: 'var(--surface)',
                        }}>
                            {TABS.map(tab => {
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        style={{
                                            flex: 1, padding: '14px 16px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontSize: '14px', fontWeight: isActive ? 700 : 500,
                                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                            borderBottom: isActive ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <span>{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div style={{ padding: '28px 32px' }}>

                            {/* ═══ TAB: General ═══ */}
                            {activeTab === 'general' && (
                                <div style={{ display: 'grid', gap: '24px', animation: 'fadeTab 0.25s ease' }}>
                                    {/* Row: Tax Code + Established Date */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <Field label="Mã số thuế">
                                            <StyledInput
                                                value={company.taxCode || ''}
                                                onChange={e => handleChange('taxCode', e.target.value)}
                                                placeholder="VD: 0312345678"
                                            />
                                        </Field>
                                        <Field label="Ngày thành lập">
                                            <StyledInput
                                                type="date"
                                                value={company.establishedDate ? new Date(company.establishedDate).toISOString().split('T')[0] : ''}
                                                onChange={e => handleChange('establishedDate', e.target.value)}
                                                style={{ maxWidth: '220px' }}
                                            />
                                        </Field>
                                    </div>

                                    {/* Company Name VN */}
                                    <Field label="Tên công ty (Tiếng Việt)" required>
                                        <StyledInput
                                            bold
                                            value={company.name}
                                            onChange={e => handleChange('name', e.target.value)}
                                            placeholder="Nhập tên doanh nghiệp..."
                                        />
                                    </Field>

                                    {/* Company Name EN */}
                                    <Field label="Tên công ty (Tiếng Anh)">
                                        <StyledInput
                                            value={company.nameEN || ''}
                                            onChange={e => handleChange('nameEN', e.target.value)}
                                            placeholder="English company name..."
                                        />
                                    </Field>

                                    {/* Names JP + Other */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <Field label="Tên công ty (Tiếng Nhật)" hint="会社名">
                                            <StyledInput
                                                value={company.nameJP || ''}
                                                onChange={e => handleChange('nameJP', e.target.value)}
                                                placeholder="日本語の会社名..."
                                            />
                                        </Field>
                                        <Field label="Tên công ty (Ngôn ngữ khác)">
                                            <StyledInput
                                                value={company.nameOther || ''}
                                                onChange={e => handleChange('nameOther', e.target.value)}
                                                placeholder="Other language name..."
                                            />
                                        </Field>
                                    </div>

                                    {/* Address */}
                                    <Field label="Địa chỉ trụ sở">
                                        <StyledInput
                                            value={company.address || ''}
                                            onChange={e => handleChange('address', e.target.value)}
                                            placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố..."
                                        />
                                    </Field>
                                </div>
                            )}

                            {/* ═══ TAB: Contact & Leadership ═══ */}
                            {activeTab === 'contact' && (
                                <div style={{ display: 'grid', gap: '28px', animation: 'fadeTab 0.25s ease' }}>
                                    {/* Contact Info */}
                                    <div>
                                        <h3 style={{
                                            fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)',
                                            marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                                        }}>
                                            📱 Thông tin liên hệ
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <Field label="Điện thoại">
                                                <StyledInput
                                                    value={company.phone || ''}
                                                    onChange={e => handleChange('phone', e.target.value)}
                                                    placeholder="028 1234 5678"
                                                />
                                            </Field>
                                            <Field label="Fax">
                                                <StyledInput
                                                    value={company.fax || ''}
                                                    onChange={e => handleChange('fax', e.target.value)}
                                                    placeholder="028 1234 5679"
                                                />
                                            </Field>
                                            <Field label="Email">
                                                <StyledInput
                                                    type="email"
                                                    value={company.email || ''}
                                                    onChange={e => handleChange('email', e.target.value)}
                                                    placeholder="info@company.com"
                                                />
                                            </Field>
                                            <Field label="Website">
                                                <StyledInput
                                                    value={company.website || ''}
                                                    onChange={e => handleChange('website', e.target.value)}
                                                    placeholder="https://company.com"
                                                />
                                            </Field>
                                        </div>
                                    </div>

                                    {/* Separator */}
                                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

                                    {/* Leadership */}
                                    <div>
                                        <h3 style={{
                                            fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)',
                                            marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                                        }}>
                                            👥 Ban lãnh đạo
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <Field label="Giám đốc" hint="Sẽ hiển thị trên các báo cáo, hóa đơn">
                                                <StyledInput
                                                    value={company.directorName || ''}
                                                    onChange={e => handleChange('directorName', e.target.value)}
                                                    placeholder="Họ và tên Giám đốc..."
                                                />
                                            </Field>
                                            <Field label="Kế toán trưởng" hint="Sẽ hiển thị trên các chứng từ kế toán">
                                                <StyledInput
                                                    value={company.chiefAccountantName || ''}
                                                    onChange={e => handleChange('chiefAccountantName', e.target.value)}
                                                    placeholder="Họ và tên Kế toán trưởng..."
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══ TAB: Accounting ═══ */}
                            {activeTab === 'accounting' && (
                                <div style={{ display: 'grid', gap: '24px', animation: 'fadeTab 0.25s ease' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                        <Field label="Đồng tiền hạch toán" hint="Đơn vị tiền cơ sở">
                                            <StyledInput
                                                value={company.currency}
                                                onChange={e => handleChange('currency', e.target.value)}
                                                placeholder="VND"
                                            />
                                        </Field>
                                        <Field label="Năm tài chính bắt đầu">
                                            <StyledSelect
                                                value={company.fiscalYearStart}
                                                onChange={e => handleChange('fiscalYearStart', parseInt(e.target.value))}
                                            >
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                    <option key={m} value={m}>Tháng {m}</option>
                                                ))}
                                            </StyledSelect>
                                        </Field>
                                        <Field label="Chế độ kế toán">
                                            <StyledSelect
                                                value={company.accountingStandard}
                                                onChange={e => handleChange('accountingStandard', e.target.value)}
                                            >
                                                <option value="TT200">Thông tư 200</option>
                                                <option value="TT133">Thông tư 133</option>
                                            </StyledSelect>
                                        </Field>
                                    </div>

                                    {/* Info box */}
                                    <div style={{
                                        background: 'var(--primary-light)',
                                        borderRadius: '12px', padding: '16px 20px',
                                        border: '1px solid var(--border)',
                                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                                    }}>
                                        <span style={{ fontSize: '20px', flexShrink: 0 }}>💡</span>
                                        <div>
                                            <p style={{
                                                fontSize: '13px', fontWeight: 600,
                                                color: 'var(--text-primary)', margin: '0 0 4px 0',
                                            }}>
                                                Lưu ý khi thay đổi chế độ kế toán
                                            </p>
                                            <p style={{
                                                fontSize: '12px', color: 'var(--text-secondary)',
                                                margin: 0, lineHeight: '1.5',
                                            }}>
                                                Thông tư 200 áp dụng cho doanh nghiệp lớn. Thông tư 133 áp dụng cho doanh nghiệp
                                                nhỏ và vừa. Thay đổi chế độ sẽ ảnh hưởng đến hệ thống tài khoản.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ TOAST ═══ */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Global tab animation */}
            <style>{`
                @keyframes fadeTab {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
