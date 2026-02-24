'use client';

/**
 * Cash Payment Form (Phiếu Chi)
 * Design: Standard Accounting Voucher (Mẫu số 02-TT)
 * Based on Thông tư 200/2014/TT-BTC
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import AccountSelect from '@/components/journal/AccountSelect';
import { numberToWordsVND } from '@/lib/numberToWords';
import { format } from 'date-fns';

interface CashPaymentFormProps {
    initialData?: any;
    mode: 'create' | 'edit' | 'view';
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function CashPaymentForm({ initialData, mode, onSuccess, onCancel }: CashPaymentFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Print Ref
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Phieu_Chi_${initialData?.paymentNumber || 'Draft'}`,
    });

    // Form State
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [partnerId, setPartnerId] = useState(initialData?.partnerId || '');
    const [reason, setReason] = useState(initialData?.description || '');
    const [amount, setAmount] = useState(initialData?.amount || 0);
    const [debitAccountId, setDebitAccountId] = useState(initialData?.debitAccountId || '');
    const [creditAccountId, setCreditAccountId] = useState(initialData?.creditAccountId || '111');
    const [attachmentDocs, setAttachmentDocs] = useState(0);

    // Payee Info
    const [payeeName, setPayeeName] = useState(initialData?.partner?.name || '');
    const [address, setAddress] = useState(initialData?.partner?.address || '');

    // Derived State
    const isReadOnly = mode === 'view';
    const amountInWords = numberToWordsVND(amount);

    // Auto-fill Payee Name/Address if partnerId changes
    useEffect(() => {
        if (partnerId && !initialData) {
            // TODO: Fetch partner details
        }
    }, [partnerId]);

    // Handle Submit
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = mode === 'create'
                ? '/api/cash-payments'
                : `/api/cash-payments/${initialData.id}`;

            const method = mode === 'create' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: 'DEFAULT_COMPANY_ID',
                    date,
                    partnerId: partnerId || null,
                    amount: Number(amount),
                    description: reason,
                    debitAccountId,
                    creditAccountId
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save payment');
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/cash-payments');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handlePost() {
        if (!initialData?.id) return;
        if (!confirm('Ghi sổ phiếu chi này? Hành động này sẽ tạo bút toán và không thể sửa đổi.')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/cash-payments/${initialData.id}/post`, {
                method: 'POST'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to post payment');
            }

            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Toolbar */}
            <div className="flex justify-between items-center print:hidden">
                <button
                    onClick={onCancel || (() => router.back())}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                    ← Quay lại
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        type="button"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        In phiếu
                    </button>
                    {!isReadOnly && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Đang lưu...' : (mode === 'create' ? 'Lưu Phiếu' : 'Cập nhật')}
                        </button>
                    )}
                    {mode === 'edit' && initialData?.status === 'DRAFT' && (
                        <button
                            onClick={handlePost}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            Ghi sổ
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200 print:hidden">
                    {error}
                </div>
            )}

            {/* VOUCHER PAPER */}
            <div ref={printRef} className="bg-white p-8 md:p-12 shadow-md border print:shadow-none print:border-none relative min-h-[800px]">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div className="text-sm">
                        <p className="font-bold uppercase text-gray-800">Đơn vị: CÔNG TY CỔ PHẦN ACCHM</p>
                        <p className="text-gray-500">Mã số thuế: 0312345678</p>
                        <p className="text-gray-500">Địa chỉ: 123 Nguyễn Huệ, TP.HCM</p>
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold uppercase text-red-600 tracking-wide mb-1">PHIẾU CHI</h1>
                        <p className="text-sm text-gray-500 italic">
                            Ngày {format(new Date(date), 'dd')} tháng {format(new Date(date), 'MM')} năm {format(new Date(date), 'yyyy')}
                        </p>
                        {initialData?.paymentNumber && (
                            <p className="text-sm font-mono mt-2 text-red-600 font-bold">Số: {initialData.paymentNumber}</p>
                        )}
                    </div>
                    <div className="text-sm text-right">
                        <p className="font-bold">Mẫu số 02-TT</p>
                        <p className="italic text-xs text-gray-400">(Ban hành theo TT 200/2014/TT-BTC)</p>
                        <div className="mt-4 text-xs">
                            Quyển số: ......... <br />
                            Nợ: <span className="font-mono font-bold">{debitAccountId || '.......'}</span> <br />
                            Có: <span className="font-mono font-bold">{creditAccountId}</span>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="space-y-6 px-4">

                    {/* Row 1: Payee */}
                    <div className="flex items-baseline gap-4">
                        <label className="w-40 text-gray-600 shrink-0">Họ tên người nhận tiền:</label>
                        <div className="grow border-b border-dotted border-gray-400">
                            <input
                                type="text"
                                value={payeeName}
                                onChange={e => setPayeeName(e.target.value)}
                                placeholder="Nhập tên người nhận..."
                                disabled={isReadOnly}
                                className="w-full bg-transparent focus:outline-none placeholder-gray-300 font-medium text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Row 2: Address */}
                    <div className="flex items-baseline gap-4">
                        <label className="w-40 text-gray-600 shrink-0">Địa chỉ:</label>
                        <div className="grow border-b border-dotted border-gray-400">
                            <input
                                type="text"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Địa chỉ..."
                                disabled={isReadOnly}
                                className="w-full bg-transparent focus:outline-none placeholder-gray-300 text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Row 3: Reason */}
                    <div className="flex items-baseline gap-4">
                        <label className="w-40 text-gray-600 shrink-0"><span className="text-red-500">*</span> Lý do chi:</label>
                        <div className="grow border-b border-dotted border-gray-400">
                            <input
                                type="text"
                                required
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Nhập lý do chi tiền..."
                                disabled={isReadOnly}
                                className="w-full bg-transparent focus:outline-none placeholder-gray-300 text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Row 4: Amount */}
                    <div className="flex items-baseline gap-4">
                        <label className="w-40 text-gray-600 shrink-0"><span className="text-red-500">*</span> Số tiền:</label>
                        <div className="grow border-b border-dotted border-gray-400 font-bold text-lg flex justify-between items-center group relative">
                            <input
                                type="number"
                                required
                                min="0"
                                value={amount === 0 ? '' : amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                disabled={isReadOnly}
                                className="w-full bg-transparent focus:outline-none text-red-600"
                            />
                            <span className="absolute right-0 top-0 text-sm font-normal text-gray-500 italic pointer-events-none group-focus-within:hidden">VND</span>
                        </div>
                    </div>

                    {/* Row 5: Amount in Words */}
                    <div className="flex items-baseline gap-4">
                        <label className="w-40 text-gray-600 shrink-0">Bằng chữ:</label>
                        <div className="grow border-b border-dotted border-gray-400 py-1">
                            <span className="italic text-gray-700 font-medium">
                                {amountInWords}
                            </span>
                        </div>
                    </div>

                    {/* Row 6: Attachments */}
                    <div className="flex items-baseline gap-4">
                        <label className="w-40 text-gray-600 shrink-0">Kèm theo:</label>
                        <div className="grow flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                value={attachmentDocs}
                                onChange={e => setAttachmentDocs(Number(e.target.value))}
                                disabled={isReadOnly}
                                className="w-16 border-b border-dotted border-gray-400 text-center bg-transparent focus:outline-none"
                            />
                            <span className="text-gray-600">chứng từ gốc.</span>
                        </div>
                    </div>

                    {/* Accounts Selection (Only visible in Edit Mode) */}
                    <div className="mt-8 pt-4 border-t border-gray-100 print:hidden bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs font-bold uppercase text-gray-500 mb-3">Hạch toán kế toán</p>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1"><span className="text-red-500">*</span> Tài khoản Nợ (Chi phí / Trả nợ)</label>
                                {isReadOnly ? (
                                    <div className="font-mono font-bold text-gray-800">{debitAccountId}</div>
                                ) : (
                                    <AccountSelect
                                        value={debitAccountId}
                                        onChange={setDebitAccountId}
                                        error={!debitAccountId}
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1"><span className="text-red-500">*</span> Tài khoản Có (Tiền mặt)</label>
                                {isReadOnly ? (
                                    <div className="font-mono font-bold text-gray-800">{creditAccountId}</div>
                                ) : (
                                    <AccountSelect
                                        value={creditAccountId}
                                        onChange={setCreditAccountId}
                                        error={!creditAccountId}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Signatures */}
                <div className="mt-12 grid grid-cols-5 gap-4 text-center">
                    <div className="col-span-1">
                        <p className="font-bold text-xs uppercase">Giám đốc</p>
                        <p className="text-[10px] italic text-gray-400 mb-12">(Ký, họ tên, đóng dấu)</p>
                    </div>
                    <div className="col-span-1">
                        <p className="font-bold text-xs uppercase">Kế toán trưởng</p>
                        <p className="text-[10px] italic text-gray-400 mb-12">(Ký, họ tên)</p>
                    </div>
                    <div className="col-span-1">
                        <p className="font-bold text-xs uppercase">Thủ quỹ</p>
                        <p className="text-[10px] italic text-gray-400 mb-12">(Ký, họ tên)</p>
                    </div>
                    <div className="col-span-1">
                        <p className="font-bold text-xs uppercase">Người nhận tiền</p>
                        <p className="text-[10px] italic text-gray-400 mb-12">(Ký, họ tên)</p>
                    </div>
                    <div className="col-span-1">
                        <p className="font-bold text-xs uppercase">Người lập phiếu</p>
                        <p className="text-[10px] italic text-gray-400 mb-12">(Ký, họ tên)</p>
                        <p className="text-sm font-medium">{initialData?.createdBy || 'Admin'}</p>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-400 italic">
                    (Đã chi đủ số tiền: {amountInWords})
                </div>

            </div>
        </div>
    );
}
