export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    css: ['~/assets/styles/index.css'],
    devtools: { enabled: true },
    routeRules: {
        '/': { redirect: '/tasks' }
    },
    typescript: {
        strict: true,
        typeCheck: true
    },
    runtimeConfig: {
        jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me'
    }
});
