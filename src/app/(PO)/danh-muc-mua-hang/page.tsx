import React from 'react';
import './styles.css';

export default function PurchaseOrderListPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-sm">
            {/* Header */}
            <div className="page-header">
                <h1 className="header-title">
                    Danh mục đơn hàng mua
                </h1>
                <div className="header-actions">
                    {/* Search Icon */}
                    <button className="header-action-btn">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    {/* Add Icon */}
                    <button className="header-action-btn">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    {/* Delete Icon */}
                    <button className="header-action-btn text-red-500">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    {/* Print Icon */}
                    <button className="header-action-btn text-gray-600">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                    </button>
                    {/* Export excel Icon */}
                    <button className="header-action-btn text-green-600">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </button>
                    {/* Return/Backup Icon */}
                    <button className="header-action-btn text-blue-500">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                    </button>
                    {/* Filter Icon */}
                    <button className="header-action-btn">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 px-4 py-2 overflow-hidden bg-white min-w-0">
                {/* Data Grid */}
                <div className="w-full max-w-full overflow-x-auto border border-gray-300 rounded">
                    <table className="full-width-table text-[11px] whitespace-nowrap">
                        <thead className="grid-thead">
                            <tr>
                                <th className="w-8 border-r border-[#c7e5f5] text-center p-1">
                                    <input type="checkbox" className="w-3 h-3" />
                                </th>
                                <th className="w-10 border-r border-[#c7e5f5] text-center">STT</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Đơn vị</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Số chứng từ</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Ngày đơn hàng</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Loại chứng từ</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Mã nhà cung cấp</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Nhà cung cấp</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Xuất hóa đơn</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Địa chỉ nhận hàng</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Người theo dõi</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Nhân viên mua hàng</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Tình trạng đơn hàng</th>
                                <th className="px-4 border-r border-[#c7e5f5]">Tổng giá trị đơn hàng</th>
                                <th className="px-4">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={15} className="empty-state">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
