import Link from 'next/link';
import { listPartners } from '@/services/partner.service';

const COMPANY_ID = '2c020450-4646-42ba-982a-ec74ff1c26a8';

export default async function VendorsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { page = '1', search = '' } = await searchParams;
    const currentPage = Number(Array.isArray(page) ? page[0] : page) || 1;
    const searchTerm = Array.isArray(search) ? search[0] : search;

    const { items, pagination } = await listPartners({
        // companyId: COMPANY_ID, 
        page: currentPage,
        limit: 20,
        search: searchTerm as string,
        filter_type: 'NCC', // Filter for Vendors
        isActive: true
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Danh Sách Nhà Cung Cấp</h1>
                <Link href="/vendors/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Thêm NCC
                </Link>
            </div>

            <div className="mb-4">
                <form action="/vendors" method="GET" className="flex gap-2">
                    <input type="text" name="search" placeholder="Tìm theo tên, mã..."
                        defaultValue={searchTerm} className="border p-2 rounded flex-1 max-w-md"
                    />
                    <button type="submit" className="bg-gray-100 border px-4 py-2 rounded hover:bg-gray-200">Tìm</button>
                </form>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-4">Mã NCC</th>
                            <th className="text-left p-4">Tên NCC</th>
                            <th className="text-left p-4">MST</th>
                            <th className="text-left p-4">Điện Thoại</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={5} className="text-center p-8 text-gray-500">Không có NCC nào.</td></tr>
                        ) : items.map((vendor) => (
                            <tr key={vendor.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium text-blue-600">
                                    <Link href={`/vendors/${vendor.id}`}>{vendor.code}</Link>
                                </td>
                                <td className="p-4">{vendor.name}</td>
                                <td className="p-4">{vendor.taxCode || '-'}</td>
                                <td className="p-4">{vendor.phone || '-'}</td>
                                <td className="p-4 text-right">
                                    <Link href={`/vendors/${vendor.id}`} className="text-gray-600 hover:text-blue-600">Chi tiết</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                    Trang {pagination.page} / {pagination.totalPages}
                </div>
            )}
        </div>
    );
}
