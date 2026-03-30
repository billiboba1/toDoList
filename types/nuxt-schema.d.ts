import type { NitroRouteConfig } from 'nitropack/types';

declare module 'nuxt/schema' {
    interface NuxtConfig {
        routeRules?: Record<string, NitroRouteConfig>;
    }
}
