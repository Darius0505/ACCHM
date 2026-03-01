'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { numberToWordsVND } from '@/lib/numberToWords';
import { ComboboxSelect, ComboboxOption } from '@/components/ui/ComboboxSelect';
import { DatePicker } from '@/components/ui/DatePicker';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useToast } from "@/components/ui/use-toast";
import { FileUploader, UploadedFile } from '@/components/ui/FileUploader';
import { PrintOptionsModal, PrintOptions } from '@/components/reports/PrintOptionsModal';
// Import reports if available, or placeholder

import SystemVoucherToolbar from '@/components/core/SystemVoucherToolbar';
import DynamicAccountingGrid from '@/components/core/DynamicAccountingGrid';
import { useVoucherCore } from '@/components/core/useVoucherCore';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export interface BankTransactionDetail {
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
    transactionNumber: string;
    date: string;
    postedDate: string;
    currency: string;
    exchangeRate: number;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    bankAccountId: string;

    // General Info
    partnerName: string;
    partnerAddress: string;
    subjectType: string;
    subjectId: string;
    subjectName: string;
    reason: string;
    attachments: string;
    attachedFiles: UploadedFile[];

    details: BankTransactionDetail[];
    status: 'POSTED' | 'DRAFT';
}

const defaultDetail: BankTransactionDetail = {
    id: 'temp-1',
    description: '',
    currency: 'VND',
    debitAccount: '',
    creditAccount: '',
    amount: 0,
    objectId: '',
    objectName: ''
};

const emptyForm: FormData = {
    transactionNumber: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    postedDate: format(new Date(), 'yyyy-MM-dd'),
    currency: 'VND',
    exchangeRate: 1,
    type: 'DEPOSIT',
    bankAccountId: '',
    partnerName: '',
    partnerAddress: '',
    subjectType: 'CUSTOMER',
    subjectId: '',
    subjectName: '',
    reason: '',
    attachments: '',
    attachedFiles: [],
    details: [{ ...defaultDetail, debitAccount: '1121', creditAccount: '131' }],
    status: 'POSTED'
};

interface BankTransactionFormProps {
    id?: string | null;
    onSuccess?: (action?: 'save' | 'delete', data?: any) => void;
    onCancel?: () => void;
}

export default function BankTransactionForm({ id, onSuccess, onCancel }: BankTransactionFormProps) {
    const { toast } = useToast();
    const { company } = useCompanyInfo();
    const isNewMode = !id;

    // Report States
    const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);

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

    const [bankAccounts, setBankAccounts] = useState<ComboboxOption[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [accRes, bankRes] = await Promise.all([
                    fetch('/api/accounts'),
                    fetch('/api/bank-accounts')
                ]);

                if (accRes.ok) {
                    const data = await accRes.json();
                    setAccounts(data.map((a: any) => ({ code: a.code, name: a.name, isPosting: a.isPosting })));
                }

                if (bankRes.ok) {
                    const data = await bankRes.json();
                    const banks = data.items || [];
                    setBankAccounts(banks.map((b: any) => ({
                        value: b.id,
                        label: `${b.bankName} - ${b.accountNumber}`,
                        description: b.currency
                    })));
                }
            } catch (error) {
                console.error('Failed to fetch metadata:', error);
            }
        };
        fetchMetadata();
    }, []);

    const fetchNextNumber = useCallback(async (type: 'DEPOSIT' | 'WITHDRAWAL') => {
        try {
            // Usually we'd hit /api/bank-transactions/next-number?type=${type}
            // For now, fallback to client generation or simple generic endpoint
            const journalCode = type === 'DEPOSIT' ? 'BR' : 'BP';
            // Placeholder: Replace with actual endpoint if exists
            return `${journalCode}-${Date.now().toString().slice(-6)}`;
        } catch (error) {
            console.error('Failed to generate number', error);
            return null;
        }
    }, []);

    const fetchVoucherApi = useCallback(async (txId: string) => {
        const res = await fetch(`/api/bank-transactions/${txId}`);
        if (!res.ok) throw new Error('Failed to fetch transaction');
        const full = await res.json();

        const dateStr = full.date ? new Date(full.date).toISOString().split('T')[0] : '';
        const postedDateStr = full.postedDate ? new Date(full.postedDate).toISOString().split('T')[0] : dateStr;

        return {
            id: full.id,
            transactionNumber: full.transactionNumber,
            date: dateStr,
            postedDate: postedDateStr,
            partnerName: full.partner?.name || '',
            partnerAddress: full.partner?.address || '',
            subjectType: full.partner?.type || 'CUSTOMER',
            subjectId: full.partnerId || '',
            subjectName: full.partner?.name || '',
            reason: full.description || '',
            currency: full.currency || 'VND', // Bank currency is usually implied by bank account, but keeping standard
            exchangeRate: full.exchangeRate || 1,
            type: full.type as 'DEPOSIT' | 'WITHDRAWAL',
            bankAccountId: full.bankAccountId || '',
            attachments: full.attachments || '',
            attachedFiles: full.attachedFiles || [],
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
                    debitAccount: full.debitAccountId || '',
                    creditAccount: full.creditAccountId || ''
                }],
            status: full.status as 'POSTED' | 'DRAFT'
        };
    }, []);

    const executeApi = useCallback(async ({ journalCode, action, data }: { journalCode: string, action: string, data: any }) => {
        // journalCode might be passed from hook, but we MUST override it with exact type code
        const actualJournalCode = data.type === 'DEPOSIT' ? 'BR' : 'BP';

        if (action === 'DELETE') {
            if (!id) return;
            const res = await fetch(`/api/vouchers/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ journalCode: actualJournalCode, action, data: { id } })
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

            // For Bank transactions, one side is the Bank Account.
            const payload = {
                id: data.id,
                date: data.date,
                transactionNumber: data.transactionNumber,
                type: data.type,
                bankAccountId: data.bankAccountId,
                partnerId: data.subjectId || undefined,
                amount: totalAmount,
                description: data.reason || data.details[0]?.description || '',
                debitAccountId: data.details[0]?.debitAccount || '',
                creditAccountId: data.details[0]?.creditAccount || '',
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
                body: JSON.stringify({ journalCode: actualJournalCode, action, data: payload })
            });

            if (!res.ok) {
                const err = await res.json();
                if (isNewMode && err.error?.includes('Unique constraint failed')) {
                    throw new Error(`Số chứng từ ${data.transactionNumber} đã tồn tại. Vui lòng thử lại.`);
                }
                throw new Error(err.error || 'Lưu thất bại');
            }

            const responseInfo = await res.json();
            if (onSuccess) onSuccess('save', responseInfo);
            return responseInfo;
        }

        if (action === 'COPY') {
            return true;
        }
    }, [id, onSuccess, isNewMode]);

    const {
        form, setForm, loading, saving, deleting, columnMetadata,
        loadVoucher, executeAction, resetForm, isPosted
    } = useVoucherCore<FormData>({
        journalCode: 'BR', // Using BR as default to load columns initially if needed, but we override it
        emptyForm,
        fetchVoucherApi,
        executeApi,
    });

    const totalAmount = form.details.reduce((sum, d) => sum + (d.amount || 0), 0);
    const amountInWords = numberToWordsVND(totalAmount);

    useEffect(() => {
        if (isNewMode) {
            resetForm();
            fetchNextNumber(emptyForm.type).then(num => {
                if (num) setForm(f => ({ ...f, transactionNumber: num }));
            });
        } else if (id) {
            loadVoucher(id);
        }
    }, [id, isNewMode, loadVoucher, resetForm, fetchNextNumber, setForm]);

    // Handle Type Change for New Mode
    const handleTypeChange = (newType: 'DEPOSIT' | 'WITHDRAWAL') => {
        if (!isNewMode) return; // Disallow changing type for existing vouchers

        setForm(f => ({
            ...f,
            type: newType,
            details: f.details.map(d => ({
                ...d,
                debitAccount: newType === 'DEPOSIT' ? '1121' : '331',
                creditAccount: newType === 'DEPOSIT' ? '131' : '1121'
            }))
        }));

        fetchNextNumber(newType).then(num => {
            if (num) setForm(f => ({ ...f, transactionNumber: num }));
        });
    };

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

    const handleSaveWrapper = () => {
        if (!form.bankAccountId) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng chọn Tài khoản Ngân hàng", variant: "destructive" });
            return;
        }
        if (totalAmount <= 0) {
            toast({ title: "Thiếu thông tin", description: "Tổng số tiền phải lớn hơn 0.", variant: "destructive" });
            return;
        }
        executeAction('SAVE');
    };

    const handleDeleteWrapper = () => {
        const msg = isPosted
            ? `Chứng từ ${form.transactionNumber} đã ghi sổ.\n\nBạn có muốn XOÁ chứng từ này không?`
            : `Bạn có chắc muốn xoá ${form.transactionNumber}?`;
        if (confirm(msg)) {
            executeAction('DELETE');
        }
    };

    const handleCopyWrapper = () => {
        setForm(prev => ({
            ...prev,
            id: undefined,
            transactionNumber: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            postedDate: format(new Date(), 'yyyy-MM-dd'),
            status: 'POSTED',
            attachments: '',
            attachedFiles: [],
            details: prev.details.map(d => ({ ...d, id: crypto.randomUUID() }))
        }));
        fetchNextNumber(form.type).then(num => {
            if (num) setForm(f => ({ ...f, transactionNumber: num }));
        });
        toast({ title: "Đã nhân bản", description: "Vui lòng kiểm tra và lưu lại." });
    };

    const addRow = () => {
        setForm(prev => ({
            ...prev,
            details: [...prev.details, {
                ...defaultDetail,
                id: crypto.randomUUID(),
                description: prev.reason,
                objectName: prev.subjectName,
                debitAccount: prev.type === 'DEPOSIT' ? '1121' : '331',
                creditAccount: prev.type === 'DEPOSIT' ? '131' : '1121'
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

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

    const isDeposit = form.type === 'DEPOSIT';
    const uiTitle = isDeposit ? 'BÁO CÓ (THU TIỀN)' : 'BÁO NỢ (CHI TIỀN)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}>

            <SystemVoucherToolbar
                title={uiTitle}
                subtitle="Bank Transaction"
                status={form.status}
                onNew={() => {
                    resetForm();
                    fetchNextNumber(emptyForm.type).then(num => {
                        if (num) setForm(f => ({ ...f, transactionNumber: num }));
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

            <main style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: 'var(--background)' }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto', backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column', minHeight: '600px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>

                    {/* HEADER 70/30 GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '0', borderBottom: '1px solid var(--border)' }}>

                        {/* LEFT COLUMN */}
                        <div style={{ padding: '20px 24px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Thông tin chung
                            </h3>

                            <div style={rowStyle}>
                                <label style={labelStyle}>Loại giao dịch</label>
                                <div style={{ display: 'flex', gap: '1px', backgroundColor: 'var(--border)', padding: '1px', borderRadius: '4px' }}>
                                    <button
                                        type="button"
                                        disabled={!isNewMode}
                                        onClick={() => handleTypeChange('DEPOSIT')}
                                        style={{
                                            padding: '4px 12px', borderRadius: '3px', fontSize: '12px', fontWeight: 500, cursor: isNewMode ? 'pointer' : 'default', border: 'none',
                                            backgroundColor: form.type === 'DEPOSIT' ? 'var(--surface)' : 'transparent',
                                            color: form.type === 'DEPOSIT' ? 'var(--success)' : 'var(--text-muted)',
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        <ArrowDownCircle size={12} /> Báo Có (Thu)
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!isNewMode}
                                        onClick={() => handleTypeChange('WITHDRAWAL')}
                                        style={{
                                            padding: '4px 12px', borderRadius: '3px', fontSize: '12px', fontWeight: 500, cursor: isNewMode ? 'pointer' : 'default', border: 'none',
                                            backgroundColor: form.type === 'WITHDRAWAL' ? 'var(--surface)' : 'transparent',
                                            color: form.type === 'WITHDRAWAL' ? 'var(--danger)' : 'var(--text-muted)',
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        <ArrowUpCircle size={12} /> Báo Nợ (Chi)
                                    </button>
                                </div>
                            </div>

                            <div style={rowStyle}>
                                <label style={labelStyle}>Tài khoản NH</label>
                                <ComboboxSelect
                                    options={bankAccounts}
                                    value={form.bankAccountId}
                                    onChange={(val) => setForm(f => ({ ...f, bankAccountId: val }))}
                                    placeholder="Chọn tài khoản ngân hàng..."
                                />
                            </div>

                            <div style={rowStyle}>
                                <label style={labelStyle}>Loại đối tượng</label>
                                <ComboboxSelect options={subjectTypes} value={form.subjectType} onChange={(val) => setForm(f => ({ ...f, subjectType: val, subjectId: '', subjectName: '', partnerName: '' }))} placeholder="Chọn loại..." />
                            </div>

                            <div style={rowStyle}>
                                <label style={labelStyle}>Đối tượng</label>
                                <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
                                    <ComboboxSelect
                                        options={subjects}
                                        value={form.subjectId || ''}
                                        onChange={(val) => {
                                            const subject: any = subjects.find(s => s.value === val);
                                            setForm(f => ({ ...f, subjectId: val, subjectName: subject?.label || '', partnerName: subject?.label || f.partnerName, partnerAddress: subject?.address || f.partnerAddress }));
                                        }}
                                        placeholder={loadingSubjects ? "Đang tải..." : "Chọn đối tượng..."}
                                    />
                                </div>
                            </div>

                            <div style={rowStyle}>
                                <label style={labelStyle}>{isDeposit ? 'Người nộp' : 'Người nhận'}</label>
                                <input value={form.partnerName} onChange={e => setForm(f => ({ ...f, partnerName: e.target.value }))} style={inputStyle} />
                            </div>

                            <div style={rowStyle}>
                                <label style={labelStyle}>Địa chỉ</label>
                                <input value={form.partnerAddress} onChange={e => setForm(f => ({ ...f, partnerAddress: e.target.value }))} style={inputStyle} />
                            </div>

                            <div style={rowStyle}>
                                <label style={labelStyle}>Lý do</label>
                                <input
                                    value={form.reason}
                                    onChange={e => {
                                        const newReason = e.target.value;
                                        setForm(f => ({ ...f, reason: newReason, details: f.details.map(d => ({ ...d, description: newReason })) }));
                                    }}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={rowStyle}>
                                <label style={{ ...labelStyle, alignSelf: 'flex-start', marginTop: '6px' }}>Chứng từ gốc</label>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <input value={form.attachments} onChange={e => setForm(f => ({ ...f, attachments: e.target.value }))} style={{ ...inputStyle, maxWidth: '200px' }} placeholder="VD: 02 Hóa đơn" />
                                    <div style={{ padding: '8px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                                        <FileUploader files={form.attachedFiles} onChange={(files) => setForm(f => ({ ...f, attachedFiles: files }))} entityType="VOUCHER" maxFiles={5} maxSizeMB={10} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div style={{ padding: '20px 24px', backgroundColor: 'rgba(var(--text-primary-rgb), 0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Chứng từ
                            </h3>

                            <div style={rowStyle}>
                                <label style={labelStyle}><span style={{ color: 'red' }}>*</span> Số chứng từ</label>
                                <input value={form.transactionNumber} onChange={e => setForm(f => ({ ...f, transactionNumber: e.target.value }))} style={{ ...inputStyle, fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', textAlign: 'left' }} />
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
                                    <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} style={inputStyle}>
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

                    {/* ACCOUNTING GRID */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-hover)' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Hạch toán</h3>
                            <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--primary)', background: 'transparent', border: '1px solid var(--primary-soft)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                Thêm dòng
                            </button>
                        </div>
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

            <PrintOptionsModal
                isOpen={isPrintOptionsOpen}
                onClose={() => setIsPrintOptionsOpen(false)}
                onConfirm={(ops) => {
                    setIsPrintOptionsOpen(false);
                    alert("Printing not implemented yet for Bank Transaction.");
                }}
            />
        </div>
    );
}
