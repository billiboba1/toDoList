import { findUserByEmail } from '../../utils/store';
import { signToken } from '../../utils/jwt';

export default defineEventHandler(async (event) => {
    const body = await readBody<{ email?: string; password?: string }>(event);
    const email = body?.email?.trim();
    const password = body?.password;

    if (!email || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email and password are required'
        });
    }

    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid credentials' });
    }

    const config = useRuntimeConfig();
    const token = signToken({ sub: user.id, email: user.email, role: user.role }, config.jwtSecret);

    return {
        token,
        user: { id: user.id, email: user.email, role: user.role }
    };
});
