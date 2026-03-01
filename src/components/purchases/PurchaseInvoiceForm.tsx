'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PurchaseInvoiceFormProps {
    initialData?: any;
    isEdit?: boolean;
    vendors?: any[];
}

interface InvoiceLine {
    description: string;
    accountId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

export default function PurchaseInvoiceForm({ initialData, isEdit, vendors = [] }: PurchaseInvoiceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expenseAccounts, setExpenseAccounts] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        partnerId: initialData?.partnerId || '',
        vendorInvoiceNumber: initialData?.vendorInvoiceNumber || '',
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        description: initialData?.description || '',
    });

    const [lines, setLines] = useState<InvoiceLine[]>(initialData?.lines || [
        { description: '', accountId: '', quantity: 1, unitPrice: 0, taxRate: 10 }
    ]);

    useEffect(() => {
        // Fetch expense/asset accounts (152, 153, 642, etc.)
        fetch('/api/accounts?code=1')
            .then(res => res.json())
            .then(data => setExpenseAccounts(data.items?.filter((a: any) => a.code.startsWith('15') || a.code.startsWith('64')) || []))
            .catch(console.error);
    }, []);

    const calculateTotals = () => {
        let subtotal = 0, taxAmount = 0;
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

    const addLine = () => setLines([...lines, { description: '', accountId: '', quantity: 1, unitPrice: 0, taxRate: 10 }]);
    const removeLine = (index: number) => lines.length > 1 && setLines(lines.filter((_, i) => i !== index));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/purchase-invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, lines })
            });

            if (!res.ok) throw new Error((await res.json()).error);

            const saved = await res.json();
            router.push(`/purchase-invoices/${saved.id}`);
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
                    <div>
                        <label className="block text-sm font-medium mb-1">Nhà Cung Cấp *</label>
                        <select value={formData.partnerId} onChange={e => setFormData({ ...formData, partnerId: e.target.value })}
                            className="w-full border p-2 rounded" required>
                            <option value="">-- Chọn NCC --</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.code} - {v.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Số HĐ NCC</label>
                        <input type="text" value={formData.vendorInvoiceNumber}
                            onChange={e => setFormData({ ...formData, vendorInvoiceNumber: e.target.value })}
                            className="w-full border p-2 rounded" placeholder="HĐ001234"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Ngày HĐ *</label>
                            <input type="date" value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full border p-2 rounded" required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Hạn Thanh Toán *</label>
                            <input type="date" value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full border p-2 rounded" required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}

            <div className="bg-white p-6 rounded shadow overflow-x-auto">
                <h3 className="font-semibold mb-4">Chi Tiết Hàng Hóa / Dịch Vụ</h3>
                <table className="w-full min-w-[700px]">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-2 w-10">#</th>
                            <th className="text-left p-2">Diễn giải</th>
                            <th className="text-left p-2 w-40">TK Chi phí</th>
                            <th className="text-right p-2 w-20">SL</th>
                            <th className="text-right p-2 w-28">Đơn Giá</th>
                            <th className="text-right p-2 w-20">Thuế %</th>
                            <th className="text-right p-2 w-28">Thành Tiền</th>
                            <th className="p-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map((line, idx) => (
                            <tr key={idx} className="border-b">
                                <td className="p-2 text-center">{idx + 1}</td>
                                <td className="p-2"><input type="text" value={line.description} onChange={e => handleLineChange(idx, 'description', e.target.value)} className="w-full border p-1 rounded" /></td>
                                <td className="p-2">
                                    <select value={line.accountId} onChange={e => handleLineChange(idx, 'accountId', e.target.value)} className="w-full border p-1 rounded">
                                        <option value="">--</option>
                                        {expenseAccounts.map(a => <option key={a.id} value={a.id}>{a.code}</option>)}
                                    </select>
                                </td>
                                <td className="p-2"><input type="number" value={line.quantity} onChange={e => handleLineChange(idx, 'quantity', Number(e.target.value))} className="w-full border p-1 rounded text-right" /></td>
                                <td className="p-2"><input type="number" value={line.unitPrice} onChange={e => handleLineChange(idx, 'unitPrice', Number(e.target.value))} className="w-full border p-1 rounded text-right" /></td>
                                <td className="p-2">
                                    <select value={line.taxRate} onChange={e => handleLineChange(idx, 'taxRate', Number(e.target.value))} className="w-full border p-1 rounded">
                                        <option value="0">0%</option><option value="5">5%</option><option value="8">8%</option><option value="10">10%</option>
                                    </select>
                                </td>
                                <td className="p-2 text-right font-medium">{(line.quantity * line.unitPrice).toLocaleString('vi-VN')}</td>
                                <td className="p-2"><button type="button" onClick={() => removeLine(idx)} className="text-red-500">&times;</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" onClick={addLine} className="mt-4 text-blue-600 text-sm font-semibold">+ Thêm dòng</button>
            </div>

            <div className="flex justify-end pr-6">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between"><span>Cộng tiền hàng:</span><span>{totals.subtotal.toLocaleString('vi-VN')}</span></div>
                    <div className="flex justify-between"><span>Tiền thuế:</span><span>{totals.taxAmount.toLocaleString('vi-VN')}</span></div>
                    <div className="flex justify-between border-t pt-2 font-bold text-lg"><span>TỔNG CỘNG:</span><span className="text-blue-600">{totals.total.toLocaleString('vi-VN')}</span></div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
                <button type="button" onClick={() => router.push('/purchase-invoices')} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{loading ? 'Đang lưu...' : 'Lưu Nháp'}</button>
            </div>
        </form>
    );
}
