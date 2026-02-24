'use client';

export default function VendorsPage() {
    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Nhà cung cấp</h2>
                    <p style={{ color: '#6B7280' }}>Quản lý danh sách đối tác cung ứng</p>
                </div>
                <button style={{ padding: '10px 20px', backgroundColor: '#111827', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600 }}>
                    + Thêm NCC
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                            <th style={{ padding: '16px', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Mã NCC</th>
                            <th style={{ padding: '16px', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Tên nhà cung cấp</th>
                            <th style={{ padding: '16px', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Mã số thuế</th>
                            <th style={{ padding: '16px', fontSize: '12px', color: '#6B7280', textTransform: 'uppercase' }}>Liên hệ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3].map(i => (
                            <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                <td style={{ padding: '16px', fontWeight: 600, color: '#374151' }}>NCC00{i}</td>
                                <td style={{ padding: '16px', color: '#111827' }}>Công ty TNHH Cung ứng {i}</td>
                                <td style={{ padding: '16px', color: '#6B7280' }}>01020300{i}</td>
                                <td style={{ padding: '16px', color: '#6B7280' }}>0909 123 45{i}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
