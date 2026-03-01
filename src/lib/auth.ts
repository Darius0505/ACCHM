import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'acchm-secret-key-change-this';
const secret = new TextEncoder().encode(JWT_SECRET);
const ALG = 'HS256';

export async function signToken(payload: any, expiresIn: string = '24h') {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(secret);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}

export function getJwtSecretKey() {
    return secret;
}

export function getUserFromRequest(request: Request) {
    const headers = request.headers;
    const userId = headers.get('x-user-id');
    const companyId = headers.get('x-company-id');
    const branchId = headers.get('x-user-branch');
    const roles = headers.get('x-user-roles') ? JSON.parse(headers.get('x-user-roles')!) : [];

    return {
        userId,
        companyId,
        branchId,
        roles
    };
}
