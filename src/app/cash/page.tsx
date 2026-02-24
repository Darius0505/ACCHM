'use client';

import { useState } from 'react';

// Icons
const ICONS = {
    process: '🔄',
    receipt: '📥',
    payment: '📤',
    ledger: '📒',
    filter: '🌪️',
    add: '➕',
    print: '🖨️',
    export: '📊'
};

// Dummy Data
const RECEIPTS = [
    { id: 'PT001', date: '24/01/2026', desc: 'Rút tiền gửi về nhập quỹ', amount: 50000000, partner: 'Ngân hàng ACB', status: 'Đã ghi sổ' },
    { id: 'PT002', date: '24/01/2026', desc: 'Thu tiền khách hàng A', amount: 12500000, partner: 'Công ty ABC', status: 'Chờ duyệt' },
    { id: 'PT003', date: '23/01/2026', desc: 'Thu hoàn ứng nhân viên', amount: 2000000, partner: 'Nguyễn Văn A', status: 'Đã ghi sổ' },
];

const PAYMENTS = [
    { id: 'PC001', date: '24/01/2026', desc: 'Chi mua văn phòng phẩm', amount: 1500000, partner: 'Nhà sách Tiền Phong', status: 'Đã ghi sổ' },
    { id: 'PC002', date: '24/01/2026', desc: 'Tam ứng công tác phí', amount: 5000000, partner: 'Trần Thị B', status: 'Đã ghi sổ' },
];

export default function CashPage() {
    const [activeTab, setActiveTab] = useState<'process' | 'receipts' | 'payments' | 'ledger'>('process');

    const renderTabButton = (id: typeof activeTab, label: string, icon: string) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                padding: '10px 20px',
                borderBottom: activeTab === id ? '2px solid #C62828' : '2px solid transparent',
                color: activeTab === id ? '#C62828' : '#6B7280',
                fontWeight: activeTab === id ? 600 : 500,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                transition: 'all 0.2s'
            }}
        >
            <span style={{ fontSize: '16px' }}>{icon}</span>
            {label}
        </button>
    );

    return (
        <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#F9FAFB' }}>
            {/* Module Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>💰</span> Quỹ Tiền Mặt
                    </h1>
                    <p style={{ color: '#6B7280', margin: '4px 0 0', fontSize: '14px' }}>
                        Quản lý thu chi, tồn quỹ và sổ sách tiền mặt
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ padding: '8px 16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Tồn quỹ hiện tại</span>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#10B981' }}>1,250,500,000 ₫</span>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', gap: '8px' }}>
                {renderTabButton('process', 'Quy trình', ICONS.process)}
                {renderTabButton('receipts', 'Thu tiền', ICONS.receipt)}
                {renderTabButton('payments', 'Chi tiền', ICONS.payment)}
                {renderTabButton('ledger', 'Sổ chi tiết', ICONS.ledger)}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* 1. PROCESS TAB */}
                {activeTab === 'process' && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '40px' }}>Quy trình Quản lý Tiền mặt</h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                            {/* Step 1 */}
                            <div style={{ textAlign: 'center', position: 'relative' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#EFF6FF', color: '#3B82F6',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px',
                                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
                                }}>
                                    📝
                                </div>
                                <div style={{ fontWeight: 600, color: '#1F2937' }}>Đề nghị Thu/Chi</div>
                                <div style={{ fontSize: '12px', color: '#6B7280' }}>Nhân viên lập</div>
                            </div>

                            {/* Arrow */}
                            <div style={{ fontSize: '24px', color: '#9CA3AF' }}>➝</div>

                            {/* Step 2 */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#FFF7ED', color: '#F97316',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px',
                                    boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.1)'
                                }}>
                                    ✅
                                </div>
                                <div style={{ fontWeight: 600, color: '#1F2937' }}>Phê duyệt</div>
                                <div style={{ fontSize: '12px', color: '#6B7280' }}>Trưởng bộ phận/KTT</div>
                            </div>

                            {/* Arrow */}
                            <div style={{ fontSize: '24px', color: '#9CA3AF' }}>➝</div>

                            {/* Step 3 */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#F0FDF4', color: '#10B981',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px',
                                    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)'
                                }}>
                                    💰
                                </div>
                                <div style={{ fontWeight: 600, color: '#1F2937' }}>Thực hiện Thu/Chi</div>
                                <div style={{ fontSize: '12px', color: '#6B7280' }}>Thủ quỹ</div>
                            </div>

                            {/* Arrow */}
                            <div style={{ fontSize: '24px', color: '#9CA3AF' }}>➝</div>

                            {/* Step 4 */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#FEF2F2', color: '#EF4444',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px',
                                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)'
                                }}>
                                    📒
                                </div>
                                <div style={{ fontWeight: 600, color: '#1F2937' }}>Ghi sổ Kế toán</div>
                                <div style={{ fontSize: '12px', color: '#6B7280' }}>Kế toán viên</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '60px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px', fontSize: '13px', color: '#6B7280', maxWidth: '600px', textAlign: 'center' }}>
                            💡 <strong>Gợi ý:</strong> Bấm vào các bước để xem hướng dẫn chi tiết hoặc thiết lập quy trình phê duyệt.
                        </div>
                    </div>
                )}

                {/* 2. RECEIPTS TAB */}
                {activeTab === 'receipts' && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" placeholder="Tìm kiếm phiếu thu..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', width: '250px' }} />
                                <button style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: 'white', color: '#374151' }}>{ICONS.filter} Lọc</button>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ padding: '8px 16px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                                    {ICONS.add} Thêm Phiếu Thu
                                </button>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Số CT</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Ngày</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Diễn giải</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Đối tượng</th>
                                    <th style={{ textAlign: 'right', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Số tiền</th>
                                    <th style={{ textAlign: 'center', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RECEIPTS.map((row) => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '12px', color: '#1F2937', fontWeight: 500 }}>{row.id}</td>
                                        <td style={{ padding: '12px', color: '#6B7280' }}>{row.date}</td>
                                        <td style={{ padding: '12px', color: '#4B5563' }}>{row.desc}</td>
                                        <td style={{ padding: '12px', color: '#4B5563' }}>{row.partner}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#10B981' }}>{row.amount.toLocaleString()} ₫</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500,
                                                backgroundColor: row.status === 'Đã ghi sổ' ? '#ECFDF5' : '#FFF7ED',
                                                color: row.status === 'Đã ghi sổ' ? '#059669' : '#C2410C'
                                            }}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 3. PAYMENTS TAB */}
                {activeTab === 'payments' && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" placeholder="Tìm kiếm phiếu chi..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', width: '250px' }} />
                                <button style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: 'white', color: '#374151' }}>{ICONS.filter} Lọc</button>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ padding: '8px 16px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                                    {ICONS.add} Thêm Phiếu Chi
                                </button>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Số CT</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Ngày</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Diễn giải</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Đối tượng</th>
                                    <th style={{ textAlign: 'right', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Số tiền</th>
                                    <th style={{ textAlign: 'center', padding: '12px', color: '#6B7280', fontWeight: 600 }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PAYMENTS.map((row) => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '12px', color: '#1F2937', fontWeight: 500 }}>{row.id}</td>
                                        <td style={{ padding: '12px', color: '#6B7280' }}>{row.date}</td>
                                        <td style={{ padding: '12px', color: '#4B5563' }}>{row.desc}</td>
                                        <td style={{ padding: '12px', color: '#4B5563' }}>{row.partner}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#EF4444' }}>{row.amount.toLocaleString()} ₫</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500,
                                                backgroundColor: row.status === 'Đã ghi sổ' ? '#ECFDF5' : '#FFF7ED',
                                                color: row.status === 'Đã ghi sổ' ? '#059669' : '#C2410C'
                                            }}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 4. LEDGER TAB */}
                {activeTab === 'ledger' && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: '#374151', fontWeight: 600 }}>Kỳ kế toán:</span>
                                <select style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                                    <option>Tháng 1/2026</option>
                                    <option>Tháng 2/2026</option>
                                </select>
                                <button style={{ padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: 'white', color: '#374151' }}>Xem báo cáo</button>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ padding: '8px 16px', backgroundColor: 'white', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
                                    {ICONS.print} In Sổ
                                </button>
                                <button style={{ padding: '8px 16px', backgroundColor: 'white', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
                                    {ICONS.export} Xuất Excel
                                </button>
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', border: '2px dashed #E5E7EB', borderRadius: '8px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                                <div>Chưa có dữ liệu sổ cái cho kỳ này</div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
