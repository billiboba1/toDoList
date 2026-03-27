import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import type { IJwtPayload } from '~/types/models';

export function signToken(payload: IJwtPayload, secret: string, expiresIn: string = '7d') {
    return jwt.sign(payload, secret, { expiresIn });
}

export function readBearerToken(event: H3Event): string | null {
    const h = getHeader(event, 'authorization') || '';
    const m = h.match(/^Bearer\s+(.+)$/i);
    return m?.[1]?.trim() || null;
}

export function verifyToken(token: string, secret: string): IJwtPayload {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== 'object' || decoded === null) {
        throw new Error('Invalid token');
    }
    const d = decoded as Record<string, unknown>;
    if (
        typeof d.sub !== 'string' ||
        typeof d.email !== 'string' ||
        (d.role !== 'admin' && d.role !== 'user')
    ) {
        throw new Error('Invalid token payload');
    }
    return { sub: d.sub, email: d.email, role: d.role };
}

export function requireUser(event: H3Event): IJwtPayload {
    const config = useRuntimeConfig();
    const token = readBearerToken(event);
    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    try {
        return verifyToken(token, config.jwtSecret);
    } catch {
        throw createError({ statusCode: 401, statusMessage: 'Invalid token' });
    }
}

export function canModifyTask(user: IJwtPayload, createdBy: string) {
    return user.role === 'admin' || user.sub === createdBy;
}
