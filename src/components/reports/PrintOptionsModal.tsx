import React, { useState } from 'react';

export interface PrintOptions {
    template: '1LIEN' | '2LIEN';
}

interface PrintOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (options: PrintOptions) => void;
    title?: string;
}

export function PrintOptionsModal({ isOpen, onClose, onConfirm, title = "Tuỳ chọn in Phiếu" }: PrintOptionsModalProps) {
    const [template, setTemplate] = useState<'1LIEN' | '2LIEN'>('1LIEN');

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
        }}>
            <div style={{
                width: '400px',
                backgroundColor: 'var(--surface, #fff)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid var(--border)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        🖨️ {title}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '20px', color: 'var(--text-muted)'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Mẫu in (Template)</label>
                        <select
                            value={template}
                            onChange={(e) => setTemplate(e.target.value as '1LIEN' | '2LIEN')}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--background)',
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        >
                            <option value="1LIEN">Mẫu chuẩn (1 Liên)</option>
                            <option value="2LIEN">Mẫu 2 Liên (A4)</option>
                        </select>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                            {template === '1LIEN'
                                ? 'Phù hợp in 1 bản A4 thông thường để lưu trữ.'
                                : 'In 2 bản giống hệt nhau trên 1 tờ A4, có đường cắt ở giữa để xé đưa khách hàng.'}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-hover)',
                    display: 'flex', justifyContent: 'flex-end', gap: '12px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px', borderRadius: '6px',
                            backgroundColor: 'transparent', border: '1px solid var(--border)',
                            color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => onConfirm({ template })}
                        style={{
                            padding: '8px 16px', borderRadius: '6px',
                            backgroundColor: 'var(--primary)', border: 'none',
                            color: '#fff', fontSize: '13px', fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        Xem trước & In
                    </button>
                </div>
            </div>
        </div>
    );
}
