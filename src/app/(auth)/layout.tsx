'use client';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', backgroundColor: '#F9FAFB' }}>
            {/* Left Side: Branding / Marketing */}
            <div style={{
                flex: '1',
                backgroundColor: '#111827',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                padding: '60px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }} className="hidden md:flex">
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(#EF4444 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}></div>

                <div style={{ zIndex: 10, textAlign: 'center', maxWidth: '480px' }}>
                    <div style={{
                        width: '80px', height: '80px', margin: '0 auto 32px',
                        background: 'linear-gradient(135deg, #EF4444, #F97316)',
                        borderRadius: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '40px', boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)'
                    }}>
                        🐴
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>
                        Quản trị Doanh nghiệp <br /> Toàn diện & Tối ưu
                    </h1>
                    <p style={{ fontSize: '16px', color: '#9CA3AF', lineHeight: 1.6 }}>
                        Hệ thống ACCHM ERP giúp bạn kiểm soát dòng tiền, quản lý nhân sự và tối ưu hóa quy trình vận hành chỉ trên một nền tảng duy nhất.
                    </p>
                </div>

                <div style={{ marginTop: 'auto', zIndex: 10, display: 'flex', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#374151' }}></span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#374151' }}></span>
                </div>
            </div>

            {/* Right Side: Form */}
            <div style={{
                flex: '1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px'
            }}>
                {children}
            </div>
        </div>
    );
}
