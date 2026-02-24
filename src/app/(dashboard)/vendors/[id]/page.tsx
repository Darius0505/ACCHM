import { notFound } from 'next/navigation';
import { getVendor, getVendorBalance } from '../../../services/vendor.service';
import VendorForm from '../../../components/partners/VendorForm';
import Link from 'next/link';

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const vendor = await getVendor(id);

    if (!vendor) notFound();

    const balance = await getVendorBalance(id);

    return (
        <div className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">{vendor.name}</h1>
                    <p className="text-gray-600">Mã NCC: {vendor.code}</p>
                </div>
                <div className="bg-orange-50 px-4 py-2 rounded border border-orange-100">
                    <div className="text-sm text-orange-600 font-semibold">Công nợ phải trả</div>
                    <div className="text-2xl font-bold text-orange-800">{balance.toLocaleString('vi-VN')} VND</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <VendorForm initialData={vendor} isEdit={true} />
                </div>
                <div className="space-y-4">
                    <div className="bg-white rounded shadow p-4">
                        <h3 className="font-bold mb-4 border-b pb-2">Thao Tác Nhanh</h3>
                        <div className="space-y-2 flex flex-col">
                            <Link href={`/purchase-invoices/new?partnerId=${vendor.id}`}
                                className="block text-center border p-2 rounded hover:bg-gray-50">
                                + Tạo Hóa Đơn Mua
                            </Link>
                            <Link href={`/vendor-payments/new?partnerId=${vendor.id}`}
                                className="block text-center border p-2 rounded hover:bg-gray-50">
                                + Thanh Toán NCC
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
