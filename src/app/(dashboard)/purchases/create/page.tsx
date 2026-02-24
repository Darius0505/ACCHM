'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CreatePurchasePage() {
    const [lines, setLines] = useState([
        { id: 1, item: '', desc: '', qty: 1, price: 0, vat: 10, amount: 0 }
    ]);

    const addLine = () => {
        setLines([...lines, { id: Date.now(), item: '', desc: '', qty: 1, price: 0, vat: 10, amount: 0 }]);
    };

    const removeLine = (id: number) => {
        if (lines.length > 1) setLines(lines.filter(l => l.id !== id));
    };

    const calculateTotal = () => {
        return lines.reduce((sum, line) => sum + (line.qty * line.price * (1 + line.vat / 100)), 0);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/purchases" style={{ textDecoration: 'none', color: '#6B7280', fontSize: '20px' }}>←</Link>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>Thêm chứng từ mua hàng</h2>
                        <p style={{ color: '#6B7280', fontSize: '13px', margin: '4px 0 0' }}>Nhập thông tin hóa đơn đầu vào</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', fontWeight: 600, cursor: 'pointer' }}>
                        Lưu nháp
                    </button>
                    <button style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#EF4444', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }}>
                        Lưu & Ghi sổ
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
                {/* Left: Main Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* General Info */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>Thông tin chung</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, color: '#6B7280', marginBottom: '6px' }}>Nhà cung cấp</label>
                                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                                    <option>Chọn nhà cung cấp...</option>
                                    <option>Công ty TNHH Nhất Việt</option>
                                    <option>Google Cloud EMEA</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, color: '#6B7280', marginBottom: '6px' }}>Diễn giải</label>
                                <input type="text" placeholder="Nhập diễn giải..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', margin: 0 }}>Chi tiết hàng hóa</h3>
                            <button onClick={addLine} style={{ fontSize: '13px', color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Thêm dòng</button>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' }}>
                                    <th style={{ textAlign: 'left', paddingBottom: '8px', width: '30%' }}>Mặt hàng</th>
                                    <th style={{ textAlign: 'center', paddingBottom: '8px', width: '10%' }}>SL</th>
                                    <th style={{ textAlign: 'right', paddingBottom: '8px', width: '20%' }}>Đơn giá</th>
                                    <th style={{ textAlign: 'center', paddingBottom: '8px', width: '10%' }}>VAT %</th>
                                    <th style={{ textAlign: 'right', paddingBottom: '8px', width: '25%' }}>Thành tiền</th>
                                    <th style={{ width: '5%' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map((line) => (
                                    <tr key={line.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '12px 0' }}>
                                            <input type="text" placeholder="Chọn hàng..." style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '6px' }} />
                                        </td>
                                        <td style={{ padding: '12px 0 12px 8px' }}>
                                            <input type="number" defaultValue={1} style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '6px', textAlign: 'center' }} />
                                        </td>
                                        <td style={{ padding: '12px 0 12px 8px' }}>
                                            <input type="number" placeholder="0" style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '6px', textAlign: 'right' }} />
                                        </td>
                                        <td style={{ padding: '12px 0 12px 8px' }}>
                                            <select style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '6px', textAlign: 'center' }}>
                                                <option>0%</option>
                                                <option>5%</option>
                                                <option>8%</option>
                                                <option>10%</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px 0 12px 8px', textAlign: 'right', fontWeight: 600, color: '#374151' }}>
                                            0 ₫
                                        </td>
                                        <td style={{ padding: '12px 0 12px 8px', textAlign: 'center' }}>
                                            <button onClick={() => removeLine(line.id)} style={{ color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>×</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Payment & Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#374151' }}>Thông tin thanh toán</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, color: '#6B7280', marginBottom: '6px' }}>Hình thức</label>
                                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                    <option>Tiền mặt</option>
                                    <option>Chuyển khoản</option>
                                    <option>Công nợ</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, color: '#6B7280', marginBottom: '6px' }}>Ngày chứng từ</label>
                                <input type="date" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, color: '#6B7280', marginBottom: '6px' }}>Số hóa đơn</label>
                                <input type="text" placeholder="VD: HĐ00123" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                            </div>
                        </div>
                    </div>

                    {/* Total Box */}
                    <div style={{ background: '#FFF7ED', padding: '24px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#9A3412' }}>
                            <span>Tổng tiền hàng</span>
                            <span>0 ₫</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', color: '#9A3412' }}>
                            <span>Tiền thuế GTGT</span>
                            <span>0 ₫</span>
                        </div>
                        <div style={{ borderTop: '1px solid #FED7AA', margin: '8px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#C2410C' }}>TỔNG CỘNG</span>
                            <span style={{ fontSize: '24px', fontWeight: 800, color: '#EA580C' }}>0 ₫</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
