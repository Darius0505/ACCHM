'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with @react-pdf/renderer
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
    { ssr: false, loading: () => <span>Đang tải...</span> }
);

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
    { ssr: false, loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>Đang tải PDF...</div> }
);

interface ReportViewerProps {
    /** The PDF Document component (e.g., <CashReceiptReport data={...} />) */
    document: React.ReactElement;
    /** Filename for download (without .pdf extension) */
    fileName: string;
    /** Whether the modal is open */
    isOpen: boolean;
    /** Close handler */
    onClose: () => void;
}

/**
 * ReportViewer - Modal to preview and download PDF reports
 * Uses dynamic imports to avoid SSR issues with @react-pdf/renderer
 */
export function ReportViewer({ document, fileName, isOpen, onClose }: ReportViewerProps) {
    const [activeTab, setActiveTab] = useState<'preview' | 'download'>('preview');

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'relative',
                width: '90vw', maxWidth: '900px',
                height: '90vh',
                backgroundColor: 'var(--surface, #fff)',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border, #e5e7eb)',
                    backgroundColor: 'var(--surface-header, #f9fafb)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #111)' }}>
                            📄 Xem trước báo cáo
                        </h3>
                        {/* Tab buttons */}
                        <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                            <button
                                onClick={() => setActiveTab('preview')}
                                style={{
                                    padding: '4px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: 500,
                                    backgroundColor: activeTab === 'preview' ? 'var(--primary, #3b82f6)' : 'transparent',
                                    color: activeTab === 'preview' ? '#fff' : 'var(--text-secondary, #6b7280)',
                                }}
                            >
                                Xem trước
                            </button>
                            <button
                                onClick={() => setActiveTab('download')}
                                style={{
                                    padding: '4px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: 500,
                                    backgroundColor: activeTab === 'download' ? 'var(--primary, #3b82f6)' : 'transparent',
                                    color: activeTab === 'download' ? '#fff' : 'var(--text-secondary, #6b7280)',
                                }}
                            >
                                Tải về
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '20px', color: 'var(--text-muted, #9ca3af)', padding: '4px',
                        }}
                        title="Đóng"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {activeTab === 'preview' ? (
                        <PDFViewer
                            width="100%"
                            height="100%"
                            showToolbar={true}
                            style={{ border: 'none' }}
                        >
                            {document}
                        </PDFViewer>
                    ) : (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', height: '100%', gap: '16px',
                        }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #3b82f6)" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                                Nhấn nút bên dưới để tải file PDF
                            </p>
                            <PDFDownloadLink
                                document={document}
                                fileName={`${fileName}.pdf`}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: 'var(--primary, #3b82f6)',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                            >
                                {({ loading }) => loading ? '⏳ Đang tạo PDF...' : `📥 Tải ${fileName}.pdf`}
                            </PDFDownloadLink>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReportViewer;
