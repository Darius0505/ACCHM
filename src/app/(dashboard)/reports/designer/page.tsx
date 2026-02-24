'use client';

import React from 'react';
import TemplateDesigner from '@/components/reports/TemplateDesigner';
import { ReportTemplateConfig } from '@/types/reportTemplate';

export default function ReportDesignerPage() {
    const handleSave = async (config: ReportTemplateConfig) => {
        try {
            // TODO: Save to database via API
            console.log('Saving template:', config);
            alert('Template đã được lưu thành công!');
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Lỗi khi lưu template');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)'
        }}>
            {/* Page Header */}
            <div style={{
                padding: '16px 24px',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'var(--text-primary)'
                    }}>
                        🎨 Thiết kế mẫu báo cáo
                    </h1>
                    <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '13px',
                        color: 'var(--text-muted)'
                    }}>
                        Tạo và chỉnh sửa mẫu báo cáo tùy chỉnh
                    </p>
                </div>

                <a
                    href="/reports"
                    style={{
                        padding: '8px 16px',
                        background: 'var(--surface-active)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        textDecoration: 'none',
                        cursor: 'pointer'
                    }}
                >
                    ← Quay lại báo cáo
                </a>
            </div>

            {/* Designer */}
            <TemplateDesigner onSave={handleSave} />
        </div>
    );
}
