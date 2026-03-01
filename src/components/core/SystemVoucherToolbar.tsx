import React from 'react';
import { ThemeToggleIcon } from '@/components/ThemeProvider';

export interface SystemVoucherToolbarProps {
    title: string;
    subtitle?: string;

    // Status Badge
    status?: 'DRAFT' | 'POSTED';
    statusTextDraft?: string;
    statusTextPosted?: string;
    onToggleStatus?: () => void;

    // Action Handlers
    onNew?: () => void;
    onCopy?: () => void;
    onSave?: () => void;
    onPrint?: () => void;
    onDelete?: () => void;
    onCancel?: () => void; // Usually for closing the form

    // Component States
    isSaving?: boolean;
    isDeleting?: boolean;
    canCopy?: boolean; // If false, the copy button is hidden
    canDelete?: boolean; // If false, the delete button is hidden
}

export default function SystemVoucherToolbar({
    title,
    subtitle,
    status = 'DRAFT',
    statusTextDraft = 'CHƯA GHI SỔ',
    statusTextPosted = 'ĐÃ GHI SỔ',
    onToggleStatus,
    onNew,
    onCopy,
    onSave,
    onPrint,
    onDelete,
    onCancel,
    isSaving = false,
    isDeleting = false,
    canCopy = false,
    canDelete = false,
}: SystemVoucherToolbarProps) {

    // Consistent button styles
    const standardButtonStyle = {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px', borderRadius: '6px',
        backgroundColor: 'transparent', border: '1px solid var(--border)',
        color: 'var(--text-primary)', fontSize: '12px', fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.2s'
    };

    const primaryButtonStyle = {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 16px', borderRadius: '6px',
        backgroundColor: 'var(--btn-danger)', border: '1px solid var(--btn-danger-border)',
        color: 'var(--btn-danger-text)', fontSize: '12px', fontWeight: 600,
        cursor: (isSaving || isDeleting) ? 'not-allowed' : 'pointer', opacity: (isSaving || isDeleting) ? 0.7 : 1,
        transition: 'all 0.2s'
    };

    const newButtonStyle = {
        ...standardButtonStyle,
        backgroundColor: 'var(--btn-secondary)',
        border: '1px solid var(--btn-secondary-border)',
        color: 'var(--btn-secondary-text)'
    };

    const copyButtonStyle = {
        ...standardButtonStyle,
        backgroundColor: 'var(--btn-secondary)',
        border: '1px solid var(--btn-secondary-border)',
        color: 'var(--btn-secondary-text)'
    };

    const printButtonStyle = {
        ...standardButtonStyle,
        backgroundColor: 'var(--btn-secondary)',
        border: '1px solid var(--btn-secondary-border)',
        color: 'var(--btn-secondary-text)'
    };

    const dangerButtonStyle = {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px', borderRadius: '6px',
        backgroundColor: 'var(--btn-secondary)', border: '1px solid var(--btn-secondary-border)',
        color: 'var(--btn-secondary-text)', fontSize: '12px', fontWeight: 500,
        cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.7 : 1,
        transition: 'all 0.2s'
    };

    return (
        <header style={{
            height: '48px', flexShrink: 0, backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {onCancel && (
                    <button onClick={onCancel} style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                )}
                <div>
                    <h1 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{title}</h1>
                    {subtitle && <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Status Badge Removed per user request */}

                {/* Khu Vực Cách Ly (Far Left) */}
                {canDelete && onDelete && (
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        style={dangerButtonStyle}
                        onMouseOver={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)')}
                        onMouseOut={(e) => !isDeleting && (e.currentTarget.style.backgroundColor = 'var(--btn-secondary)')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                        {isDeleting ? 'Đang xoá...' : 'Xoá'}
                    </button>
                )}

                {canDelete && onDelete && <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border)', margin: '0 4px' }}></div>}

                {/* Vùng Vãng Lai */}
                {onPrint && (
                    <button
                        onClick={onPrint}
                        style={printButtonStyle}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-secondary)'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                        In
                    </button>
                )}

                {/* Vùng Cận Vua */}
                {canCopy && onCopy && (
                    <button
                        onClick={onCopy}
                        style={copyButtonStyle}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-secondary)'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        Nhân bản
                    </button>
                )}

                {onNew && (
                    <button
                        onClick={onNew}
                        style={newButtonStyle}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-secondary)'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        Mới
                    </button>
                )}

                {(onPrint || (canCopy && onCopy) || onNew) && <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border)', margin: '0 4px' }}></div>}

                {/* Vị trí Vua (Cực Phải) */}
                {onSave && (
                    <button
                        onClick={onSave}
                        disabled={isSaving || isDeleting}
                        style={primaryButtonStyle}
                        onMouseOver={(e) => (!isSaving && !isDeleting) && (e.currentTarget.style.backgroundColor = 'var(--btn-danger-hover)')}
                        onMouseOut={(e) => (!isSaving && !isDeleting) && (e.currentTarget.style.backgroundColor = 'var(--btn-danger)')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                )}

                {/* Global Utilities */}
                <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border)', margin: '0 8px' }}></div>
                <ThemeToggleIcon />
            </div>
        </header>
    );
}
