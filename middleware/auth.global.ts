export default defineNuxtRouteMiddleware((to) => {
    if (to.path === '/') {
        return navigateTo('/tasks');
    }

    if (import.meta.server) {
        return;
    }

    const auth = useAuth();
    auth.loadFromStorage();

    if (to.path === '/login') {
        if (auth.token.value) {
            return navigateTo('/tasks');
        }
        return;
    }

    if (!auth.token.value) {
        return navigateTo('/login');
    }
});
