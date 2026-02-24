import { NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, password } = body;

        if (!code || !password) {
            return NextResponse.json(
                { error: 'Mã nhân viên và mật khẩu không được để trống' },
                { status: 400 }
            );
        }

        const { user, token } = await authService.login(code, password);

        const response = NextResponse.json({
            user,
            token,
            message: 'Login successful'
        });

        // Set cookie for convenience/security if using Next.js middleware extensively
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return response;

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Authentication failed' },
            { status: 401 }
        );
    }
}
