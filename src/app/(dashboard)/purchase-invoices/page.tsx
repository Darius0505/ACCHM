import Link from 'next/link';
import { listPurchaseInvoices } from '../../services/purchaseInvoice.service';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8';

export default async function PurchaseInvoicesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { page = '1', status = '' } = await searchParams;
    const statusFilter = Array.isArray(status) ? status[0] : status;

    const { items } = await listPurchaseInvoices({
        companyId: COMPANY_ID,
        page: Number(page),
        limit: 20,
        status: statusFilter || undefined
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Hóa Đơn Mua Hàng</h1>
                <Link href="/purchase-invoices/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Tạo Hóa Đơn
                </Link>
            </div>

            <div className="mb-4 flex gap-2">
                <a href="/purchase-invoices" className={`px-3 py-1 rounded ${!statusFilter ? 'bg-gray-200 font-bold' : 'bg-gray-50'}`}>Tất cả</a>
                <a href="/purchase-invoices?status=DRAFT" className={`px-3 py-1 rounded ${statusFilter === 'DRAFT' ? 'bg-gray-200 font-bold' : 'bg-gray-50'}`}>Nháp</a>
                <a href="/purchase-invoices?status=POSTED" className={`px-3 py-1 rounded ${statusFilter === 'POSTED' ? 'bg-gray-200 font-bold' : 'bg-gray-50'}`}>Đã ghi sổ</a>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-4">Số HĐ</th>
                            <th className="text-left p-4">Ngày</th>
                            <th className="text-left p-4">Nhà Cung Cấp</th>
                            <th className="text-left p-4">Trạng Thái</th>
                            <th className="text-right p-4">Tổng Tiền</th>
                            <th className="text-right p-4">Còn Nợ</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={7} className="text-center p-8 text-gray-500">Chưa có hóa đơn nào.</td></tr>
                        ) : items.map((inv) => (
                            <tr key={inv.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium text-blue-600">
                                    <Link href={`/purchase-invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                                </td>
                                <td className="p-4">{new Date(inv.date).toLocaleDateString('vi-VN')}</td>
                                <td className="p-4">{inv.partner.name}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${inv.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-medium">{Number(inv.totalAmount).toLocaleString('vi-VN')}</td>
                                <td className="p-4 text-right text-orange-600">
                                    {Number(inv.balanceAmount) > 0 ? Number(inv.balanceAmount).toLocaleString('vi-VN') : '-'}
                                </td>
                                <td className="p-4 text-right">
                                    <Link href={`/purchase-invoices/${inv.id}`} className="text-gray-600 hover:text-blue-600">Chi tiết</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
