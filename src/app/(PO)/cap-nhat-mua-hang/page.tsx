import React from 'react';
import './styles.css';

export default function PurchaseOrderUpdatePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-sm">
            {/* Header */}
            <div className="page-header">
                <h1 className="header-title">
                    Cập nhật đơn hàng mua - POF2001
                </h1>
                <div className="header-actions">
                    <button className="header-action-btn">
                        {/* Save Icon */}
                        <svg className="save-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                    </button>
                    <button className="header-action-btn">
                        {/* Save icon alternate */}
                        <svg className="save-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 p-2 overflow-auto bg-white">
                {/* Thông tin chung */}
                <fieldset className="border border-gray-300 p-3 mb-4 rounded relative">
                    <legend className="text-xs font-semibold px-1 text-gray-700 w-auto bg-white relative -top-2">Thông tin chung</legend>

                    <div className="form-grid mt-[-10px] w-full">
                        <Field label="Loại chứng từ" required value="Đơn hàng mua" />
                        <Field label="Địa chỉ nhận hàng" />

                        <Field label="Số chứng từ" required value="2026/03/DHM/001" />
                        <Field label="Phương thức vận chuyển" />

                        <DateField label="Ngày đơn hàng" required />
                        <LookupField label="Nhà cung cấp" required hasValue />

                        <Field label="Số hợp đồng" />
                        <Field label="Bảng giá" />

                        <DateField label="Ngày ký hợp đồng" />
                        <Field label="Mã số thuế" />

                        <Field label="Loại tiền" required value="Tiền Việt Nam" />
                        <Field label="Địa chỉ" />

                        <Field label="Tỷ giá" required value="1" />
                        <Field label="Điện thoại" />

                        <Field label="Tình trạng đơn hàng" required value="0-Chưa chấp nhận" />
                        <Field label="Diễn giải" value="Đơn hàng Mua" />

                        <Field label="Phân loại đơn hàng" />
                        <LookupField label="Người duyệt 01" required hasValue />

                        <Field label="Loại mặt hàng" value="Tất cả" />
                    </div>
                </fieldset>

                {/* Thông tin thanh toán */}
                <fieldset className="border border-gray-300 p-3 mb-6 rounded relative">
                    <legend className="text-xs font-semibold px-1 text-gray-700 w-auto bg-white relative -top-2">Thông tin thanh toán</legend>

                    <div className="form-grid mt-[-10px] w-full">
                        <LookupField label="Người theo dõi" value="Quản trị hệ thống" hasValue />
                        <Field label="Phương thức thanh toán" value="Tiền mặt" />

                        <DateField label="Ngày đáo hạn" />
                        <Field label="Điều khoản thanh toán" />

                        <DateField label="Ngày xếp hàng" />
                        <LookupField label="Tham số" />

                        <DateField label="Ngày thanh toán" />
                    </div>
                </fieldset>

                {/* Checkboxes Row */}
                <div className="flex gap-8 mb-4 border-b pb-4 mt-2 list-kethua-gap">
                    <label className="flex items-center gap-2 cursor-pointer element-kethua-gap">
                        <input type="checkbox" className="w-3 h-3 text-blue-600 rounded border-gray-300" />
                        <span className="text-xs text-gray-700">Kế thừa yêu cầu mua hàng ...</span>
                        <input type="button" className="w-3 h-3 text-blue-600 rounded border-gray-300" />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer element-kethua-gap">
                        <input type="checkbox" className="w-3 h-3 text-blue-600 rounded border-gray-300" />
                        <span className="text-xs text-gray-700">Kế thừa báo giá nhà cung cấp ...</span>
                        <input type="button" className="w-3 h-3 text-blue-600 rounded border-gray-300" />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer element-kethua-gap">
                        <input type="checkbox" className="w-3 h-3 text-blue-600 rounded border-gray-300" />
                        <span className="text-xs text-gray-700">Kế thừa đơn hàng bán ...</span>
                        <input type="button" className="w-3 h-3 text-blue-600 rounded border-gray-300" />
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mb-2">
                    <button className="flex items-center gap-1 bg-gray-100 border border-gray-300 px-3 py-1 text-xs rounded hover:bg-gray-200">
                        <span className="font-bold">+</span> Thêm
                    </button>
                    <button className="flex items-center gap-1 bg-gray-100 border border-gray-300 px-3 py-1 text-xs rounded hover:bg-gray-200">
                        <span>🗑️</span> Hủy
                    </button>
                    <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        Thêm nhiều mặt hàng <span className="p-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">...</span>
                    </button>
                </div>

                {/* Data Grid */}
                <div className="border border-gray-300 overflow-x-auto rounded">
                    <table className="w-full text-xs whitespace-nowrap">
                        <thead className="bg-[#e4f0fa] text-[#0066b2] font-semibold border-b border-gray-300 text-center">
                            <tr>
                                <th className="p-1 border-r border-[#bedaf2] w-10">STT</th>
                                <th className="p-1 border-r border-[#bedaf2] min-w-[80px]">Mã hàng</th>
                                <th className="p-1 border-r border-[#bedaf2] min-w-[120px]">Tên mặt hàng</th>
                                <th className="p-1 border-r border-[#bedaf2]">Đơn vị tính</th>
                                <th className="p-1 border-r border-[#bedaf2]">Thông số kỹ thuật</th>
                                <th className="p-1 border-r border-[#bedaf2]">Số lượng</th>
                                <th className="p-1 border-r border-[#bedaf2]">Dài</th>
                                <th className="p-1 border-r border-[#bedaf2]">Rộng</th>
                                <th className="p-1 border-r border-[#bedaf2]">Dày</th>
                                <th className="p-1 border-r border-[#bedaf2]">Đơn giá</th>
                                <th className="p-1 border-r border-[#bedaf2]">Quy đổi</th>
                                <th className="p-1 border-r border-[#bedaf2]">Nhóm thuế</th>
                                <th className="p-1 border-r border-[#bedaf2]">Nguyên tệ</th>
                                <th className="p-1 border-r border-[#bedaf2]">% thuế VAT</th>
                                <th className="p-1 border-r border-[#bedaf2]">% Chiếu khấu</th>
                                <th className="p-1 border-r border-[#bedaf2]">Thuế GTGT</th>
                                <th className="p-1 border-r border-[#bedaf2]">Thuế GTGT quy đổi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200 hover:bg-yellow-50 align-top">
                                <td className="p-1 border-r border-gray-200 bg-gray-100 text-center">1</td>
                                <td className="p-1 border-r border-gray-200 text-center">
                                    <div className="flex items-center justify-between border border-gray-300 bg-white">
                                        <input className="w-full outline-none px-1 text-xs h-5" />
                                        <button className="px-1 bg-gray-100 border-l border-gray-300 hover:bg-gray-200 text-[10px]">...</button>
                                    </div>
                                </td>
                                <td className="p-1 border-r border-gray-200 bg-red-50"></td>
                                <td className="p-1 border-r border-gray-200">
                                    <div className="flex items-center justify-between border border-gray-300 bg-white">
                                        <input className="w-full outline-none px-1 text-xs h-5" />
                                        <button className="px-1 bg-gray-100 border-l border-gray-300 hover:bg-gray-200 text-[10px]">...</button>
                                    </div>
                                </td>
                                <td className="p-1 border-r border-gray-200"></td>
                                <td className="p-1 border-r border-gray-200 text-right">0.00</td>
                                <td className="p-1 border-r border-gray-200 bg-[#f0f8ff]"></td>
                                <td className="p-1 border-r border-gray-200 bg-[#f0f8ff]"></td>
                                <td className="p-1 border-r border-gray-200 bg-[#f0f8ff]"></td>
                                <td className="p-1 border-r border-gray-200 text-right">0</td>
                                <td className="p-1 border-r border-gray-200 bg-[#f0f8ff] text-right">0.00</td>
                                <td className="p-1 border-r border-gray-200"></td>
                                <td className="p-1 border-r border-gray-200 text-right">0.00</td>
                                <td className="p-1 border-r border-gray-200"></td>
                                <td className="p-1 border-r border-gray-200 text-right">0.00</td>
                                <td className="p-1 border-r border-gray-200"></td>
                                <td className="p-1 border-r border-gray-200 text-right">0.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Field({ label, required = false, value = '' }: { label: string, required?: boolean, value?: string }) {
    return (
        <>
            <span className="text-gray-600 text-[11px] font-medium min-w-[130px]">
                {label} {required && <span className="text-red-500">*</span>}
            </span>
            <div className="flex items-center border-b border-gray-300 pb-0.5 relative min-w-0">
                <input
                    type="text"
                    defaultValue={value}
                    className="w-full min-w-0 text-[12px] text-gray-800 outline-none bg-transparent"
                />
            </div>
        </>
    );
}

function DateField({ label, required = false }: { label: string, required?: boolean, defaultValue?: string }) {
    return (
        <>
            <span className="text-gray-600 text-[11px] font-medium min-w-[130px]">
                {label} {required && <span className="text-red-500">*</span>}
            </span>
            <div className="flex items-center border-b border-gray-300 pb-0.5 relative min-w-0">
                <input
                    type="date"
                    className="w-full min-w-0 text-[12px] text-gray-800 outline-none bg-transparent"
                />
            </div>
        </>
    );
}

function LookupField({ label, required = false, value = '', hasValue = false }: { label: string, required?: boolean, value?: string, hasValue?: boolean }) {
    return (
        <>
            <span className="text-gray-600 text-[11px] font-medium min-w-[130px]">
                {label} {required && <span className="text-red-500">*</span>}
            </span>
            <div className="flex items-center border-b border-gray-300 pb-0.5 gap-1 min-w-0">
                <input
                    type="text"
                    defaultValue={value}
                    className="flex-1 min-w-0 text-[12px] text-gray-800 outline-none bg-transparent"
                />
                <button className="px-1.5 py-0 bg-gray-100 border border-gray-300 rounded text-gray-600 hover:bg-gray-200 text-[10px] leading-tight shrink-0">
                    ...
                </button>
                {hasValue && (
                    <button className="w-[16px] h-[16px] rounded bg-[#3eaaf6] text-white flex items-center justify-center hover:bg-blue-600 shrink-0">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </>
    );
}
