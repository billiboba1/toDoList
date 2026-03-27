export function useApi() {
    const { token, logout } = useAuth();

    return $fetch.create({
        onRequest({ options }) {
            const t = token.value;
            if (t) {
                const headers = new Headers(options.headers as HeadersInit | undefined);
                headers.set('Authorization', `Bearer ${t}`);
                options.headers = headers;
            }
        },
        async onResponseError({ response }) {
            if (response.status === 401) {
                logout();
                await navigateTo('/login');
            }
        }
    });
}
