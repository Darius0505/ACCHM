'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Locale = 'vi' | 'en' | 'ja';

const translations = {
    vi: {
        appName: 'ACCHM',
        tagline: 'Giải pháp quản trị doanh nghiệp',
        signIn: 'Đăng nhập',
        welcome: 'Chào mừng quay trở lại',
        employeeCode: 'Mã nhân viên',
        password: 'Mật khẩu',
        rememberMe: 'Ghi nhớ đăng nhập',
        forgotPassword: 'Quên mật khẩu?',
        loginButton: 'Đăng nhập',
        signingIn: 'Đang đăng nhập...',
        contactAdmin: 'Liên hệ quản trị viên để được cấp quyền',
        error: 'Mã nhân viên hoặc mật khẩu không đúng',
        module1: 'Kế toán & Tài chính',
        module2: 'Quản lý Mua hàng',
        module3: 'Quản lý Kho',
        module4: 'Bán hàng & CRM',
        module5: 'Nhân sự & Chấm công',
    },
    en: {
        appName: 'ACCHM',
        tagline: 'Enterprise Management Solution',
        signIn: 'Sign In',
        welcome: 'Welcome back',
        employeeCode: 'Employee Code',
        password: 'Password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        loginButton: 'Sign In',
        signingIn: 'Signing in...',
        contactAdmin: 'Contact administrator for access',
        error: 'Invalid employee code or password',
        module1: 'Accounting & Finance',
        module2: 'Purchasing',
        module3: 'Inventory Management',
        module4: 'Sales & CRM',
        module5: 'HR & Attendance',
    },
    ja: {
        appName: 'ACCHM',
        tagline: '企業管理ソリューション',
        signIn: 'ログイン',
        welcome: 'おかえりなさい',
        employeeCode: '社員コード',
        password: 'パスワード',
        rememberMe: 'ログイン状態を保持',
        forgotPassword: 'パスワードをお忘れですか？',
        loginButton: 'ログイン',
        signingIn: 'ログイン中...',
        contactAdmin: '管理者に連絡してアクセス権を取得',
        error: '社員コードまたはパスワードが正しくありません',
        module1: '会計・財務',
        module2: '購買管理',
        module3: '在庫管理',
        module4: '営業・CRM',
        module5: '人事・勤怠',
    }
};

// Fire Element Color Palette
const colors = {
    primary: '#E57373',      // Coral Red
    primaryDark: '#C62828',  // Deep Rose
    accent: '#FF8A65',       // Soft Orange
    amber: '#FFB74D',        // Warm Amber
    bgWarm: '#FFFAF5',       // Warm White
    bgCream: '#FFF8F0',      // Cream
    text: '#3D3D3D',         // Warm Charcoal
    textSecondary: '#757575', // Medium Gray
};

export default function LoginPage() {
    const router = useRouter();
    // Demo credentials pre-filled for development
    const [code, setCode] = useState('ADMIN_01');
    const [password, setPassword] = useState('admin123');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [locale, setLocale] = useState<Locale>('vi');

    useEffect(() => {
        const cookieLocale = document.cookie
            .split('; ')
            .find(row => row.startsWith('locale='))
            ?.split('=')[1] as Locale;
        if (cookieLocale && translations[cookieLocale]) {
            setLocale(cookieLocale);
        }
    }, []);

    const t = translations[locale];

    const switchLanguage = (lang: Locale) => {
        document.cookie = `locale=${lang};path=/;max-age=31536000`;
        setLocale(lang);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, password }),
            });

            if (!res.ok) {
                setError(t.error);
                return;
            }

            router.push('/');
            router.refresh();
        } catch {
            setError(t.error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: colors.bgWarm }}>
            {/* Left Panel - Fire Element Gradient */}
            <div style={{
                width: '50%',
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 50%, ${colors.accent} 100%)`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '48px',
                position: 'relative',
                overflow: 'hidden'
            }} className="hidden lg:flex">
                {/* Decorative circles - warm glows */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '250px',
                    height: '250px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '50%',
                    filter: 'blur(50px)'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '10%',
                    width: '300px',
                    height: '300px',
                    background: `rgba(255,183,77,0.3)`,
                    borderRadius: '50%',
                    filter: 'blur(60px)'
                }}></div>

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '400px' }}>
                    {/* Logo - Horse (Mã Đáo Thành Công) */}
                    <div style={{
                        width: '120px',
                        height: '120px',
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        padding: '12px'
                    }}>
                        <img
                            src="/logo.png"
                            alt="ACCHM Logo"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>

                    <h1 style={{
                        fontSize: '52px',
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: '12px',
                        letterSpacing: '-1px'
                    }}>
                        {t.appName}
                    </h1>
                    <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '48px' }}>
                        {t.tagline}
                    </p>

                    {/* Module Features */}
                    <div style={{ textAlign: 'left' }}>
                        <p style={{
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.6)',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            marginBottom: '16px'
                        }}>
                            Modules
                        </p>
                        {[
                            { icon: '💰', text: t.module1 },  // Kế toán
                            { icon: '🛍️', text: t.module2 },  // Mua hàng
                            { icon: '📦', text: t.module3 },  // Kho
                            { icon: '🛒', text: t.module4 },  // Bán hàng
                            { icon: '👥', text: t.module5 }   // Nhân sự
                        ].map((module, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                color: 'white',
                                marginBottom: '14px',
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(5px)'
                            }}>
                                <span style={{ fontSize: '20px' }}>{module.icon}</span>
                                <span style={{ fontSize: '15px', fontWeight: 500 }}>{module.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: colors.bgWarm
            }}>
                {/* Language Switcher */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '24px' }}>
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        background: 'white',
                        borderRadius: '24px',
                        padding: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        {(['vi', 'en', 'ja'] as Locale[]).map(lang => (
                            <button
                                key={lang}
                                onClick={() => switchLanguage(lang)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    background: locale === lang ? colors.primary : 'transparent',
                                    color: locale === lang ? 'white' : colors.textSecondary,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {lang === 'vi' ? '🇻🇳 VI' : lang === 'en' ? '🇬🇧 EN' : '🇯🇵 JP'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div style={{ width: '100%', maxWidth: '420px' }}>
                        {/* Mobile Logo */}
                        <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: colors.primaryDark }}>
                                {t.appName}
                            </h1>
                            <p style={{ color: colors.textSecondary }}>{t.tagline}</p>
                        </div>

                        <div style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '40px',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
                        }}>
                            <h2 style={{
                                fontSize: '26px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginBottom: '8px',
                                color: colors.text
                            }}>
                                {t.signIn}
                            </h2>
                            <p style={{
                                color: colors.textSecondary,
                                textAlign: 'center',
                                marginBottom: '32px'
                            }}>
                                {t.welcome}
                            </p>

                            {error && (
                                <div style={{
                                    background: '#FFEBEE',
                                    border: `1px solid ${colors.primary}`,
                                    borderRadius: '10px',
                                    padding: '14px',
                                    marginBottom: '20px',
                                    color: colors.primaryDark,
                                    fontSize: '14px',
                                    textAlign: 'center'
                                }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        marginBottom: '8px',
                                        color: colors.text
                                    }}>
                                        {t.employeeCode}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="VD: ADMIN_01"
                                        value={code}
                                        onChange={e => setCode(e.target.value.toUpperCase())}
                                        style={{
                                            width: '100%',
                                            padding: '14px 18px',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            background: colors.bgCream,
                                            transition: 'border-color 0.2s',
                                            fontFamily: 'monospace',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase'
                                        }}
                                        onFocus={e => e.target.style.borderColor = colors.primary}
                                        onBlur={e => e.target.style.borderColor = '#E0E0E0'}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        marginBottom: '8px',
                                        color: colors.text
                                    }}>
                                        {t.password}
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 18px',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            background: colors.bgCream,
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = colors.primary}
                                        onBlur={e => e.target.style.borderColor = '#E0E0E0'}
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '28px'
                                }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer'
                                    }}>
                                        <input
                                            type="checkbox"
                                            style={{
                                                accentColor: colors.primary,
                                                width: '16px',
                                                height: '16px'
                                            }}
                                        />
                                        <span style={{ fontSize: '14px', color: colors.textSecondary }}>
                                            {t.rememberMe}
                                        </span>
                                    </label>
                                    <a href="#" style={{
                                        fontSize: '14px',
                                        color: colors.primary,
                                        textDecoration: 'none',
                                        fontWeight: 500
                                    }}>
                                        {t.forgotPassword}
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        opacity: isLoading ? 0.7 : 1,
                                        boxShadow: `0 4px 14px rgba(229, 115, 115, 0.4)`,
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseOver={e => {
                                        if (!isLoading) {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = `0 6px 20px rgba(229, 115, 115, 0.5)`;
                                        }
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = `0 4px 14px rgba(229, 115, 115, 0.4)`;
                                    }}
                                >
                                    {isLoading ? t.signingIn : t.loginButton}
                                </button>
                            </form>

                            <p style={{
                                textAlign: 'center',
                                fontSize: '14px',
                                color: colors.textSecondary,
                                marginTop: '24px'
                            }}>
                                {t.contactAdmin}
                            </p>
                        </div>

                        <p style={{
                            textAlign: 'center',
                            fontSize: '12px',
                            color: '#BDBDBD',
                            marginTop: '24px'
                        }}>
                            © 2024 ACCHM. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
