import type { IAuthUser } from '~/types/models';

const TOKEN_KEY = 'todolist_token';
const USER_KEY = 'todolist_user';

export function useAuth() {
    const token = useState<string | null>('auth_token', () => null);
    const user = useState<IAuthUser | null>('auth_user', () => null);

    function loadFromStorage() {
        if (!import.meta.client) {
            return;
        }
        token.value = localStorage.getItem(TOKEN_KEY);
        const raw = localStorage.getItem(USER_KEY);
        user.value = raw ? (JSON.parse(raw) as IAuthUser) : null;
    }

    function persist(t: string, u: IAuthUser) {
        token.value = t;
        user.value = u;
        if (import.meta.client) {
            localStorage.setItem(TOKEN_KEY, t);
            localStorage.setItem(USER_KEY, JSON.stringify(u));
        }
    }

    function logout() {
        token.value = null;
        user.value = null;
        if (import.meta.client) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }
    }

    function canModifyTask(createdBy: string) {
        const u = user.value;
        if (!u) {
            return false;
        }
        return u.role === 'admin' || u.id === createdBy;
    }

    return { token, user, loadFromStorage, persist, logout, canModifyTask };
}
