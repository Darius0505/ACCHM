'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VendorFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function VendorForm({ initialData, isEdit }: VendorFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        code: initialData?.code || '',
        name: initialData?.name || '',
        taxCode: initialData?.taxCode || '',
        address: initialData?.address || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        contactPerson: initialData?.contactPerson || '',
        paymentTermDays: initialData?.paymentTermDays || 30
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = isEdit ? `/api/vendors/${initialData.id}` : '/api/vendors';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save vendor');
            }

            router.push('/vendors');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">{isEdit ? 'Cập nhật NCC' : 'Thêm Nhà Cung Cấp Mới'}</h2>

            {error && <div className="text-red-500 bg-red-50 p-3 rounded">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Mã NCC *</label>
                    <input type="text" required value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        className="w-full border p-2 rounded" placeholder="NCC001" disabled={isEdit}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tên NCC *</label>
                    <input type="text" required value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border p-2 rounded" placeholder="Công ty XYZ"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Mã Số Thuế</label>
                    <input type="text" value={formData.taxCode}
                        onChange={e => setFormData({ ...formData, taxCode: e.target.value })}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Điện Thoại</label>
                    <input type="text" value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border p-2 rounded"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Địa Chỉ</label>
                <input type="text" value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border p-2 rounded"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Thời Hạn Thanh Toán (Ngày)</label>
                    <input type="number" value={formData.paymentTermDays}
                        onChange={e => setFormData({ ...formData, paymentTermDays: Number(e.target.value) })}
                        className="w-full border p-2 rounded"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => router.back()}
                    className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Đang lưu...' : 'Lưu NCC'}
                </button>
            </div>
        </form>
    );
}
