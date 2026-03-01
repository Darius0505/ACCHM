import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, getJwtSecretKey } from '@/lib/auth'; // Ensure this uses 'jose'

// Paths that do NOT require authentication
const publicPaths = [
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/files',         // Serve stored images (public)
    '/api/upload',        // Upload endpoint (authenticated via session)
    '/_next',
    '/favicon.ico',
    '/logo.png',
    '/uploads',           // Legacy static uploads
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Check if public path
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // 2. Get token
    const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');

    // 3. Verify Token
    if (!token) {
        // API Request -> 401
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // UI Request -> Redirect to Login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyToken(token);

    if (!payload) {
        // API Request -> 401
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }
        // UI Request -> Redirect to Login
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Token valid, add info to headers for downstream
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-email', payload.email as string);
    if (payload.companyId) {
        requestHeaders.set('x-company-id', payload.companyId as string);
    }
    if (payload.roles) {
        requestHeaders.set('x-user-roles', JSON.stringify(payload.roles));
    }
    if (payload.permissions) {
        requestHeaders.set('x-user-permissions', JSON.stringify(payload.permissions));
    }
    if (payload.scope) {
        requestHeaders.set('x-user-scope', JSON.stringify(payload.scope));
    }
    if (payload.branchId) {
        requestHeaders.set('x-user-branch', payload.branchId as string);
    }
    if (payload.departmentId) {
        requestHeaders.set('x-user-department', payload.departmentId as string);
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// Configure paths to match
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
