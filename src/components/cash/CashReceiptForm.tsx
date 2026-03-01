'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { numberToWordsVND } from '@/lib/numberToWords';
import { DatePicker } from '@/components/ui/DatePicker';
import { ComboboxSelect, ComboboxOption } from '@/components/ui/ComboboxSelect';
import { CashReceiptReport } from '@/components/reports/CashReceiptReport';
import { CashReceiptReport2Lien } from '@/components/reports/CashReceiptReport2Lien';
import { ReportViewer } from '@/components/reports/ReportViewer';
import { PrintOptionsModal, PrintOptions } from '@/components/reports/PrintOptionsModal';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useToast } from "@/components/ui/use-toast";
import { FileUploader, UploadedFile } from '@/components/ui/FileUploader';

// --- HYBRID CORE ARCHITECTURE ---
import SystemVoucherToolbar from '@/components/core/SystemVoucherToolbar';
import DynamicAccountingGrid from '@/components/core/DynamicAccountingGrid';
import { useVoucherCore } from '@/components/core/useVoucherCore';

// --- Interfaces ---
export interface ReceiptDetail {
    id: string;
    description: string;
    currency: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
    objectId: string;
    objectName: string;
}

export interface FormData {
    id?: string;
    receiptNumber: string;
    date: string;
    postedDate: string;
    currency: string;
    exchangeRate: number;

    // General Info
    payerName: string;
    payerAddress: string;
    subjectType: string;
    subjectId: string;
    subjectName: string;
    reason: string;
    employeeName: string;
    attachments: string;
    attachedFiles: UploadedFile[];
    inheritFromOrder: boolean;
    inheritFromContract: boolean;

    details: ReceiptDetail[];
    status: 'POSTED';
}

const defaultDetail: ReceiptDetail = {
    id: 'temp-1',
    description: '',
    currency: 'VND',
    debitAccount: '1111',
    creditAccount: '131',
    amount: 0,
    objectId: '',
    objectName: ''
};

const emptyForm: FormData = {
    receiptNumber: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    postedDate: format(new Date(), 'yyyy-MM-dd'),
    currency: 'VND',
    exchangeRate: 1,
    payerName: '',
    payerAddress: '',
    subjectType: 'CUSTOMER',
    subjectId: '',
    subjectName: '',
    reason: '',
    employeeName: '',
    attachments: '',
    attachedFiles: [],
    inheritFromOrder: false,
    inheritFromContract: false,
    details: [{ ...defaultDetail }],
    status: 'POSTED'
};

import { SysGridColumnMetadata } from '../core/DynamicAccountingGrid';

interface CashReceiptFormProps {
    id?: string | null;
    onSuccess?: (action?: 'save' | 'delete', data?: any) => void;
    onCancel?: () => void;
}

export default function CashReceiptForm({ id, onSuccess, onCancel }: CashReceiptFormProps) {
    const { toast } = useToast();
    const { company } = useCompanyInfo();
    const isNewMode = !id;

    // Report States
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);
    const [printTemplate, setPrintTemplate] = useState<'1LIEN' | '2LIEN'>('1LIEN');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

    // Data Sources
    const [subjectTypes] = useState<ComboboxOption[]>([
        { value: 'CUSTOMER', label: 'Khách hàng', code: 'KH' },
        { value: 'VENDOR', label: 'Nhà cung cấp', code: 'NCC' },
        { value: 'EMPLOYEE', label: 'Nhân viên', code: 'NV' },
        { value: 'BANK', label: 'Ngân hàng', code: 'NH' },
        { value: 'OTHER', label: 'Khác', code: 'K' }
    ]);
    const [subjects, setSubjects] = useState<ComboboxOption[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    // Accounts for Grid Lookups
    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await fetch('/api/accounts');
                if (res.ok) {
                    const data = await res.json();
                    setAccounts(data.map((a: any) => ({ code: a.code, name: a.name, isPosting: a.isPosting })));
                }
            } catch (error) {
                console.error('Failed to fetch accounts', error);
            }
        };
        fetchAccounts();
    }, []);

    // Fetch Next Number Function
    const fetchNextNumber = useCallback(async () => {
        try {
            const res = await fetch('/api/cash-receipts/next-number');
            if (res.ok) {
                const data = await res.json();
                return data.nextNumber || null;
            }
        } catch (error) {
            console.error('Failed to fetch next number', error);
        }
        return null;
    }, []);

    // Phase 1 Mock API Fetch (Memoized)
    const fetchVoucherApi = useCallback(async (receiptId: string) => {
        const res = await fetch(`/api/cash-receipts/${receiptId}`);
        if (!res.ok) throw new Error('Failed to fetch receipt');
        const full = await res.json();

        const dateStr = full.date ? new Date(full.date).toISOString().split('T')[0] : '';
        const postedDateStr = full.postedDate ? new Date(full.postedDate).toISOString().split('T')[0] : dateStr;

        return {
            id: full.id,
            receiptNumber: full.receiptNumber,
            date: dateStr,
            postedDate: postedDateStr,
            payerName: full.payerName || full.partner?.name || '',
            payerAddress: full.payerAddress || '',
            subjectType: full.partner?.type || 'CUSTOMER',
            subjectId: full.partnerId || '',
            subjectName: full.partner?.name || '',
            reason: full.description || '',
            currency: full.currency || 'VND',
            exchangeRate: full.exchangeRate || 1,
            employeeName: full.employeeName || '',
            attachments: full.attachments || '',
            attachedFiles: full.attachedFiles || [],
            inheritFromOrder: false,
            inheritFromContract: false,
            details: full.details?.length > 0
                ? full.details.map((d: any) => ({
                    id: d.id,
                    description: d.description || '',
                    currency: d.originalCurrency || 'VND',
                    debitAccount: d.debitAccountId || '',
                    creditAccount: d.creditAccountId || '',
                    amount: Number(d.amount),
                    objectId: d.partnerId || '',
                    objectName: d.partner?.name || ''
                }))
                : [{
                    ...defaultDetail,
                    amount: Number(full.amount),
                    description: full.description,
                    debitAccount: full.debitAccountId || '1111',
                    creditAccount: full.creditAccountId || '131'
                }],
            status: 'POSTED' as const
        };
    }, []);

    // Phase 3 Master API Integration
    const executeApi = useCallback(async ({ journalCode, action, data }: { journalCode: string, action: string, data: any }) => {
        if (action === 'DELETE') {
            if (!id) return;
            const res = await fetch(`/api/vouchers/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ journalCode, action, data: { id } })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Xoá thất bại');
            }
            if (onSuccess) onSuccess('delete');
            return true;
        }

        if (action === 'SAVE') {
            const totalAmount = data.details.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
            const payload = {
                id: data.id,
                date: data.date,
                receiptNumber: data.receiptNumber,
                partnerId: data.subjectId || undefined,
                payerName: data.payerName,
                amount: totalAmount,
                description: data.reason || data.details[0]?.description || '',
                debitAccountId: data.details[0]?.debitAccount || '1111',
                creditAccountId: data.details[0]?.creditAccount || '131',
                attachments: data.attachments,
                status: data.status,
                details: data.details.map((d: any) => ({
                    description: d.description,
                    debitAccountId: d.debitAccount,
                    creditAccountId: d.creditAccount,
                    amount: d.amount,
                    partnerId: d.objectId || undefined
                })),
                attachedFiles: data.attachedFiles
            };

            const res = await fetch(`/api/vouchers/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ journalCode, action, data: payload })
            });

            if (!res.ok) {
                const err = await res.json();
                if (isNewMode && err.error?.includes('Unique constraint failed')) {
                    throw new Error(`Số phiếu ${data.receiptNumber} đã tồn tại. Vui lòng lấy số mới và lưu lại.`);
                }
                throw new Error(err.error || 'Lưu thất bại');
            }

            const responseInfo = await res.json();
            if (onSuccess) onSuccess('save', responseInfo);
            return responseInfo;
        }

        if (action === 'COPY') {
            return true; // Virtual action handled by setForm logic wrapper
        }
    }, [id, onSuccess, isNewMode]);

    // --- HYBRID CORE INITIALIZATION ---
    const {
        form,
        setForm,
        loading,
        saving,
        deleting,
        columnMetadata,
        loadVoucher,
        executeAction,
        resetForm,
        isPosted
    } = useVoucherCore<FormData>({
        journalCode: 'PT', // Phieu Thu
        emptyForm,
        fetchVoucherApi,
        executeApi,
    });

    // Sub-Calculations
    const totalAmount = form.details.reduce((sum, d) => sum + (d.amount || 0), 0);
    const amountInWords = numberToWordsVND(totalAmount);

    // Initial Load
    useEffect(() => {
        if (isNewMode) {
            resetForm();
            fetchNextNumber().then(num => {
                if (num) setForm(f => ({ ...f, receiptNumber: num }));
            });
        } else if (id) {
            loadVoucher(id);
        }
    }, [id, isNewMode, loadVoucher, resetForm, fetchNextNumber, setForm]);

    // Fetch Subjects when Type changes
    useEffect(() => {
        async function fetchSubjects() {
            if (!form.subjectType) return;
            setLoadingSubjects(true);
            try {
                const res = await fetch(`/api/partners?type=${form.subjectType}`);
                if (res.ok) {
                    const data = await res.json();
                    setSubjects(data.map((s: any) => ({
                        value: s.id,
                        label: s.name,
                        description: `${s.code || ''} - ${s.phone || ''}`,
                        address: s.address,
                        code: s.code || ''
                    })));
                }
            } catch (error) {
                console.error('Failed to fetch subjects', error);
            } finally {
                setLoadingSubjects(false);
            }
        }
        fetchSubjects();
    }, [form.subjectType]);

    // --- Action Wrappers ---
    const handleSaveWrapper = () => {
        if (!form.receiptNumber) {
            toast({ title: "Thiếu thông tin", description: "Số phiếu không được để trống", variant: "destructive" });
            return;
        }
        if (!form.payerName) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng nhập người nộp tiền", variant: "destructive" });
            return;
        }
        if (totalAmount <= 0) {
            toast({ title: "Thiếu thông tin", description: "Tổng số tiền phải lớn hơn 0.", variant: "destructive" });
            return;
        }
        const invalidLine = form.details.findIndex(d => !d.debitAccount || !d.creditAccount);
        if (invalidLine >= 0) {
            toast({ title: "Thiếu thông tin", description: `Dòng ${invalidLine + 1}: Vui lòng nhập đầy đủ TK Nợ và TK Có`, variant: "destructive" });
            return;
        }
        executeAction('SAVE');
    };

    const handleDeleteWrapper = () => {
        const msg = isPosted
            ? `Phiếu ${form.receiptNumber} đã ghi sổ.\n\nBạn có muốn XOÁ phiếu này không?\n(Bút toán liên quan sẽ bị huỷ tự động)`
            : `Bạn có chắc muốn xoá phiếu ${form.receiptNumber}?`;
        if (confirm(msg)) {
            executeAction('DELETE');
        }
    };

    const handleCopyWrapper = () => {
        setForm(prev => ({
            ...prev,
            id: undefined,
            receiptNumber: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            postedDate: format(new Date(), 'yyyy-MM-dd'),
            status: 'POSTED',
            attachments: '',
            attachedFiles: [],
            details: prev.details.map(d => ({ ...d, id: crypto.randomUUID() }))
        }));
        fetchNextNumber().then(num => {
            if (num) setForm(f => ({ ...f, receiptNumber: num }));
        });
        toast({ title: "Đã nhân bản", description: "Đã copy dữ liệu sang phiếu mới. Vui lòng kiểm tra và lưu lại." });
    };

    const addRow = () => {
        setForm(prev => ({
            ...prev,
            details: [...prev.details, {
                ...defaultDetail,
                id: crypto.randomUUID(),
                description: prev.reason,
                objectName: prev.subjectName
            }]
        }));
    };

    // --- Styles ---
    const inputStyle = {
        backgroundColor: 'var(--background)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        height: '32px',
        padding: '0 8px',
        borderRadius: '4px',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box' as const
    };

    const labelStyle = {
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        minWidth: '100px',
        textAlign: 'left' as const,
        marginRight: '12px',
        whiteSpace: 'nowrap' as const,
        letterSpacing: '0.02em'
    };

    const rowStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px'
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>

            {/* HYBRID CORE: VOUCHER TOOLBAR */}
            <SystemVoucherToolbar
                title="PHIẾU THU TIỀN MẶT"
                subtitle="Cash Receipt Voucher"
                status={form.status}
                onNew={() => {
                    resetForm();
                    fetchNextNumber().then(num => {
                        if (num) setForm(f => ({ ...f, receiptNumber: num }));
                    });
                    if (onSuccess) onSuccess('new' as any);
                }}
                onCopy={id && form.id ? handleCopyWrapper : undefined}
                onSave={handleSaveWrapper}
                onPrint={() => setIsPrintOptionsOpen(true)}
                onDelete={id ? handleDeleteWrapper : undefined}
                onCancel={onCancel}
                isSaving={saving}
                isDeleting={deleting}
                canCopy={true}
                canDelete={true}
            />

            {/* MAIN FORM */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: 'var(--background)' }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto', backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column', minHeight: '600px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>

                    {/* FORM HEADER - Premium 2-Column Grid Layout */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '7fr 3fr',
                        gap: '0',
                        borderBottom: '1px solid var(--border)'
                    }}>

                        {/* LEFT COLUMN: Thông tin chung (70%) */}
                        <div style={{
                            padding: '20px 24px',
                            borderRight: '1px solid var(--border)',
                            display: 'flex', flexDirection: 'column', gap: '10px'
                        }}>
                            <h3 style={{
                                fontSize: '11px', fontWeight: 700, color: 'var(--primary)',
                                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Thông tin chung
                            </h3>

                            <div style={rowStyle}>
                                <label style={{ ...labelStyle, minWidth: '90px' }}>Loại đối tượng</label>
                                <ComboboxSelect
                                    options={subjectTypes}
                                    value={form.subjectType}
                                    onChange={(val) => {
                                        setForm(f => ({
                                            ...f,
                                            subjectType: val,
                                            subjectId: '',
                                            subjectName: '',
                                            payerName: ''
                                        }));
                                    }}
                                    placeholder="Chọn loại..."
                                    searchPlaceholder="Tìm loại đối tượng..."
                                />
                            </div>

                            <div style={rowStyle}>
                                <label style={{ ...labelStyle, minWidth: '90px' }}>Đối tượng</label>
                                <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
                                    <div style={{ flex: 1 }}>
                                        <ComboboxSelect
                                            options={subjects}
                                            value={form.subjectId || ''}
                                            onChange={(val) => {
                                                const subject: any = subjects.find(s => s.value === val);
                                                setForm(f => ({
                                                    ...f,
                                                    subjectId: val,
                                                    subjectName: subject?.label || '',
                                                    payerName: subject?.label || f.payerName,
                                                    payerAddress: subject?.address || f.payerAddress
                                                }));
                                            }}
                                            placeholder={loadingSubjects ? "Đang tải..." : "Chọn đối tượng..."}
                                            searchPlaceholder="Tìm đối tượng..."
                                            emptyMessage={form.subjectType ? "Không tìm thấy đối tượng" : "Vui lòng chọn loại đối tượng trước"}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={rowStyle}>
                                <label style={{ ...labelStyle, minWidth: '90px' }}><span style={{ color: 'red' }}>*</span> Người nộp</label>
                                <input value={form.payerName} onChange={e => setForm(f => ({ ...f, payerName: e.target.value }))} style={inputStyle} />
                            </div>

                            <div style={rowStyle}>
                                <label style={{ ...labelStyle, minWidth: '90px' }}>Địa chỉ</label>
                                <input value={form.payerAddress} onChange={e => setForm(f => ({ ...f, payerAddress: e.target.value }))} style={inputStyle} placeholder="Địa chỉ người nộp tiền..." />
                            </div>

                            <div style={rowStyle}>
                                <label style={{ ...labelStyle, minWidth: '90px' }}>Lý do nộp</label>
                                <input
                                    value={form.reason}
                                    onChange={e => {
                                        const newReason = e.target.value;
                                        setForm(f => ({
                                            ...f,
                                            reason: newReason,
                                            details: f.details.map(d => ({ ...d, description: newReason }))
                                        }));
                                    }}
                                    style={inputStyle}
                                    placeholder="Lý do thu tiền..."
                                />
                            </div>

                            <div style={rowStyle}>
                                <label style={{ ...labelStyle, minWidth: '90px', alignSelf: 'flex-start', marginTop: '6px' }}>Kèm theo</label>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            value={form.attachments}
                                            onChange={e => setForm(f => ({ ...f, attachments: e.target.value }))}
                                            style={{ ...inputStyle, maxWidth: '200px' }}
                                            placeholder="0 chứng từ gốc"
                                        />
                                    </div>
                                    <div style={{ padding: '8px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                                        <FileUploader
                                            files={form.attachedFiles}
                                            onChange={(files) => setForm(f => ({ ...f, attachedFiles: files }))}
                                            entityType="VOUCHER"
                                            maxFiles={5}
                                            maxSizeMB={10}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Chứng từ (30%) */}
                        <div style={{
                            padding: '20px 24px',
                            backgroundColor: 'rgba(var(--text-primary-rgb), 0.02)',
                            display: 'flex', flexDirection: 'column', gap: '12px'
                        }}>
                            <h3 style={{
                                fontSize: '11px', fontWeight: 700, color: 'var(--primary)',
                                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Chứng từ
                            </h3>

                            <div style={rowStyle}>
                                <label style={labelStyle}><span style={{ color: 'red' }}>*</span> Số phiếu</label>
                                <input value={form.receiptNumber} onChange={e => setForm(f => ({ ...f, receiptNumber: e.target.value }))} style={{ ...inputStyle, fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', textAlign: 'left' }} />
                            </div>
                            <div style={rowStyle}>
                                <label style={labelStyle}><span style={{ color: 'red' }}>*</span> Ngày chứng từ</label>
                                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, fontSize: '11px', padding: '4px' }} />
                            </div>
                            <div style={rowStyle}>
                                <label style={labelStyle}>Ngày hạch toán</label>
                                <input type="date" value={form.postedDate} onChange={e => setForm(f => ({ ...f, postedDate: e.target.value }))} style={{ ...inputStyle, fontSize: '11px', padding: '4px' }} />
                            </div>
                            <div style={{ ...rowStyle, gap: '8px' }}>
                                <label style={labelStyle}>Loại tiền</label>
                                <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
                                    <select
                                        value={form.currency}
                                        onChange={e => setForm(f => ({ ...f, currency: e.target.value, details: f.details.map(d => ({ ...d, currency: e.target.value })) }))}
                                        style={inputStyle}
                                    >
                                        <option value="VND">VND</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ ...rowStyle, gap: '8px' }}>
                                <label style={labelStyle}>Tỷ giá</label>
                                <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
                                    <input type="number" value={form.exchangeRate} onChange={e => setForm(f => ({ ...f, exchangeRate: Number(e.target.value) || 1 }))} style={{ ...inputStyle, textAlign: 'right' }} min={1} disabled={form.currency === 'VND'} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACCOUNTING GRID AREA */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-hover)' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Hạch toán</h3>
                            <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--primary)', background: 'transparent', border: '1px solid var(--primary-soft)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Thêm dòng
                            </button>
                        </div>

                        {/* HYBRID CORE: DYNAMIC GRID */}
                        <div style={{ flex: 1 }}>
                            <DynamicAccountingGrid
                                data={form.details}
                                columnMetadata={columnMetadata}
                                lookups={{ accounts, subjects }}
                                onDataChange={(newData) => setForm((prev: any) => ({ ...prev, details: newData }))}
                                height={250}
                                darkMode={true}
                                showRowNumbers={true}
                                showDeleteButton={true}
                            />
                        </div>

                        {/* FORM FOOTER */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Cộng:</span>
                                <span style={{ fontSize: '12px', fontStyle: 'italic', fontWeight: 500, color: 'var(--text-secondary)' }}>{amountInWords} đồng</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tổng:</span>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--primary)' }}>
                                    {new Intl.NumberFormat('vi-VN').format(totalAmount)} VND
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Print Options Modal */}
            <PrintOptionsModal
                isOpen={isPrintOptionsOpen}
                onClose={() => setIsPrintOptionsOpen(false)}
                onConfirm={(options: PrintOptions) => {
                    setPrintTemplate(options.template);
                    setIsPrintOptionsOpen(false);

                    import('qrcode').then(QRCode => {
                        const qrText = `ACCHM-PT|${form.receiptNumber}|${form.date}|${totalAmount}`;
                        QRCode.toDataURL(qrText, { width: 120, margin: 0 })
                            .then(url => {
                                setQrCodeDataUrl(url);
                                setTimeout(() => setIsReportOpen(true), 150);
                            })
                            .catch(err => {
                                console.error("Failed to generate QR", err);
                                setTimeout(() => setIsReportOpen(true), 150);
                            });
                    });
                }}
            />

            {/* Report Viewer Modal */}
            {company && (
                <ReportViewer
                    isOpen={isReportOpen}
                    onClose={() => setIsReportOpen(false)}
                    fileName={`Phieu_Thu_${form.receiptNumber}`}
                    document={
                        printTemplate === '2LIEN' ? (
                            <CashReceiptReport2Lien
                                company={company}
                                signatureNames={{
                                    'Giám đốc': company.directorName || '',
                                    'Kế toán trưởng': company.chiefAccountantName || '',
                                    'Người nộp tiền': form.payerName || '',
                                }}
                                qrCodeDataUrl={qrCodeDataUrl}
                                data={{
                                    receiptNumber: form.receiptNumber,
                                    date: new Date(form.date),
                                    payerName: form.payerName,
                                    payerAddress: form.payerAddress,
                                    reason: form.reason,
                                    amount: totalAmount,
                                    amountInWords: amountInWords,
                                    attachments: form.attachments,
                                    details: form.details.map(d => ({
                                        description: d.description,
                                        debitAccount: d.debitAccount,
                                        creditAccount: d.creditAccount,
                                        amount: d.amount || 0
                                    }))
                                }}
                            />
                        ) : (
                            <CashReceiptReport
                                company={company}
                                signatureNames={{
                                    'Giám đốc': company.directorName || '',
                                    'Kế toán trưởng': company.chiefAccountantName || '',
                                    'Người nộp tiền': form.payerName || '',
                                }}
                                qrCodeDataUrl={qrCodeDataUrl}
                                data={{
                                    receiptNumber: form.receiptNumber,
                                    date: new Date(form.date),
                                    payerName: form.payerName,
                                    payerAddress: form.payerAddress,
                                    reason: form.reason,
                                    amount: totalAmount,
                                    amountInWords: amountInWords,
                                    attachments: form.attachments,
                                    details: form.details.map(d => ({
                                        description: d.description,
                                        debitAccount: d.debitAccount,
                                        creditAccount: d.creditAccount,
                                        amount: d.amount || 0
                                    }))
                                }}
                            />
                        )
                    }
                />
            )}
        </div>
    );
}
