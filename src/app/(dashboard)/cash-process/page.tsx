"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CashReceiptForm from '@/components/cash/CashReceiptForm';
import CashPaymentForm from '@/components/cash/CashPaymentForm';

export default function CashProcessPage() {
    const router = useRouter();
    const [showAction, setShowAction] = useState(false);
    const [activeForm, setActiveForm] = useState<'receipt' | 'payment' | null>(null);

    return (
        <div
            onClick={() => setShowAction(false)}
            style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }}
        >
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151', marginBottom: '40px' }}>Quy trình Quản lý Tiền mặt</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                {/* Step 1 */}
                <div style={{ textAlign: 'center', position: 'relative', cursor: 'pointer' }} onClick={() => { }}>
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
                <div style={{ textAlign: 'center', cursor: 'pointer', position: 'relative' }} onClick={(e) => {
                    e.stopPropagation();
                    setShowAction(!showAction);
                }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#F0FDF4', color: '#10B981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px',
                        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)',
                        transition: 'transform 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        💰
                    </div>
                    <div style={{ fontWeight: 600, color: '#1F2937' }}>Thực hiện Thu Chi</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Thủ quỹ</div>

                    {/* Action Popup */}
                    {showAction && (
                        <div style={{
                            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                            marginTop: '12px', backgroundColor: 'white', borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            border: '1px solid #E5E7EB', zIndex: 10, minWidth: '160px', overflow: 'hidden'
                        }} onClick={e => e.stopPropagation()}>
                            <div
                                onClick={() => { setShowAction(false); setActiveForm('receipt'); }}
                                style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 500 }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0FDF4'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                📥 Phiếu Thu
                            </div>
                            <div
                                onClick={() => { setShowAction(false); setActiveForm('payment'); }}
                                style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: 500 }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                📤 Phiếu Chi
                            </div>
                        </div>
                    )}
                </div>

                {/* Arrow */}
                <div style={{ fontSize: '24px', color: '#9CA3AF' }}>➝</div>

                {/* Step 4 */}
                <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => router.push('/cash-book')}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#FEF2F2', color: '#EF4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px',
                        boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)',
                        transition: 'transform 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        📒
                    </div>
                    <div style={{ fontWeight: 600, color: '#1F2937' }}>Ghi sổ Kế toán</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Kế toán viên</div>
                </div>
            </div>

            <div style={{ marginTop: '60px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px', fontSize: '13px', color: '#6B7280', maxWidth: '600px', textAlign: 'center' }}>
                💡 <strong>Gợi ý:</strong> Bấm vào các bước để xem hướng dẫn chi tiết hoặc thiết lập quy trình phê duyệt.
            </div>

            {/* FORM MODAL */}
            {activeForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setActiveForm(null)}>
                    <div style={{
                        backgroundColor: 'white', width: '90%', height: '90%', borderRadius: '8px',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }} onClick={e => e.stopPropagation()}>
                        {activeForm === 'payment' && (
                            <div className="flex-1 overflow-y-auto p-4">
                                <CashPaymentForm
                                    mode="create"
                                    onSuccess={() => setActiveForm(null)}
                                    onCancel={() => setActiveForm(null)}
                                />
                            </div>
                        )}
                        {/* CashReceiptForm handles its own scrolling and padding internally */}
                        {activeForm === 'receipt' && (
                            <CashReceiptForm
                                onSuccess={() => setActiveForm(null)}
                                onCancel={() => setActiveForm(null)}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
