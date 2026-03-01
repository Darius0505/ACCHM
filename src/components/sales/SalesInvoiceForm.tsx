
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SalesInvoiceFormProps {
    initialData?: any;
    isEdit?: boolean;
    partners?: any[]; // Passed from server or loaded dynamically
}

interface InvoiceLine {
    description: string;
    accountId: string; // Revenue Account ID
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

export default function SalesInvoiceForm({ initialData, isEdit, partners = [] }: SalesInvoiceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Revenue Accounts (511) - Ideally fetched or filtered from accounts
    // For now, let's assume we fetch them or hardcode common ones if not provided
    const [revenueAccounts, setRevenueAccounts] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        partnerId: initialData?.partnerId || '',
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        description: initialData?.description || '',
    });

    const [lines, setLines] = useState<InvoiceLine[]>(initialData?.lines?.map((l: any) => ({
        description: l.description,
        accountId: l.accountId,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        taxRate: Number(l.taxRate)
    })) || [
            { description: '', accountId: '', quantity: 1, unitPrice: 0, taxRate: 10 }
        ]);

    // Fetch Revenue Accounts on mount
    useEffect(() => {
        // Fetch accounts starting with 511
        fetch('/api/accounts?code=511')
            .then(res => res.json())
            .then(data => setRevenueAccounts(data.items || []))
            .catch(err => console.error('Failed to load revenue accounts', err));

        // If partner list is empty (not passed), we might want to fetch it here too or assume passed.
        // For simplicity, we'll assume partners are passed OR we will fetch broadly if list is empty?
    }, []);

    // Helper to calculate totals
    const calculateTotals = () => {
        let subtotal = 0;
        let taxAmount = 0;
        lines.forEach(line => {
            const amount = line.quantity * line.unitPrice;
            subtotal += amount;
            taxAmount += amount * (line.taxRate / 100);
        });
        return { subtotal, taxAmount, total: subtotal + taxAmount };
    };

    const totals = calculateTotals();

    const handleLineChange = (index: number, field: keyof InvoiceLine, value: any) => {
        const newLines = [...lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setLines(newLines);
    };

    const addLine = () => {
        setLines([...lines, { description: '', accountId: revenueAccounts[0]?.id || '', quantity: 1, unitPrice: 0, taxRate: 10 }]);
    };

    const removeLine = (index: number) => {
        if (lines.length > 1) {
            setLines(lines.filter((_, i) => i !== index));
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.partnerId) {
            setError('Vui lòng chọn khách hàng');
            setLoading(false);
            return;
        }

        if (lines.some(l => !l.description || !l.accountId)) {
            setError('Vui lòng điền đầy đủ thông tin dòng chi tiết');
            setLoading(false);
            return;
        }

        try {
            const url = isEdit
                ? `/api/sales-invoices/${initialData.id}`
                : '/api/sales-invoices';

            const method = isEdit ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                lines
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save invoice');
            }

            const saved = await res.json();
            router.push(`/sales-invoices/${saved.id}`); // Redirect to view
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Thông Tin Chung</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1">Khách Hàng *</label>
                        <select
                            value={formData.partnerId}
                            onChange={e => setFormData({ ...formData, partnerId: e.target.value })}
                            className="w-full border p-2 rounded"
                            required
                        >
                            <option value="">-- Chọn Khách Hàng --</option>
                            {partners.map(p => (
                                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Diễn giải chung</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Thời Gian</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Ngày Hóa Đơn *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Hạn Thanh Toán *</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full border p-2 rounded"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}

            <div className="bg-white p-6 rounded shadow overflow-x-auto">
                <h3 className="font-semibold text-gray-700 mb-4">Chi Tiết Hàng Hóa / Dịch Vụ</h3>
                <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-2 w-10">#</th>
                            <th className="text-left p-2">Diễn giải</th>
                            <th className="text-left p-2 w-48">TK Doanh Thu</th>
                            <th className="text-right p-2 w-24">SL</th>
                            <th className="text-right p-2 w-32">Đơn Giá</th>
                            <th className="text-right p-2 w-24">Thuế %</th>
                            <th className="text-right p-2 w-32">Thành Tiền</th>
                            <th className="p-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map((line, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-2 text-center">{index + 1}</td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={line.description}
                                        onChange={e => handleLineChange(index, 'description', e.target.value)}
                                        className="w-full border p-1 rounded"
                                        placeholder="Tên sản phẩm/dịch vụ"
                                    />
                                </td>
                                <td className="p-2">
                                    <select
                                        value={line.accountId}
                                        onChange={e => handleLineChange(index, 'accountId', e.target.value)}
                                        className="w-full border p-1 rounded"
                                    >
                                        <option value="">-- Chọn TK --</option>
                                        {revenueAccounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={line.quantity}
                                        onChange={e => handleLineChange(index, 'quantity', Number(e.target.value))}
                                        className="w-full border p-1 rounded text-right"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        min="0"
                                        value={line.unitPrice}
                                        onChange={e => handleLineChange(index, 'unitPrice', Number(e.target.value))}
                                        className="w-full border p-1 rounded text-right"
                                    />
                                </td>
                                <td className="p-2">
                                    <select
                                        value={line.taxRate}
                                        onChange={e => handleLineChange(index, 'taxRate', Number(e.target.value))}
                                        className="w-full border p-1 rounded text-right"
                                    >
                                        <option value="0">0%</option>
                                        <option value="5">5%</option>
                                        <option value="8">8%</option>
                                        <option value="10">10%</option>
                                    </select>
                                </td>
                                <td className="p-2 text-right font-medium">
                                    {(line.quantity * line.unitPrice).toLocaleString('vi-VN')}
                                </td>
                                <td className="p-2">
                                    <button
                                        type="button"
                                        onClick={() => removeLine(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        &times;
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    type="button"
                    onClick={addLine}
                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                    + Thêm dòng
                </button>
            </div>

            <div className="flex justify-end pr-6">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Cộng tiền hàng:</span>
                        <span className="font-medium">{totals.subtotal.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Tiền thuế:</span>
                        <span className="font-medium">{totals.taxAmount.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2 text-lg font-bold">
                        <span>TỔNG CỘNG:</span>
                        <span className="text-blue-600">{totals.total.toLocaleString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                    type="button"
                    onClick={() => router.push('/sales-invoices')}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                    {loading ? 'Đang lưu...' : (isEdit ? 'Cập Nhật' : 'Lưu Nháp')}
                </button>
            </div>
        </form>
    );
}
