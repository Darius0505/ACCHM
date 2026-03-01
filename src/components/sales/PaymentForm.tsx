
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaymentFormProps {
    initialData?: any;
    partners?: any[];
}

interface InvoiceAllocation {
    id: string;
    invoiceNumber: string;
    date: string;
    totalAmount: number;
    balanceAmount: number;
    allocation: number;
    selected: boolean;
}

export default function PaymentForm({ initialData, partners = [] }: PaymentFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedPartnerId = searchParams.get('partnerId');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        partnerId: initialData?.partnerId || preSelectedPartnerId || '',
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        amount: initialData?.amount || 0,
        paymentMethod: initialData?.paymentMethod || 'CASH',
        bankAccountId: initialData?.bankAccountId || '',
        description: initialData?.description || '',
    });

    const [invoices, setInvoices] = useState<InvoiceAllocation[]>([]);
    
    // Bank accounts for selection (hardcoded or fetched)
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);

    useEffect(() => {
        // Fetch bank accounts if method is BANK
        if (formData.paymentMethod === 'BANK') {
            fetch('/api/bank-accounts')
                .then(res => res.json())
                .then(data => setBankAccounts(data.items || [])) // Assumption on API response structure
                .catch(console.error);
        }
    }, [formData.paymentMethod]);

    // Fetch Open Invoices when Partner changes
    useEffect(() => {
        if (!formData.partnerId) {
            setInvoices([]);
            return;
        }

        if (initialData) return; // Don't refetch on View/Edit mode yet, simplistic handling

        setLoading(true);
        // Fetch invoices with status POSTED and paymentStatus != PAID
        // We probably need an API parameter for this specifically.
        // Reusing listSalesInvoices API with status filter? 
        // Or a specific endpoint. Let's try list endpoint with params.
        fetch(`/api/sales-invoices?partnerId=${formData.partnerId}&status=POSTED`)
            .then(res => res.json())
            .then(data => {
                // Filter client side for now if API doesn't support 'UNPAID' filter strictly or returns all
                const openInvoices = (data.items || [])
                    .filter((inv: any) => inv.paymentStatus !== 'PAID' && inv.balanceAmount > 0)
                    .map((inv: any) => ({
                        id: inv.id,
                        invoiceNumber: inv.invoiceNumber,
                        date: inv.date,
                        totalAmount: Number(inv.totalAmount),
                        balanceAmount: Number(inv.balanceAmount),
                        allocation: 0,
                        selected: false
                    }));
                setInvoices(openInvoices);
            })
            .catch(err => console.error('Failed to load invoices', err))
            .finally(() => setLoading(false));

    }, [formData.partnerId, initialData]);

    // Auto-allocate logic
    const handleAmountChange = (val: number) => {
        setFormData({ ...formData, amount: val });
        // Optional: Auto allocate FIFO?
        // Let's implement a simple "Auto Allocate" button instead of doing it on change
    };

    const autoAllocate = () => {
        let remaining = formData.amount;
        const newInvoices = invoices.map(inv => {
            if (remaining <= 0) {
                return { ...inv, allocation: 0, selected: false };
            }
            const alloc = Math.min(remaining, inv.balanceAmount);
            remaining -= alloc;
            return { ...inv, allocation: alloc, selected: alloc > 0 };
        });
        setInvoices(newInvoices);
    };

    const handleAllocationChange = (index: number, val: number) => {
        const newInvoices = [...invoices];
        const invoice = newInvoices[index];
        
        // Cap at balance
        const cappedVal = Math.min(val, invoice.balanceAmount);
        newInvoices[index] = { ...invoice, allocation: cappedVal, selected: cappedVal > 0 };
        setInvoices(newInvoices);

        // Update total amount based on allocations? 
        // Usually, Total Amount drives allocation, or Allocation drives Total.
        // Let's sum up allocations to warn if mismatch.
    };

    const totalAllocated = invoices.reduce((sum, inv) => sum + inv.allocation, 0);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        if (Math.abs(totalAllocated - formData.amount) > 100) { // Tolerance for rounding
             // For now, require match or warn?
             // Ideally, payment amount CAN use unallocated as "Overpayment" / "Deposit in advance".
             // But our backend service validation `totalAllocated <= data.amount` is strict.
             if (totalAllocated > formData.amount) {
                 setError('Tổng phân bổ không được lớn hơn số tiền thu');
                 setSubmitting(false);
                 return;
             }
        }

        try {
            const allocations = invoices
                .filter(inv => inv.allocation > 0)
                .map(inv => ({
                    invoiceId: inv.id,
                    amount: inv.allocation
                }));

            const res = await fetch('/api/customer-payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    allocations
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save payment');
            }

            const saved = await res.json();
            // Redirect to detail or post
            // For simplicity, back to list or detail
            router.push('/customer-payments'); 
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    // Read-only view for Detail page
    if (initialData && !partners.length) { // Heuristic check if it is detail view
         // Can implement read only render here
         return <div>Loading...</div>; // TODO or handle separate Detail component
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header / Main Info */}
            <div className="bg-white p-6 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Thông Tin Thanh Toán</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">Khách Hàng *</label>
                         <select
                            value={formData.partnerId}
                            onChange={e => setFormData({ ...formData, partnerId: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                            disabled={!!initialData}
                        >
                            <option value="">-- Chọn Khách Hàng --</option>
                            {partners.map(p => (
                                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Phương thức</label>
                            <select
                                value={formData.paymentMethod}
                                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="w-full border p-2 rounded"
                            >
                                <option value="CASH">Tiền mặt</option>
                                <option value="BANK">Chuyển khoản</option>
                            </select>
                        </div>
                        {formData.paymentMethod === 'BANK' && (
                             <div>
                                <label className="block text-sm font-medium mb-1">Tài khoản Ngân hàng</label>
                                <select
                                    value={formData.bankAccountId}
                                    onChange={e => setFormData({ ...formData, bankAccountId: e.target.value })}
                                    className="w-full border p-2 rounded"
                                    required
                                >
                                    <option value="">-- Chọn TK --</option>
                                    {bankAccounts.map(b => (
                                        <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber}</option>
                                    ))}
                                </select>
                             </div>
                        )}
                    </div>

                    <div>
                         <label className="block text-sm font-medium mb-1">Diễn giải</label>
                         <input
                            type="text"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Giá Trị</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium mb-1">Ngày Chứng Từ *</label>
                             <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1">Số Tiền Thu *</label>
                             <input
                                type="number"
                                value={formData.amount}
                                onChange={e => handleAmountChange(Number(e.target.value))}
                                className="w-full border p-2 rounded font-bold text-right"
                                required
                            />
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={autoAllocate}
                        className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 font-medium border"
                    >
                        ⚡ Tự động phân bổ (FIFO)
                    </button>
                    
                     <div className="flex justify-between items-center bg-blue-50 p-3 rounded text-sm">
                        <span>Đã phân bổ:</span>
                        <span className={`font-bold ${totalAllocated > formData.amount ? 'text-red-600' : 'text-blue-700'}`}>
                            {totalAllocated.toLocaleString('vi-VN')}
                        </span>
                    </div>
                </div>
            </div>

            {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}

            {/* Invoice Allocation Grid */}
            <div className="bg-white p-6 rounded shadow overflow-x-auto">
                 <h3 className="font-semibold text-gray-700 mb-4">Danh Sách Hóa Đơn Còn Nợ</h3>
                 {loading ? (
                     <div className="text-center py-4 text-gray-500">Đang tải hóa đơn...</div>
                 ) : invoices.length === 0 ? (
                     <div className="text-center py-4 text-gray-500">Khách hàng không có hóa đơn nợ.</div>
                 ) : (
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-2 text-left">Số HĐ</th>
                                <th className="p-2 text-left">Ngày</th>
                                <th className="p-2 text-right">Tổng Tiền</th>
                                <th className="p-2 text-right">Còn Nợ</th>
                                <th className="p-2 text-right w-40">Phân Bổ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv, idx) => (
                                <tr key={inv.id} className={`border-b ${inv.allocation > 0 ? 'bg-blue-50' : ''}`}>
                                    <td className="p-2">{inv.invoiceNumber}</td>
                                    <td className="p-2">{new Date(inv.date).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-2 text-right">{inv.totalAmount.toLocaleString('vi-VN')}</td>
                                    <td className="p-2 text-right font-medium">{inv.balanceAmount.toLocaleString('vi-VN')}</td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            value={inv.allocation}
                                            onChange={e => handleAllocationChange(idx, Number(e.target.value))}
                                            className="w-full border p-1 rounded text-right"
                                            min="0"
                                            max={inv.balanceAmount}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {submitting ? 'Đang lưu...' : 'Lưu Chứng Từ'}
                </button>
            </div>
        </form>
    );    
}
