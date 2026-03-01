import { NextResponse } from 'next/server';
import { userService } from '@/services/user.service';

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }


        const user = await userService.getUser(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get permissions and scope from JWT headers (forwarded by middleware)
        let permissionMap: Record<string, string[]> = {};
        let scope = { type: 'OWN' };
        try {
            const permHeader = request.headers.get('x-user-permissions');
            if (permHeader) {
                const parsed = JSON.parse(permHeader);
                // Handle both flat array ['*:*:*'] and object { FORM: ['ACTION'] } formats
                if (Array.isArray(parsed)) {
                    if (parsed.includes('*:*:*')) {
                        permissionMap = { '*': ['*'] };
                    }
                } else {
                    permissionMap = parsed;
                }
            }
            const scopeHeader = request.headers.get('x-user-scope');
            if (scopeHeader) scope = JSON.parse(scopeHeader);
        } catch { /* use defaults */ }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                companyId: user.companyId,
                roles: user.roles.map(ur => ur.role.name),
                permissions: user.roles.flatMap(ur => ur.role.permissions.map(rp => rp.permission)),
                permissionMap,
                scope,
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
