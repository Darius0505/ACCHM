'use client';

export default function PurchaseInvoicesPage() {
    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Chứng từ mua hàng</h2>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>Danh sách hóa đơn đầu vào</p>

            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧾</div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Chưa có chứng từ nào</h3>
                <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>Tạo chứng từ mới để bắt đầu theo dõi công nợ.</p>
                <button style={{ padding: '10px 20px', backgroundColor: '#EF4444', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600 }}>
                    + Thêm chứng từ
                </button>
            </div>
        </div>
    );
}
