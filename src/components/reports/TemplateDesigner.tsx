'use client';

import React, { useState, useCallback } from 'react';
import { ReportColumn, ReportTemplateConfig, ReportType, ReportCategory } from '@/types/reportTemplate';
import { VAS_TEMPLATES } from '@/config/reports/vasTemplates';

// ============================================================================
// TYPES
// ============================================================================

interface TemplateDesignerProps {
    initialConfig?: ReportTemplateConfig;
    onSave?: (config: ReportTemplateConfig) => void;
    onCancel?: () => void;
}

interface AvailableField {
    field: string;
    label: string;
    labelEN?: string;
    type: 'text' | 'number' | 'currency' | 'date' | 'percentage';
    category: string;
}

// ============================================================================
// AVAILABLE FIELDS BY REPORT TYPE
// ============================================================================

const AVAILABLE_FIELDS: Record<string, AvailableField[]> = {
    BALANCE_SHEET: [
        { field: 'vasCode', label: 'Mã số', type: 'text', category: 'VAS' },
        { field: 'name', label: 'Tên chỉ tiêu', type: 'text', category: 'Basic' },
        { field: 'thisPeriod', label: 'Số cuối kỳ', type: 'currency', category: 'Financial' },
        { field: 'prevPeriod', label: 'Số đầu năm', type: 'currency', category: 'Financial' },
        { field: 'note', label: 'Ghi chú', type: 'text', category: 'Basic' },
    ],
    INCOME_STATEMENT: [
        { field: 'vasCode', label: 'Mã số', type: 'text', category: 'VAS' },
        { field: 'name', label: 'Tên chỉ tiêu', type: 'text', category: 'Basic' },
        { field: 'thisPeriod', label: 'Kỳ này', type: 'currency', category: 'Financial' },
        { field: 'prevPeriod', label: 'Kỳ trước', type: 'currency', category: 'Financial' },
        { field: 'change', label: 'Chênh lệch', type: 'currency', category: 'Financial' },
        { field: 'changePercent', label: '% Thay đổi', type: 'percentage', category: 'Financial' },
    ],
    TRIAL_BALANCE: [
        { field: 'accountCode', label: 'Số TK', type: 'text', category: 'Account' },
        { field: 'accountName', label: 'Tên TK', type: 'text', category: 'Account' },
        { field: 'openingDebit', label: 'Nợ đầu kỳ', type: 'currency', category: 'Opening' },
        { field: 'openingCredit', label: 'Có đầu kỳ', type: 'currency', category: 'Opening' },
        { field: 'movementDebit', label: 'PS Nợ', type: 'currency', category: 'Movement' },
        { field: 'movementCredit', label: 'PS Có', type: 'currency', category: 'Movement' },
        { field: 'closingDebit', label: 'Nợ cuối kỳ', type: 'currency', category: 'Closing' },
        { field: 'closingCredit', label: 'Có cuối kỳ', type: 'currency', category: 'Closing' },
    ],
    GENERAL: [
        { field: 'code', label: 'Mã', type: 'text', category: 'Basic' },
        { field: 'name', label: 'Tên', type: 'text', category: 'Basic' },
        { field: 'description', label: 'Mô tả', type: 'text', category: 'Basic' },
        { field: 'amount', label: 'Số tiền', type: 'currency', category: 'Financial' },
        { field: 'quantity', label: 'Số lượng', type: 'number', category: 'Quantity' },
        { field: 'date', label: 'Ngày', type: 'date', category: 'Date' },
    ]
};

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const createDefaultConfig = (): ReportTemplateConfig => ({
    version: '1.0.0',
    dataSource: { endpoint: '' },
    columns: [],
    header: {
        showCompanyInfo: true,
        showLogo: false,
        title: 'Báo cáo mới',
        titleEN: 'New Report'
    },
    footer: {
        showSignatures: true,
        showDate: true,
        showPageNumbers: true
    },
    export: {
        fileName: 'report',
        sheetName: 'Sheet1',
        paperSize: 'A4',
        orientation: 'portrait',
        margins: { top: 20, bottom: 20, left: 25, right: 15 },
        style: {
            headerBgColor: '#1E3A8A',
            headerFontColor: '#FFFFFF',
            alternatRowColor: '#F8FAFC',
            borderStyle: 'thin',
            fontSize: 11,
            fontFamily: 'Times New Roman'
        }
    }
});

// ============================================================================
// COMPONENT
// ============================================================================

export function TemplateDesigner({ initialConfig, onSave, onCancel }: TemplateDesignerProps) {
    const [config, setConfig] = useState<ReportTemplateConfig>(initialConfig || createDefaultConfig());
    const [selectedReportType, setSelectedReportType] = useState<string>('GENERAL');
    const [selectedColumns, setSelectedColumns] = useState<ReportColumn[]>(initialConfig?.columns || []);
    const [activeTab, setActiveTab] = useState<'columns' | 'header' | 'export'>('columns');

    // Get available fields for selected report type
    const availableFields = AVAILABLE_FIELDS[selectedReportType] || AVAILABLE_FIELDS.GENERAL;

    // Add column
    const addColumn = (field: AvailableField) => {
        if (selectedColumns.some(c => c.field === field.field)) return;

        const newColumn: ReportColumn = {
            field: field.field,
            headerName: field.label,
            headerNameEN: field.labelEN,
            type: field.type,
            width: field.type === 'currency' ? 130 : 120,
            align: field.type === 'currency' || field.type === 'number' ? 'right' : 'left'
        };

        setSelectedColumns([...selectedColumns, newColumn]);
    };

    // Remove column
    const removeColumn = (field: string) => {
        setSelectedColumns(selectedColumns.filter(c => c.field !== field));
    };

    // Move column
    const moveColumn = (field: string, direction: 'up' | 'down') => {
        const index = selectedColumns.findIndex(c => c.field === field);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= selectedColumns.length) return;

        const newColumns = [...selectedColumns];
        [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];
        setSelectedColumns(newColumns);
    };

    // Update column
    const updateColumn = (field: string, updates: Partial<ReportColumn>) => {
        setSelectedColumns(selectedColumns.map(c =>
            c.field === field ? { ...c, ...updates } : c
        ));
    };

    // Load VAS template
    const loadVASTemplate = (code: string) => {
        const template = VAS_TEMPLATES.find(t => t.code === code);
        if (template) {
            setConfig(template.config);
            setSelectedColumns(template.config.columns);
            setSelectedReportType(template.type);
        }
    };

    // Save
    const handleSave = () => {
        const finalConfig: ReportTemplateConfig = {
            ...config,
            columns: selectedColumns
        };
        onSave?.(finalConfig);
    };

    return (
        <div style={{
            display: 'flex',
            height: 'calc(100vh - 120px)',
            background: 'var(--bg)',
            gap: '16px',
            padding: '16px'
        }}>
            {/* LEFT PANEL: Available Fields */}
            <div style={{
                width: '280px',
                background: 'var(--surface)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--surface-active)'
                }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        📋 Trường dữ liệu
                    </h3>

                    {/* Report Type Selector */}
                    <select
                        value={selectedReportType}
                        onChange={(e) => setSelectedReportType(e.target.value)}
                        style={{
                            marginTop: '12px',
                            width: '100%',
                            padding: '8px 10px',
                            fontSize: '13px',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            background: 'var(--surface)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="GENERAL">Chung</option>
                        <option value="BALANCE_SHEET">Bảng CĐKT (B01-DN)</option>
                        <option value="INCOME_STATEMENT">BC KQKD (B02-DN)</option>
                        <option value="TRIAL_BALANCE">Bảng CĐPS</option>
                    </select>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
                    {/* Group by category */}
                    {Array.from(new Set(availableFields.map(f => f.category))).map(category => (
                        <div key={category} style={{ marginBottom: '16px' }}>
                            <div style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                                marginBottom: '8px',
                                textTransform: 'uppercase'
                            }}>
                                {category}
                            </div>
                            {availableFields.filter(f => f.category === category).map(field => (
                                <button
                                    key={field.field}
                                    onClick={() => addColumn(field)}
                                    disabled={selectedColumns.some(c => c.field === field.field)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        width: '100%',
                                        padding: '8px 10px',
                                        marginBottom: '4px',
                                        background: selectedColumns.some(c => c.field === field.field)
                                            ? 'var(--surface-active)'
                                            : 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        cursor: selectedColumns.some(c => c.field === field.field)
                                            ? 'not-allowed'
                                            : 'pointer',
                                        opacity: selectedColumns.some(c => c.field === field.field) ? 0.5 : 1,
                                        transition: 'all 0.15s',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span style={{ fontSize: '14px' }}>
                                        {field.type === 'currency' ? '💰' :
                                            field.type === 'number' ? '🔢' :
                                                field.type === 'date' ? '📅' :
                                                    field.type === 'percentage' ? '📊' : '📝'}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {field.label}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                            {field.field}
                                        </div>
                                    </div>
                                    {selectedColumns.some(c => c.field === field.field) ? (
                                        <span style={{ fontSize: '12px', color: 'var(--success)' }}>✓</span>
                                    ) : (
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                {/* VAS Templates */}
                <div style={{
                    padding: '12px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--surface-active)'
                }}>
                    <div style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        marginBottom: '8px'
                    }}>
                        📋 MẪU VAS CÓ SẴN
                    </div>
                    {VAS_TEMPLATES.map(t => (
                        <button
                            key={t.code}
                            onClick={() => loadVASTemplate(t.code)}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '8px 10px',
                                marginBottom: '4px',
                                background: 'var(--primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            {t.code} - {t.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* MIDDLE PANEL: Column Layout */}
            <div style={{
                flex: 1,
                background: 'var(--surface)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--surface-active)'
                }}>
                    {[
                        { id: 'columns', label: '📊 Cột báo cáo' },
                        { id: 'header', label: '📋 Header/Footer' },
                        { id: 'export', label: '⚙️ Xuất file' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: '12px 20px',
                                background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                                fontSize: '13px',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                    {activeTab === 'columns' && (
                        <div>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-primary)' }}>
                                Cột đã chọn ({selectedColumns.length})
                            </h4>

                            {selectedColumns.length === 0 ? (
                                <div style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                    background: 'var(--surface-active)',
                                    borderRadius: '8px',
                                    border: '2px dashed var(--border)'
                                }}>
                                    Click vào trường bên trái để thêm cột
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {selectedColumns.map((col, index) => (
                                        <div
                                            key={col.field}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px',
                                                background: 'var(--surface-active)',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border)'
                                            }}
                                        >
                                            {/* Reorder buttons */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <button
                                                    onClick={() => moveColumn(col.field, 'up')}
                                                    disabled={index === 0}
                                                    style={{
                                                        width: '24px',
                                                        height: '20px',
                                                        background: 'var(--surface)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '4px',
                                                        fontSize: '10px',
                                                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                        opacity: index === 0 ? 0.3 : 1
                                                    }}
                                                >
                                                    ▲
                                                </button>
                                                <button
                                                    onClick={() => moveColumn(col.field, 'down')}
                                                    disabled={index === selectedColumns.length - 1}
                                                    style={{
                                                        width: '24px',
                                                        height: '20px',
                                                        background: 'var(--surface)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '4px',
                                                        fontSize: '10px',
                                                        cursor: index === selectedColumns.length - 1 ? 'not-allowed' : 'pointer',
                                                        opacity: index === selectedColumns.length - 1 ? 0.3 : 1
                                                    }}
                                                >
                                                    ▼
                                                </button>
                                            </div>

                                            {/* Column config */}
                                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px', gap: '8px' }}>
                                                <input
                                                    value={col.headerName}
                                                    onChange={(e) => updateColumn(col.field, { headerName: e.target.value })}
                                                    placeholder="Tên cột"
                                                    style={{
                                                        padding: '6px 8px',
                                                        fontSize: '13px',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '4px',
                                                        background: 'var(--surface)'
                                                    }}
                                                />
                                                <input
                                                    value={col.field}
                                                    disabled
                                                    style={{
                                                        padding: '6px 8px',
                                                        fontSize: '12px',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '4px',
                                                        background: 'var(--surface-hover)',
                                                        color: 'var(--text-muted)'
                                                    }}
                                                />
                                                <input
                                                    type="number"
                                                    value={col.width || 120}
                                                    onChange={(e) => updateColumn(col.field, { width: Number(e.target.value) })}
                                                    placeholder="Width"
                                                    style={{
                                                        padding: '6px 8px',
                                                        fontSize: '12px',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '4px',
                                                        background: 'var(--surface)'
                                                    }}
                                                />
                                                <select
                                                    value={col.align || 'left'}
                                                    onChange={(e) => updateColumn(col.field, { align: e.target.value as any })}
                                                    style={{
                                                        padding: '4px 6px',
                                                        fontSize: '12px',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '4px',
                                                        background: 'var(--surface)'
                                                    }}
                                                >
                                                    <option value="left">Trái</option>
                                                    <option value="center">Giữa</option>
                                                    <option value="right">Phải</option>
                                                </select>
                                            </div>

                                            {/* Remove button */}
                                            <button
                                                onClick={() => removeColumn(col.field)}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    background: 'var(--danger)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '14px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'header' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                                    Tiêu đề báo cáo (Vietnamese)
                                </label>
                                <input
                                    value={config.header.title}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        header: { ...config.header, title: e.target.value }
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        background: 'var(--surface)'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                                    Tiêu đề báo cáo (English)
                                </label>
                                <input
                                    value={config.header.titleEN || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        header: { ...config.header, titleEN: e.target.value }
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        background: 'var(--surface)'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.header.showCompanyInfo}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            header: { ...config.header, showCompanyInfo: e.target.checked }
                                        })}
                                    />
                                    <span style={{ fontSize: '13px' }}>Hiện thông tin công ty</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.footer?.showSignatures}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            footer: { ...config.footer, showSignatures: e.target.checked }
                                        })}
                                    />
                                    <span style={{ fontSize: '13px' }}>Hiện chữ ký</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'export' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                                    Tên file mặc định
                                </label>
                                <input
                                    value={config.export.fileName || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        export: { ...config.export, fileName: e.target.value }
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        fontSize: '13px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        background: 'var(--surface)'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                                    Khổ giấy
                                </label>
                                <select
                                    value={config.export.paperSize}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        export: { ...config.export, paperSize: e.target.value as any }
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        fontSize: '13px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        background: 'var(--surface)'
                                    }}
                                >
                                    <option value="A4">A4</option>
                                    <option value="A3">A3</option>
                                    <option value="Letter">Letter</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                                    Hướng giấy
                                </label>
                                <select
                                    value={config.export.orientation}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        export: { ...config.export, orientation: e.target.value as any }
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        fontSize: '13px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        background: 'var(--surface)'
                                    }}
                                >
                                    <option value="portrait">Dọc (Portrait)</option>
                                    <option value="landscape">Ngang (Landscape)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                                    Màu header
                                </label>
                                <input
                                    type="color"
                                    value={config.export.style?.headerBgColor || '#1E3A8A'}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        export: {
                                            ...config.export,
                                            style: { ...config.export.style, headerBgColor: e.target.value }
                                        }
                                    })}
                                    style={{
                                        width: '100%',
                                        height: '40px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        background: 'var(--surface)',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    padding: '16px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--surface-active)'
                }}>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            style={{
                                padding: '10px 20px',
                                background: 'var(--surface)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            Hủy
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={selectedColumns.length === 0}
                        style={{
                            padding: '10px 24px',
                            background: selectedColumns.length > 0 ? 'var(--primary)' : 'var(--border)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: selectedColumns.length > 0 ? 'pointer' : 'not-allowed'
                        }}
                    >
                        💾 Lưu mẫu báo cáo
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TemplateDesigner;
