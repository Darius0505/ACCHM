'use client';

import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';

interface ExportButtonProps {
    onExport: (format: 'excel' | 'pdf' | 'csv') => Promise<void>;
    isLoading?: boolean;
    disabled?: boolean;
}

export function ExportButton({ onExport, isLoading = false, disabled = false }: ExportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [exporting, setExporting] = useState<string | null>(null);

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        setExporting(format);
        setIsOpen(false);
        try {
            await onExport(format);
        } finally {
            setExporting(null);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled || isLoading || !!exporting}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
                    opacity: disabled || isLoading ? 0.6 : 1,
                    transition: 'all 0.15s'
                }}
            >
                {exporting ? (
                    <>
                        <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                        Đang xuất...
                    </>
                ) : (
                    <>
                        📤 Xuất báo cáo
                        <span style={{ fontSize: '10px' }}>▼</span>
                    </>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 40
                        }}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown menu */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '4px',
                            minWidth: '180px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 50,
                            overflow: 'hidden'
                        }}
                    >
                        <ExportMenuItem
                            icon="📊"
                            label="Excel (.xlsx)"
                            sublabel="Microsoft Excel"
                            onClick={() => handleExport('excel')}
                        />
                        <ExportMenuItem
                            icon="📄"
                            label="PDF"
                            sublabel="Có thể in"
                            onClick={() => handleExport('pdf')}
                            disabled
                        />
                        <ExportMenuItem
                            icon="📝"
                            label="CSV"
                            sublabel="Dữ liệu thô"
                            onClick={() => handleExport('csv')}
                            disabled
                        />
                    </div>
                </>
            )}
        </div>
    );
}

interface ExportMenuItemProps {
    icon: string;
    label: string;
    sublabel?: string;
    onClick: () => void;
    disabled?: boolean;
}

function ExportMenuItem({ icon, label, sublabel, onClick, disabled }: ExportMenuItemProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 14px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.background = 'var(--surface-hover)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
            }}
        >
            <span style={{ fontSize: '18px' }}>{icon}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {label}
                </div>
                {sublabel && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {sublabel}
                    </div>
                )}
            </div>
            {disabled && (
                <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    background: 'var(--surface-active)',
                    borderRadius: '4px',
                    color: 'var(--text-muted)'
                }}>
                    Soon
                </span>
            )}
        </button>
    );
}

// ============================================================================
// HELPER: Download Excel Buffer
// ============================================================================

export async function downloadExcel(
    buffer: ArrayBuffer | Uint8Array,
    fileName: string
): Promise<void> {
    const blob = new Blob([buffer as ArrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `${fileName}.xlsx`);
}

// ============================================================================
// EXPORT: Default
// ============================================================================

export default ExportButton;
