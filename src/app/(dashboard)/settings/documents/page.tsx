'use client';

/**
 * Document Settings Page
 * Manage Journal Numbers, Templates, Prefixes
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface Journal {
    id: string;
    code: string;
    name: string;
    prefix: string;
    template: string;
    nextNumber: number;
    padding: number;
    type: string;
}

export default function DocumentSettingsPage() {
    const [journals, setJournals] = useState<Journal[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Journal>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings/documents');
            if (res.ok) {
                const data = await res.json();
                setJournals(data);
            }
        } catch (error) {
            console.error('Failed to fetch journals', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (journal: Journal) => {
        setEditingId(journal.id);
        setEditForm({ ...journal });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async (id: string) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/settings/documents/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                await fetchJournals();
                setEditingId(null);
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    // Helper to preview
    const getPreview = (template: string, prefix: string, nextNum: number, padding: number) => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const numStr = String(nextNum).padStart(padding || 5, '0');

        let formatted = template || '{PREFIX}-{YYYY}-{NNNNN}';
        formatted = formatted.replace('{PREFIX}', prefix || '');
        formatted = formatted.replace('{YYYY}', String(year));
        formatted = formatted.replace('{YY}', String(year).slice(-2));
        formatted = formatted.replace('{MM}', month);
        formatted = formatted.replace('{DD}', day);
        formatted = formatted.replace(/{N+}/, numStr);

        if (!template?.includes('{N')) {
            formatted += numStr;
        }
        return formatted;
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Thiết lập chứng từ</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Cấu hình số phiếu, tiền tố và định dạng mã chứng từ</p>
                </div>
                <Button onClick={fetchJournals} variant="outline" size="sm">Làm mới</Button>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-header)', textAlign: 'left' }}>
                            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Mã loại</th>
                            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Tên chứng từ</th>
                            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Tiền tố (Prefix)</th>
                            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Mẫu số (Template)</th>
                            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Độ dài số</th>
                            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Số tiếp theo</th>
                            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Xem trước</th>
                            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center' }}>Đang tải...</td></tr>
                        ) : journals.map(journal => {
                            const isEditing = editingId === journal.id;

                            // Use updated/editing values for preview
                            const currentTemplate = isEditing ? (editForm.template ?? journal.template) : journal.template;
                            const currentPrefix = isEditing ? (editForm.prefix ?? journal.prefix) : journal.prefix;
                            const currentNextNum = isEditing ? (editForm.nextNumber ?? journal.nextNumber) : journal.nextNumber;
                            const currentPadding = isEditing ? (editForm.padding ?? journal.padding) : journal.padding;

                            const preview = getPreview(
                                currentTemplate || '{PREFIX}-{YYYY}-{NNNNN}',
                                currentPrefix || journal.code || '',
                                currentNextNum || 1,
                                currentPadding || 5
                            );

                            return (
                                <tr key={journal.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>{journal.code}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500 }}>{journal.name}</td>

                                    {/* Prefix */}
                                    <td style={{ padding: '12px 16px' }}>
                                        {isEditing ? (
                                            <input
                                                value={editForm.prefix !== undefined ? editForm.prefix : (journal.prefix || '')}
                                                onChange={e => setEditForm(f => ({ ...f, prefix: e.target.value }))}
                                                style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                                            />
                                        ) : journal.prefix}
                                    </td>

                                    {/* Template */}
                                    <td style={{ padding: '12px 16px' }}>
                                        {isEditing ? (
                                            <input
                                                value={editForm.template !== undefined ? editForm.template : (journal.template || '')}
                                                onChange={e => setEditForm(f => ({ ...f, template: e.target.value }))}
                                                placeholder="{PREFIX}-{YYYY}-{NNNNN}"
                                                style={{ width: '220px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                                            />
                                        ) : <code style={{ fontSize: '12px', backgroundColor: 'var(--surface-hover)', padding: '2px 4px', borderRadius: '4px' }}>{journal.template}</code>}
                                    </td>

                                    {/* Padding */}
                                    <td style={{ padding: '12px 16px' }}>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editForm.padding !== undefined ? editForm.padding : (journal.padding || 5)}
                                                onChange={e => setEditForm(f => ({ ...f, padding: parseInt(e.target.value) }))}
                                                style={{ width: '50px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                                            />
                                        ) : journal.padding}
                                    </td>

                                    {/* Next Number */}
                                    <td style={{ padding: '12px 16px' }}>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editForm.nextNumber !== undefined ? editForm.nextNumber : (journal.nextNumber || 1)}
                                                onChange={e => setEditForm(f => ({ ...f, nextNumber: parseInt(e.target.value) }))}
                                                style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
                                            />
                                        ) : (journal.nextNumber || 1)}
                                    </td>

                                    {/* Preview */}
                                    <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>
                                        {preview}
                                    </td>

                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <Button size="xs" variant="ghost" onClick={handleCancel}>Hủy</Button>
                                                <Button size="xs" onClick={() => handleSave(journal.id)} disabled={saving}>Lưu</Button>
                                            </div>
                                        ) : (
                                            <Button size="xs" variant="ghost" onClick={() => handleEdit(journal)}>Sửa</Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                <strong>Ghi chú về Template:</strong>
                <ul style={{ marginTop: '8px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li><code>{`{PREFIX}`}</code>: Tiền tố (ví dụ: PT, PC)</li>
                    <li><code>{`{YYYY}`}</code>: Năm 4 chữ số (2026)</li>
                    <li><code>{`{YY}`}</code>: Năm 2 chữ số (26)</li>
                    <li><code>{`{MM}`}</code>: Tháng hiện tại (01-12)</li>
                    <li><code>{`{DD}`}</code>: Ngày hiện tại (01-31)</li>
                    <li><code>{`{NN...}`}</code>: Số tự tăng (độ dài theo cấu hình Padding hoặc số lượng chữ N)</li>
                </ul>
            </div>
        </div>
    );
}
